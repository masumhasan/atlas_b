const { LegalDocument } = require('../models/legal.model');
const { RecentChange } = require('../models/change.model');
const { AppError } = require('../utils/response');
const { CANONICAL_LEGAL_DOCUMENTS } = require('../config/seedLegal');

const initLegalDocuments = async () => {
  try {
    for (const item of CANONICAL_LEGAL_DOCUMENTS) {
      const existing = await LegalDocument.findOne({ slug: item.slug });
      if (!existing) {
        await LegalDocument.create(item);
        console.log(`[Legal Init] Created canonical document: ${item.slug}`);
      } else if (!existing.sections || existing.sections.length === 0) {
        existing.sections = item.sections;
        existing.subtitle = existing.subtitle || item.subtitle;
        existing.version = existing.version || item.version;
        existing.effectiveDate = existing.effectiveDate || item.effectiveDate;
        await existing.save();
        console.log(`[Legal Init] Backfilled sections for: ${item.slug}`);
      }
    }
  } catch (error) {
    console.error('[Legal Init] Failed to initialize legal documents:', error.message);
  }
};

const getAllLegalDocs = async () => {
  return LegalDocument.find().sort({ order: 1, createdAt: 1 });
};

const getPublicLegalDocs = async () => {
  return LegalDocument.find({ status: 'published' }).sort({ order: 1, createdAt: 1 });
};

const getLegalDocBySlug = async (slug) => {
  const cleanSlug = String(slug).trim().toLowerCase();
  const doc = await LegalDocument.findOne({ slug: cleanSlug });
  if (!doc) {
    throw new AppError(`Legal document '${slug}' not found`, 404, 'LEGAL_DOC_NOT_FOUND');
  }
  return doc;
};

const updateLegalDoc = async (slug, data, user = {}) => {
  const doc = await getLegalDocBySlug(slug);

  if (data.title !== undefined) {
    doc.title = String(data.title).trim();
  }
  if (data.subtitle !== undefined) {
    doc.subtitle = String(data.subtitle).trim();
  }
  if (data.version !== undefined) {
    doc.version = String(data.version).trim();
  }
  if (data.effectiveDate !== undefined) {
    doc.effectiveDate = String(data.effectiveDate).trim();
  }
  if (data.status !== undefined) {
    const s = String(data.status).toLowerCase();
    if (!['published', 'draft'].includes(s)) {
      throw new AppError("Status must be either 'published' or 'draft'", 400, 'VALIDATION_ERROR');
    }
    doc.status = s;
  }
  if (Array.isArray(data.sections)) {
    doc.sections = data.sections.map((sec, idx) => {
      const rawN = sec.n || String(idx + 1).padStart(2, '0');
      const cleanN = String(rawN).padStart(2, '0');
      return {
        id: sec.id ? String(sec.id) : cleanN,
        n: cleanN,
        title: String(sec.title || '').trim(),
        shortTitle: String(sec.shortTitle || sec.title || '').trim(),
        paragraphs: Array.isArray(sec.paragraphs)
          ? sec.paragraphs.map((p) => String(p).trim()).filter(Boolean)
          : [],
        highlight:
          sec.highlight && (sec.highlight.label || sec.highlight.value)
            ? {
                label: String(sec.highlight.label || '').trim(),
                value: String(sec.highlight.value || '').trim(),
              }
            : null,
        cta:
          sec.cta && sec.cta.label
            ? {
                label: String(sec.cta.label).trim(),
              }
            : null,
      };
    });
  }

  await doc.save();

  try {
    await RecentChange.create({
      title: doc.title,
      type: 'Legal',
      status: doc.status,
      action: doc.status === 'published' ? 'Published' : 'Draft Saved',
      summary: `Updated legal document ${doc.title} (${doc.version})`,
      updatedBy: user.name || user.email || 'Atlas Admin',
    });
  } catch (err) {
    console.warn('[RecentChange] Failed to log legal change:', err.message);
  }

  return doc;
};

const createLegalDoc = async (data, user = {}) => {
  const cleanSlug = String(data.slug || '')
    .trim()
    .toLowerCase()
    .replace(/^\/+/, '');

  if (!cleanSlug) {
    throw new AppError('Slug is required', 400, 'VALIDATION_ERROR');
  }

  const existing = await LegalDocument.findOne({ slug: cleanSlug });
  if (existing) {
    throw new AppError(`Legal document with slug '${cleanSlug}' already exists`, 409, 'SLUG_CONFLICT');
  }

  const doc = await LegalDocument.create({
    slug: cleanSlug,
    title: String(data.title || 'Untitled Document').trim(),
    subtitle: String(data.subtitle || '').trim(),
    version: data.version || 'v1.0',
    effectiveDate: data.effectiveDate || '',
    status: (data.status || 'published').toLowerCase(),
    order: typeof data.order === 'number' ? data.order : 99,
    sections: Array.isArray(data.sections) ? data.sections : [],
  });

  return doc;
};

module.exports = {
  initLegalDocuments,
  getAllLegalDocs,
  getPublicLegalDocs,
  getLegalDocBySlug,
  updateLegalDoc,
  createLegalDoc,
};
