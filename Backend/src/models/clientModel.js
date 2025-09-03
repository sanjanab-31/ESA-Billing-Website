const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  gstin: { type: String, required: true },
  phone: String,
  address: String,
  userId: { type: String, required: true, index: true }, // To associate with a Firebase user
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
