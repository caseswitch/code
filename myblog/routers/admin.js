/**
 * Created by zl on 2017/2/19.
 * 负责处理管理业/admin路由
 */
var express = require('express');
//引入用户数据模型
var User = require('../models/User')
//引入分类数据模型
var Category = require('../models/Category');
//引入内容数据模型
var Content = require('../models/Content')
var marked = require('marked')
//引入上传文件处理模块
var multer = require("multer");
//引入markdwon处理模块
var marked = require("marked");

var upload = multer();
var router = express.Router()
router.use(function (req, res, next){
    // 在这里进行管理身份验证，如果只有路由对上但是isAdmin为false时，不能通过
    if(!req.userInfo.isAdmin){
        res.send('只有管理员才可以进入管理页面！')
        return;
    }
    next();
})

/**
 * 管理首页
 */
router.get('/', function (req, res){
    res.render('./admin/index', {
        userInfo: req.userInfo
    });
})

/**
 * 用户管理
 */
router.get('/user', function (req, res){
    var page = Number(req.query.page || 1);

    //每页页码
    var limit = 10;
    User.count().then(function (count){
        var pages = Math.ceil(count/limit);

        //页码边界判断
        page = Math.min(page, pages);
        page = Math.max(page, 1);

        //忽略条数
        var skip = (page - 1)*limit;
        User.find().limit(limit).skip(skip).then(function (data){
            req.userInfo.users = data;
            res.render('./admin/user-list', {
                userInfo: req.userInfo,
                page: page,
                count: count,
                pages:pages,
                limit: limit,
                which: 'user'

            });
        })
    }).catch(function (err){
        console.log(err)
    })


})

/**
 * 分类首页
 */
router.get('/category', function (req, res){
    var page = Number(req.query.page || 1);

    //每页显示条数
    var limit = 10;
    Category.count().then(function (count){
        var pages = Math.ceil(count/limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);

        var skip = (page - 1)*limit;
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function (categories){
            res.render('./admin/category', {
                userInfo: req.userInfo,
                page: page,
                count: count,
                pages:pages,
                limit: limit,
                categories:categories,
                which: "category"

            });
        })
    })
})

/**
 * 分类添加页
 */
router.get('/category/add', function (req, res){

    res.render('admin/category_add',{
        userInfo: req.userInfo,

    })
})

/**
 *  分类添加请求
 */
router.post('/category/add', function (req, res){
    var name = req.body.name;
    if(name==""){
        res.render('admin/error',{
            userInfo: req.userInfo,
            message: '请填写分类名称'
        })
        return;
    }else{
        Category.findOne({
            name:name
        }).then(function (rs){

            if(rs===null){
                return new Category({
                    name:name
                }).save()
            }else {
                res.render('admin/error', {
                    userInfo: req.userInfo,
                    message: "您要创建的类已经存在了",
                    url: '/admin/category'
                })
                return Promise.reject();
            }
        }).then(function (newCategory){
            res.render('admin/success', {
                userInfo: req.userInfo,
                message: "分类保存成功",
                url: '/admin/category'
            })
        }).catch(function (err){
            console.log(err);
        })
    }

})

/**
 * 分类编辑 请求页面
 */
router.get('/category/edit', function (req, res){
    var id = req.query.id || '';

    Category.findOne({
        _id: id
    }).then(function (category){
        if(category === null){
            res.render('admin/error', {
                userInfo:req.userInfo,
                message: "您要修改的类不存在"
            })
        }else {
            res.render('admin/category_edit', {
                userInfo:req.userInfo,
                category: category
            })
        }
    }).catch(function (err){
        console.log(err);
    })


})
/**
 * 分类编辑 请求数据 POST
 */
router.post('/category/edit', function (req, res){
    var id = req.query.id || '';
    var name = req.body.name;

    if(name===""){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '不能输入一个空的名称'
        })
        return;
    }
    Category.findOne({
        name:name
    }).then(function (category){
        if(category){
            res.render('admin/error',{
                userInfo: req.userInfo,
                message: "已经存在的分类"
            })
            return Promise.reject();
        }else {
            return Category.update({
                //要修改数据的条件
                _id: id
            },{
                name:name
            })
        }
    }).then(function (){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改分类成功',
            url: '/admin/category'
        })
    })

})
/**
 * 删除分类
 */
router.get('/category/delete', function (req, res){
    var id = req.query.id || '';
    Category.findOne({
        _id: id
    }).then(function (category){
        if(category){
          return Category.remove({
              _id: id
          })
        }else {
          res.render('/admin/error', {
              userInfo: req.userInfo,
              message: "你要删除的类不存在"
          })
            return Promise.reject();
        }
    }).then(function (){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: "成功删除类",
            url: '/admin/category'
        })
    })
})


/**
 * 内容管理首页
 */
router.get('/content', function (req, res){
    var page = Number(req.query.page || 1);

    //内容管理首页显示数据条数
    var limit = 10;

    Content.count().then(function (count){
        var pages = Math.ceil(count/limit);

        //处理页码边界情况
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1)*limit;
        Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(['category', 'user']).then(function (contents){
            res.setHeader('Content-Type', 'text/html');
            res.render('admin/content', {
                userInfo: req.userInfo,
                page: page,
                count: count,
                pages:pages,
                limit: limit,
                contents:contents,
                which: "content"
            });
        }).catch(function (err){
            console.log(err);
        })

    })
})

/**
 * 内容添加页
 */

router.get('/content/add', function (req, res){
    Category.find().then(function (categories){
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories,

        })
    }).catch(function (err){
        console.log(err)
    })
})
/**
 * 内容提交
 */
router.post('/content/add', upload.single('avatar'), function (req, res){

    //对上传文件进行解析
    var content = "";
    var title = req.body.title;
    //上传内容验证
    if(req.file === undefined && req.body.content_input === ""){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: "您要上传的内容不能为空哦"
        })
        return;
    }
    if(title===""){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题不能为空',
        })
        return;
    }

    //确定上传来源是文件 还是 textarea填写的 优先将textarea填写的内容设定为内容
    if(req.file !== undefined){
        content = req.file.buffer.toString().trim();
    }
    if(req.body.content_input.trim() !== ""){
        content = req.body.content_input;
    }

    new Content({
        category: req.body.category,
        title: title,
        user: req.userInfo._id.toString(),
        intro: req.body.intro,
        content: content
    }).save().then(function (){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: "内容添加成功",
            url: "/admin/content"
        })
    }).catch(function (err){
        console.log("内容添加失败，" + err)
    })

})
/**
 * 内容修改页
 */
router.get('/content/edit', function (req, res){
    var id = req.query.id || '';

    //分类列表下拉条
    var categories = [];
    Category.find().then(function (rs){
        categories = rs;
        Content.findOne({
            _id: id
        }).then(function (content){

            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                content: content,
                categories: categories
            })
        }).catch(function (err){
            console.log(err)
        })
    })

})
/**
 * 内容修改提交
 */
router.post('/content/edit', function (req, res){

    //内容验证
    if(req.body.content_input=="" || req.body.title==""){
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题或者内容不能为空',
        })
        return;
    }
    var id = req.query.id || '';
    console.log(req.body.content_input)
    Content.findOne({
        _id: id
    }).then(function (rs){

        //根据条件进行筛选
        return Content.update({
            _id: id
        }, {
            category: req.body.category,
            title: req.body.title,
            user: req.userInfo._id.toString(),
            intro: req.body.intro,
            content: req.body.content_input
        })
    }).then(function (){
        res.render('admin/success',{
            userInfo: req.userInfo,
            message: "修改成功 ",
            url: '/admin/content'
        })
    }).catch(function (){
        res.render('admin/success', {
            userInfo: req.userInfo,
            messsge: "操作失败"
        })
    })
})

/**
 * 内容删除
 */
router.get('/content/delete', function (req, res){
    var id = req.query.id || "";
    Content.remove({
        _id: id
    }).then(function (){
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: "内容已经删除",
            url: "/admin/content"
        })
    }).catch(function (){
        res.render('admin/success', {
            userInfo: req.userInfo,
            messsge: "操作失败"
        })
    })
})

module.exports = router;