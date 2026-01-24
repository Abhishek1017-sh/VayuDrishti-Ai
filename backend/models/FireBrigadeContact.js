const mongoose = require('mongoose');

const fireBrigadeContactSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: true,
    unique: true,
    enum: ['Zone-1', 'Zone-2', 'Zone-3', 'Zone-A', 'Zone-B', 'Zone-C', 'Facility-1', 'Facility-2']
  },
  zoneName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  contactPerson: String,
  city: String,
  address: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FireBrigadeContact', fireBrigadeContactSchema);
