const http = require('http');
const app = require('./src/app');
const env = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/database');
const { initAdminAccount } = require('./src/services/auth.service');
const { User } = require('./src/models/user.model');
const { generateToken } = require('./src/utils/jwt');

const runTests = async () => {
  console.log('\n--- Starting Atlas Backend Test Suite ---\n');

  await connectDB();
  await initAdminAccount();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099';
  console.log(`Test server running at ${baseUrl}`);

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
    // 1. Health check test
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert('Health Check Returns 200', healthRes.status === 200);
    assert('Health Check Success is true', healthData.success === true);
    assert('Health Check Data Status is "ok"', healthData.data?.status === 'ok');

    // 2. Validation error - missing email and password
    const emptyLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const emptyLoginData = await emptyLoginRes.json();
    assert('Login with empty body returns 400', emptyLoginRes.status === 400);
    assert('Login empty body has error code VALIDATION_ERROR', emptyLoginData.error?.code === 'VALIDATION_ERROR');

    // 3. Validation error - invalid email format
    const invalidEmailRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '123' }),
    });
    const invalidEmailData = await invalidEmailRes.json();
    assert('Login with invalid email returns 400', invalidEmailRes.status === 400);
    assert('Login with invalid email returns VALIDATION_ERROR', invalidEmailData.error?.code === 'VALIDATION_ERROR');

    // 4. Invalid credentials - wrong password
    const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: env.ADMIN_EMAIL, password: 'WrongPassword123!' }),
    });
    const wrongPassData = await wrongPassRes.json();
    assert('Login with wrong password returns 401', wrongPassRes.status === 401);
    assert('Login with wrong password returns INVALID_CREDENTIALS', wrongPassData.error?.code === 'INVALID_CREDENTIALS');

    // 4b. Invalid credentials - non-admin email rejected
    const wrongEmailRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'other@example.com', password: 'AnyPassword123!' }),
    });
    const wrongEmailData = await wrongEmailRes.json();
    assert('Login with non-admin email returns 401', wrongEmailRes.status === 401);
    assert('Login with non-admin email returns INVALID_CREDENTIALS', wrongEmailData.error?.code === 'INVALID_CREDENTIALS');

    // 5. Successful Admin Login
    const validLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASS }),
    });
    const validLoginData = await validLoginRes.json();
    assert('Valid Admin Login returns 200', validLoginRes.status === 200);
    assert('Valid Admin Login success is true', validLoginData.success === true);
    assert('Valid Admin Login returns user object', Boolean(validLoginData.data?.user));
    assert('Valid Admin Login user has role admin', validLoginData.data?.user?.role === 'admin');
    assert('Valid Admin Login does not return password', validLoginData.data?.user?.password === undefined);
    assert('Valid Admin Login returns token', Boolean(validLoginData.data?.token));

    const token = validLoginData.data?.token;

    // 6. Protected GET /api/auth/me - without token
    const noTokenRes = await fetch(`${baseUrl}/api/auth/me`);
    const noTokenData = await noTokenRes.json();
    assert('/api/auth/me without token returns 401', noTokenRes.status === 401);
    assert('/api/auth/me without token returns UNAUTHORIZED', noTokenData.error?.code === 'UNAUTHORIZED');

    // 7. Protected GET /api/auth/me - with invalid token
    const invalidTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.token' },
    });
    const invalidTokenData = await invalidTokenRes.json();
    assert('/api/auth/me with invalid token returns 401', invalidTokenRes.status === 401);
    assert('/api/auth/me with invalid token returns INVALID_TOKEN', invalidTokenData.error?.code === 'INVALID_TOKEN');

    // 8. Protected GET /api/auth/me - with valid token
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    assert('/api/auth/me with valid token returns 200', meRes.status === 200);
    assert('/api/auth/me returns user email', meData.data?.email === env.ADMIN_EMAIL);
    assert('/api/auth/me returns user role admin', meData.data?.role === 'admin');
    assert('/api/auth/me does not expose password', meData.data?.password === undefined);

    // 9. Role-based authorization test - User with non-admin role rejected from /me (admin protected)
    const testUser = await User.findOneAndUpdate(
      { email: 'staff@atlas.com' },
      { email: 'staff@atlas.com', password: 'Password123!', role: 'user' },
      { upsert: true, new: true }
    );
    const staffToken = generateToken({ id: testUser._id.toString(), email: testUser.email, role: 'user' });
    const forbiddenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    const forbiddenData = await forbiddenRes.json();
    assert('Non-admin role access to admin-only endpoint returns 403', forbiddenRes.status === 403);
    assert('Non-admin access returns FORBIDDEN code', forbiddenData.error?.code === 'FORBIDDEN');
    await User.deleteOne({ email: 'staff@atlas.com' });

    // 10. Logout endpoint
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
    const logoutData = await logoutRes.json();
    assert('POST /api/auth/logout returns 200', logoutRes.status === 200);
    assert('POST /api/auth/logout returns success message', Boolean(logoutData.message));

    // 11. 404 Route Not Found
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-route`);
    const notFoundData = await notFoundRes.json();
    assert('Non-existent route returns 404', notFoundRes.status === 404);
    assert('Non-existent route returns NOT_FOUND code', notFoundData.error?.code === 'NOT_FOUND');

    // 12. CORS headers test
    const corsRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'http://localhost:3000' },
    });
    assert('CORS allows configured origin', corsRes.headers.get('access-control-allow-origin') === 'http://localhost:3000');

    // 13. Pages endpoints
    const pagesRes = await fetch(`${baseUrl}/api/pages`);
    const pagesData = await pagesRes.json();
    assert('GET /api/pages returns 200', pagesRes.status === 200);
    const totalPagesCount = pagesData.data?.length;
    assert('GET /api/pages returns pages list', totalPagesCount >= 8);

    const publicPagesRes = await fetch(`${baseUrl}/api/pages/public`);
    const publicPagesData = await publicPagesRes.json();
    assert('GET /api/pages/public returns 200', publicPagesRes.status === 200);
    assert('GET /api/pages/public returns published pages', publicPagesData.data?.length === totalPagesCount);

    // 14. Update page visibility
    const firstPage = pagesData.data[0];
    const toggleRes = await fetch(`${baseUrl}/api/pages/${firstPage.id}/visibility`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ visibility: 'hidden' }),
    });
    const toggleData = await toggleRes.json();
    assert('PATCH /api/pages/:id/visibility returns 200', toggleRes.status === 200);
    assert('Page visibility updated to hidden', toggleData.data?.visibility === 'hidden');

    // 15. Verify dashboard stats reflect the hidden page dynamically
    const statsRes = await fetch(`${baseUrl}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statsData = await statsRes.json();
    assert('GET /api/dashboard/stats returns 200', statsRes.status === 200);
    const hiddenStat = statsData.data?.stats.find((s) => s.id === 'hidden-pages');
    const pubStat = statsData.data?.stats.find((s) => s.id === 'published-pages');
    assert('Hidden pages stat count is 1', hiddenStat?.value === 1);
    assert('Published pages stat count is decremented by 1', pubStat?.value === totalPagesCount - 1);

    // Revert page back to published
    await fetch(`${baseUrl}/api/pages/${firstPage.id}/visibility`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ visibility: 'published' }),
    });

    // 16. Test GET /api/media/folders
    const foldersRes = await fetch(`${baseUrl}/api/media/folders`);
    const foldersData = await foldersRes.json();
    assert('GET /api/media/folders returns 200', foldersRes.status === 200);
    assert('Cloudinary ROOT is lmcsatlas', foldersData.data?.ROOT === 'lmcsatlas');
    assert('PAGES folder is lmcsatlas/pages', foldersData.data?.PAGES === 'lmcsatlas/pages');
    assert('INSIGHTS folder is lmcsatlas/insights', foldersData.data?.INSIGHTS === 'lmcsatlas/insights');

    // 17. Test POST /api/media/upload without token returns 401
    const unauthUploadRes = await fetch(`${baseUrl}/api/media/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'pages' }),
    });
    assert('POST /api/media/upload without token returns 401', unauthUploadRes.status === 401);

    // 18. Test POST /api/media/upload with admin token (base64)
    const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const uploadRes = await fetch(`${baseUrl}/api/media/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        image: sampleBase64,
        folder: 'pages',
      }),
    });
    const uploadData = await uploadRes.json();
    assert('POST /api/media/upload returns 201', uploadRes.status === 201);
    assert('Uploaded asset publicId starts with lmcsatlas/pages/', uploadData.data?.publicId?.startsWith('lmcsatlas/pages/'));
    assert('Uploaded asset folder is lmcsatlas/pages', uploadData.data?.folder === 'lmcsatlas/pages');

    // 19. Test DELETE /api/media
    if (uploadData.data?.publicId) {
      const deleteRes = await fetch(`${baseUrl}/api/media`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ publicId: uploadData.data.publicId }),
      });
      const deleteData = await deleteRes.json();
      assert('DELETE /api/media returns 200', deleteRes.status === 200);
      assert('Cloudinary destroy result is ok', deleteData.data?.result === 'ok');
    }

    // 20. Test Insights public & detail endpoints
    const pubInsightsRes = await fetch(`${baseUrl}/api/insights/public`);
    const pubInsightsData = await pubInsightsRes.json();
    assert('GET /api/insights/public returns 200', pubInsightsRes.status === 200);
    assert('Public insights list contains items', pubInsightsData.data?.length > 0);

    const singleRes = await fetch(`${baseUrl}/api/insights/the-illusion-of-control`);
    const singleData = await singleRes.json();
    assert('GET /api/insights/the-illusion-of-control returns 200', singleRes.status === 200);
    assert('The Illusion of Control has sections', singleData.data?.body?.length > 0);

    // 21. Test Insight Create, Update, Delete with Admin
    const createInsightRes = await fetch(`${baseUrl}/api/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Test Insight Flow', tag: 'Governance', excerpt: 'Test excerpt' }),
    });
    const createdInsight = await createInsightRes.json();
    assert('POST /api/insights returns 201', createInsightRes.status === 201);

    const updateInsightRes = await fetch(`${baseUrl}/api/insights/${createdInsight.data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Updated Test Insight Flow' }),
    });
    assert('PUT /api/insights/:id returns 200', updateInsightRes.status === 200);

    const delInsightRes = await fetch(`${baseUrl}/api/insights/${createdInsight.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert('DELETE /api/insights/:id returns 200', delInsightRes.status === 200);

  } finally {
    await new Promise((resolve) => server.close(resolve));
    await disconnectDB();
  }

  console.log(`\nTest results: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    process.exit(1);
  }
};

runTests();
