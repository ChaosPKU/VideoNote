var target = null;
//删除的popover设置
var deletePopSetting = {
    placement: "right",
    html: true,
    container: "#notes",
    trigger: "manual",
    selector: ".deleteNote",
    title: function() {
        return "确定要删除这条笔记？";
    },
    content: function() {
        return '<button class="btn btn-default" id="cancelDel">取消</button>'+
               '<button class="btn btn-success" id="sureDel">确认</button>';
    }
};

window.addEventListener("message", function (e) {
	
	console.log(e);
	if(!localStorage.id || localStorage.id != e.data){
		localStorage.id = e.data;
	}
});
window.addEventListener("load",function (e){
	target = $("#targetID").text();
	getProfiles(target);
});
//为之后创建page需要的显示信息做准备
function displayNULL(str){
	if(!str){
		return "未填写此信息";
	}
	else return str;
}
//输入是一个数组信息，返回一个将数组信息以手风琴方式展示出来的父DOM
function displayNotesArray(array, accordionID){
	//大手风琴为返回
    var canEdit = false ;
    //能且只能删除自己发的notes，所以只有notes大风车里有删除和编辑，且还需判断是不是自己
    if(accordionID == "accordionNotes" && localStorage.id == target)
        canEdit = true;
	$accordion = $('<div class="panel-group" id="'+accordionID+'">');
	for(var i = 0 ; i < array.length ; i++){
		$panel_div = $('<div class="panel panel-default">'+
						  '<div class="panel-heading" data-toggle="collapse" data-parent="#'+accordionID+'" href="#collapse'+i+accordionID+'">'+
		                    '<h4 class="panel-title">'+
		                      '<span class="label label-success">'+array[i].type+'</span>&nbsp;&nbsp;'+
		                      '<a><span class="noteTitle">'+array[i].title + '</span><small class="text-primary noteTime">'+
		                            array[i].time+'</small><small class="noteUser"><span class="glyphicon glyphicon-user"></span> <strong>'+
		                            array[i].from+'</strong></small></a>'+
		                    '</h4>'+
		                  '</div>'+
		                '</div>');
		$panel_collapse=$('<div id="collapse'+i+accordionID+'" class="panel-collapse collapse">'+
					        '<div class="panel-body">'+
					          '<p><span class="noteInfo">课件：</span><span>'+array[i].name+'</span></p>'+
					          '<p><span class="noteInfo">页码：</span><span>'+array[i].pageIndex+'</span></p>'+
					          '<p><span class="noteInfo">摘要：</span><span>'+array[i].abstract+'</span></p>'+
					        '</div>'+
					      '</div>');
        if(canEdit == true){
            $panel_collapse_operate=$('<a href="#" class="editNote"><span class="glyphicon glyphicon-edit"></span> 编辑</a>'+
                '<a href="#" class="deleteNote"><span class="glyphicon glyphicon-trash"></span> 删除</a>'+
                '<a href="'+array[i].URL+"#page="+array[i].pageIndex+"&index="+array[i].noteIndex+
                '" class="enterToNote" target="_blank">点此进入 >>></a>');
            $panel_collapse_operate.popover(deletePopSetting);
            $panel_collapse.find("div").data(array[i]);
        }
        else{
            $panel_collapse_operate=$('<a href="'+array[i].URL+"#page="+array[i].pageIndex+"&index="+array[i].noteIndex+
                '" class="enterToNote" target="_blank">点此进入 >>></a>');
        }
        $panel_collapse.find('div').append($panel_collapse_operate);
        //console.log(array[i]);
		$panel_div.append($panel_collapse);
		$accordion.append($panel_div);
	}
	return $accordion;
}
//展示个人信息
function displayProfile(information){
	/*information的结构
	{	baseInfo:{	userID: ,
				    nickname: ,
				    role: string, 
				    head: , 
				    mobilephone: ,
				    email: } ,
		notes: [{
					URL: ,
            		pageIndex: ,
            		noteIndex: ,
					title: ,
					type: string,
					from: string name,
					time: ,
					abstract: ,
					body:
		}],
		collects:[] ,
		concerns:[]}
	*/
	var baseInfo = information.baseInfo;
	var notes = information.notes;
	var collects =information.collects;
	var concerns = information.concerns;
	//是不是我自己
	var if_mine = (localStorage.id == target)? true: false;
	//左边个人资料里有我还是ta的差别，右边只有修改的时候有差
	var whose = (if_mine == true)? "我":baseInfo.nickname;
	$profile_ul = $("#profile_left ul");
	$info_li = $('<li class="active"><a href="#profile" data-toggle="tab">'+
		'<span class="glyphicon glyphicon-user"></span>&nbsp;&nbsp;'+whose+'的资料</a></li>');
	$notes_li = $('<li><a href="#notes"  data-toggle="tab"><span class="glyphicon glyphicon-pencil"></span>'+
		'<span class="badge pull-right">'+notes.length+'</span>&nbsp;&nbsp;'+whose+'的笔记/问题</a></li>');
	$concerns_li = $('<li><a href="#concerns"  data-toggle="tab"><span class="glyphicon glyphicon-eye-open"></span>'+
		'<span class="badge pull-right">'+concerns.length+'</span>&nbsp;&nbsp;'+whose+'的关注</a></li>');
	$collects_li = $('<li><a href="#collects"  data-toggle="tab"><span class="glyphicon glyphicon-star"></span>'+
		'<span class="badge pull-right">'+collects.length+'</span>&nbsp;&nbsp;'+whose+'的收藏</a></li>'); 
	$profile_ul.append($info_li,$notes_li,$concerns_li,$collects_li);

	//右边
	//个人资料板块
	$profile_div=$("#profile");
	$profile_panel=$('<div class="panel panel-primary"></div>');
	
	$profile_heading=$('<div class="panel-heading"><h3 class="panel-title">'+whose+'的资料</h3></div>');
	$profile_panel.append($profile_heading);

	$profile_body=$('<div class="panel-body"></div>');
	$profile_body_head=$('<div id="headPhoto"><img src="'+baseInfo.head+'" class="img-rounded" id="head_icon"></div>');
	if(if_mine){
		$profile_body_head.append('<footer><a href="#" id="changeHead">换头像</a></footer>');
	}
	$profile_body.append($profile_body_head);

	var nickname=(if_mine==true)?'<input type="text" class="form-control" id="nickname" placeholder="未填写此信息" value="'+baseInfo.nickname+
									'">': '<p class="form-control-static" id="nickname">'+baseInfo.nickname+'</p>';
	var cellphone=(if_mine==true)?'<input type="text" class="form-control" id="cellphone" placeholder="未填写此信息" value="'+baseInfo.mobilephone+
									'">': '<p class="form-control-static" id="cellphone">'+displayNULL(baseInfo.mobilephone)+'</p>';
	var email=(if_mine==true)?'<input type="text" class="form-control" id="email" placeholder="未填写此信息" value="'+baseInfo.email+
									'">': '<p class="form-control-static" id="email">'+displayNULL(baseInfo.email)+'</p>';	
	$profile_body_user = $('<div id="userProfile">'+
			                '<form class="form-horizontal" role="form">'+
			                  '<div class="form-group">'+
			                    '<label class="col-sm-3 control-label">学号/教工号:</label>'+
			                    '<div class="col-sm-7">'+
			                      '<p class="form-control-static" id="user_id">'+baseInfo.userID+'</p>'+
			                    '</div>'+
			                  '</div>'+
			                  '<div class="form-group">'+
			                    '<label for="nickname" class="col-sm-3 control-label">昵称:</label>'+
			                    '<div class="col-sm-7">'+nickname+
			                    '</div>'+
			                  '</div>'+
			                  '<div class="form-group">'+
			                    '<label class="col-sm-3 control-label">身份:</label>'+
			                    '<div class="col-sm-7">'+
			                      '<p class="form-control-static">'+baseInfo.role+'</p>'+
			                    '</div>'+
			                  '</div>'+
			                  '<div class="form-group">'+
			                    '<label for="cellphone" class="col-sm-3 control-label">手机号:</label>'+
			                    '<div class="col-sm-7">'+cellphone+
			                    '</div>'+
			                  '</div>'+
			                  '<div class="form-group">'+
			                    '<label for="email" class="col-sm-3 control-label">E-mail:</label>'+
			                    '<div class="col-sm-7">'+email+
			                    '</div>'+
			                  '</div>'+
			                '</form>'+
			              '</div>');
	if(if_mine){
		$profile_body_user.find("form").append('<div class="form-group">'+
							                    '<div class="col-sm-offset-4 col-sm-8">'+
							                      '<button type="submit" class="btn btn-primary" id="submitFix">提交修改</button>'+
							                    '</div>'+
							                  '</div>');
	}
	$profile_body.append($profile_body_user);
	$profile_panel.append($profile_body);
	$profile_div.append($profile_panel);

	//note部分
	$note_div=$("#notes");
	$note_panel=$('<div class="panel panel-primary">'+
		            '<div class="panel-heading">'+
		              '<h3 class="panel-title">'+whose+'的笔记/问题</h3>'+
		            '</div>'+
		          '<div>');
	$note_pannel_body=$('<div class="panel-body"></div>');
	$note_pannel_body.append(displayNotesArray(notes, "accordionNotes"));
	$note_panel.append($note_pannel_body);
	$note_div.append($note_panel);

	//concern部分
	$concern_div=$("#concerns");
	$concern_panel=$('<div class="panel panel-primary">'+
		            '<div class="panel-heading">'+
		              '<h3 class="panel-title">'+whose+'的关注</h3>'+
		            '</div>'+
		          '<div>');
	$concern_pannel_body=$('<div class="panel-body"></div>');
	$concern_pannel_body.append(displayNotesArray(concerns, "accordionConcerns"));
	$concern_panel.append($concern_pannel_body);
	$concern_div.append($concern_panel);

	//collect部分
	$collect_div=$("#collects");
	$collect_panel=$('<div class="panel panel-primary">'+
		            '<div class="panel-heading">'+
		              '<h3 class="panel-title">'+whose+'的收藏</h3>'+
		            '</div>'+
		          '<div>');
	$collect_pannel_body=$('<div class="panel-body"></div>');
	$collect_pannel_body.append(displayNotesArray(collects, "accordionCollects"));
	$collect_panel.append($collect_pannel_body);
	$collect_div.append($collect_panel);

}
$(document).ready(function(){
    var whichDelete, whichEdit;

	//换头像popover的设置
	var headPopSetting = {
		placement: "bottom",
	    html: true,
        container: "#profile",
        selector: "#changeHead",
	    title: function() {
	      return "头像的最佳尺寸为128*128";
	    },
	    content: function() {
	      return '<form id="headForm" enctype="multipart/form-data" method="post" action="">' +
                  '<input type="file" name="file" id="headUpdate" accept="image/*" />' +
                '</form>' +
                '<button class="btn btn-primary" id="uploadHead" disabled="disabled">上传头像</button>'+
                '<button class="btn btn-success" id="saveHead" disabled="disabled">保存修改</button>';
	    }
	};
	//动态加载后也可以使用此pop
	$('#profile').popover(headPopSetting);

    $('#redactor_content_4').redactor({
        imageUpload: '/imageUpload',
        fileUpload: '/fileUpload'
    });

	//选择文件后才可点击上传
	$(document).on("change","#headUpdate",function(){
		$("#uploadHead").removeAttr("disabled");
	});
	//上传
	$(document).on("click","#uploadHead",function(){
		if($("#headUpdate").val()){
			var form = document.getElementById("headForm");
			var form_data = new FormData(form);
			uploadHead(form_data);
			$(this).text("上传中...").attr("disabled","disabled");
		}
		return false;
	});
	//保存
	$(document).on("click","#saveHead",function(){
		if($("#headUpdate").val()){
			var userID = Number($("#user_id").text());
			var head = $("#headPhoto").find("img").attr("src");
			saveHead(userID, head);
			$(this).text("保存中...").attr("disabled","disabled");
		}
		return false;
	});

	//提交对自己信息的修改
	$(document).on("click","#submitFix",function(){
		$(this).text("提交中...").attr("disabled","disabled");
		updateProfiles($("#user_id").text(),$("#nickname").val(),$("#cellphone").val(),$("#email").val());	
		return false;
	});

    //大风车变换关闭popover
    $(document).on("hide.bs.collapse","#accordionNotes",function(){
        $(".deleteNote").each(function () {
            $(this).popover('hide');
        });
//        console.log($(this));
    });
    //点击删除，弹出popover
    $(document).on("click",".deleteNote",function(){
        whichDelete = $(this).parent().data();
        whichDelete.deletedID = $(this).parent().parent().attr("id");
        $(this).popover('show');
        console.log(whichDelete);
        console.log();
        return false;
    });
    //取消删除
    $(document).on("click","#cancelDel",function(){
        $(".deleteNote").each(function () {
            $(this).popover('hide');
        });
        return false;
    });
    //确认删除
    $(document).on("click","#sureDel",function(){
        deleteNote(localStorage.id, whichDelete.URL, whichDelete.pageIndex, whichDelete.noteIndex, whichDelete.deletedID);
        $(this).text("删除中...");
        $(this).attr("disabled","disabled");
        return false;
    });

    //编辑
    $(document).on("click",".editNote",function(){
        whichEdit = $(this).parent().data();
        whichEdit.editedID = $(this).parent().parent().attr("id");

        var $editForm = $("#editModal form");
        $editForm.find("#editPdfName").text(whichEdit.name);
        $editForm.find("#editPdfPage").text(whichEdit.pageIndex);
        $editForm.find("#editNoteTitle").val(whichEdit.title);
        $("#redactor_content_4").setCode(whichEdit.body);
        if(whichEdit.type == "笔记"){
            $editForm.find("#editIsNote").attr("checked","checked");
        }else{
            $editForm.find("#editIsQuestion").attr("checked","checked");
        }

        $("#editModal").modal();
        console.log(whichEdit);
        return false;
    });

    $("#saveEdit").click(function () {
        var editedNote = {};
        editedNote.URL = whichEdit.URL;
        editedNote.pageIndex = whichEdit.pageIndex;
        editedNote.noteIndex = whichEdit.noteIndex;
        editedNote.title = $("#editNoteTitle").val();
        editedNote.type = $('input[name="editNoteType"]:checked').val();
        editedNote.body = $("#redactor_content_4").getCode();
        var smallAbstract = $(editedNote.body).text();
        if(smallAbstract.length > 80){
            smallAbstract = smallAbstract.substring(0,80);
            smallAbstract = smallAbstract + "...";
        }
        editedNote.abstract = smallAbstract;

        editNotePro(localStorage.id, editedNote, whichEdit.editedID);
        $(this).text("修改中...");
        $(this).attr("disabled","disabled")
        return false;
    });

});