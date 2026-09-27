const { Page } = require('../models/page.model');
const { RecentChange } = require('../models/change.model');
const { AppError } = require('../utils/response');

const DEFAULT_PAGES = [
  { name: 'Home', route: '/', originalRoute: '/', slug: 'home', order: 1, visibility: 'published' },
  { name: 'How LMCS Works', route: '/how-lmcs-works', originalRoute: '/how-lmcs-works', slug: 'how-lmcs-works', order: 2, visibility: 'published' },
  { name: 'Project Assessment', route: '/project-assessment', originalRoute: '/project-assessment', slug: 'project-assessment', order: 3, visibility: 'published' },
  { name: 'ATLAS', route: '/atlas', originalRoute: '/atlas', slug: 'atlas', order: 4, visibility: 'published' },
  { name: 'Project Drift', route: '/project-drift', originalRoute: '/project-drift', slug: 'project-drift', order: 5, visibility: 'published' },
  { name: 'Academy', route: '/academy', originalRoute: '/academy', slug: 'academy', order: 6, visibility: 'published' },
  { name: 'Delivery Confidence', route: '/delivery-confidence', originalRoute: '/delivery-confidence', slug: 'delivery-confidence', order: 7, visibility: 'published' },
  { name: 'Insights', route: '/insights', originalRoute: '/insights', slug: 'insights', order: 8, visibility: 'published' },
  { name: 'About', route: '/about', originalRoute: '/about', slug: 'about', order: 9, visibility: 'published' },
];

const DEFAULT_CHANGES = [
  { title: 'Strategic Overview', type: 'Page', status: 'published', action: 'Published', summary: 'Updated the strategic overview content and published it.', updatedBy: 'Atlas Admin' },
  { title: 'Project Drift Analysis', type: 'Insight', status: 'draft', action: 'Draft Saved', summary: 'Saved draft version of project drift analysis.', updatedBy: 'Atlas Admin' },
  { title: 'Terms of Engagement', type: 'Legal', status: 'published', action: 'Published', summary: 'Published terms of engagement document.', updatedBy: 'Atlas Admin' },
  { title: 'Leadership Bio: CEO', type: 'Page', status: 'hidden', action: 'Hidden', summary: 'Set leadership bio page visibility to hidden.', updatedBy: 'Atlas Admin' },
  { title: 'Market Expansion Strategy', type: 'Report', status: 'published', action: 'Published', summary: 'Published market expansion strategy insight report.', updatedBy: 'Atlas Admin' },
];

const initPages = async () => {
  try {
    for (const p of DEFAULT_PAGES) {
      const exists = await Page.findOne({ slug: p.slug });
      if (!exists) {
        await Page.create(p);
      }
    }

    const changeCount = await RecentChange.countDocuments();
    if (changeCount === 0) {
      await RecentChange.insertMany(DEFAULT_CHANGES);
      console.log(`[Changes Init] Seeded initial recent content changes.`);
    }
  } catch (error) {
    console.error('[Pages Init] Failed to initialize pages:', error.message);
  }
};

const getAllPages = async () => {
  return Page.find().sort({ order: 1, createdAt: 1 });
};

const getPublicPages = async () => {
  return Page.find({ visibility: 'published' }).sort({ order: 1, createdAt: 1 });
};

const getPageById = async (id) => {
  const page = await Page.findById(id);
  if (!page) {
    throw new AppError('Page not found', 404, 'PAGE_NOT_FOUND');
  }
  return page;
};

const updatePage = async (id, { name, route, visibility }, user = {}) => {
  const page = await getPageById(id);

  const updates = {};
  let action = 'Updated';

  if (name && name.trim()) {
    updates.name = name.trim();
  }

  if (route && route.trim()) {
    let cleanRoute = route.trim();
    if (!cleanRoute.startsWith('/')) {
      cleanRoute = `/${cleanRoute}`;
    }

    // Check if new route already in use by another page
    if (cleanRoute !== page.route) {
      const existing = await Page.findOne({ route: cleanRoute, _id: { $ne: id } });
      if (existing) {
        throw new AppError(`Route '${cleanRoute}' is already in use by another page`, 409, 'ROUTE_CONFLICT');
      }
      updates.route = cleanRoute;
      action = 'Route Changed';
    }
  }

  if (visibility) {
    const validStatuses = ['published', 'hidden', 'draft'];
    const normVisibility = visibility.toLowerCase();
    if (!validStatuses.includes(normVisibility)) {
      throw new AppError(`Invalid visibility status. Allowed: ${validStatuses.join(', ')}`, 400, 'INVALID_STATUS');
    }
    updates.visibility = normVisibility;
    action = normVisibility === 'published' ? 'Published' : 'Hidden';
  }

  const updater = user.email || 'Atlas Admin';
  updates.updatedBy = updater;

  const updatedPage = await Page.findByIdAndUpdate(id, updates, { new: true });

  // Record recent change log
  await RecentChange.create({
    title: updatedPage.name,
    type: 'Page',
    status: updatedPage.visibility,
    action,
    summary: `Updated page "${updatedPage.name}" (route: ${updatedPage.route}, visibility: ${updatedPage.visibility})`,
    updatedBy: updater,
  });

  return updatedPage;
};

const togglePageVisibility = async (id, visibility, user = {}) => {
  return updatePage(id, { visibility }, user);
};

module.exports = {
  initPages,
  getAllPages,
  getPublicPages,
  getPageById,
  updatePage,
  togglePageVisibility,
};
