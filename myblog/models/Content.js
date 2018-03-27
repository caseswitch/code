var mongo = require('mongoose');
var contentSchema = require('../schemas/content');

module.exports = mongo.model('Content', contentSchema);