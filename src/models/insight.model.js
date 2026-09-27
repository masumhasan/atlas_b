const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['paragraph', 'quote', 'image'],
      required: true,
      default: 'paragraph',
    },
    text: { type: String, default: '' },
    quote: { type: String, default: '' },
    attribution: { type: String, default: '' },
    src: { type: String, default: '' },
    caption: { type: String, default: '' },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true },
    content: [contentBlockSchema],
  },
  { _id: false }
);

const insightSchema = new mongoose.Schema(
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
    tag: {
      type: String,
      required: [true, 'Tag / Category is required'],
      trim: true,
      default: 'Strategy',
      index: true,
    },
    breadcrumb: {
      type: String,
      trim: true,
      default: 'Archive / Insights',
    },
    date: {
      type: String,
      trim: true,
      default: () =>
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
    },
    readTime: {
      type: String,
      trim: true,
      default: '8 min read',
    },
    excerpt: {
      type: String,
      trim: true,
      default: '',
    },
    intro: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      trim: true,
      default: '/images/insight/1insight.png',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
      index: true,
    },
    author: {
      type: String,
      trim: true,
      default: 'Atlas Admin',
    },
    body: [sectionSchema],
    order: {
      type: Number,
      default: 0,
      index: true,
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

insightSchema.index({ title: 'text', excerpt: 'text' });

const Insight = mongoose.model('Insight', insightSchema);

module.exports = {
  Insight,
};
