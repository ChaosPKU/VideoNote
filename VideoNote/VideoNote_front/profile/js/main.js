var isNewVideo = 0;
var MyNotesResult = null;
var OtherNotesResult;
var slot_length = 10;    //10s为一个slot
var noteSeq = 0;   //note index
var noteSubmitTime;
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
    $(".toil > a").click(function(){
        var user_id = localStorage.id;
        var video_url = localStorage.video_url;
        var video_time = localStorage.time;
        var slot_index = parseInt(parseInt(video_time)/slot_length);   //设定10s为一个时间段
        var operation = 0;
        var upordown = 0;
        if($($($(this).parents()[1])[0]).hasClass("note")){  //是对note的操作
            operation = 0;
            upordown = 0;
            if($(this).hasClass("notePraise")){
                operation = 1;
            }
            else if($(this).hasClass("noteConcern")){
                operation = 2;
            }
            else if($(this).hasClass("noteCollect")){
                operation = 3;
            }
            if(operation == 0){  //noteEdit
                var array = $($(this).parents()[1]).find(".title").html().split('>');
                var title = array[array.length - 1];
                var content = $($($(this).parents()[1]).children()[0]).find(".mycontent").html();
                $("#editNoteTitle").val(title);
                $("#editModal").modal();
                $("#redactor_content_3").setCode(content);
                $("#saveEdit").click(function(){
                    var note = {};
                    note.title = $('#editNoteTitle').val();
                    note.body = $("#redactor_content_3").getCode();
                    note.URL = localStorage.video_url;
                    note.slotIndex = parseInt(MyNotesResult.notes[noteSeq].videoTime / slot_length);
                    note.noteIndex = noteSeq;
                    var smallAbstract = $(note.body).text();
                    if(smallAbstract.length > 80){
                        smallAbstract = smallAbstract.substring(0,80);
                        smallAbstract = smallAbstract + "...";
                    }
                    note.abstract = smallAbstract;
                    editNote(localStorage.id,note,updateNotesFrame);
                })
            }
            else {
                if($($(this)[0].children[1]).html().split("(")[1].split(")")[0] != "0") {
                    upordown = 1;
                }
                else {
                    upordown = 0;
                }
                operateNote(user_id,video_url,slot_index,noteSeq,operation - 1,upordown,updateNotesFrame);
            }
        }
        else if($($($(this).parents()[1])[0]).hasClass("reply")){  //是对reply的操作
            operation = 0;   //noteEdit
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
                operateReply(user_id,video_url,slot_index,noteSeq,replyIndex,upordown,updateNotesFrame);
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
                var name = $($(this).parents()[1]).children().find(".name > a").html();
                $($(this).parents()[1]).children().find("textarea").attr({"placeholder":"@" + name});
                $($($(this).parents()[1]).children()[2]).css({"display":"block"});
                $(".commentSubmit").click(function(){
                    var comment = $($(this).parent().children()[0]).val();
                    var replyseq = $($(this).parent().parent()).data("replyseq");
                    var user_id = localStorage.id;
                    var video_url = localStorage.video_url;
                    var video_time = localStorage.time;
                    var slot_index = parseInt(parseInt(video_time)/slot_length);   //设定10s为一个时间段
                    var to = $($(this).parents()[1]).children().find(".name > a").data("id");
                    commentToReply(user_id,video_url,slot_index,noteSeq,replyseq,to,comment,$($($(this).parents()[1]).children()[2]),updateNotesFrame);
                })
            }
            else if($(this).hasClass("noteDelete")){
                operation = 4;
                var note = {};
                note.URL = localStorage.video_url;
                note.slotIndex = parseInt(MyNotesResult.notes[noteSeq].videoTime / slot_length);
                note.noteIndex = noteSeq;
                note.replyIndex = $($(this).parents()[1]).data('replyseq');
                replyToDelete(localStorage.id,note,updateNotesFrame);
            }
            if(operation == 0){  //noteEdit
                var content = $($($(this).parents()[1]).children()[0]).find(".mycontent").html();
                $("#editReplyModal").modal();
                $("#redactor_content_4").setCode(content);
                var replyIndex = $($(this).parents()[1]).data('replyseq');
                $("#saveReplyEdit").click(function(){
                    var note = {};
                    note.body = $("#redactor_content_4").getCode();
                    note.URL = localStorage.video_url;
                    note.slotIndex = parseInt(MyNotesResult.notes[noteSeq].videoTime / slot_length);
                    note.noteIndex = noteSeq;
                    note.replyIndex = replyIndex;
                    var smallAbstract = $(note.body).text();
                    if(smallAbstract.length > 80){
                        smallAbstract = smallAbstract.substring(0,80);
                        smallAbstract = smallAbstract + "...";
                    }
                    note.abstract = smallAbstract;
                    replyToEditSubmit(localStorage.id,note,updateNotesFrame);
                })
            }
            else if(operation == 1){
                operateNote(user_id,video_url,slot_index,noteSeq,operation - 1,upordown,updateNotesFrame);
            }
        }
        else if($($($(this).parents()[1])[0]).hasClass("secReply")){  //是对secReply的操作
            if($(this).hasClass("noteDelete")){
                var note = {};
                note.URL = localStorage.video_url;
                note.slotIndex = parseInt(MyNotesResult.notes[noteSeq].videoTime / slot_length);
                note.noteIndex = noteSeq;
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
                    commentToReply(user_id,video_url,slot_index,noteSeq,replyseq,to,comment,$($($(this).parents()[1]).children()[2]),updateNotesFrame);
                })
            }
        }
        else console.log("operation error!");
    })
}
//按笔记所在视频时间排序
function NoteCMP(a,b)
{
    return parseFloat(a.videoTime) - parseFloat(b.videoTime);
}
//显示笔记栏的笔记
function displayNotesFunc(result){
    MyNotesResult = result;
    updateReplysFrame(noteSeq);
    var str = '';
    var notes = result.notes;
    notes.sort(NoteCMP);
    var len = notes.length;
    for(var i = 0;i < len; ++ i){
        str += "<div class='timeNotes' data-seq=";
        str += notes[i].noteIndex;
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
    $($('.notesBody')[0]).html(str);
    $('.tab-content .notesBody .timeNotes').click(function(){
        $('.tab-content .notesGroup').css('display','none');
        $('.tab-content')[0].scrollTop = 0;
        var seq = $(this).data('seq');
        noteSeq = seq;
        //console.log(MyNotesResult);
        updateReplysFrame(noteSeq);
        $('.tab-content .replys').css('display','block');
    })
}
//更新笔记栏
function updateNotesFrame(video_url, slot_index,user_id){
    var video_total_time = localStorage.video_total_time;
    getNotesOnASlot(video_url,slot_index,video_total_time,displayNotesFunc,user_id);
}
//更新笔记回复区域
function updateReplysFrame(noteSeq){
    var note = null;
    for(var i = 0;i < MyNotesResult.notes.length; ++ i){
        if(MyNotesResult.notes[i].noteIndex == noteSeq) {
            note = MyNotesResult.notes[i];
            break;
        }
    }
    if(!note)
        return;
    str = '';
    str += "<button class='btn btn-info mybtn' type='button'>笔记</button>";
    str += note.title;
    $($(".tab-pane .note .title")[0]).html(str);
    $($(".tab-pane .note .replyList")[0]).html("");
    var str = '';
    str += "<a class='icon' href='../profile/individual.html?want=";
    str += note.fromUserID;
    str += "' target='_blank'><span class='fui-user' ";
    str += "data-id = ";
    str += note.fromUserID;
    str += " ></span> ";
    var user = getUserFromID(note.fromUserID,MyNotesResult);
    str += user.nickname;
    str += " </a><a class='icon'><span class='fui-calendar'></span> ";
    str += note.time;
    str += " </a><a class='icon'><span class='fui-chat'></span> ";
    str += note.replys.length;
    str += " </a>";
    $($(".tab-pane .note .detail")[0]).html(str);
    $($(".tab-pane .note .mycontent")[0]).html(note.body);
    str = '';
    str += "<a href='#' class='noteEdit'><span class='fui-new'></span><span> 编辑 </span></a><a href='#' class='notePraise'><span class='fui-heart'></span><span> 赞(";
    str += note.praises.length;
    str += ") </span></a><a href='#' class='noteConcern'><span class='fui-eye'></span><span> +关注(";
    str += note.concerns.length;
    str += ") </span></a><a href='#' class='noteCollect'><span class='fui-star'></span><span> 收藏(";
    str += note.collects.length;
    str += ") </span></a>";
    $($(".tab-pane .note .mytoil")[0]).html(str);
    str = '';
    str += "<button class='btn btn-inverse' type='button'>回复<span class='btn-default'><b>";
    str += note.replys.length;
    str += "</b></span></button>";
    for(var i = 0; i < note.replys.length; ++ i){
        str += "<div class='reply' data-replyseq = ";
        str += note.replys[i].replyIndex;
        str += ">";
        str += "<div class='myrow'><div class='pic'></div><div class='info'><div class='detail'><div class='icon name'><button class='btn btn-info mybtn' type='button'>回复</button><a  target='_blank' style='font-size:20px;color:#000' ";
        str += "data-id = ";
        str += note.replys[i].fromUserID;
        str += " >";
        var user =  getUserFromID(note.replys[i].fromUserID,MyNotesResult);
        str += user.nickname;
        str += "</a></div><a class='icon'>";
        str += note.replys[i].time;
        str += "</a></div></div><div class='mycontent'>";
        str += note.replys[i].body;
        str += "</div> </div>";
        str += "<div class='toil mytoil'><a href='#' class='noteEdit'><span class='fui-new'></span><span> 编辑 </span></a><a href='#' class='noteDelete'><span class='fui-trash'></span><span> 删除 </span></a><a href='#' class='notePraise'><span class='fui-heart'></span> <span> 赞(";
        str += note.replys[i].praises.length;
        str += ") </span></a><a href='#' class='noteComments'><span class='fui-document'></span><span> 展开评论(";
        str += note.replys[i].comments.length;
        str += ") </span></a><a href='#' class='noteComment'><span class='fui-chat'></span><span> 评论 </span></a></div>";
        str += "<div class='commentBox'> <textarea class='form-control pull-left commentArea' rows='3' placeholder='@'></textarea> <button class='btn btn-success commentSubmit'>提交</button> </div>"
        str += "<div class='secReplyList'>";
        for(var j = 0;j < note.replys[i].comments.length; ++ j) {
            str += "<div class='secReply' data-commentSeq = '";
            str += j;
            str += "'><div class='myrow'><div class='pic'></div><div class='info'><div class='detail'><div class='icon name'> <button class='btn btn-info mybtn' type='button'>评论</button> <a  target='_blank' style='font-size:20px;color:#000' data-id = '";
            str += note.replys[i].comments[j].fromUserID;
            str += "'>";
            str += getUserFromID(note.replys[i].comments[j].fromUserID, MyNotesResult).nickname;
            str += "</a></div><a class='icon'>";
            str += note.replys[i].comments[j].time;
            str += "</a></div></div><div class='mycontent'><a class='at'>@";
            str += getUserFromID(note.replys[i].comments[j].toUserID, MyNotesResult).nickname;
            str += ": </a>";
            str += note.replys[i].comments[j].body;
            str += "</div></div><div class='toil sectoil'><a href='#' class='noteDelete'><span class='fui-trash'></span>";
            str += "<span> 删除 </span></a><a href='#' class='noteComment'><span class='fui-chat'></span><span> 评论 </span>";
            str += "</a></div><div class='commentBox'><textarea class='form-control pull-left commentArea' rows='3' placeholder='@'></textarea>";
            str += "<button class='btn btn-success commentSubmit'>提交</button></div></div>";
        }
        str += "</div></div>";
    }
    $($(".tab-pane .note .replyList")[0]).html(str);
    addListenerForOperation();
}
function setVideo(mp4,webm,slotIndex){
	var str = '';
	if(webm){
		str += '<source src="' + webm + '" type="video/webm">';
		localStorage.setItem('webm',webm);
	}
	if(mp4){
		str += '<source src="' + mp4 + '" type="video/mp4">';
		localStorage.setItem('mp4',mp4);
	}
	$("video").html(str);
    $('video')[0].addEventListener('loadedmetadata',function(){
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
        else if(MyNotesResult){
            for(var i = 0;i < MyNotesResult.notes.length; ++ i){
                var node = $($("#home .timeNotes")[i]).children()[1];
                if($(node).hasClass("focused"))
                    $(node).removeClass("focused");
                var duration = MyNotesResult.notes[i].videoTime - localStorage.time;
                if(duration > -0.5 && duration < 0.5){
                    $(node).addClass("focused");
                }
            }
        }
    })
}

function basic_bars(container, horizontal) {

  var
    horizontal = (horizontal ? true : false), // Show horizontal bars
    d1 = [],                                  // First data series
    d2 = [],                                  // Second data series
    point,                                    // Data point variable declaration
    i;

  for (i = 0; i < 4; i++) {

    if (horizontal) {
      point = [Math.ceil(Math.random()*10), i];
    } else {
      point = [i, Math.ceil(Math.random()*10)];
    }

    d1.push(point);

    if (horizontal) {
      point = [Math.ceil(Math.random()*10), i+0.5];
    } else {
      point = [i+0.5, Math.ceil(Math.random()*10)];
    }

    d2.push(point);
  };

  // Draw the graph
  Flotr.draw(
    container,
    [d1, d2],
    {
      bars : {
        show : true,
        horizontal : horizontal,
        shadowSize : 0,
        barWidth : 0.5
      },
      mouse : {
        track : true,
        relative : true
      },
      yaxis : {
        min : 0,
        autoscaleMargin : 1
      }
    }
  );
};

$(document).ready( function() {
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
		}
	})
	//切换显示tab时scroll归0,重置笔记页面
	$('.nav-tabs > li').click(function(){
		$('.tab-content')[0].scrollTop = 0;
		$('.tab-content .notesGroup').css('display','block');
		$('.tab-content .replys').css('display','none');
	})
	//切换笔记显示页面和编辑/回复页面   待删
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

    //redactor初始化
    $('.replys .head .btn-info').click(function(){
        $('#redactor_content_1').redactor({
            imageUpload: serverIP + '/imageUpload',
            fileUpload: serverIP + '/fileUpload'
        });
    })

    $('#newnote').click(function(){
        //截图部分
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
	if(localStorage.mp4||localStorage.webm){
		setTimeout(function(){
			if(!isNewVideo)
			{
				setVideo(localStorage.mp4,localStorage.webm,0);
			}
			else isNewVideo = 0;
		}, 500);
	}
	//监听是否有新的视频资源
	chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
		console.log(message);
		if(message.operation == "setVideo")
		{
			isNewVideo = 1;
			localStorage.setItem('time',0);
			if(message.contents.site == 'coursea')
				setVideo(message.contents.mp4,message.contents.webm,0);
			else if(message.contents.site == 'edx')
			{
				$("video").html(message.contents.source);
				$("video")[0].currentTime = localStorage.time;
				VideoLoop();
			}
			sendResponse("success");
		}
        else if(message.operation == "setNote"){
            isNewVideo = 1;
            localStorage.setItem('time',message.contents.videotime);
            var str = message.contents.url;
            if(str.substr(str.length - 4,4) == 'webm'){
                setVideo(null,str,message.contents.slotindex);
            }
            else if(str.substr(str.length - 3,3) == 'mp4'){
                setVideo(str,null,message.contents.slotindex);
            }
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
		if(src.substr(len - 3,len) == 'ebm')
			setVideo(null,src,0);
		else if(src.substr(len - 3,len) == 'mp4')
			setVideo(src,null,0);
	})

    //画表格部分
    var container = document.getElementById("formContainer");
    $($('.nav-tabs > li')[2]).click(function(){
    	$('container').css({'display':'block'});
    	basic_bars(container,false);
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
        var slot_index = parseInt(parseInt(MyNotesResult.notes[noteSeq].videoTime) / slot_length);   //设定10s为一个时间段
        var noteIndex = noteSeq;
        replyToNote(user_id, video_url, slot_index, noteIndex, note, updateNotesFrame);
    })

});