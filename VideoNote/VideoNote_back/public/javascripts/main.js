var isNewVideo = 0;
function VideoLoop(){
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
	$("video")[0].play();
	$("video")[0].currentTime = localStorage.time;
	VideoLoop();
}

$(document).ready( function() {
	if(localStorage.mp4||localStorage.webm){
		setTimeout(function(){
			if(!isNewVideo)
			{
				setVideo(localStorage.mp4,localStorage.webm);
			}
			else isNewVideo = 0;
		}, 500);
	}

	chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
		console.log(message);
		if(message.operation == "setVideo")
		{
			isNewVideo = 1;
			localStorage.setItem('time',0);
			setVideo(message.contents.mp4,message.contents.webm);
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
	$("#form1").submit(function(){
		$(this).ajaxSubmit(options); 
		window.open("https://www.google.com.hk/#newwindow=1&safe=strict&q=" + $(".form-control")[0].value , "_blank")
	})

	$("#form2").submit(function(){
		$(this).ajaxSubmit(options); 
	})

	$("#note").click(function(){
		$(".rightframe").toggle();
		if($(".leftframe").hasClass("bigframe"))
			$(".leftframe").removeClass("bigframe");
		else $(".leftframe").addClass("bigframe");
	})
});