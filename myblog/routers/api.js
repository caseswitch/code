/**
 * Created by zl on 2017/2/19.
 * 负责处理/api 路由
 */
var express = require('express');
var router = express.Router();
//引入数据模型
var User = require('../models/User');
var Content= require('../models/Content')

//响应数据
var resData;
router.use(function(req, res, next){
    //每次初始化resData
    resData = {
        code: 0,
        message: ''
    }
    next();
})

/**
 * 注册
 */
router.post('/user/register', function (req, res, next){
    //简单密码验证
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    if(username == ''){
        resData = {
            code: 1,
            message: '用户名不能为空'
        }
        res.json(resData)
        return;
    }
    if(password == ""){
        resData = {
            code: 2,
            message: '密码不能为空'
        }
        res.json(resData)
        return;
    }
    if(password != repassword){
        resData = {
            code: 3,
            message: '两次输入的密码必须一致'
        }
        res.json(resData)
        return;
    }
    User.findOne({
        username: username
    }).then(function (result){

        if(result !== null){
            resData = {
                code: 4,
                message: '您注册的用户名已经存在'
            }
            res.json(resData);
            return;
        }else {
            resData.message = "注册成功"
            res.json(resData)

            var user = new User({
                    username:username,
                    password:password
                });
            return user.save();

        }
    }).catch(function (err){
        console.log(err)
    })


})

/**
 * 登录
 */
router.post('/user/login', function (req, res){
    var username = req.body.username;
    var password = req.body.password;
    User.findOne({
        username: username,
        password: password
    }).then(function (result){
        if(username == "" || password == ""){
            resData = {
                code: 1,
                message: '用户名和密码不能为空'
            }
            res.json(resData);
            return;
        }
        if(result===null){
            resData = {
                code: 2,
                message: '您输入的密码或者用户名错误'
            }
            res.json(resData);
            return;
        }else {
            resData.message = "登录成功";
            resData.userInfo = {
                username: result.username,
                _id: result._id
            }
            //设置cookies，注意设置为一个JSON
            req.cookies.set('userInfo',JSON.stringify({
                username: result.username,
                _id: result._id
            }))
            res.json(resData)
        }
    }).catch(function (err){
        console.log(err);
    })

})

/**
 * 登出
 */
router.get('/user/loginout', function (req, res){
    var id = req.query.contentId || '';
    req.cookies.set('userInfo', null);
    res.render('main/index', {
        userInfo:req.userInfo,
    })
})

/**
 * 评论提交
 */
router.post('/comment', function (req, res){

    //评论提交数据对象
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    }
    Content.findOne({
        _id: req.body.contentId
    }).then(function (content){

        if(content===null){
            return;
        }
        content.comments.push(postData);
        return content.save();
    }).then(function (newContent){
        resData.message = "评论成功"
        resData.content = newContent;
        res.json(resData);
    }).catch(function (err){
        console.log(err);
    })
})

/**
 * 刷新加载评论
 */
router.get('/comment', function (req, res){
    Content.findOne({
        _id: req.query.contentId
    }).then(function (content){
        console.log(content)
        resData.content = content;
        res.json(resData);
    }).catch(function (err){
        console.log(err)
    })
})

module.exports = router;