//测试用的
$(document).ready(function(){

		$('#redactor_content_1').redactor({ 	
			imageUpload: '/imageUpload',
			fileUpload: '/fileUpload'
		});

		//点panel也进得去
		$(".noteEasyDis .panel").click(function(){
			$("#notesDis").css("display","none");
			$("#oneNoteDis").css("display","block");
		});
		//每个评论的评论在mouseover时才显示
		$(".oneComment").mouseover(function(){
			$(this).find(".commentDis").css("display","block");
		});
		$(".oneComment").mouseout(function(){
			$(this).find(".commentDis").css("display","none");
		});

		//展开和收起评论
		$(".operateComments").toggle(function(){
			$(this).parent().nextAll(".oneComment").css("display","block");
			$(this).html('<span class="glyphicon glyphicon-comment"></span> 收起' + $(this).text().substring(3));
		},function(){
			$(this).parent().nextAll(".oneComment").css("display","none");
			$(this).html('<span class="glyphicon glyphicon-comment"></span> 展开' + $(this).text().substring(3));
		});

		//回复modal的位置
		$('#replyModal').on('show.bs.modal', function (e) {
		  	$('#replyModal').find(".modal-dialog").css("margin-top",function(){
		  		return $("body").height()/3;
		  	});
		});
	}
);