var isNewVideo = 0;
var MyNotesResult = null;
var OtherNotesResult = null;
var CurrentResult = null;
var slot_length = 10;    //10s为一个slot
var noteSeq = 0;   //note index
var noteSubmitTime;
var test;
//秒数转标准时间格式
function formatTime(second) {
    return [parseInt(second / 60 / 60), parseInt(second / 60) % 60, parseInt(second % 60)].join(":").replace(/\b(\d)\b/g, "0$1");
}
//根据ID获取user
function getUserFromID(id,result){
    var user = null;
    result.users.forEach(function(e){
        if(e.userID == id) {
            user = e;
        }
    })
    return user;
}
//注册评论、展开评论、赞等事件
function addListenerForOperation(){
    var handler = function(){
        var user_id = localStorage.id;
        var video_url = localStorage.video_url;
        var video_time = localStorage.time;
        var slot_index = parseInt(parseInt(video_time)/slot_length);   //设定10s为一个时间段
        var operation = 0;
        var upordown = 0;
        if($($($(this).parents()[1])[0]).hasClass("note")){  //是对note的操作
            operation = -1;
            upordown = 0;
            if($(this).hasClass("noteEdit")){
                operation = 0;
            }
            else if($(this).hasClass("notePraise")){
                operation = 1;
            }
            else if($(this).hasClass("noteConcern")){
                operation = 2;
            }
            else if($(this).hasClass("noteCollect")){
                operation = 3;
            }
            else if($(this).hasClass("noteDelete")){
                operation = 4;
            }
            if(operation == 0){  //noteEdit
                //console.log(CurrentResult);
                var array = $($(this).parents()[1]).find(".title").html().split('>');
                var title = array[array.length - 1];
                var content = $($($(this).parents()[1]).children()[0]).find(".mycontent").html();
                $("#editNoteTitle").val(title);
                $("#editModal").modal();
                $("#redactor_content_3").setCode(content);
            }
            else if(operation == 4){
                var noteToDel = CurrentResult.notes[noteSeq].noteIndex;
                recordDelete(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,noteToDel);
                deleteNote(user_id,video_url,slot_index,CurrentResult.notes[noteSeq].noteIndex,updateNotesFrame);
            }
            else {
                if($($(this)[0].children[1]).html().split("(")[1].split(")")[0] != "0") {
                    upordown = 1;
                }
                else {
                    upordown = 0;
                }
                operateNote(user_id,video_url,slot_index,CurrentResult.notes[noteSeq].noteIndex,operation - 1,upordown,updateNotesFrame);
                recordOperateNote(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,CurrentResult.notes[noteSeq],operation - 1,upordown);
            }
        }
        else if($($($(this).parents()[1])[0]).hasClass("reply")){  //是对reply的操作
            operation = -1;
            upordown = 0;
            if($(this).hasClass("notePraise")){
                operation = 1;
                if($($(this)[0].children[1]).html().split("(")[1].split(")")[0] != "0") {
                    upordown = 1;
                }
                else {
                    upordown = 0;
                }
                var replyIndex = $($($(this)[0]).parents()[1]).data("replyseq");
                operateReply(user_id,video_url,slot_index,CurrentResult.notes[noteSeq].noteIndex,replyIndex,upordown,updateNotesFrame);
            }
            else if($(this).hasClass("noteComments")){
                operation = 2;
                var node = $(this).parent().parent().children()[3];
                if($(node).css("display") == "none"){
                    $(node).animate({},500,function(){
                        $(node).css({"display":"block"});
                    })
                }
                else{
                    $(node).animate({},500,function(){
                        $(node).css({"display":"none"});
                    })
                }
                //鼠标悬停或离去时显示/隐藏第二级回复的底端菜单
                $('.secReply').each(function(){
                    $(this)[0].addEventListener('mouseover',function(){
                        $($(this)[0].children[1]).css({'display':'block'})
                    });
                    $(this)[0].addEventListener('mouseleave',function(){
                        $($(this)[0].children[1]).css({'display':'none'})
                    })
                });
            }
            else if($(this).hasClass("noteComment")){
                operation = 3;
                var node = $(this).parent().parent().children()[2];
                if($(node).css("display") == "none"){
                    $(node).animate({},500,function(){
                        $(node).css({"display":"block"});
                    })
                }
                else{
                    $(node).animate({},500,function(){
                        $(node).css({"display":"none"});
                    })
                }
                var name = $($(this).parents()[1]).children().find(".name > a").html();
                $($(this).parents()[1]).children().find("textarea").attr({"placeholder":"@" + name});
                //$($($(this).parents()[1]).children()[2]).css({"display":"block"});
                $(".commentSubmit").click(function(){
                    var comment = $($(this).parent().children()[0]).val();
                    var replyseq = $($(this).parent().parent()).data("replyseq");
                    var user_id = localStorage.id;
                    var video_url = localStorage.video_url;
                    var video_time = localStorage.time;
                    var slot_index = parseInt(parseInt(video_time)/slot_length);   //设定10s为一个时间段
                    var to = $($(this).parents()[1]).children().find(".name > a").data("id");
                    commentToReply(user_id,video_url,slot_index,CurrentResult.notes[noteSeq].noteIndex,replyseq,to,comment,$($($(this).parents()[1]).children()[2]),updateNotesFrame);
                })
            }
            else if($(this).hasClass("noteDelete")){
                operation = 4;
                var note = {};
                note.URL = localStorage.video_url;
                note.slotIndex = parseInt(CurrentResult.notes[noteSeq].videoTime / slot_length);
                note.noteIndex = CurrentResult.notes[noteSeq].noteIndex;
                note.replyIndex = $($(this).parents()[1]).data('replyseq');
                replyToDelete(localStorage.id,note,updateNotesFrame);
            }
            else if($(this).hasClass("noteEdit")){  //noteEdit
                operation = 0;
                var content = $($($(this).parents()[1]).children()[0]).find(".mycontent").html();
                $("#editReplyModal").modal();
                $("#redactor_content_4").setCode(content);
                var replyIndex = $($(this).parents()[1]).data('replyseq');
            }
            //else if(operation == 1){
            //    operateNote(user_id,video_url,slot_index,CurrentResult.notes[noteSeq].noteIndex,operation - 1,upordown,updateNotesFrame);
            //    recordOperateNote(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,CurrentResult.notes[noteSeq],operation - 1,upordown);
            //}
        }
        else if($($($(this).parents()[1])[0]).hasClass("secReply")){  //是对secReply的操作
            if($(this).hasClass("noteDelete")){
                var note = {};
                note.URL = localStorage.video_url;
                note.slotIndex = parseInt(CurrentResult.notes[noteSeq].videoTime / slot_length);
                note.noteIndex = CurrentResult.notes[noteSeq].noteIndex;
                note.replyIndex = $($(this).parents()[3]).data('replyseq');
                note.commentIndex = $($(this).parents()[1]).data('commentseq');
                commentToDelete(localStorage.id,note,updateNotesFrame);
            }
            else if($(this).hasClass("noteComment")){
                var name = $($(this).parents()[1]).children().find(".name > a").html();
                $($(this).parents()[1]).children().find("textarea").attr({"placeholder":"@" + name});
                $($($(this).parents()[1]).children()[2]).css({"display":"block"});
                $(".commentSubmit").click(function(){
                    var comment = $($(this).parent().children()[0]).val();
                    var replyseq = $($(this).parents()[3]).data("replyseq");
                    var user_id = localStorage.id;
                    var video_url = localStorage.video_url;
                    var video_time = localStorage.time;
                    var slot_index = parseInt(parseInt(video_time)/slot_length);   //设定10s为一个时间段
                    var to = $($(this).parents()[1]).children().find(".name > a").data("id");
                    commentToReply(user_id,video_url,slot_index,CurrentResult.notes[noteSeq].noteIndex,replyseq,to,comment,$($($(this).parents()[1]).children()[2]),updateNotesFrame);
                })
            }
        }
        else console.log("operation error!");
    }
    $(".toil > a").each(function(){
        $(this)[0].removeEventListener('click',handler,false);
    });
    $(".toil > a").each(function(){
        $(this)[0].addEventListener('click',handler,false);
    });
    $("a.linkToIndividual").click(function(){
        recordViewInfo(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,CurrentResult.notes[noteSeq]);
    })
}
function parseNotesResult(result){
    var user_id = localStorage.id;
    //console.log(result);
    MyNotesResult = $.extend(true,{},result);
    OtherNotesResult = $.extend(true,{},result);
    for(var i = 0; i < OtherNotesResult.notes.length;) {
        if (OtherNotesResult.notes[i].fromUserID == user_id)
            OtherNotesResult.notes.splice(i, 1);
        else i++;
    }
    for(var i = 0;i < MyNotesResult.notes.length; ){
        if(MyNotesResult.notes[i].fromUserID != user_id)
            MyNotesResult.notes.splice(i,1);
        else i++;
    }
    //console.log(MyNotesResult,OtherNotesResult,CurrentResult);
    if($($(".nav-tabs > li")[0]).hasClass("active"))
        CurrentResult = MyNotesResult;
    else CurrentResult = OtherNotesResult;
}
//按笔记所在视频时间排序
function NoteCMP(a,b)
{
    return parseFloat(a.videoTime) - parseFloat(b.videoTime);
}
function updateNotesFunc(result,index) {
    var str = '';
    var notes = result.notes;
    if(!notes) {
        console.log('error');
        return;
    }
    notes.sort(NoteCMP);
    updateReplysFrame(result,index);
    var len = notes.length;
    for(var i = 0;i < len; ++ i){
        str += "<div class='timeNotes' data-seq=";
        str += i;
        str += "> <img src = ";
        str += serverIP + notes[i].screenshot;
        str += " class='capImg'/> <div class='noFocused ";
        //str += "focused";
        str += "'> <div class='round'></div> ";
        if(i < len - 1)
            str += "<div class='line-through'></div>";
        str += " </div> <div class='notesCard '> <div class='notesmsg'>";
        str += notes[i].title;
        str += "</div> <div class='createTime'> ";
        str += notes[i].time;
        str += "</div> <div class='videoTime'>";
        str +=  formatTime(notes[i].videoTime);
        str += "</div> </div> </div>";
    }
    $($('.notesBody')[index]).html(str);
    $('.tab-content .notesBody .timeNotes').click(function(){
        var seqNum = $(this).parents().find(".tab-content").parent().children().find('li.active').data().seq;
        $('.tab-content .notesGroup').css('display','none');
        $('.tab-content')[0].scrollTop = 0;
        noteSeq = $(this).data('seq');
        updateReplysFrame(result,index);
        if(index == seqNum) {
            clickThisNote(CurrentResult.notes[noteSeq].fromUserID, localStorage.video_url, parseInt(parseInt(CurrentResult.notes[noteSeq].videoTime) / slot_length), CurrentResult.notes[noteSeq].noteIndex);
            recordViewANote(localStorage.id, localStorage.video_url, parseInt(parseInt(localStorage.time) / slot_length), localStorage.time, CurrentResult.notes[noteSeq]);
        }
        $('.tab-content .replys').css('display','block');
    })
}
//显示笔记栏的笔记
function displayNotesFunc(result){
    parseNotesResult(result);
    updateNotesFunc(MyNotesResult,0);
    updateNotesFunc(OtherNotesResult,1);
}
//更新笔记栏
function updateNotesFrame(video_url, slot_index,user_id){
    var video_total_time = localStorage.video_total_time;
    getNotesOnASlot(video_url,slot_index,video_total_time,displayNotesFunc,user_id);
}
//更新笔记回复区域
function updateReplysFrame(result,index){
    var note = result.notes[noteSeq];
    if(!note) {
        if(index == 1)
            addListenerForOperation();
        return;
    }
    str = '';
    str += "<button class='btn btn-info mybtn' type='button'>笔记</button>";
    str += note.title;
    $($(".tab-pane .note .title")[index]).html(str);
    $($(".tab-pane .note .replyList")[index]).html("");
    var str = '';
    str += "<a class='icon linkToIndividual' href='../profile/individual.html?want=";
    str += note.fromUserID;
    str += "' target='_blank' data-id = ' ";
    str += note.fromUserID;
    str += " '><span class='fui-user' ";
    str += " ></span> ";
    var user = getUserFromID(note.fromUserID,result);
    str += user.nickname;
    str += " </a><a class='icon'><span class='fui-calendar'></span> ";
    str += note.time;
    str += " </a><a class='icon'><span class='fui-chat'></span> ";
    str += note.replys.length;
    str += " </a>";
    //$($(".tab-pane .note .detail")[index]).html(str);
    $($($(".tab-pane .note")[index]).find(".detail")[0]).html(str);
    $($($(".tab-pane .note")[index]).find(".myrow .pic")[0]).attr({"src":user.head});
    //$($(".tab-pane .note .mycontent")[index]).html(note.body);
    $($($(".tab-pane .note")[index]).find(".mycontent")[0]).html(note.body);
    str = '';
    if(note.fromUserID == localStorage.id) {
        str += "<a href='#' class='noteEdit'><span class='fui-new'></span><span> 编辑 </span></a>";
        str += "<a href='#' class='noteDelete'><span class='fui-trash'></span><span> 删除 </span></a>";
    }
    str += "<a href='#' class='notePraise'><span class='fui-heart'></span><span> 赞(";
    str += note.praises.length;
    str += ") </span></a>";
    if(note.fromUserID != localStorage.id) {
        str += "<a href='#' class='noteConcern'><span class='fui-eye'></span><span> +关注(";
        str += note.concerns.length;
        str += ") </span></a>";
    }
    str += "<a href='#' class='noteCollect'><span class='fui-star'></span><span> 收藏(";
    str += note.collects.length;
    str += ") </span></a>";
    //$($(".tab-pane .note .mytoil")[0]).html(str);
    $($($(".tab-pane .note")[index]).find(".mytoil")[0]).html(str);
    str = '';
    str += "<button class='btn btn-inverse' type='button'>回复<span class='btn-default'><b>";
    str += note.replys.length;
    str += "</b></span></button>";
    for(var i = 0; i < note.replys.length; ++ i){
        str += "<div class='reply' data-replyseq = ";
        var user =  getUserFromID(note.replys[i].fromUserID,result);
        str += note.replys[i].replyIndex;
        str += ">";
        str += "<div class='myrow'><img class='pic' src=' ";
        str += user.head;
        str += "'><div class='info'><div class='detail'><div class='icon name'><button class='btn btn-info mybtn' type='button'>回复</button><a  class='linkToIndividual' href='../profile/individual.html?want=";
        str += note.replys[i].fromUserID;
        str += "'target='_blank' style='font-size:20px;color:#000' ";
        str += "data-id = ";
        str += note.replys[i].fromUserID;
        str += " >";
        str += user.nickname;
        str += "</a></div><a class='icon'>";
        str += note.replys[i].time;
        str += "</a></div></div><div class='mycontent'>";
        str += note.replys[i].body;
        str += "</div> </div>";
        str += "<div class='toil mytoil'>";
        if(note.replys[i].fromUserID == localStorage.id) {
            str += "<a href='#' class='noteEdit'><span class='fui-new'></span><span> 编辑 </span></a>";
            str += "<a href='#' class='noteDelete'><span class='fui-trash'></span><span> 删除 </span></a>";
        }
        str += "<a href='#' class='notePraise'><span class='fui-heart'></span> <span> 赞(";
        str += note.replys[i].praises.length;
        str += ") </span></a><a href='#' class='noteComments'><span class='fui-document'></span><span> 展开评论(";
        str += note.replys[i].comments.length;
        str += ") </span></a><a href='#' class='noteComment'><span class='fui-chat'></span><span> 评论 </span></a></div>";
        str += "<div class='commentBox'> <textarea class='form-control pull-left commentArea' rows='3' placeholder='@'></textarea> <button class='btn btn-success commentSubmit'>提交</button> </div>"
        str += "<div class='secReplyList'>";
        for(var j = 0;j < note.replys[i].comments.length; ++ j) {
            str += "<div class='secReply' data-commentSeq = '";
            str += j;
            str += "'><div class='myrow'><img class='pic' src='";
            var user = getUserFromID(note.replys[i].comments[j].fromUserID, result);
            str += user.head;
            str += "'><div class='info'><div class='detail'><div class='icon name'> <button class='btn btn-info mybtn' type='button'>评论</button> <a  class='linkToIndividual' href='../profile/individual.html?want=";
            str += note.replys[i].comments[j].fromUserID;
            str += "' target='_blank' style='font-size:20px;color:#000' data-id = '";
            str += note.replys[i].comments[j].fromUserID;
            str += "'>";
            str += user.nickname;
            str += "</a></div><a class='icon'>";
            str += note.replys[i].comments[j].time;
            str += "</a></div></div><div class='mycontent'><a class='at linkToIndividual' href='../profile/individual.html?want=";
            str += note.replys[i].comments[j].toUserID;
            str += "' target='_blank' data-id=' ";
            str += note.replys[i].comments[j].toUserID;
            str += "' >@";
            str += getUserFromID(note.replys[i].comments[j].toUserID, result).nickname;
            str += ": </a>";
            str += note.replys[i].comments[j].body;
            str += "</div></div><div class='toil sectoil'>";
            if(note.replys[i].comments[j].fromUserID == localStorage.id) {
                str += "<a href='#' class='noteDelete'><span class='fui-trash'></span>";
                str += "<span> 删除 </span></a>";
            }
            str += "<a href='#' class='noteComment'><span class='fui-chat'></span><span> 评论 </span>";
            str += "</a></div><div class='commentBox'><textarea class='form-control pull-left commentArea' rows='3' placeholder='@'></textarea>";
            str += "<button class='btn btn-success commentSubmit'>提交</button></div></div>";
        }
        str += "</div></div>";
    }
    $($(".tab-pane .note .replyList")[index]).html(str);
    if(index == 1)
        addListenerForOperation();
}
function setVideo(src,slotIndex,message){
    //console.log(src,slotIndex,message);
    var str = '';
    str += '<source src="' + src + '">';
    localStorage.setItem('VideoSrc',src);
    if(message && message.contents.video.poster){
        $($('video')[0]).attr("poster",message.contents.video.poster);
    }
    if(message && message.contents.video.tracks.length){
        var tracks = message.contents.video.tracks;
        //console.log("tracks:", tracks);
        for(var i = 0;i < tracks.length; ++ i){
            str += " <track src='" + "https://www.coursera.org" + tracks[i].src;
            str += "' srclang='" + tracks[i].srclang;
            str += "' label='" + tracks[i].label;
            str += "' kind='" + tracks[i].kind;
            if(tracks[i].srclang == 'zh-CN'){
                str += "' default>";
                $('#tracks .dropdown-menu').append('<li trackid="' + i + '"><a><span class="fui-check"></span>&nbsp;&nbsp;' + tracks[i].label + '</a></li>');
            }
            else {
                str += "'>";
                $('#tracks .dropdown-menu').append('<li trackid="' + i + '"><a><span class="fui-none"></span>&nbsp;&nbsp;' + tracks[i].label + '</a></li>');
            }
        }
    }
    if($('span.fui-check'))
        $('#tracks .dropdown-menu').append('<li><a><span class="fui-none"></span>&nbsp;&nbsp;无字幕</a></li>');
    else
        $('#tracks .dropdown-menu').append('<li><a><span class="fui-check"></span>&nbsp;&nbsp;无字幕</a></li>');
    $('#tracks .dropdown-menu>li').click(function(){
        $('span.fui-check').each(function(){
            $(this).attr('class','fui-none');
        })
        $(this).find('span').attr('class','fui-check');
        var track_id = $(this).attr("trackid");
        for(var i = 0;i < $("video")[0].textTracks.length; ++ i){
            if(i != track_id)
                $("video")[0].textTracks[i].mode = 'disabled';
            else
                $("video")[0].textTracks[i].mode = 'showing';
        }
    })
    $("video").html(str);
    //$('video')[0].addChild('TextTrackDisplay');
    $('video')[0].addEventListener('loadedmetadata',function(){
        recordOpenVideo(localStorage.id,localStorage.video_url);
        $("#navbarInput-02").val($('video')[0].currentSrc);
        $("video")[0].currentTime = localStorage.time;
        $('.tab-content').height($('video').height() + $('.foot').height() +35);
        localStorage.setItem('video_url',$('video')[0].currentSrc);
        localStorage.setItem('video_total_time',$('video')[0].duration);
        localStorage.setItem('slot_index',slotIndex);
        updateNotesFrame($('video')[0].currentSrc, slotIndex, localStorage.id);
    })
    $('video')[0].addEventListener('timeupdate',function(){
        localStorage.time = $("video")[0].currentTime;
        var video_url = localStorage.video_url;
        var slot_index = localStorage.slot_index;
        var user_id = localStorage.id;
        if(parseInt(localStorage.time / slot_length) != slot_index) {
            slot_index = parseInt(localStorage.time / slot_length);
            localStorage.setItem('slot_index',slot_index);
            updateNotesFrame(video_url, slot_index, user_id);
        }
        else if(CurrentResult){
            for(var i = 0;i < CurrentResult.notes.length; ++ i){
                var node = $($("#home .timeNotes")[i]).children()[1];
                if($(node).hasClass("focused"))
                    $(node).removeClass("focused");
                var duration = CurrentResult.notes[i].videoTime - localStorage.time;
                if(duration > -0.5 && duration < 0.5){
                    $(node).addClass("focused");
                }
            }
        }
    })
    var JumpFromTime,JumpToTime;
    $('video')[0].addEventListener('seeking',function(){
        JumpFromTime = localStorage.time;
    })
    $('video')[0].addEventListener('seeked',function(){
        JumpToTime = localStorage.time;
        if(JumpFromTime != JumpToTime)
            recordTimeChange(localStorage.id,localStorage.video_url,parseInt(parseInt(JumpToTime) / slot_length),JumpToTime,JumpFromTime);
    })
    $('video')[0].addEventListener('pause',function(){
        recordPause(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time);
    })
    //chrome.contextMenus.onClicked.addListener(function(info,tab){
    //        console.log(info);
    //    })
    //$($('video')[0]).on('contextmenu', function(e) {
    //    //e.preventDefault();
    //
    //});
    chrome.downloads.onCreated.addListener(function(info){
        recordVideoDownload(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time);
    })
}

function basic_bars(response) {
    var xTicks = [];
    for(var i = 1;i < response.notes.length;i ++){
        xTicks.push([i-0.5,i*slot_length]);
    }
    var yTicks = [];
    var len = parseInt(response.maxnotesnum / 5) + 1;
    yTicks.push([0,""]);
    for(var i = 1; i < 6; i++){
        yTicks.push([i*len,len*i]);
    }
    var horizontal = false;
    var container = document.getElementById("formContainer");
    $('container').css({'display':'block'});
    var option = {
        colors: ['#00A8F0', '#C0D800', '#CB4B4B', '#4DA74D', '#9440ED'],  //线条的颜色
        ieBackgroundColor:'#3ec5ff',                    //选中时的背景颜色
        title:'笔记分布趋势统计图',               //标题
        subtitle:'',                           //子标题
        shadowSize:0,                                 //线条阴影
        defaultType:'bars',                           //图表类型,可选值:bars,bubbles,candles,gantt,lines,markers,pie,points,radar
        HtmlText:true,                                //是使用html或者canvas显示 true:使用html  false:使用canvas
        fontColor:'#ff3ec5',                           //字体颜色
        fontSize:10,                                  //字体大小
        resolution:10,                                  //分辨率 数字越大越模糊
        parseFloat:false,                               //是否将数据转化为浮点型
        xaxis: {
            ticks:xTicks, // 自定义X轴
            minorTicks: null,
            showLabels:true,                             // 是否显示X轴刻度
            showMinorLabels:false,
            labelsAngle:0,                              //x轴文字倾斜角度
            title:'单位/s',                                 //x轴标题
            titleAngle:0,                                //x轴标题倾斜角度
            noTicks:12,                                   //当使用自动增长时,x轴刻度的个数
            minorTickFreq:null,                           //
            tickFormatter: Flotr.defaultTickFormatter,   //刻度的格式化方式
            tickDecimals:0,                              //刻度小数点后的位数
            min:-0.5,                                    //刻度最小值  X轴起点的值
            max:response.notes.length - 1.5,                                    //刻度最大值
            autoscale:false,
            autoscaleMargin:0,
            color:null,                             //x轴刻度的颜色
            mode:'normal',
            scaling:'linear',                            //linear or logarithmic
            base:Math.E,
            titleAlign:'center',                         //标题对齐方式
            margin:true
        },
        x2axis:{
        },
        yaxis:{
            title: '单位/个',          // => axis title
            tickFormatter: Flotr.defaultTickFormatter,   //刻度的格式化方式
            tickDecimals:0                              //刻度小数点后的位数
        },
        y2axis:{

        },
        grid: {
            color: '#545454',      // => 表格外边框和标题以及所有刻度的颜色
            backgroundColor: null, // => 表格背景颜色
            backgroundImage: null, // => 表格背景图片
            watermarkAlpha: 0.4,   // => 水印透明度
            tickColor: '#DDDDDD',  // => 表格内部线条的颜色
            labelMargin: 1,        // => margin in pixels
            verticalLines: true,   // => 表格内部是否显示垂直线条
            minorVerticalLines: null, // => whether to show gridlines for minor ticks in vertical dir.
            horizontalLines: true, // => 表格内部是否显示水平线条
            minorHorizontalLines: null, // => whether to show gridlines for minor ticks in horizontal dir.
            outlineWidth: 1,       // => 表格外边框的粗细
            outline : 'nsew',      // => 超出显示范围后的显示方式
            circular: false        // => 是否以环形的方式显示
        },
        mouse:{
            track: true,          // => 为true时,当鼠标移动到每个折点时,会显示折点的坐标
            //trackAll: true,       // => 为true时,当鼠标在线条上移动时,显示所在点的坐标
            position: 'ne',        // => 鼠标事件显示数据的位置 (default south-east)
            relative: false,       // => 当为true时,鼠标移动时,即使不在线条上,也会显示相应点的数据
            trackFormatter: Flotr.defaultTrackFormatter, // => formats the values in the value box
            margin: 5,             // => margin in pixels of the valuebox
            lineColor: '#FF3F19',  // => 鼠标移动到线条上时,点的颜色
            trackDecimals: 0,      // => 数值小数点后的位数
            sensibility: 1,        // => 值越小,鼠标事件越精确
            trackY: true,          // => whether or not to track the mouse in the y axis
            radius: 3             // => radius of the track point
            //fillColor: null,       // => color to fill our select bar with only applies to bar and similar graphs (only bars for now)
            //fillOpacity: 0.4       // => o
        },
        legend:{
            container:$("#legendContainer"),
            position:'ne'
        }
    };

    // Draw Graph
    var data = [
        { data : response.notes, label :'笔记' ,lines : { show : true }, points : { show : true }},
        { data : response.replys, label :'回复' ,lines : { show :true }, points : { show : true }},
        { data : response.comments, label :'评论' ,lines : { show : true }, points : { show : true }}
    ];
    Flotr.draw(container, data, option);
};

$(document).ready( function() {
    getMessage(localStorage.id);
    //UI部分
    //开关笔记栏 设置动画
    $("#bookmark").click(function(){
        if($(".leftframe").hasClass("bigframe"))
        {
            //$(".leftframe").removeClass("bigframe");
            $('.leftframe').animate({width: "67%",marginLeft: "0"},500,function(){
                $(".rightframe").toggle();
                $('.tab-content')[0].scrollTop = 0;
                $(".rightframe").addClass('animated');
                $(".rightframe").removeClass('fadeOutRight');
                $(".rightframe").addClass('fadeInRight');
                $(this).removeClass("bigframe");
            })
            $("#form2 .input-group").animate({width:"530px"},500,function(){})
            recordOpenNoteOrNot(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,1);
        }
        else {
            $(".rightframe").addClass('animated');
            $(".rightframe").removeClass('fadeInRight');
            $(".rightframe").addClass('fadeOutRight');
            setTimeout(function(){
                $(".rightframe").toggle();
                $('.leftframe').animate({width: "80%",marginLeft: "10%"},500,function(){
                    $(this).addClass("bigframe");
                })
                $("#form2 .input-group").animate({width:"680px"},500,function(){})
            },500);
            recordOpenNoteOrNot(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,0);
        }
    })
    //切换显示tab时scroll归0,重置笔记页面
    $('.nav-tabs > li').click(function(){
        $('.tab-content')[0].scrollTop = 0;
        $('.tab-content .notesGroup').css('display','block');
        $('.tab-content .replys').css('display','none');
        if($(this).data('seq') == '0') {
            CurrentResult = MyNotesResult;
            if($(".rightframe").hasClass("bigframe"))
            {
                $('.rightframe').animate({width: "33%",marginRight: "0"},500,function(){
                    $(".leftframe").toggle();
                    $('.tab-content')[0].scrollTop = 0;
                    $(".leftframe").addClass('animated');
                    $(".leftframe").removeClass('fadeOutLeft');
                    $(".leftframe").addClass('fadeInLeft');
                    $(this).removeClass("bigframe");
                })
            }
            recordMyOrOther(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,0);
        }
        else if($(this).data('seq') == '1') {
            CurrentResult = OtherNotesResult;
            if($(".rightframe").hasClass("bigframe"))
            {
                $('.rightframe').animate({width: "33%",marginRight: "0"},500,function(){
                    $(".leftframe").toggle();
                    $('.tab-content')[0].scrollTop = 0;
                    $(".leftframe").addClass('animated');
                    $(".leftframe").removeClass('fadeOutLeft');
                    $(".leftframe").addClass('fadeInLeft');
                    $(this).removeClass("bigframe");
                })
            }
            recordMyOrOther(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,1);
        }
        else if($(this).data('seq') == '2'){
            if(!$(".rightframe").hasClass("bigframe"))
            {
                $(".leftframe").addClass('animated');
                $(".leftframe").removeClass('fadeInLeft');
                $(".leftframe").addClass('fadeOutLeft');
                setTimeout(function(){
                    $(".leftframe").toggle();
                    $(".rightframe").css({"float":"right"});
                    $('.rightframe').animate({width: "80%",marginRight: "10%"},500,function(){
                        $(this).addClass("bigframe");
                        getVideoBasicInfo(localStorage.video_url,basic_bars);
                    })
                },500);
            }
            recordViewAnalysis(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time);
        }
    })
    //切换笔记显示页面和编辑/回复页面
    $('.tab-content .notesBody .timeNotes').click(function(){
        $('.tab-content .notesGroup').css('display','none');
        $('.tab-content')[0].scrollTop = 0;
        $('.tab-content .replys').css('display','block');
    })
    $('.replys .head .btn-danger').click(function(){
        $('.tab-content .notesGroup').css('display','block');
        $('.tab-content .replys').css('display','none');
    })

    //设置右侧frame高度使两端对齐
    $(window).resize(function(){
        $('.tab-content').height($('video').height() + $('.foot').height() +35);
    })

    //modal部分
    $('#replyModal_1').on('show.bs.modal', function (e) {
        $('#replyModal_1').find(".modal-dialog").css("margin-top",function(){
            return $(window).height()/8;
        });
    });
    $('#replyModal_1 button[data-dismiss=modal]').click(function(){
        recordFakeReply(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,CurrentResult.notes[noteSeq]);
    })
    $('#replyModal_2 button[data-dismiss=modal]').click(function(){
        var note = {};
        note.title = $("#noteTitle").val();
        note.body = $('#redactor_content_2').getCode();
        recordFakeNote(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,note);
    })
    //redactor初始化
    $('.replys .head .btn-info').click(function(){
        $('#redactor_content_1').redactor({
            imageUpload: serverIP + '/imageUpload',
            fileUpload: serverIP + '/fileUpload'
        });
    })

    $('#newnote').click(function(){
        //截图部分
        $("video")[0].pause();
        chrome.tabs.captureVisibleTab(null, {
            format: 'jpeg',
            quality: 10
        }, function(dataUrl){
            noteSubmitTime = new Date().getTime();
            uploadScreenShot(dataUrl , noteSubmitTime);
        });

        $('#redactor_content_2').redactor({
            imageUpload: serverIP + '/imageUpload',
            fileUpload: serverIP + '/fileUpload'
        });
    })
    $("#redactor_content_3").redactor({
        imageUpload: serverIP + '/imageUpload',
        fileUpload: serverIP + '/fileUpload'
    })
    $("#redactor_content_4").redactor({
        imageUpload: serverIP + '/imageUpload',
        fileUpload: serverIP + '/fileUpload'
    })

    //功能性部分
    //已有播放记录，则根据记录设置播放
    if(localStorage.VideoSrc){
        setTimeout(function(){
            if(!isNewVideo)
            {
                setVideo(localStorage.VideoSrc,0,JSON.parse(localStorage.message));
            }
            else isNewVideo = 0;
        }, 500);
    }
    //监听是否有新的视频资源
    chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
        console.log(message);
        localStorage.setItem('message',JSON.stringify(message));
        if(message.operation == "setVideo")
        {
            isNewVideo = 1;
            localStorage.setItem('time',0);
            setVideo(message.contents.info.srcUrl,0,message);
            //else if(message.contents.site == 'edx')
            //{
            //    $("video").html(message.contents.source);
            //    $("video")[0].currentTime = localStorage.time;
            //    VideoLoop();
            //}
            sendResponse("success");
        }
        else if(message.operation == "setNote"){
            //alert(message.contents.from + "   " + localStorage.nickname);
            if(message.contents.from != localStorage.nickname){
                $($(".nav-tabs > li")[0]).removeClass('active');
                $($(".nav-tabs > li")[1]).addClass('active');
                $($(".tab-pane")[0]).removeClass('active');
                $($(".tab-pane")[1]).addClass('active');
            }
            isNewVideo = 1;
            localStorage.setItem('time',message.contents.videotime);
            var str = message.contents.url;
                setVideo(str,message.contents.slotindex);
            sendResponse("success");
        }
        else
            sendResponse("failure");
    });
    var options = {
        beforeSubmit:  function(){},
        success:       function(){},
        resetForm: false,
        dataType:  'json'
    };
    //谷歌搜索，注意替换保留字符
    $("#form1").submit(function(){
        $(this).ajaxSubmit(options);
        window.open("https://www.google.com.hk/#newwindow=1&safe=strict&q=" + encodeURIComponent($(".form-control")[0].value) , "_blank");
    })
    //根据输入的视频源设置视频
    $("#form2").submit(function(){
        var src = $("#navbarInput-02").val();
        var len = src.length;
            setVideo(src,0);
        recordVideoChange(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,src);
    })

    //***********  与服务器交互部分  ***********//
    //暂时设定video_name与url相同
    //设定10s为一个时间段 slot
    $("#noteSubmit").click(function(){
        var note = {};
        note.title = $("#noteTitle").val();
        note.body = $('#redactor_content_2').getCode();
        var smallAbstract = $(note.body).text();
        if(smallAbstract.length > 80){
            smallAbstract = smallAbstract.substring(0,80);
            smallAbstract = smallAbstract + "...";
        }
        note.abstract = smallAbstract;
        var user_id = localStorage.id;
        var video_url = localStorage.video_url;
        var video_name = localStorage.video_url;  //暂时设为与url相同
        var video_time = localStorage.time;
        var video_total_time = localStorage.video_total_time;
        var slot_index = parseInt(parseInt(video_time)/slot_length);   //设定10s为一个时间段
        submitNote(user_id,video_url,video_name,video_total_time,video_time,slot_index,note,noteSubmitTime,updateNotesFrame);
        recordRealNote(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,note);
    })
    $("#replySubmit").click(function(){
        var note = {};
        note.body = $('#redactor_content_1').getCode();
        var smallAbstract = $(note.body).text();
        if(smallAbstract.length > 80){
            smallAbstract = smallAbstract.substring(0,80);
            smallAbstract = smallAbstract + "...";
        }
        note.abstract = smallAbstract;
        var user_id = localStorage.id;
        var video_url = localStorage.video_url;
        var slot_index = parseInt(parseInt(CurrentResult.notes[noteSeq].videoTime) / slot_length);   //设定10s为一个时间段
        var noteIndex = CurrentResult.notes[noteSeq].noteIndex;
        replyToNote(user_id, video_url, slot_index, noteIndex, note, updateNotesFrame);
        recordRealReply(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,CurrentResult.notes[noteSeq]);
    })
    $("#saveEdit").click(function(){
        var note = {};
        note.title = $('#editNoteTitle').val();
        note.body = $("#redactor_content_3").getCode();
        note.URL = localStorage.video_url;
        note.slotIndex = parseInt(CurrentResult.notes[noteSeq].videoTime / slot_length);
        note.noteIndex = CurrentResult.notes[noteSeq].noteIndex;
        var smallAbstract = $(note.body).text();
        if(smallAbstract.length > 80){
            smallAbstract = smallAbstract.substring(0,80);
            smallAbstract = smallAbstract + "...";
        }
        note.abstract = smallAbstract;
        editNote(localStorage.id,note,updateNotesFrame);
        recordEdit(localStorage.id,localStorage.video_url,parseInt(parseInt(localStorage.time) / slot_length),localStorage.time,note);
    })
    $("#saveReplyEdit").click(function(){
        var note = {};
        note.body = $("#redactor_content_4").getCode();
        note.URL = localStorage.video_url;
        note.slotIndex = parseInt(CurrentResult.notes[noteSeq].videoTime / slot_length);
        note.noteIndex = CurrentResult.notes[noteSeq].noteIndex;
        note.replyIndex = replyIndex;
        var smallAbstract = $(note.body).text();
        if(smallAbstract.length > 80){
            smallAbstract = smallAbstract.substring(0,80);
            smallAbstract = smallAbstract + "...";
        }
        note.abstract = smallAbstract;
        replyToEditSubmit(localStorage.id,note,updateNotesFrame);
    })
});