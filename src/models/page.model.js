const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Page name is required'],
      trim: true,
    },
    route: {
      type: String,
      required: [true, 'Page route is required'],
      unique: true,
      trim: true,
    },
    originalRoute: {
      type: String,
      trim: true,
    },
    visibility: {
      type: String,
      enum: {
        values: ['published', 'hidden', 'draft'],
        message: 'Invalid visibility status: {VALUE}',
      },
      default: 'published',
      index: true,
    },
    slug: {
      type: String,
      trim: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
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

const Page = mongoose.model('Page', pageSchema);

module.exports = { Page };
