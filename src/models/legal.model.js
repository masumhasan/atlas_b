const mongoose = require('mongoose');

const legalHighlightSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    value: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const legalCtaSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const legalSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    n: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    shortTitle: { type: String, required: true, trim: true },
    paragraphs: {
      type: [String],
      default: [],
    },
    highlight: {
      type: legalHighlightSchema,
      default: null,
    },
    cta: {
      type: legalCtaSchema,
      default: null,
    },
  },
  { _id: false }
);

const legalDocumentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
      default: '',
    },
    version: {
      type: String,
      trim: true,
      default: 'v1.0',
    },
    effectiveDate: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    sections: {
      type: [legalSectionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

legalDocumentSchema.index({ title: 'text', subtitle: 'text' });

const LegalDocument = mongoose.model('LegalDocument', legalDocumentSchema);

module.exports = {
  LegalDocument,
};
