const mongoose = require('mongoose');

const VALID_INQUIRY_TYPES = [
  'Project Assessment',
  'Atlas Platform',
  'Executive / Portfolio',
  'Practitioner',
  'Partnership',
  'General Inquiry',
];

const inquirySchema = new mongoose.Schema(
  {
    inquiryType: {
      type: String,
      enum: {
        values: VALID_INQUIRY_TYPES,
        message: '{VALUE} is not a valid inquiry type',
      },
      required: [true, 'Inquiry type is required'],
      default: 'General Inquiry',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Work email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    project: {
      type: String,
      trim: true,
      default: '',
    },
    context: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'Read', 'Closed'],
      default: 'New',
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      default: '',
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

inquirySchema.index({
  name: 'text',
  email: 'text',
  organization: 'text',
  project: 'text',
  message: 'text',
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = {
  Inquiry,
  VALID_INQUIRY_TYPES,
};
