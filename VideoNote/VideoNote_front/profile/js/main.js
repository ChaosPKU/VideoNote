var isNewVideo = 0;
//秒数转标准时间格式
function formatTime(second) {
    return [parseInt(second / 60 / 60), parseInt(second / 60) % 60, parseInt(second % 60)].join(":").replace(/\b(\d)\b/g, "0$1");
}
//显示笔记栏的笔记
function displayNotesFunc(result){
    console.log(result);
    var str = '';
    var notes = result.notes;
    var len = notes.length;
    for(var i = 0;i < len; ++ i){
        str += "<div class='timeNotes'> <img src class='capImg'/> <div class='noFocused ";
        str += "focused";
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
}
//更新笔记栏
function updateNotesFrame(video_url, slot_index,user_id){
    getNotesOnASlot(video_url,slot_index,displayNotesFunc,user_id);
}
function setVideo(mp4,webm){
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
        updateNotesFrame($('video')[0].currentSrc, 0, localStorage.id);
    })
    $('video')[0].addEventListener('timeupdate',function(){
        localStorage.time = $("video")[0].currentTime;
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
	//鼠标悬停或离去时显示/隐藏第二级回复的底端菜单
	$('.secReply').each(function(){
		$(this)[0].addEventListener('mouseover',function(){
			$($(this)[0].children[1]).css({'display':'block'})
		});
		$(this)[0].addEventListener('mouseleave',function(){
			$($(this)[0].children[1]).css({'display':'none'})
		})
	});

    //redactor初始化
    $('.replys .head .btn-info').click(function(){
        $('#redactor_content_1').redactor({
            imageUpload: serverIP + '/imageUpload',
            fileUpload: serverIP + '/fileUpload'
        });
    })

    $('#newnote').click(function(){
        $('#redactor_content_2').redactor({
            imageUpload: serverIP + '/imageUpload',
            fileUpload: serverIP + '/fileUpload'
        });
    })

	//功能性部分
	//已有播放记录，则根据记录设置播放
	if(localStorage.mp4||localStorage.webm){
		setTimeout(function(){
			if(!isNewVideo)
			{
				setVideo(localStorage.mp4,localStorage.webm);
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
				setVideo(message.contents.mp4,message.contents.webm);
			else if(message.contents.site == 'edx')
			{
				$("video").html(message.contents.source);
				$("video")[0].currentTime = localStorage.time;
				VideoLoop();
			}
			sendResponse("success");
		}
		else sendResponse("failure");
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
			setVideo(null,src);
		else if(src.substr(len - 3,len) == 'mp4')
			setVideo(src,null);
	})
	//视频截图部分
    $("#newnote").click(function(){
        chrome.tabs.captureVisibleTab(null, {
            format: 'png',
            quality: 100
        }, function(dataUrl){
            $('.timeNotes > img:first').attr({'src':dataUrl});
        });
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
        var slot_index = parseInt(parseInt(video_time)/10);   //设定10s为一个时间段
        submitNote(user_id,video_url,video_name,video_total_time,video_time,slot_index,note,updateNotesFrame);
    })
});