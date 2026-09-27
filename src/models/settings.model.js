const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    publicContactEmail: {
      type: String,
      trim: true,
      default: 'admin@lmcs.com',
    },
    publicPhone: {
      type: String,
      trim: true,
      default: '+1 (555) 019-2837',
    },
    websiteName: {
      type: String,
      trim: true,
      default: 'LMCS Corporate Portal',
    },
    websiteStatus: {
      type: String,
      enum: ['Active', 'Maintenance', 'Offline'],
      default: 'Active',
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

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = {
  Settings,
};
