const http = require('http');
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/database');
const { initAdminAccount } = require('./src/services/auth.service');
const { initInquiries } = require('./src/services/inquiry.service');
const { User } = require('./src/models/user.model');
const { generateToken } = require('./src/utils/jwt');

const runTests = async () => {
  console.log('\n--- Starting Atlas Inquiries Backend Test Suite ---\n');

  await connectDB();
  await initAdminAccount();
  await initInquiries();

  const admin = await User.findOne({ role: 'admin' });
  const adminToken = generateToken({
    id: admin._id,
    email: admin.email,
    role: admin.role,
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5097, resolve));
  const baseUrl = 'http://localhost:5097';
  console.log(`Inquiry test server running at ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  const assert = (name, condition, details = '') => {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${details}`);
      failed++;
    }
  };

  try {
    // 1. GET /api/inquiries without token returns 401
    const unauthRes = await fetch(`${baseUrl}/api/inquiries`);
    assert('GET /api/inquiries without token returns 401', unauthRes.status === 401);

    // 2. GET /api/inquiries with admin token returns inquiries and meta counts
    const listRes = await fetch(`${baseUrl}/api/inquiries`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listJson = await listRes.json();
    assert('GET /api/inquiries with token returns 200', listRes.status === 200);
    assert('Response success is true', listJson.success === true);
    assert('Inquiries array returned', Array.isArray(listJson.data) && listJson.data.length >= 10);
    assert('Counts meta object present', Boolean(listJson.meta?.counts));
    assert('Counts has New and Read and Closed', typeof listJson.meta?.counts?.New === 'number');

    // 3. POST /api/inquiries creates a public inquiry
    const newInquiryPayload = {
      inquiryType: 'Project Assessment',
      name: 'Alexander Sterling',
      organization: 'Sterling & Croft Infrastructure',
      role: 'Chief Infrastructure Officer',
      phone: '+1 202 555 9988',
      email: 'alexander@sterlingcroft.com',
      project: 'Global Resiliency Assessment',
      context: 'Evaluating catastrophic failure scenarios across our 5 primary data centers.',
      message: 'We are seeking an executive assessment under the LMCS methodology.',
    };

    const createRes = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInquiryPayload),
    });
    const createJson = await createRes.json();
    assert('POST /api/inquiries returns 201', createRes.status === 201);
    assert('Created inquiry has inquiryType', createJson.data?.inquiryType === 'Project Assessment');
    assert('Created inquiry has organization', createJson.data?.organization === 'Sterling & Croft Infrastructure');
    assert('Created inquiry has role', createJson.data?.role === 'Chief Infrastructure Officer');
    assert('Created inquiry has project', createJson.data?.project === 'Global Resiliency Assessment');
    assert('Created inquiry status is New', createJson.data?.status === 'New');

    const createdId = createJson.data?.id;

    // 4. Validation error on missing email
    const invalidRes = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Incomplete User' }),
    });
    assert('POST without email returns 400', invalidRes.status === 400);

    // 5. PATCH /api/inquiries/:id/status updates status to Read then Closed
    const patchRes = await fetch(`${baseUrl}/api/inquiries/${createdId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'Read' }),
    });
    const patchJson = await patchRes.json();
    assert('PATCH status to Read returns 200', patchRes.status === 200);
    assert('Inquiry status updated to Read', patchJson.data?.status === 'Read');

    // 6. DELETE created inquiry cleanup
    const delRes = await fetch(`${baseUrl}/api/inquiries/${createdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert('DELETE inquiry returns 200', delRes.status === 200);

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    await disconnectDB();
    if (failed > 0) {
      process.exit(1);
    }
  }
};

runTests();
