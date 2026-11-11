const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide doctor name'],
      trim: true
    },
    specialization: {
      type: String,
      required: [true, 'Please provide doctor specialization'],
      trim: true
    },
    hospital: {
      type: String,
      required: [true, 'Please provide hospital name'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide doctor phone number'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide doctor email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });
doctorSchema.index({ specialization: 1, hospital: 1 });
doctorSchema.index({ createdAt: -1 });

// Virtual populate for patients assigned to this doctor
doctorSchema.virtual('patients', {
  ref: 'Patient',
  localField: '_id',
  foreignField: 'doctorId',
  justOne: false
});

module.exports = mongoose.model('Doctor', doctorSchema);
