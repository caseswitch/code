/**
 * Created by zl on 2017/2/19.
 * 负责处理/main 用户展示页路由
 */
var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');
var marked = require('marked');
//返回数据
var data = {};
router.use(function (req, res, next){

    //用户页面每次请求返回分类数据
    Category.find().then(function (categories){
        data.categories = categories;
    })
    next()
})
router.get('/', function (req, res){

    /*
     读取views目录下的指定文件，解析并返回给客户端
     第一个参数 表示模版的文件， 相对于views目录 views/index.html
     第二个参数 传递给模版使用的数据
     */
    //将cookies传到index模版里
    //发送给模版的数据

    //页码各项数据
    data.pages = 0,
    data.page = Number(req.query.page || 1),
    data.limit = 5,
    data.count = 0,
    data.whichCategory = req.query.category || '';
    var where = {};
    if(data.whichCategory){
        where.category = data.whichCategory;
    }
    Content.where(where).count().then(function (count){
        data.count = count;
        data.pages = Math.ceil(data.count/data.limit);
        data.page = Math.min(data.page, data.pages);
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1)*data.limit;
        return Content.find().where(where).sort({_id: -1}).limit(data.limit).skip(skip).populate(['category', 'user']);
    }).then(function (contents){
         res.render('main/index', {
             userInfo: req.userInfo,
             contents:contents,
             categories:data.categories,
             data: data
        });
    }).catch(function (err){
        console.log(err);
    })
})

/**
 * 内容详情页
 */
router.get('/views', function (req, res){
    var id = req.query.contentId || "";
    var newContent = '';
    Content.findOne({
        _id: id
    }).then(function (content){

        //页面加载，阅读数+1
        content.views ++;
        newContent = marked(content.content);
        content.save();
        res.render('main/views', {
            userInfo: req.userInfo,
            content: content,
            newContent: newContent,
            categories: data.categories,
            data: data,
            offside: true
        })
    }).catch(function (err){
        console.log(err);
    })

})

module.exports = router;