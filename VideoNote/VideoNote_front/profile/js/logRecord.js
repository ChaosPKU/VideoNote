/*
 *********  用户操作编码  *********
 在扩展程序那边代码记:
 100: 打开某个video
 120/121: 显示/关闭笔记区域

 140:下载某个video
 150:切换某个video

 400: 假发布笔记(相关区域)

 110: 切换视频时间（此时有多少相关笔记）
 120: 暂停
 130/131: 切换查看我的/其他笔记
 132:查看视频分析

 200: 查看某个笔记(该笔记一套相关信息)
 操作某个笔记——
 210/211: 假/真回复(该笔记一套相关信息)
 220/221: 赞/取消赞(该笔记一套相关信息)
 230/231: 收藏/取消收藏(该笔记一套相关信息)
 240/241: 关注/取消关注(该笔记一套相关信息)

 250:编辑某个笔记(该笔记经过编辑的相关信息)
 260:删除某个笔记(该笔记一套相关信息)

 300: 查阅某人资料(谁)

 401: 真发布笔记(相关区域)
 */

//110:切换视频时间
function recordPageChange(who, courseID, pdf, page, notesNum){
    //console.log(arguments);
    jQuery.ajax({
        url:'/recordPageChange',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: 110,
            status: [notesNum]
        },
        success:function(response){
            // console.log(response);
        },
        error:function(response){

        }
    });
}
//130/131: 切换查看最新/最热笔记
function recordNewOrHot(who, courseID, pdf, page, switchHot){
    //console.log(arguments);
    // switchHot == 0, 切换成最新 —— 130
    // switchHot == 1, 切换成最热 —— 131
    jQuery.ajax({
        url:'/recordNewOrHot',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: switchHot == 0 ? 130 : 131
        },
        success:function(response){
            // console.log(response);
        },
        error:function(response){

        }
    });
}
//200: 查看某个笔记(该笔记一套相关信息)
function recordViewANote(who, courseID, pdf, page, noteInfo){
    /*
     noteInfo 需要用到的东西
     noteIndex
     from
     title
     type
     relatedRangeContent
     clickNum
     replyNum
     praiseNum
     concernNum
     collectNum
     */
    // console.log(arguments);

    jQuery.ajax({
        url:'/recordViewANote',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: 200,
            status: [noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title, noteInfo.type,
                noteInfo.relatedRangeContent, noteInfo.clickCnt, noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            //   console.log(response);
        },
        error:function(response){

        }
    });
}
//210: 假回复
function recordFakeReply(who, courseID, pdf, page, noteInfo){
    /*
     noteInfo 与上一个一样
     */
    //console.log(arguments);
    jQuery.ajax({
        url:'/recordFakeReply',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: 210,
            status: [noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title, noteInfo.type,
                noteInfo.relatedRangeContent, noteInfo.clickCnt, noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){

        }
    });
}
//211: 真回复
function recordRealReply(who, courseID, pdf, page, noteInfo){
    /*
     noteInfo 与上一个一样
     */
    //console.log(arguments);
    jQuery.ajax({
        url:'/recordRealReply',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: 211,
            status: [noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title, noteInfo.type,
                noteInfo.relatedRangeContent, noteInfo.clickCnt, noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){

        }
    });
}
//6合1函数，记录对笔记的操作
//220/221: 赞/取消赞(该笔记一套相关信息)
//230/231: 关注/取消关注(该笔记一套相关信息)
//240/241: 收藏/取消收藏(该笔记一套相关信息)
function recordOperateReply(who, courseID, pdf, page, noteInfo, which , upOrDown){
    /*
     noteInfo 与上一个一样
     which : 0 赞， 1 关注， 2 收藏
     upOrDown: 0 加， 1 减
     */
    var doWhat = "";
    if(which == 0){
        doWhat = upOrDown == 0 ? 220 : 221 ;
    }else if(which == 1){
        doWhat = upOrDown == 0 ? 230 : 231 ;
    }else{
        doWhat = upOrDown == 0 ? 240 : 241 ;
    }
    //console.log(arguments);
    jQuery.ajax({
        url:'/recordOperateReply',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: doWhat,
            status: [noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title, noteInfo.type,
                noteInfo.relatedRangeContent, noteInfo.clickCnt, noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){

        }
    });
}
//250: 记录编辑操作
function recordEdit(who, courseID, pdf, page, noteInfo){
    /*
     noteInfo 与上一个一样
     */
    console.log(arguments);
    jQuery.ajax({
        url:'/recordEdit',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: 250,
            status: [noteInfo.noteIndex, noteInfo.title, noteInfo.type, noteInfo.body]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){

        }
    });
}
//260: 记录删除操作
function recordDelete(who, courseID, pdf, page, noteIndex){
    /*
     noteInfo 与上一个一样
     */
    //console.log(arguments);
    jQuery.ajax({
        url:'/recordDelete',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: 260,
            status: [noteIndex]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){

        }
    });
}
//300: 查阅某人资料
function recordViewInfo(who, courseID, pdf, page, noteInfo, viewWho){
    /*
     status一开始多了一个viewWho，用来记录查看了谁，后面的noteinfo并不一定有用，先记着。。
     noteInfo 与上一个一样
     */
    //console.log(arguments);
    jQuery.ajax({
        url:'/recordViewInfo',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: 300,
            status: [viewWho, noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title, noteInfo.type,
                noteInfo.relatedRangeContent, noteInfo.clickCnt, noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){

        }
    });
}
//401: 真的发布笔记
function recordRealNote(who, courseID, pdf, page, relContent){
    //console.log(arguments);
    jQuery.ajax({
        url:'/recordRealNote',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            whatCourse: courseID,
            whatPDF: pdf,
            whatPage: page,
            doWhat: 401,
            status: [relContent]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){

        }
    });
}