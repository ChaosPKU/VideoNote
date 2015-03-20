var UsersThisPage = [];
var scrollBottom = 9999999;//巨大的数，为了一开始在顶上
var maybeNoteIndex = null;//第一次进来如果是有index的，按index处理
//返回某个string在某个数组里的index；若没有，返回-1
function indexInArray(name, array){
	for(var i = 0 ; i < array.length ; i++){
		if(name.toString() == array[i].toString()){
			return i;
		}
	}
	return -1;
}
//findUserObject
function findUser(userid , users){
	var i = 0 ;
	for(i = 0 ; i < users.length ; i++){
		if(userid == users[i].userID){
			break;
		}
	}
	return users[i];
}
//排序函数
function newerSort(a,b){
	return b._time - a._time ;
}
function hotscore(note){
	var score = 0 ;
	for(var i = 0 ; i < note.replys.length ; i++){
		score += 2; //一个回复+2
		score += note.replys[i].comments.length; //一个评论+1
	}
	score += note.praises.length*3 ;//一个赞+3
	score += note.concerns.length*5 ;//一个关注+5
	//console.log(note.title + '  ' + score);
	return score;
}
function hotterSort(a,b){//最热笔记应该是 回复数和评论数、关注综合
	//console.log(hotscore(b)+'  '+hotscore(a))
	return hotscore(b) - hotscore(a) ;
}
function praiseSort(a,b){//如果是问题，回复用赞的多少排序，这里的a，b均为reply
	return b.praises.length - a.praises.length;
}

//首页展示笔记摘要信息，notes为本页所有笔记，whereToDis为在最新中还是最热中
function displayNotesFunc(notes, whereToDis){
	//console.log(UsersThisPage);
	if(whereToDis == 0){
		notes.sort(newerSort);
		$ullist = $("#notesDis #newer .notesGroup");
		$ullist.empty();
	}else{
		notes.sort(hotterSort);
		$ullist = $("#notesDis #hotter .notesGroup");
		$ullist.empty();
	}
	var myID = $("#page_information").data("user_ID");
	for(var i = 0 ; i < notes.length ; i++){
		var typeStr = (notes[i].type == 0)?"笔记":"问题";
		var fromUser = findUser(notes[i].fromUserID, UsersThisPage[$("#page_information").data("pdf_page")]);
		
		$media_body = $('<div class="media-body noteAbstract">'+
						'<h3 class="media-heading"> <span class="label label-primary">'+typeStr+'</span> '+ notes[i].title +'</h3>'+
						'<h5 class="media-heading text-right">'+fromUser.nickname +'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
							'<small><time>'+notes[i].time+'</time></small></h5>'+
						'<p>'+notes[i].abstract+'</p></div>');
		
		$head = $('<a class="pull-left" href="#"><img class="media-object img-rounded" src="'+fromUser.head +'" alt="'+
					notes[i].fromUserID+'"></a>');		
		$panel_body = $('<div class="panel-body" id="note'+whereToDis+notes[i].noteIndex+'"></div>');
		$panel_body.append($head);
		$panel_body.append($media_body);
		$panel_body.data(notes[i]);

		var praiseUpDown = null;
		if(indexInArray(myID,notes[i].praises) < 0){
			praiseUpDown = '<a href="#" class="notePraiseA"><span class="glyphicon glyphicon-thumbs-up"></span><span> 赞('+notes[i].praises.length+')</span></a>';
		}else{
			praiseUpDown = '<a href="#" class="noNotePraiseA"><span class="glyphicon glyphicon-thumbs-up"></span><span> 已赞('+notes[i].praises.length+')</span></a>';
		}
		var concernUpDown = null;
		if(indexInArray(myID,notes[i].concerns) < 0){
			concernUpDown = '<a href="#" class="noteConcernA"><span class="glyphicon glyphicon-eye-open"></span><span> +关注('+notes[i].concerns.length+')</span></a>';
		}else{
			concernUpDown = '<a href="#" class="noNoteConcernA"><span class="glyphicon glyphicon-eye-close"></span><span> 已关注('+notes[i].concerns.length+')</span></a>';
		}

		$panel_footer = $('<div class="panel-footer text-right">'+
							'<a href="#" class="replyA"><span class="glyphicon glyphicon-comment"></span><span> '+notes[i].replys.length+'条回复</span></a>&nbsp;&nbsp;&nbsp;&nbsp;'+
							 praiseUpDown+'&nbsp;&nbsp;&nbsp;&nbsp;'+ concernUpDown +
						'</div>');
		$panel_footer.data({"noteIndex":notes[i].noteIndex});

		$panel = $('<div class="panel panel-default"></div>');
		$panel.data({"selection":notes[i].relatedRange});
		$panel.append($panel_body);
		$panel.append($panel_footer);

		$li = $('<li class="media noteEasyDis"></li>');
		$li.append($panel);

		$ullist.append($li);
	}
	//console.log(scrollBottom);
	if($("#notesDis").css("display") == "block"){
		$("body").scrollTop($("body").height()-scrollBottom);//回到返回前的样子,距底部距离一定,但不要影响次页
	}
	//如果是以直接进入某个笔记进来的话，找到他，并click他
	if(maybeNoteIndex){
		//console.log(maybeNoteIndex);
		$("#note0"+maybeNoteIndex).hover();
		$("#note0"+maybeNoteIndex).click();
		maybeNoteIndex = null;
	}
}
//假的回复显示
function fakeDisReply(replys ,note, i){
	$replyli = $('<li class="media"><a class="pull-left" href="/profile?want='+
					$("#page_information").data("user_ID")+'" target="_blank">'+
					'<img class="media-object img-rounded" src="'+$("#page_information").data("head")+'" alt="'+
						$("#page_information").data("user_ID")+'">'+
				'</a></li>');

	$replyli_body = $('<div class="media-body"><h5 class="media-heading"><a href="/profile?want='+
						$("#page_information").data("user_ID")+'" target="_blank"><span>'+
						$("#page_information").data("nickname") +' </span></a><small><time>'+
						note.replys[i].time +'</time></small></h5><div class="replyBody">'+
						note.replys[i].body + '</div></div>');
	$replyli_footer = $(
    '<footer class="content-meta text-right" >'+
        '<a href="#" class="replyEdit"><span class="glyphicon glyphicon-edit"></span> 编辑</a>'+
        '<a href="#" class="replyDelete"><span class="glyphicon glyphicon-trash"></span> 删除</a>'+
        '<a href="#" class="replyPraise"><span class="glyphicon glyphicon-thumbs-up"></span><span> 赞('+
            note.replys[i].praises.length +')</span></a>'+
        '<a href="#" class="operateComments"><span class="glyphicon glyphicon-comment"></span> 展开评论('+
            note.replys[i].comments.length +')</a>'+
        '<a href="#" class="replyComment"><span class="glyphicon glyphicon-pencil"></span> 评论</a>'+
    '</footer>');
	$replyli_footer.data({
		"noteIndex": note.noteIndex,
		"replyIndex": note.replys[i].replyIndex
	});
	$replyli_body.append($replyli_footer);
	$comment_box = $('<div class="media commentBox">' +
						'<textarea class="form-control pull-left" rows="3" placeholder="评论"></textarea>'+
						'<button type="button" class="btn btn-success commentSubmit">提交</button>'+
					'</div>');
	$replyli_body.append($comment_box);

	$replyli.append($replyli_body);

	$(replys+" ul").append($replyli);
	$(replys).siblings("footer").find('a[href="#replys"]').html('<span class="glyphicon glyphicon-comment"></span> '+note.replys.length);
	$(replys+" h4 span").text(note.replys.length);
}
//假的评论显示
function fakeDisComment(thisCommentBox, comment){
	var commentToUser = findUser(comment.toUserID, UsersThisPage[$("#currentPage").data("currentPage")]);
	$comment_div = $('<div class="media oneComment" style="display: block;">'+
						'<a class="pull-left" href="/profile?want='+$("#page_information").data("user_ID")+'" target="_blank">'+
							'<img class="media-object img-rounded" src="'+$("#page_information").data("head")+'" alt="'+
							$("#page_information").data("user_ID")+'"></a>'+
						'<div class="media-body">'+
							'<h5 class="media-heading"><a href="/profile?want='+$("#page_information").data("user_ID")+
							'" target="_blank"><span>'+$("#page_information").data("nickname")+' </span></a><small><time>'+
							comment.time +'</time></small></h5>'+
							'<p><a href="/profile?want='+commentToUser.userID+'" target="_blank">@'+commentToUser.nickname+':</a>'+
							comment.body +'</p>'+
						'</div>'+
						'<div class="text-right commentDis content-meta">'+
                            '<a href="#" class="commentDelete"><span class="glyphicon glyphicon-trash"></span> 删除</a>'+
							'<a href="#" class="commentComment"><span class="glyphicon glyphicon-pencil"></span> 评论</a>'+
						'</div>'+
					'</div>');
	$(thisCommentBox).before($comment_div);
	var text = $(thisCommentBox).siblings("footer").find(".operateComments").text();
	text = text.substring(0,text.length-1);
	text = text.substring(0,6) + (Number(text.substring(6))+1) ;
	$(thisCommentBox).siblings("footer").find(".operateComments").html('<span class="glyphicon glyphicon-comment"></span>'+text+')');

}
//收听消息
window.addEventListener('message',function (e) {
    var msg = e.data;
    var $dataElement = $("#page_information");
    //console.log(msg);
    if(msg.key=="url"){
    	$dataElement.data("pdf_url",msg.value);
    //	console.log(msg.value);
	}
	else if(msg.key == "noteIndex"){
		maybeNoteIndex = msg.value;
	}
    else if(msg.key=="userid"){
    	$dataElement.data("user_ID",msg.value);
    	if(!localStorage.id || localStorage.id!=msg.value){
    		localStorage.id = msg.value;
    	}
    //	console.log($dataElement.data("user_ID"));
    }
    else if(msg.key=="nickname"){
    	$dataElement.data("nickname",msg.value);
    //	console.log($dataElement.data("user_ID"));
    }
    else if(msg.key=="head"){
    	$dataElement.data("head",msg.value);
    //	console.log($dataElement.data("user_ID"));
    }
    else if(msg.key=="page"){
    	//console.log(msg.value);
    	if(!$dataElement.data("pdf_page") || $dataElement.data("pdf_page")!= msg.value){
    		$dataElement.data("pdf_page",msg.value);
    		//console.log($dataElement.data("pdf_page"));
    		getNotesOnAPage($dataElement.data("pdf_url"),$dataElement.data("pdf_page"),displayNotesFunc);
    	}     	
    	
    }
    else if(msg.key=="update"){
    	//提交之后更新此页
    	//console.log($dataElement.data("pdf_url")+"  " +$dataElement.data("pdf_page"));
		getNotesOnAPage($dataElement.data("pdf_url"),$dataElement.data("pdf_page"),displayNotesFunc);   	
    }
	    
});

//selection
var selectionToPDF = null;
$(document).ready(function(){
	//位置

	$(document).on("mouseover","div.panel",function(){
		if(!selectionToPDF){
			//console.log("over");
			selectionToPDF = $(this).data("selection");
			var iframedata = new Object();
		    iframedata.key="selection" ;
		    iframedata.value=selectionToPDF;
			window.parent.postMessage(iframedata,'*');
		}	
	});

	$(document).on("mouseleave","div.panel",function(){
		//console.log("leave");
		if(selectionToPDF){
			selectionToPDF = null ;
			var iframedata = new Object();
		    iframedata.key="clearSelection" ;
			window.parent.postMessage(iframedata,'*');
		}
	});	

//这个函数里面有次页
	$(document).on("click",".panel .panel-body",function(){
		//console.log($("body").scrollTop());
		scrollBottom = $("body").height() - $("body").scrollTop() ;
		$("body").scrollTop(0); //次页保证每次从头开始
		//别删selection
		selectionToPDF = null;
		//生成后面的页面
		var note = $(this).data();
		var myID = $("#page_information").data("user_ID");
		var fromUser = findUser(note.fromUserID, UsersThisPage[$("#page_information").data("pdf_page")]);

		$("#replyTitle").text("回复笔主："+fromUser.nickname);
		$("#replyTitle").data({noteIndex : note.noteIndex});
		
		$wrapAll = $("#allWrap");
		$wrapAll.data({"selection":note.relatedRange});

		$currentPage = $('<p id="currentPage"></p>');//有可能外面的页码变了，但里面的不能变！
		$currentPage.data("currentPage",$("#page_information").data("pdf_page"));
		$wrapAll.append($currentPage);
		

		var typeStr = (note.type == 0)?"笔记":"问题";
		
		$start = $('<a href="/profile?want='+fromUser.userID+'" target="_blank"><img class="img-rounded pull-left avatar" src="'
					+fromUser.head+'" alt="'+note.fromUserID+'"></a>'+
					'<h3 class="article-title"><span class="label label-primary">'+typeStr+'</span><span> '+note.title+'</span></h3>'+
					'<footer class="content-meta noteFooter">'+
						'<a href="/profile?want='+fromUser.userID+'" target="_blank"><span class="glyphicon glyphicon-user"></span> '+fromUser.nickname+'</a>'+
						'<time><span class="glyphicon glyphicon-calendar"></span> '+note.time+'</time>'+
						'<a href="#replys"><span class="glyphicon glyphicon-comment"></span> '+note.replys.length+'</a>'+
					'</footer>');
		$wrapAll.append($start);

		$content_wrap = $('<div id="contentwrap"><div id="content">'+note.body+'</div></div>');

		var praiseUpDown = null;
		if(indexInArray(myID,note.praises) < 0){
			praiseUpDown = '<a href="#" class="notePraiseA"><span class="glyphicon glyphicon-thumbs-up"></span><span> 赞('+note.praises.length+')</span></a>';
		}else{
			praiseUpDown = '<a href="#" class="noNotePraiseA"><span class="glyphicon glyphicon-thumbs-up"></span><span> 已赞('+note.praises.length+')</span></a>';
		}
		var concernUpDown = null;
		if(indexInArray(myID,note.concerns) < 0){
			concernUpDown = '<a href="#" class="noteConcernA"><span class="glyphicon glyphicon-eye-open"></span><span> +关注('+note.concerns.length+')</span></a>';
		}else{
			concernUpDown = '<a href="#" class="noNoteConcernA"><span class="glyphicon glyphicon-eye-close"></span><span> 已关注('+note.concerns.length+')</span></a>';
		}
		var collectUpDown = null;
		if(indexInArray(myID,note.collects) < 0){
			collectUpDown = '<a href="#" class="noteCollectA"><span class="glyphicon glyphicon-star-empty"></span><span> 收藏('+note.collects.length+')</span></a>';
		}else{
			collectUpDown = '<a href="#" class="noNoteCollectA"><span class="glyphicon glyphicon-star"></span><span> 已收藏('+note.collects.length+')</span></a>';
		}
        var ifMyNote = null;
        if(note.fromUserID == myID){
            ifMyNote = '<a href="#" class="noteEdit"><span class="glyphicon glyphicon-edit"></span> 编辑</a>';
        }else{
            ifMyNote='';
        }
		$content_footer = $('<footer class="content-meta text-right" >'+ ifMyNote +
						praiseUpDown + concernUpDown +collectUpDown +
					'</footer>');
		$content_footer.data({"noteIndex":note.noteIndex });
		$content_wrap.append($content_footer);
		$wrapAll.append($content_wrap);

		$replys = $('<div id="replys" class="clearfix"><h4>回复 <span class="label label-info">'+
					note.replys.length+'</span></h4></div>');
		$replyul = $('<ul class="media-list"></ul>');
		//如果是问题，那么回复按赞的多少排序
		if(note.type == 1){
			note.replys.sort(praiseSort);
		}
		for(var i = 0 ; i < note.replys.length ; i++){
			var replyFromUser = findUser(note.replys[i].fromUserID, UsersThisPage[$("#currentPage").data("currentPage")]);

			$replyli = $('<li class="media"><a class="pull-left" href="/profile?want='+replyFromUser.userID+'" target="_blank">'+
							'<img class="media-object img-rounded" src="'+replyFromUser.head+'" alt="'+note.replys[i].fromUserID+'">'+
						'</a></li>');

			$replyli_body = $('<div class="media-body"><h5 class="media-heading"><a href="/profile?want='+
								replyFromUser.userID+'" target="_blank"><span>'+
								replyFromUser.nickname +' </span></a><small><time>'+
								note.replys[i].time +'</time></small></h5><div class="replyBody">'+
								note.replys[i].body + '</div></div>');

            //是自己的话可以编辑和删除
            var ifMyReply = null;
            if(note.replys[i].fromUserID == myID){
                ifMyReply = '<a href="#" class="replyEdit"><span class="glyphicon glyphicon-edit"></span> 编辑</a>'+
                '<a href="#" class="replyDelete"><span class="glyphicon glyphicon-trash"></span> 删除</a>';
            }else{
                ifMyReply = '';
            }

			var replyPraiseUpDown = null ;
			if(indexInArray(myID,note.replys[i].praises) < 0){
				replyPraiseUpDown = '<a href="#" class="replyPraise"><span class="glyphicon glyphicon-thumbs-up"></span><span> 赞('+note.replys[i].praises.length+')</span></a>';
			}else{
				replyPraiseUpDown = '<a href="#" class="noReplyPraise"><span class="glyphicon glyphicon-thumbs-up"></span><span> 已赞('+note.replys[i].praises.length+')</span></a>';
			}

			$replyli_footer = $('<footer class="content-meta text-right" >'+ ifMyReply + replyPraiseUpDown +
									'<a href="#" class="operateComments"><span class="glyphicon glyphicon-comment"></span> 展开评论('+
										note.replys[i].comments.length +')</a>'+
									'<a href="#" class="replyComment"><span class="glyphicon glyphicon-pencil"></span> 评论</a>'+
								'</footer>');
			$replyli_footer.data({
				"noteIndex": note.noteIndex,
				"replyIndex": note.replys[i].replyIndex
			});
			$replyli_body.append($replyli_footer);

			for(var j = 0 ; j < note.replys[i].comments.length ; j++){
				
				var commentFromUser = findUser(note.replys[i].comments[j].fromUserID, UsersThisPage[$("#currentPage").data("currentPage")]);
				var commentToUser = findUser(note.replys[i].comments[j].toUserID, UsersThisPage[$("#currentPage").data("currentPage")]);
                var ifMyComment = null;
                if(note.replys[i].comments[j].fromUserID == myID){
                    ifMyComment = '<a href="#" class="commentDelete"><span class="glyphicon glyphicon-trash"></span> 删除</a>';
                }else{
                    ifMyComment = '';
                }
                $comment_div = $('<div class="media oneComment">'+
									'<a class="pull-left" href="/profile?want='+commentFromUser.userID+'" target="_blank">'+
										'<img class="media-object img-rounded" src="'+commentFromUser.head+'" alt="'+
										note.replys[i].comments[j].fromUserID+'"></a>'+
									'<div class="media-body">'+
										'<h5 class="media-heading"><a href="/profile?want='+commentFromUser.userID+
										'" target="_blank"><span>'+commentFromUser.nickname+' </span></a><small><time>'+
										note.replys[i].comments[j].time +'</time></small></h5>'+
										'<p><a href="/profile?want='+commentToUser.userID+'" target="_blank">@'+commentToUser.nickname+':</a>'+
										note.replys[i].comments[j].body +'</p>'+
									'</div>'+
									'<div class="text-right commentDis content-meta">'+ ifMyComment+
										'<a href="#" class="commentComment"><span class="glyphicon glyphicon-pencil"></span> 评论</a>'+
									'</div>'+
								'</div>');
				$replyli_body.append($comment_div);
			}
			$comment_box = $('<div class="media commentBox">' +
								'<textarea class="form-control pull-left" rows="3" placeholder="评论"></textarea>'+
								'<button type="button" class="btn btn-success commentSubmit">提交</button>'+
							'</div>');
			$replyli_body.append($comment_box);

			$replyli.append($replyli_body);
			$replyul.append($replyli);
		}
		$replys.append($replyul);
		$wrapAll.append($replys);

		$("#notesDis").css("display","none");
		$("#oneNoteDis").css("display","block");

	});
	$(document).on("click",".panel .panel-footer .replyA",function(){
		$(this).parent().prev().click();
	});
	$(document).on("click",".panel .panel-footer .concernA",function(){
		console.log($(this).data());
		return false;
	});

	//次页
	$(document).on("mouseover","#oneNoteDis",function(){
		if(!selectionToPDF){
			//console.log("over");
			selectionToPDF = $(this).find("#allWrap").data("selection");
			var iframedata = new Object();
		    iframedata.key="selection" ;
		    iframedata.value=selectionToPDF;
			window.parent.postMessage(iframedata,'*');
		}	
	});

	$(document).on("mouseleave","#oneNoteDis",function(){
		//console.log("leave");
		if(selectionToPDF){
			selectionToPDF = null ;
			var iframedata = new Object();
		    iframedata.key="clearSelection" ;
			window.parent.postMessage(iframedata,'*');
		}
	});	


	$(document).on("click","#goBack",function(){
		$("#oneNoteDis").css("display","none");
		$("#notesDis").css("display","block");
		$("#allWrap").empty();
		getNotesOnAPage($("#page_information").data("pdf_url"),$("#page_information").data("pdf_page"),displayNotesFunc);
		
		return false;
	});

	//每个评论的评论在mouseover时才显示
	$(document).on("mouseover",".oneComment",function(){
		$(this).find(".commentDis").css("display","block");
	});
	$(document).on("mouseout",".oneComment",function(){
		$(this).find(".commentDis").css("display","none");
	});
	

	//展开和收起评论
	$(document).on("click",".operateComments",function(){
		//console.log($(this).text().substring(0,2));
		if($(this).text().substring(0,2) == " 展"){
			$(this).parent().nextAll(".oneComment").slideDown("fast");
			$(this).html('<span class="glyphicon glyphicon-comment"></span> 收起' + $(this).text().substring(3));
		}else{
			$(this).parent().nextAll(".oneComment").slideUp("fast");
			$(this).html('<span class="glyphicon glyphicon-comment"></span> 展开' + $(this).text().substring(3));
		}
		return false;
	});
    //点大框的某些部分应该也可以展开和收起评论
    $(document).on("click","#replys li.media div.media-body h5",function(){
        $(this).parent().find("footer a.operateComments").click();
        return false;
    });
    $(document).on("click","#replys li.media h5 a",function(e){
        e.stopPropagation();
    });

	//回复的评论生成评论textarea
	$(document).on("click",".replyComment",function(){
		//其他回复下面的评论框关了，开这个评论框
		$(".commentBox").css("display","none");
		//显示评论们
		$(this).parent().nextAll(".oneComment").css("display","block");
		$(this).siblings('.operateComments').html('<span class="glyphicon glyphicon-comment"></span> 收起' + $(this).siblings('.operateComments').text().substring(3));
		
		var toUserID = $(this).parent().parent().siblings("a").find("img").attr("alt");
		$commentBox = $(this).parent().siblings(".commentBox");
		$commentBox.css("display","block");
		var toUserName = $(this).parent().siblings("h5").find("span").text();
		$commentBox.find("textarea").focus();
		$commentBox.find("textarea").attr("placeholder","@"+toUserName);
		$commentBox.find("button").data("toUserID",toUserID);
		return false;
	});

	//评论的评论生成评论textarea
	$(document).on("click",".commentComment",function(){
		//其他回复下面的评论框关了，开这个评论框
		$(".commentBox").css("display","none");

		var toUserID = $(this).parent().siblings("a").find("img").attr("alt");
		$commentBox = $(this).parent().parent().siblings(".commentBox");
		$commentBox.css("display","block");
		var toUserName = $(this).parent().siblings("div.media-body").find("h5 span").text();
		$commentBox.find("textarea").focus();
		$commentBox.find("textarea").attr("placeholder","@"+toUserName);
		$commentBox.find("button").data("toUserID",toUserID);
		return false;
	});
	//textarea focus的时候背景
	$(document).on("focus",".commentBox textarea",function(){
		$(this).parent().parent().parent().addClass("hover");
	});
	$(document).on("blur",".commentBox textarea",function(){
		$(this).parent().parent().parent().removeClass("hover");
	});

	//提交评论回复
	$(document).on("click",".commentSubmit",function(){
		var to = $(this).data("toUserID");
		var data = $("#page_information").data(); //user_ID,pdf_url
		var page = data.pdf_page ;
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
		}
		var information = $(this).parent().siblings("footer").data();//noteIndex,replyIndex
		var body = $(this).siblings("textarea").val();
		//console.log(information);
		//console.log($dataElement.data());
		commentToReply(data.user_ID, data.pdf_url, page, information.noteIndex, information.replyIndex, to, body, displayNotesFunc);
		return false;
	});

	//回复modal
	$('#redactor_content_1').redactor({ 	
		imageUpload: '/imageUpload',
		fileUpload: '/fileUpload'
	});
	//位置
	$('#replyModal').on('show.bs.modal', function (e) {
	  	$('#replyModal').find(".modal-dialog").css("margin-top",function(){
	  		return $(window).height()/2;
	  	});
	});

    //回复编辑modal
    $('#redactor_content_2').redactor({
        imageUpload: '/imageUpload',
        fileUpload: '/fileUpload'
    });

    //笔记编辑modal
    $('#redactor_content_3').redactor({
        imageUpload: '/imageUpload',
        fileUpload: '/fileUpload'
    });

	//提交回复
	$(document).on("click","#replyToNoteSubmit",function(){
		$dataElement = $("#page_information");
		var page = $dataElement.data("pdf_page");
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
		}
		var note_index = $("#replyTitle").data().noteIndex;
		var body = $('#redactor_content_1').getCode();
		//console.log(note_index);
		//console.log($dataElement.data("pdf_page"));

		replyToNote($dataElement.data("user_ID"), $dataElement.data("pdf_url"), page, note_index, body, displayNotesFunc);
		return false;
	});

	//笔记的赞
	$(document).on("click",".notePraiseA",function(){
		$dataElement = $("#page_information");
		var page = $dataElement.data("pdf_page");
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
			console.log(page);
		}
		$(this).addClass("activeOperation");
		var noteIndex = $(this).parent().data("noteIndex");

		operateNote($dataElement.data("user_ID"), $dataElement.data("pdf_url"), page, noteIndex, 0, 0, displayNotesFunc);	
		return false;
	});
	//笔记的取消赞
	$(document).on("click",".noNotePraiseA",function(){
		$dataElement = $("#page_information");
		var page = $dataElement.data("pdf_page");
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
		}
		$(this).addClass("activeOperation");
		var noteIndex = $(this).parent().data("noteIndex");

		operateNote($dataElement.data("user_ID"), $dataElement.data("pdf_url"), page, noteIndex, 0, 1, displayNotesFunc);	
		return false;
	});

	//笔记的关注
	$(document).on("click",".noteConcernA",function(){
		$dataElement = $("#page_information");
		var page = $dataElement.data("pdf_page");
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
		}
		$(this).addClass("activeOperation");
		var noteIndex = $(this).parent().data("noteIndex");

		operateNote($dataElement.data("user_ID"), $dataElement.data("pdf_url"), page, noteIndex, 1, 0, displayNotesFunc);	
		return false;
	});
	//笔记的取消关注
	$(document).on("click",".noNoteConcernA",function(){
		$dataElement = $("#page_information");
		var page = $dataElement.data("pdf_page");
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
		}
		$(this).addClass("activeOperation");
		var noteIndex = $(this).parent().data("noteIndex");

		operateNote($dataElement.data("user_ID"), $dataElement.data("pdf_url"), page, noteIndex, 1, 1, displayNotesFunc);	
		return false;
	});

	//笔记的收藏
	$(document).on("click",".noteCollectA",function(){
		$dataElement = $("#page_information");
		var page = $dataElement.data("pdf_page");
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
		}
		$(this).addClass("activeOperation");
		var noteIndex = $(this).parent().data("noteIndex");

		operateNote($dataElement.data("user_ID"), $dataElement.data("pdf_url"), page, noteIndex, 2, 0, displayNotesFunc);	
		return false;
	});
	//笔记的取消收藏
	$(document).on("click",".noNoteCollectA",function(){
		$dataElement = $("#page_information");
		var page = $dataElement.data("pdf_page");
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
		}
		$(this).addClass("activeOperation");
		var noteIndex = $(this).parent().data("noteIndex");

		operateNote($dataElement.data("user_ID"), $dataElement.data("pdf_url"), page, noteIndex, 2, 1, displayNotesFunc);	
		return false;
	});

	//回复的赞
	$(document).on("click",".replyPraise",function(){
		$dataElement = $("#page_information");
		var page = $dataElement.data("pdf_page");
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
		}
		$(this).addClass("activeReplyPraise");
		var noteIndex = $(this).parent().data("noteIndex");
		var replyIndex = $(this).parent().data("replyIndex");

		operateReply($dataElement.data("user_ID"), $dataElement.data("pdf_url"), page, noteIndex, replyIndex, 0, displayNotesFunc);	
		return false;
	});
	//回复的取消赞
	$(document).on("click",".noReplyPraise",function(){
		$dataElement = $("#page_information");
		var page = $dataElement.data("pdf_page");
		if($("#currentPage").length > 0){
			page = $("#currentPage").data("currentPage");
		}
		$(this).addClass("activeReplyPraise");
		var noteIndex = $(this).parent().data("noteIndex");
		var replyIndex = $(this).parent().data("replyIndex");

		operateReply($dataElement.data("user_ID"), $dataElement.data("pdf_url"), page, noteIndex, replyIndex, 1, displayNotesFunc);	
		return false;
	});

    //笔记的编辑
    $(document).on("click",".noteEdit", function () {
        var baseData = $("#page_information").data();//user_ID,pdf_url
        var page = baseData.pdf_page ;
        if($("#currentPage").length > 0){
            page = $("#currentPage").data("currentPage");
        }
        var noteNeedEdit = {};
        noteNeedEdit.URL = baseData.pdf_url;
        noteNeedEdit.pageIndex = page;
        noteNeedEdit.noteIndex = $(this).parent().data("noteIndex");
        noteNeedEdit.title=$("#allWrap h3.article-title span")[1].innerText;
        noteNeedEdit.body=$("#content").html();
        //console.log(noteNeedEdit);
        if($("#allWrap h3.article-title span")[0].innerText == "笔记"){
            noteNeedEdit.type = 0;
            $("#editIsNote").attr("checked","checked");
        }else{
            noteNeedEdit.type = 1;
            $("#editIsQuestion").attr("checked","checked");
        }
        $("#editNoteTitle").val(noteNeedEdit.title);
        $('#redactor_content_3').setCode(noteNeedEdit.body);
        $("#editModal").modal("show").on('shown.bs.modal',function(){
            $("#noteEditSubmit").data({"user_ID":baseData.user_ID, "noteToEdit":noteNeedEdit});
        });
        return false;
    });
    //笔记编辑确认提交
    $("#noteEditSubmit").click(function(){
        $(this).attr("disabled","disabled");
        $(this).text("提交中...");
        var noteToEdit = $(this).data("noteToEdit");
        noteToEdit.body = $('#redactor_content_3').getCode();
        noteToEdit.title = $("#editNoteTitle").val();
        noteToEdit.type=  $('input[name="editNoteType"]:checked').val();
        var smallAbstract = $(noteToEdit.body).text();
        if(smallAbstract.length > 80){
            smallAbstract = smallAbstract.substring(0,80);
            smallAbstract = smallAbstract + "...";
        }
        noteToEdit.abstract = smallAbstract;
        editNote($(this).data("user_ID"),noteToEdit);
//      console.log($(this).data());
    });
    //笔记编辑确认恢复modal
    $("#editModal").on("hidden.bs.modal", function () {
        $(this).find("#noteEditSubmit").removeAttr("disabled").text("确认修改");
    });

    //回复的编辑
    $(document).on("click",".replyEdit", function () {
        var baseData = $("#page_information").data();
        var replyToEdit = $(this).parent().data();
        replyToEdit.URL = baseData.pdf_url;
        replyToEdit.pageIndex = baseData.pdf_page;
        if($("#currentPage").length > 0){
            replyToEdit.pageIndex = $("#currentPage").data("currentPage");
        }
        var whichOneEdit = $(this).parent().parent();
        $('#redactor_content_2').setCode(whichOneEdit.find("div.replyBody").html());
        $("#replyEdit").modal("show").on('shown.bs.modal',function(){
            $("#replyEditSubmit").data({"user_ID":baseData.user_ID, "replyToEdit":replyToEdit, "which":whichOneEdit});
        });

        return false;
    });
    //回复编辑确认提交
    $("#replyEditSubmit").click(function(){
        $(this).attr("disabled","disabled");
        $(this).text("修改中...");
        var replyToEdit = $(this).data("replyToEdit");
        replyToEdit.body = $('#redactor_content_2').getCode();
        replyToEditSubmit($(this).data("user_ID"),replyToEdit,$(this).data("which"));
//      console.log($(this).data());
    });
    //回复编辑确认恢复modal
    $("#replyEdit").on("hidden.bs.modal", function () {
        $(this).find("#replyEditSubmit").removeAttr("disabled").text("确认修改");
    });

    //回复的删除
    $(document).on("click",".replyDelete", function () {
        var baseData = $("#page_information").data();
        var replyToDel = $(this).parent().data();
        replyToDel.URL = baseData.pdf_url;
        replyToDel.pageIndex = baseData.pdf_page;
        if($("#currentPage").length > 0){
            replyToDel.pageIndex = $("#currentPage").data("currentPage");
        }
        var whichOneDelete = $(this).parent().parent().parent();
        $("#replyConfirm").modal("show").on('shown.bs.modal',function(){
            $("#replyDelConfirm").data({"user_ID":baseData.user_ID, "replyToDel":replyToDel, "which":whichOneDelete});
        });

        return false;
    });
    //回复确认删除
    $("#replyDelConfirm").click(function(){
        $(this).attr("disabled","disabled");
        $(this).text("删除中...");
        //console.log($(this).data());
        replyToDelete($(this).data("user_ID"),$(this).data("replyToDel"),$(this).data("which"));
//      console.log($(this).data());
    });
    //回复确认删除恢复modal
    $("#replyConfirm").on("hidden.bs.modal", function () {
        $(this).find("#replyDelConfirm").removeAttr("disabled").text("确认删除");
    });

    //评论的删除
    $(document).on("click",".commentDelete", function () {
        var commentIndex = $(this).parent().parent().parent().find(".oneComment").index($(this).parent().parent());
        var baseData = $("#page_information").data();
        var commentToDel = $(this).parent().parent().siblings("footer").data();
        commentToDel.URL = baseData.pdf_url;
        commentToDel.pageIndex = baseData.pdf_page;
        if($("#currentPage").length > 0){
            commentToDel.pageIndex = $("#currentPage").data("currentPage");
        }
        commentToDel.commentIndex = commentIndex;
        var whichOneDelete = $(this).parent().parent();
        $("#commentConfirm").modal("show").on('shown.bs.modal',function(){
            $("#commentDelConfirm").data({"user_ID":baseData.user_ID, "commentToDel":commentToDel, "which":whichOneDelete});
        });

        return false;
    });
    //评论确认删除
    $("#commentDelConfirm").click(function(){
        $(this).attr("disabled","disabled");
        $(this).text("删除中...");
        commentToDelete($(this).data("user_ID"),$(this).data("commentToDel"),$(this).data("which"));
//      console.log($(this).data());
    });
    //评论确认删除恢复modal
    $("#commentConfirm").on("hidden.bs.modal", function () {
        $(this).find("#commentDelConfirm").removeAttr("disabled").text("确认删除");
    });
});