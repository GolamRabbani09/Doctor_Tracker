const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide patient name'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Please provide patient age'],
      min: [0, 'Age must be non-negative']
    },
    gender: {
      type: String,
      required: [true, 'Please specify patient gender'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: '{VALUE} is not a valid gender'
      }
    },
    phone: {
      type: String,
      required: [true, 'Please provide patient phone number'],
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    condition: {
      type: String,
      required: [true, 'Please provide patient diagnosed condition'],
      trim: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Please assign a doctor for this patient']
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
patientSchema.index({ name: 'text', condition: 'text' });
patientSchema.index({ doctorId: 1 });
patientSchema.index({ createdAt: -1 });
patientSchema.index({ condition: 1, doctorId: 1 });

// Query middleware to auto-populate doctorId with name and specialization
patientSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'doctorId',
    select: 'name specialization hospital email phone'
  });
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
