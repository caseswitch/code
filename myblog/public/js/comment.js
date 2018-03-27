/**
 * 评论ajax请求以及评论区渲染
 */

//评论渲染数据
renderComment.data = {
    limit:5,
    page:1,
    pages:0,
    comments:[],
    len: 0
}

/**
 * 用户提交评论
 */
$("#post-btn").on('click', function (){
    $.ajax({
        method: 'post',
        url: "/api/comment",
        data: {
            contentId: $("#contendId").val(),
            content: $("#comment").val()
        },
        success(data){
            renderComment.data.comments = data.content.comments;
            renderComment.data.len = data.content.comments.length;
            renderPage()
            $(".no-comment").html('');
            $("#comment").val('');
        },
        error(err){

        }
    })
})

/**
 * 加载页面，ajax请求评论区数据并进行渲染
 */
$.ajax({
    method: 'get',
    url: "/api/comment",
    data: {
        contentId: $("#contendId").val()
    },
    success(data){
        console.log(data)
        renderComment.data.len = data.content.comments.length;
        renderComment.data.comments = data.content.comments;
        renderPage();
        $(".no-comment").html('');

    },
    error(err){
        console.log(err)
    }
})

//分页山下页点击事件
$(".page").on('click', 'a', function (){
    var index = $(".page a").index($(this));
    if(index===0){
        renderComment.data.page --;
        if(renderComment.data.page===0){
            renderComment.data.page===0
        }
    }else {
        renderComment.data.page ++;
        if(renderComment.data.page>renderComment.data.pages){
            renderComment.data.page = renderComment.data.pages;
        }
    }
    renderPage();
})

//渲染页码
function renderPage(){
    var comments = renderComment.data.comments.reverse(),
        pageData = renderComment.data,
        ori = 0,
        end = 0,
        currentData = [];
    pageData.pages = Math.ceil(renderComment.data.len/pageData.limit);
    pageData.page = Math.max(1, pageData.page);
    pageData.page = Math.min(pageData.page, pageData.pages);
    ori = (pageData.page-1)*pageData.limit;
    end = (pageData.page)*pageData.limit;
    $(".page-num").html(pageData.page+"/"+pageData.pages);
    for(var i=ori; i<end; i++){
        if(comments[i]===undefined) break;
        currentData.push(comments[i]);
    }
    renderComment(currentData)
}

//评论去渲染函数
function renderComment (data){
    var comments = data;
    var html = '';
    comments.forEach(function (comment){
        html += `
                <li class="comments-item">
                    <div class="comments-item-hd clearfix">
                        <h4 class="comments-user fl">
                            ${comment.username}
                        </h4>
                        <span class="comments-time fr">
                            ${formatDate(comment.postTime)}
                        </span>
                    </div>
                    <p class="comments-item-content">
                        ${comment.content}
                    </p>
                </li>
               `;
    });
    $(".comments-list").html(html);
}

//格式化时间
function formatDate(date){
    var newDate = new Date(date);
    var timeStr = newDate.getFullYear()+'-'+(newDate.getMonth()+1)+'-'+newDate.getDate()+ ' '+newDate.getHours()+':'+newDate.getMinutes();
    return timeStr;
}

