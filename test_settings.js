const http = require('http');
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/database');
const { initAdminAccount } = require('./src/services/auth.service');
const { initSettings } = require('./src/services/settings.service');
const { User } = require('./src/models/user.model');
const { generateToken } = require('./src/utils/jwt');

const runTests = async () => {
  console.log('\n--- Starting Atlas Settings Backend Test Suite ---\n');

  await connectDB();
  await initAdminAccount();
  await initSettings();

  const admin = await User.findOne({ role: 'admin' });
  const adminToken = generateToken({
    id: admin._id,
    email: admin.email,
    role: admin.role,
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098';
  console.log(`Settings test server running at ${baseUrl}`);

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
    // 1. GET /api/settings/public returns 200 and contact info
    const pubRes = await fetch(`${baseUrl}/api/settings/public`);
    const pubData = await pubRes.json();
    assert('GET /api/settings/public returns 200', pubRes.status === 200);
    assert(
      'Public settings contain email and phone',
      Boolean(pubData.data.publicContactEmail && pubData.data.publicPhone)
    );

    // 2. GET /api/settings returns 200
    const getRes = await fetch(`${baseUrl}/api/settings`);
    const getData = await getRes.json();
    assert('GET /api/settings returns 200', getRes.status === 200);
    assert('GET /api/settings returns data object', Boolean(getData.data.id || getData.data._id));

    // 3. PUT /api/settings without token returns 401
    const unauthPut = await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicContactEmail: 'test@example.com' }),
    });
    assert('PUT /api/settings without token returns 401', unauthPut.status === 401);

    // 4. PUT /api/settings with invalid email returns 400
    const invalidPut = await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ publicContactEmail: 'invalid-email-address' }),
    });
    assert('PUT /api/settings with invalid email returns 400', invalidPut.status === 400);

    // 5. PUT /api/settings with valid updates returns 200
    const validPut = await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        publicContactEmail: 'support@lmcs.com',
        publicPhone: '+1 (555) 999-0000',
      }),
    });
    const putData = await validPut.json();
    assert('PUT /api/settings with valid data returns 200', validPut.status === 200);
    assert(
      'Updated email is support@lmcs.com',
      putData.data.publicContactEmail === 'support@lmcs.com'
    );
    assert(
      'Updated phone is +1 (555) 999-0000',
      putData.data.publicPhone === '+1 (555) 999-0000'
    );

    // 6. Verify public endpoint reflects update
    const pubVerify = await fetch(`${baseUrl}/api/settings/public`);
    const pubVerifyData = await pubVerify.json();
    assert(
      'Public endpoint returns updated support@lmcs.com',
      pubVerifyData.data.publicContactEmail === 'support@lmcs.com'
    );

    // 7. Reset settings back to default values for clean state
    await fetch(`${baseUrl}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        publicContactEmail: 'admin@lmcs.com',
        publicPhone: '+1 (555) 019-2837',
      }),
    });
    const resetRes = await fetch(`${baseUrl}/api/settings/public`);
    const resetData = await resetRes.json();
    assert(
      'Public endpoint reset to admin@lmcs.com',
      resetData.data.publicContactEmail === 'admin@lmcs.com'
    );
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    await disconnectDB();
    console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
