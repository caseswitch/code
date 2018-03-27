/**
 * Created by zl on 2017/2/19.
 * 处理页面ajax请求
 */
$(function (){
    //点击按钮登录框与注册框切换
    $('.login-box .register-btn').on('click', function (){
        $('.login-box').hide();
        $('.register-box').show();
    })
    $('.register-box .login-btn').on('click', function (){
        $('.login-box').show();
        $('.register-box').hide();
    })

    /**
     * 轮播图的实现
     */
    var handler=null;
    function initBanner() {
        start();
    }
    function ChangImg(index){
        index=index%4;
        $('.banner>.ad').find('*').removeClass('select').end().find(':nth-child('+index+')').addClass('select');

    }
    function start() {
        handler=setInterval(function () {
            var index=$('.banner>.ad>.select').index();
            console.log(index);
            ChangImg(index+1);

        },2000);
    }
    $(function () {
        start();
    })



    /**
     * 注册请求
     */
    $('.register-box .side-submit').on('click', function (){
        console.log($('.register-box').find('[name="repassword"]'))

        $.ajax({
            type:'post',
            url: '/api/user/register',
            data: {
                username: $('.register-box').find('[name="username"]').val(),
                password: $('.register-box').find('[name="password"]').val(),
                repassword: $('.register-box').find('[name="repassword"]').val()
            },
            dataType: 'json',//
            success: function (data){
               $('.register-box .user-waring').html(data.message)
               if(data.code==0){
                   setTimeout(function (){
                       $(".register-box").hide();
                       $(".login-box").show();
                       $('.register-box .user-waring').html();
                   },1000)
               }
            },
            error: function (err, data){
                console.log('失败了')
            }

        })
    })

    /**
     * 登录请求
     */
    $('.login-box .side-submit').on('click', function (){
        console.log($('.register-box').find('[name="repassword"]'))

        $.ajax({
            type:'post',
            url: '/api/user/login',
            data: {

                username: $('.login-box').find('[name="username"]').val(),
                password: $('.login-box').find('[name="password"]').val()

            },
            dataType: 'json',
            success: function (data){

                $('.login-box .user-waring').html(data.message)
                $('.user-waring').html(data.message)
                if(data.code==0){

                        //如果发送请求成功，那么重新发送请求得到新的模版
                        window.location.reload();
                }
            },
            error: function (err, data){
                console.log('失败了'+err)
            }

        })
    })

    /**
     * 登出
     */
    $('#login-out').on('click', function (){
        $.ajax({
            url: '/api/user/loginout',
            data: {},
            success: function (){
                window.location.reload();
            },
            error: function (err){
                console.log(err)
            }
        })
    })
})