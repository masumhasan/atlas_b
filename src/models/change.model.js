const mongoose = require('mongoose');

const changeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Page', 'Insight', 'Legal', 'Report', 'Inquiry'],
      default: 'Page',
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'hidden', 'new', 'read', 'closed'],
      default: 'published',
    },
    action: {
      type: String,
      default: 'Updated',
    },
    summary: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      default: 'Atlas Admin',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const RecentChange = mongoose.model('RecentChange', changeSchema);

module.exports = { RecentChange };
