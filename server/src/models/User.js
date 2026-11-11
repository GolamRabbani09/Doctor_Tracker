const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Note: unique index on email is created automatically via field definition unique: true

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare entered plain text password with hashed password in database
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Sign JWT and return token
 * @returns {string}
 */
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, name: this.name, email: this.email },
    process.env.JWT_SECRET || 'doctor_tracker_jwt_super_secret_production_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

module.exports = mongoose.model('User', userSchema);
