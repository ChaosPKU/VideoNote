var isNewVideo = 0;
var globalVideo;
function VideoLoop(){
	//每秒执行一次，记录当前视频的播放时间
	localStorage.time = $("video")[0].currentTime;
	setTimeout(function(){
		VideoLoop();
	}, 1000);
}

function setVideo(mp4,webm){
	var str = '';
	if(webm){
		str += '<source src="' + webm + '" type="video/webm">';
		localStorage.setItem('webm',webm);
		$("#navbarInput-02").val(webm);
	}
	if(mp4){
		str += '<source src="' + mp4 + '" type="video/mp4">';
		localStorage.setItem('mp4',mp4);
		$("#navbarInput-02").val(mp4);
	}
	$("video").html(str);
	//$("video")[0].play();
	$("video")[0].currentTime = localStorage.time;
	VideoLoop();
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
	//开关笔记栏
	$("#bookmark").click(function(){
		$(".rightframe").toggle();
		if($(".leftframe").hasClass("bigframe"))
		{
			$(".leftframe").removeClass("bigframe");
			$("#form2 .input-group").width('450');
		}
		else {
			$(".leftframe").addClass("bigframe");
			$("#form2 .input-group").width('600')
		}
	})
	//切换笔记显示页面和编辑/回复页面
	$('.tab-content .notesBody .timeNotes').click(function(){
		$('.tab-content .notesGroup').css('display','none');
		$('.tab-content .replys').css('display','block');
	})
	$('.replys .head .btn-danger').click(function(){
		$('.tab-content .notesGroup').css('display','block');
		$('.tab-content .replys').css('display','none');
	})
	$('.replys .head .btn-info').click(function(){
		$('#redactor_content_1').redactor({ 	
			imageUpload: '/imageUpload',
			fileUpload: '/fileUpload'
		});
	})

	//设置右侧frame高度使两端对齐
	$('.tab-content').height($('video').height() + $('.foot').height() +35);
	$(window).resize(function(){
		$('.tab-content').height($('video').height() + $('.foot').height() +35);
	})

	//modal部分
	$('#replyModal').on('show.bs.modal', function (e) {
	  	$('#replyModal').find(".modal-dialog").css("margin-top",function(){
	  		return $(window).height()/4;
	  	});
	});

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
		$(this).ajaxSubmit(options); 
	})
	//视频截图部分
	var v = $('video')[0];
    var c = document.getElementById("myCanvas");
    ctx = c.getContext('2d');
    var myPlayer = videojs('video');
    $("#newnote").click(function(){
    	/*
    	var c = document.getElementById("myCanvas");
    	ctx = c.getContext('2d');
    	globalVideo.volume = 0;
    	globalVideo.currentTime = '40';
    	globalVideo.play();
    	globalVideo.addEventListener('playing',function(){
    		ctx.drawImage(globalVideo,0,0,78.5,44.2);
    		console.log(c.toDataURL("image/png"));
    		$('.timeNotes > img:first').attr({'src':c.toDataURL("image/png")});
    		globalVideo.pause();
    	});
		*/
        ctx.drawImage(v,0,0,78.5,44.2);
        console.log(c.toDataURL("image/png"));
        $('.timeNotes > img:first').attr({'src':c.toDataURL("image/png")});
    })
    //视频元数据准备好之后，准备下载作为本地视频
    $('video')[0].onloadedmetadata = function(){
    	console.log($('video')[0].currentSrc);
    	XHRVideoHandler();
    }
    //画表格部分
    //var container = document.getElementById("container");
    //basic_bars(container,false);
});

function XHRVideoHandler() {
	  window.URL = window.URL || window.webkitURL;
      var xhr = new XMLHttpRequest();
      var Curvideo = $('video')[0].currentSrc;
      xhr.open('GET', Curvideo, true);
      // Response handlers.
      xhr.responseType = 'blob';
      xhr.onload = function () {
         	globalVideo = document.createElement('video');
			globalVideo.src = window.URL.createObjectURL(this.response);
			globalVideo.preload = 'auto';
			//document.body.appendChild(video);
      };
      xhr.onerror = function () {
         alert('error making the request.');
      };
      xhr.send();
   }