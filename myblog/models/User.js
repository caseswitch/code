var mongo = require('mongoose');
var usersSchema = require('../schemas/user');

//第一个参数 模型名字 第二个参数 图标结构
module.exports = mongo.model('User', usersSchema);