const { Insight } = require('../models/insight.model');
const { RecentChange } = require('../models/change.model');
const { SEED_INSIGHTS } = require('../config/seedInsights');
const { AppError } = require('../utils/response');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const initInsights = async () => {
  try {
    for (const item of SEED_INSIGHTS) {
      const exists = await Insight.findOne({ slug: item.slug });
      if (!exists) {
        await Insight.create(item);
      }
    }
    console.log('[Insights Init] Verified canonical insights in database.');
  } catch (error) {
    console.error('[Insights Init] Error initializing insights:', error.message);
  }
};

const getAllInsights = async (query = {}) => {
  const { search, status, tag, page = 1, limit = 50 } = query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status.toLowerCase();
  }

  if (tag && tag !== 'All') {
    filter.tag = new RegExp(`^${tag.trim()}$`, 'i');
  }

  if (search && search.trim()) {
    const s = search.trim();
    filter.$or = [
      { title: new RegExp(s, 'i') },
      { tag: new RegExp(s, 'i') },
      { excerpt: new RegExp(s, 'i') },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 50);
  const skip = (pageNum - 1) * limitNum;

  const [total, insights] = await Promise.all([
    Insight.countDocuments(filter),
    Insight.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limitNum),
  ]);

  return {
    insights,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

const getPublicInsights = async () => {
  return Insight.find({ status: 'published' }).sort({ order: 1, createdAt: -1 });
};

const getInsightByIdOrSlug = async (idOrSlug) => {
  let insight = null;
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    insight = await Insight.findById(idOrSlug);
  }
  if (!insight) {
    insight = await Insight.findOne({ slug: idOrSlug });
  }
  if (!insight) {
    throw new AppError(`Insight '${idOrSlug}' not found`, 404, 'INSIGHT_NOT_FOUND');
  }
  return insight;
};

const createInsight = async (data, user) => {
  const title = data.title?.trim();
  if (!title) {
    throw new AppError('Insight title is required', 400, 'TITLE_REQUIRED');
  }

  let slug = data.slug?.trim() ? slugify(data.slug) : slugify(title);
  if (!slug) slug = `insight-${Date.now()}`;

  const existingSlug = await Insight.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const insight = await Insight.create({
    ...data,
    title,
    slug,
    author: user?.name || user?.email || data.author || 'Atlas Admin',
    status: (data.status || 'published').toLowerCase(),
  });

  await RecentChange.create({
    title: insight.title,
    type: 'Insight',
    status: insight.status,
    action: insight.status === 'published' ? 'Published' : 'Draft Saved',
    summary: `Created insight '${insight.title}' (${insight.tag}).`,
    updatedBy: insight.author,
  });

  return insight;
};

const updateInsight = async (id, data, user) => {
  const insight = await getInsightByIdOrSlug(id);

  if (data.title !== undefined) insight.title = data.title.trim();
  if (data.slug !== undefined && data.slug.trim()) {
    const nextSlug = slugify(data.slug);
    if (nextSlug !== insight.slug) {
      const conflict = await Insight.findOne({ slug: nextSlug, _id: { $ne: insight._id } });
      if (conflict) {
        throw new AppError(`Slug '${nextSlug}' is already in use`, 409, 'SLUG_CONFLICT');
      }
      insight.slug = nextSlug;
    }
  }
  if (data.tag !== undefined) insight.tag = data.tag;
  if (data.breadcrumb !== undefined) insight.breadcrumb = data.breadcrumb;
  if (data.date !== undefined) insight.date = data.date;
  if (data.readTime !== undefined) insight.readTime = data.readTime;
  if (data.excerpt !== undefined) insight.excerpt = data.excerpt;
  if (data.intro !== undefined) insight.intro = data.intro;
  if (data.image !== undefined) insight.image = data.image;
  if (data.status !== undefined) insight.status = data.status.toLowerCase();
  if (data.body !== undefined) insight.body = data.body;
  if (data.order !== undefined) insight.order = data.order;

  insight.author = user?.name || user?.email || insight.author;
  await insight.save();

  await RecentChange.create({
    title: insight.title,
    type: 'Insight',
    status: insight.status,
    action: insight.status === 'published' ? 'Published' : 'Draft Saved',
    summary: `Updated insight '${insight.title}' content.`,
    updatedBy: insight.author,
  });

  return insight;
};

const deleteInsight = async (id, user) => {
  const insight = await getInsightByIdOrSlug(id);
  await Insight.findByIdAndDelete(insight._id);

  await RecentChange.create({
    title: insight.title,
    type: 'Insight',
    status: 'hidden',
    action: 'Deleted',
    summary: `Deleted insight '${insight.title}'.`,
    updatedBy: user?.name || user?.email || 'Atlas Admin',
  });

  return { message: 'Insight deleted successfully' };
};

module.exports = {
  initInsights,
  getAllInsights,
  getPublicInsights,
  getInsightByIdOrSlug,
  createInsight,
  updateInsight,
  deleteInsight,
};
