/**
 * 轮播图的实现
 */
var handler=null;
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
