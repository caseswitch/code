var mongoose = require('mongoose');
var CategoriesSchema = require('../schemas/categories');

module.exports = mongoose.model('Category', CategoriesSchema);