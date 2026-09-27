const { Inquiry, VALID_INQUIRY_TYPES } = require('../models/inquiry.model');
const { RecentChange } = require('../models/change.model');
const { AppError } = require('../utils/response');
const { SEED_INQUIRIES } = require('../config/seedInquiries');

const initInquiries = async () => {
  try {
    const count = await Inquiry.countDocuments();
    if (count === 0) {
      await Inquiry.insertMany(SEED_INQUIRIES);
      console.log(`[Inquiries Init] Seeded ${SEED_INQUIRIES.length} initial inquiries.`);
    }
  } catch (error) {
    console.error('[Inquiries Init] Failed to initialize inquiries:', error.message);
  }
};

const getInquiries = async ({ search = '', status = '', page = 1, limit = 50 } = {}) => {
  const query = {};

  if (status && status !== 'All') {
    query.status = status;
  }

  if (search && search.trim()) {
    const term = search.trim();
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { organization: { $regex: term, $options: 'i' } },
      { project: { $regex: term, $options: 'i' } },
      { message: { $regex: term, $options: 'i' } },
      { inquiryType: { $regex: term, $options: 'i' } },
      { subject: { $regex: term, $options: 'i' } },
    ];
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (p - 1) * l;

  const [inquiries, total, newCount, readCount, closedCount] = await Promise.all([
    Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(l),
    Inquiry.countDocuments(query),
    Inquiry.countDocuments({ status: 'New' }),
    Inquiry.countDocuments({ status: 'Read' }),
    Inquiry.countDocuments({ status: 'Closed' }),
  ]);

  return {
    inquiries,
    total,
    page: p,
    limit: l,
    counts: {
      New: newCount,
      Read: readCount,
      Closed: closedCount,
      Total: newCount + readCount + closedCount,
    },
  };
};

const getInquiryById = async (id) => {
  const item = await Inquiry.findById(id);
  if (!item) {
    throw new AppError('Inquiry not found', 404, 'INQUIRY_NOT_FOUND');
  }
  return item;
};

const createInquiry = async (data) => {
  const {
    inquiryType,
    name,
    organization = '',
    role = '',
    phone = '',
    email,
    project = '',
    context = '',
    message = '',
    subject,
  } = data;

  if (!name || !name.trim()) {
    throw new AppError('Name is required', 400, 'VALIDATION_ERROR');
  }

  if (!email || !email.trim()) {
    throw new AppError('Work email is required', 400, 'VALIDATION_ERROR');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new AppError('Valid work email is required', 400, 'VALIDATION_ERROR');
  }

  let cleanType = (inquiryType || 'General Inquiry').trim();
  if (!VALID_INQUIRY_TYPES.includes(cleanType)) {
    const match = VALID_INQUIRY_TYPES.find(
      (t) => t.toLowerCase() === cleanType.toLowerCase()
    );
    cleanType = match || 'General Inquiry';
  }

  const cleanSubject =
    subject && subject.trim() ? subject.trim() : `${cleanType} Request`;

  const item = await Inquiry.create({
    inquiryType: cleanType,
    name: name.trim(),
    organization: organization.trim(),
    role: role.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    project: project.trim(),
    context: context.trim(),
    message: message.trim(),
    subject: cleanSubject,
    status: 'New',
  });

  return item;
};

const updateInquiryStatus = async (id, status, user = {}) => {
  const valid = ['New', 'Read', 'Closed'];
  if (!valid.includes(status)) {
    throw new AppError(
      `Status must be one of: ${valid.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }

  const item = await getInquiryById(id);
  item.status = status;
  await item.save();

  try {
    await RecentChange.create({
      title: `${item.name} (${item.inquiryType})`,
      type: 'Inquiry',
      status: status.toLowerCase(),
      action: status === 'Closed' ? 'Closed' : 'Updated',
      summary: `Inquiry status changed to ${status} by ${user.name || user.email || 'Admin'}`,
      updatedBy: user.name || user.email || 'Atlas Admin',
    });
  } catch (err) {
    console.warn('[RecentChange] Failed to log inquiry status update:', err.message);
  }

  return item;
};

const deleteInquiry = async (id) => {
  const item = await getInquiryById(id);
  await item.deleteOne();
  return { id };
};

module.exports = {
  initInquiries,
  getInquiries,
  getInquiryById,
  createInquiry,
  updateInquiryStatus,
  deleteInquiry,
};
