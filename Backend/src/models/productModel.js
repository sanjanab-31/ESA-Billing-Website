const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hsnCode: { type: String, required: true },
  userId: { type: String, required: true, index: true },
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
