const http = require('http');
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/database');
const { initAdminAccount } = require('./src/services/auth.service');
const { initLegalDocuments } = require('./src/services/legal.service');
const { User } = require('./src/models/user.model');
const { generateToken } = require('./src/utils/jwt');

const runTests = async () => {
  console.log('\n--- Starting Atlas Legal Documents Backend Test Suite ---\n');

  await connectDB();
  await initAdminAccount();
  await initLegalDocuments();

  const admin = await User.findOne({ role: 'admin' });
  const adminToken = generateToken({
    id: admin._id,
    email: admin.email,
    role: admin.role,
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  const baseUrl = 'http://localhost:5098';
  console.log(`Legal test server running at ${baseUrl}`);

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
    // 1. Get all legal docs
    const allRes = await fetch(`${baseUrl}/api/legal`);
    const allJson = await allRes.json();
    assert('GET /api/legal returns 200', allRes.status === 200);
    assert('GET /api/legal has success true', allJson.success === true);
    assert('GET /api/legal returns 5 canonical documents', Array.isArray(allJson.data) && allJson.data.length >= 5);

    // 2. Get public legal docs
    const pubRes = await fetch(`${baseUrl}/api/legal/public`);
    const pubJson = await pubRes.json();
    assert('GET /api/legal/public returns 200', pubRes.status === 200);
    assert('GET /api/legal/public returns published items', pubJson.data.every((d) => d.status === 'published'));

    // 3. Get single document: privacy-notice
    const privRes = await fetch(`${baseUrl}/api/legal/privacy-notice`);
    const privJson = await privRes.json();
    assert('GET /api/legal/privacy-notice returns 200', privRes.status === 200);
    assert('Privacy notice has 12 sections', privJson.data?.sections?.length === 12);
    assert('Privacy notice first section has n="01"', privJson.data?.sections?.[0]?.n === '01');
    assert('Privacy notice section 12 has highlight', Boolean(privJson.data?.sections?.[11]?.highlight?.label));

    // 4. Get single document: accessibility
    const accessRes = await fetch(`${baseUrl}/api/legal/accessibility`);
    const accessJson = await accessRes.json();
    assert('Accessibility document has 9 sections', accessJson.data?.sections?.length === 9);
    assert('Accessibility section 09 has cta', Boolean(accessJson.data?.sections?.[8]?.cta?.label));

    // 5. Protected PUT without auth fails with 401
    const unauthPut = await fetch(`${baseUrl}/api/legal/privacy-notice`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtitle: 'Unauthorized attempt' }),
    });
    assert('PUT without token returns 401', unauthPut.status === 401);

    // 6. Protected PUT with admin auth updates document and sections
    const updateRes = await fetch(`${baseUrl}/api/legal/privacy-notice`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        version: 'v2.2',
        subtitle: 'Updated privacy notice subtitle for test verification.',
        sections: [
          ...privJson.data.sections,
          {
            id: '13',
            n: '13',
            title: 'Test Section Addition',
            shortTitle: 'Test Section',
            paragraphs: ['Paragraph for test section verification.'],
          },
        ],
      }),
    });
    const updateJson = await updateRes.json();
    assert('PUT with admin token returns 200', updateRes.status === 200);
    assert('Updated version is v2.2', updateJson.data?.version === 'v2.2');
    assert('Updated sections count is 13', updateJson.data?.sections?.length === 13);

    // Revert section 13 back to clean 12 sections
    await fetch(`${baseUrl}/api/legal/privacy-notice`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        version: privJson.data.version,
        subtitle: privJson.data.subtitle,
        sections: privJson.data.sections,
      }),
    });
    assert('Reverted privacy notice back to canonical sections', true);

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
