/*
 *********  用户操作编码  *********
 在扩展程序那边代码记:
 100: 打开某个video
 120/121: 显示/关闭笔记区域

 140:下载某个video
 150:切换某个video

 400: 假发布笔记(相关区域)

 110: 切换视频时间（此时有多少相关笔记）
 160: 暂停
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
var serverIP = 'http://127.0.0.1:8880';
//110:切换视频时间
function recordTimeChange(who, video, slot, video_time,fromTime){
    jQuery.ajax({
        url:serverIP + '/recordTimeChange',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 110,
            status: [fromTime]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//130/131: 切换查看我的/其他笔记
function recordMyOrOther(who, video, slot, video_time, switchOther){
    // switchOther == 0, 切换成我的笔记 —— 130
    // switchOther == 1, 切换成其他笔记 —— 131
    jQuery.ajax({
        url:serverIP + '/recordMyOrOther',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: switchOther == 0 ? 130 : 131
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//200: 查看某个笔记(该笔记一套相关信息)
function recordViewANote(who, video, slot, video_time, noteInfo){
    /*
     noteInfo 需要用到的东西
     noteIndex
     from
     title
     videoTime
     screenshot
     clickNum
     replyNum
     praiseNum
     concernNum
     collectNum
     */

    jQuery.ajax({
        url:serverIP + '/recordViewANote',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 200,
            status: [noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title,
                noteInfo.videoTime, noteInfo.screenshot, noteInfo.clickCnt, noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//210: 假回复
function recordFakeReply(who, video, slot, video_time, noteInfo){
    jQuery.ajax({
        url:serverIP + '/recordFakeReply',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 210,
            status: [noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title,
                noteInfo.videoTime, noteInfo.screenshot, noteInfo.clickCnt, //除本次外的点击量
                noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//211: 真回复
function recordRealReply(who, video, slot, video_time, noteInfo){
    jQuery.ajax({
        url:serverIP + '/recordRealReply',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 211,
            status: [noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title,
                noteInfo.videoTime, noteInfo.screenshot, noteInfo.clickCnt, noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//记录对笔记的操作
//220/221: 赞/取消赞(该笔记一套相关信息)
//230/231: 关注/取消关注(该笔记一套相关信息)
//240/241: 收藏/取消收藏(该笔记一套相关信息)
function recordOperateReply(who, video, slot, video_time,  noteInfo, which , upOrDown){
    /*
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
    jQuery.ajax({
        url:serverIP + '/recordOperateReply',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: doWhat,
            status: [noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title,
                noteInfo.videoTime, noteInfo.screenshot, noteInfo.clickCnt, noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//250: 记录编辑操作
function recordEdit(who, video, slot, video_time, noteInfo){
    //console.log(arguments);
    jQuery.ajax({
        url:serverIP + '/recordEdit',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 250,
            status: [noteInfo.noteIndex, noteInfo.title, noteInfo.body]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//260: 记录删除操作
function recordDelete(who, video, slot, video_time, noteIndex){
    jQuery.ajax({
        url:serverIP + '/recordDelete',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 260,
            status: [noteIndex]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//300: 查阅某人资料
function recordViewInfo(who, video, slot, video_time, noteInfo, viewWho){
    jQuery.ajax({
        url:serverIP + '/recordViewInfo',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 300,
            status: [viewWho,noteInfo.noteIndex, noteInfo.fromUserID, noteInfo.title,
                noteInfo.videoTime, noteInfo.screenshot, noteInfo.clickCnt, noteInfo.replys.length,
                noteInfo.praises.length, noteInfo.concerns.length, noteInfo.collects.length]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//401: 真的发布笔记
function recordRealNote(who, video, slot, video_time, relContent){
    jQuery.ajax({
        url:serverIP + '/recordRealNote',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 401,
            status: [relContent]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//400: 假发布笔记
function recordFakeNote(who, video, slot, video_time, relContent){
    jQuery.ajax({
        url:serverIP + '/recordFakeNote',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 400,
            status: [relContent]
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//100: 打开某个video
function recordOpenVideo(who, video){
    jQuery.ajax({
        url:serverIP + '/recordOpenVideo',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:0,
            whatSlot: 0,
            doWhat: 100
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//120/121 显示/关闭笔记区域
function recordOpenNoteOrNot(who, video,slot,video_time,switchopen){
    jQuery.ajax({
        url:serverIP + '/recordOpenNoteOrNot',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: switchopen == 0 ? 121 : 120
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//132 查看视频分析
function recordViewAnalysis(who, video,slot,video_time){
    jQuery.ajax({
        url:serverIP + '/recordViewAnalysis',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 132
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//160 暂停
function recordPause(who, video,slot,video_time){
    jQuery.ajax({
        url:serverIP + '/recordPause',
        type:'post',
        data:{
            who: who,
            when: new Date().getTime(),
            which_video: video,
            which_time:video_time,
            whatSlot: slot,
            doWhat: 160
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}