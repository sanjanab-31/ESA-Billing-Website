const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client', // Assuming you have a Client model
    required: true,
  },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  gstAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Outstanding', 'Draft'],
    default: 'Draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Add other relevant fields like invoiceNumber, dueDate, etc.
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
