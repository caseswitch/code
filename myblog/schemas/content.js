/**
 * Created by zl on 2017/2/22.
 */
var mongo = require('mongoose');

//用户的表结构
module.exports = {
    //配置图表基础字段
    //关联字段
    category: {
        //类型
        type: mongo.Schema.Types.ObjectId,
        //引用
        ref: 'Category'
    },
    user: {
        type:mongo.Schema.Types.ObjectId,
        ref: 'User'
    },
    addTime: {
        type: Date,
        default: new Date()
    },
    views: {
        type: Number,
        default: 0
    },
    //标题
    title : {
        type: String,
        default: ''
    },
    //内容简介
    intro :  {
        type: String,
        default: ''
    },
    //内容
    content: {
        type: String,
        default: ''
    },
    //评论
    comments: {
        type: Array,
        default: []
    }

}