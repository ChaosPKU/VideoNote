var serverIP = 'http://182.92.224.53:8801';
var user = '';

//提交笔记
function submitNote(userID, URL, VideoName, TotalTime, VideoTime ,slotIndex, note , noteSubmitTime,callback){
    jQuery.ajax({
        url:serverIP + '/submitNote',
        type:'post',
        data:{
            userID: userID,
            URL: URL,
            VideoName: VideoName,
            TotalTime: TotalTime,
            VideoTime: VideoTime,
            slotIndex: slotIndex,
            SubmitTime: noteSubmitTime,
            note: note
        },
        success:function(response){
            $('#redactor_content_2').setCode("<p>写点什么...</p>");
            $('#replyModal_2').modal('hide');
            $("#noteTitle").val('');
            //$('#replyModal_2 form')[0].reset();
            callback(URL,slotIndex,userID);
        },
        error:function(response){
            console.log(response);
            //alert(response.msg);
        }
    });
}

//得到一个时间段的笔记
function getNotesOnASlot(video_URL, video_slot, total_time,callback, userID){
    jQuery.ajax({
        url:serverIP + '/getNotesOnASlot',
        type:'post',
        data:{
            video_url: video_URL,
            video_slot:video_slot,
            total_time:total_time
        },
        success:function(response){
            if(response.status == 'success'){
                //console.log(response.msg);
                callback(response.result);
            }
            else if(response.status == 'new'){
                //console.log(response.msg);
            }
            else{
                //console.log(response.msg);
            }
        },
        error:function(response){
            console.log(response);
            //alert(response.msg);
        }
    });
}
//提交对笔主的回复
function replyToNote(userID, URL, slotIndex, noteIndex, body, callback){
    jQuery.ajax({
        url:serverIP + '/replyToNote',
        type:'post',
        data:{
            userID: userID,
            URL: URL,
            slotIndex: slotIndex,
            noteIndex: noteIndex,
            body: body
        },
        success:function(response){
            console.log(response);
            $('#replyModal_1').modal('hide');
            $('#redactor_content_1').setCode("<p>回复什么...</p>");
            callback(URL,slotIndex,userID);

        },
        error:function(response){
            console.log(response);
        }
    });
}

//在笔记页面编辑笔记
function editNote(userID, editedNote,recall){
    jQuery.ajax({
        url: serverIP + '/editNote',
        type: 'post',
        data: {
            userID: userID,
            note: editedNote
        },
        success:function(response){
            $('#redactor_content_3').setCode("<p>请做出修改~</p>");
            $('#editModal').modal('hide');
            $("#editNoteTitle").val('');
            recall(editedNote.URL,editedNote.slotIndex,userID);
        },
        error:function(response){
            console.log(response);
        }
    });
}

//提交对某个reply或者comment的评论
function commentToReply(userID, URL, slotIndex, noteIndex, replyIndex, to, body,node, callback){
    jQuery.ajax({
        url:serverIP + '/commentToReply',
        type:'post',
        data:{
            userID: userID,
            URL: URL,
            slotIndex: slotIndex,
            noteIndex: noteIndex,
            replyIndex: replyIndex,
            to: to,
            body: body
        },
        success:function(response){
            console.log(response);
            $(node).css({"display":"none"});
            callback(URL,slotIndex,userID);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//编辑某条回复
function replyToEditSubmit(userID, replyInfo, callback){
    jQuery.ajax({
        url:serverIP + '/editReply',
        type:'post',
        data:{
            userID: userID,
            replyToEdit: replyInfo
        },
        success:function(response){
            console.log(response);
            $('#redactor_content_4').setCode("<p>请做出修改~</p>");
            $('#editReplyModal').modal('hide');
            callback(replyInfo.URL,replyInfo.slotIndex,userID);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//删除某条回复
function replyToDelete(userID, replyInfo, callback){
    jQuery.ajax({
        url:serverIP + '/deleteReply',
        type:'post',
        data:{
            userID: userID,
            replyToDel: replyInfo
        },
        success:function(response){
            console.log(response);
            callback(replyInfo.URL,replyInfo.slotIndex,userID);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//删除某条评论
function commentToDelete(userID, commentInfo, callback){
    jQuery.ajax({
        url:serverIP + '/deleteComment',
        type:'post',
        data:{
            userID: userID,
            commentToDel: commentInfo
        },
        success:function(response){
            console.log(response);
            callback(commentInfo.URL,commentInfo.slotIndex,userID);
        },
        error:function(response){
            console.log(response);
        }
    });
}

//对note进行功能性操作
function operateNote(userID, URL, slotIndex, noteIndex, which, upordown, callback){
    //which 有0，1，2 三个选项：0-赞功能，1-关注功能，2-收藏功能
    //upordown 有0，1 两个选项：0-增加， 1-减少
    jQuery.ajax({
        url:serverIP + '/operateNote',
        type:'post',
        data:{
            userID: userID,
            URL: URL,
            slotIndex: slotIndex,
            noteIndex: noteIndex,
            which: which,
            upordown: upordown
        },
        success:function(response){
            console.log(response);
            callback(URL,slotIndex,userID);
        },
        error:function(response){
            console.log(response);
        }
    });
}

//对reply进行功能性操作,只有赞与取消赞
function operateReply(userID, URL, slotIndex, noteIndex, replyIndex, upordown, callback){
    //upordown 有0，1 两个选项：0-增加， 1-减少
    jQuery.ajax({
        url:serverIP + '/praiseOrNotReply',
        type:'post',
        data:{
            userID: userID,
            URL: URL,
            slotIndex: slotIndex,
            noteIndex: noteIndex,
            replyIndex: replyIndex,
            upordown: upordown
        },
        success:function(response){
            console.log(response);
            callback(URL,slotIndex,userID);
        },
        error:function(response){
            console.log(response);
        }
    });
}

//得到用户资料
function getProfiles(target_userID,callback){
    jQuery.ajax({
        url:serverIP + '/getProfiles',
        type:'get',
        data:{
            userID: target_userID
        },
        success:function(response){
            if(response.status == "success"){
                callback(response);
            }
            else{
                console.log(response);
            }
        },
        error:function(response){
            console.log(response);
        }
    })
}
//得到用户消息
function getMessage(userID){
    jQuery.ajax({
        url:serverIP + '/getMessage',
        type:'get',
        data:{
            userID: userID
        },
        success:function(response){
            if(response.status == "success"){
                console.log(response);
                var notesMessages = response.messages.noteMessage.length;
                var concernMessages = response.messages.concernMessage.length;
                if(notesMessages + concernMessages != 0)
                    $(".dropdown-toggle .navbar-unread").html(notesMessages + concernMessages);
                else
                    $(".dropdown-toggle .navbar-unread").html("");
                $($(".dropdown-menu >li >a")[0]).html(notesMessages + concernMessages + "条消息");
                $($(".dropdown-menu >li >a")[1]).html(notesMessages + "条我的笔记消息");
                $($(".dropdown-menu >li >a")[2]).html(concernMessages + "条我的关注消息");
                $($(".dropdown-menu >li >a")[1]).attr({'href':'./individual.html?want=' + localStorage.id});
                $($(".dropdown-menu >li >a")[2]).attr({'href':'./individual.html?want=' + localStorage.id});

            }
            else{
                console.log(response);
            }
        },
        error:function(response){
            console.log(response);
        }
    })
}

//得到用户资料
function getMyBriefProfile(target_userID,callback){
    jQuery.ajax({
        url:serverIP + '/getMyBriefProfile',
        type:'get',
        data:{
            userID: target_userID
        },
        success:function(response){
            if(response.status == "success"){
                callback(response);
            }
            else{
                console.log(response);
            }
        },
        error:function(response){
            console.log(response);
        }
    })
}

//上传个人头像
function uploadHead(formdata){
    jQuery.ajax({
        url: serverIP + '/uploadHead',
        type: 'post',
        data: formdata,
        mimeType:"multipart/form-data",
        contentType: false,
        cache: false,
        processData:false,
        success:function(response){
            $(".headarea").find("img").attr("src",serverIP + response);
            $("#uploadHead").text("上传头像");
            $("#saveHead").text("保存头像");
        },
        error:function(response){
            console.log(response);
        }
    });
}
//上传视频截图
//上传个人头像
function uploadScreenShot(data,time){
    jQuery.ajax({
        url: serverIP + '/uploadScreenShot',
        type: 'post',
        data: {
            imgData:data,
            name:time
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//保存个人头像
function saveHead(userID, head){
    jQuery.ajax({
        url:serverIP +  '/saveHead',
        type: 'post',
        data: {
            userID: userID,
            headURL: head
        },
        success:function(response){
            $("#saveHead").text("保存成功");
            setTimeout("$('#changehead').popover('hide');",500);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//提交个人信息的修改
function updateProfiles(userID, nickname, mobilephone, email){
    jQuery.ajax({
        url: serverIP + '/updateProfiles',
        type: 'post',
        data: {
            userID: userID,
            nickname: nickname,
            mobilephone: mobilephone,
            email: email
        },
        success:function(response){
            alert(response.msg);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//删除笔记
function deleteNote(userID, URL, slotIndex, noteIndex, callback){
    jQuery.ajax({
        url: serverIP + '/deleteNote',
        type: 'post',
        data: {
            userID: userID,
            URL: URL,
            slotIndex: slotIndex,
            noteIndex: noteIndex
        },
        success:function(response){
            callback(URL,slotIndex,userID);
            $('.tab-content')[0].scrollTop = 0;
            $('.tab-content .notesGroup').css('display','block');
            $('.tab-content .replys').css('display','none');
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//在个人主页编辑笔记
function editNotePro(userID, editedNote, editedWhich){
    jQuery.ajax({
        url: serverIP + '/editNote',
        type: 'post',
        data: {
            userID: userID,
            note: editedNote
        },
        success:function(response){
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//取视频的笔记分布信息
function getVideoBasicInfo(URL,recall){
    jQuery.ajax({
        url:serverIP + "/getVideoBasicInfo",
        type:'get',
        data:{
            url:URL
        },
        success:function(response){
            recall(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
//记录点击笔记量
function clickThisNote(userID,URL,slotIndex,noteIndex){
    jQuery.ajax({
        url: serverIP + '/clickThisNote',
        type: 'post',
        data: {
            userID: userID,
            URL: URL,
            slotIndex: slotIndex,
            noteIndex: noteIndex
        },
        success:function(response){
            CurrentResult.notes[noteSeq].clickCnt = response.result.clickCnt;
            console.log(response);
        },
        error:function(response){
            console.log(response);
        }
    });
}
