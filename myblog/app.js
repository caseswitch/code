/**
 * Created by zl on 2017/2/19.
 * 入口文件
 */

var express = require('express')

var swig = require('swig');

//加载数据库模块
var mongoose = require('mongoose');

//加载body-parse,用于处理post提交过来的数据
var bodyParser = require('body-parser')

var Cookie = require('cookies');

var User = require('./models/User.js');

var app = express();


//-----------中间件-------------------

//设置bodyParser
app.use(bodyParser.urlencoded({extended: true}))


//设置cookie
app.use(function (req, res, next){
    req.cookies = new Cookie(req, res);

    //存放用户的cookies信息
    req.userInfo = {};
    
    if(req.cookies.get('userInfo')){
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = userInfo.isAdmin;
                next();
            })
        }catch (err){
            next();
        }
    }
    else {
        next();
    }

})


//路由设置
app.use('/', require('./routers/main'))

app.use('/admin', require('./routers/admin'))

app.use('/api', require('./routers/api'))

//静态文件托管
app.use('/public', express.static(__dirname+'/public'));
//---------------------

//设置模版引擎
app.engine('html', swig.renderFile);
//设置模版文件存放的目录，par1:必须是views   par2: 实际目录
app.set('views', './views')
//注册模版引擎 par1: 必须是view engine par2 :和 app.engine方法定义的模版引擎方法必须一致（第二个参数）
app.set('view engine', 'html');
//开发过程中，需要取消缓存
swig.setDefaults({cache:false})

//------------------

mongoose.connect('mongodb://127.0.0.1:27017/blog', function (err){
    if(err){

        console.log('数据库连接失败')
    }else {
        console.log('数据库连接成功')
        //注意应该在等待数据库连接成功在去和客户端开启通信
        app.listen(8888,function (){
            console.log('myBlog')
        })
    }
})
