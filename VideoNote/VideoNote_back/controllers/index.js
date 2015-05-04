//载入数据model
var models = require('../models');
var userModel = models.UserModel;
var videoModel = models.VideoModel;
//加载模块
var hash = require('../hash.js').hash;
var fs = require('fs');
var url = require('url');
var multiparty = require('multiparty');
var async = require('async');

//查找某个string在不在某个string数组里
function inArray(name, array){
    for(var i = 0 ; i < array.length ; i++){
        if(name.toString() == array[i].toString()){
            return i;
        }
    }
    return -1;
}

//返回特定object在相同结构object数组里的index；若没有，返回-1
function objectIndexInArray(name, array){
    for(var i = 0 ; i < array.length ; i++){
        var flag = true ;
        for(var key in name){
            //console.log(key);
            if(name[key] != array[i][key] ){
                flag = false;
                break;
            }
        }
        if(flag == true)
            return i ;
    }
    return -1;
}
//时间里的数字不够2位用0补齐
function timePadZero(number){
    return (number.toString().length > 1) ? number.toString() : "0"+number ;
}
//自定义的Date转string
function easyTime(date){
    return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+timePadZero(date.getHours())+':'+ timePadZero(date.getMinutes());
}
//async的eachSeries，为数组中的信息进行异步有序查询并将查询后得到的新数组返回而打造的吊炸天的函数
function arrayQuerySave(queryArray, welldone){
    var saveArray = [];
    async.eachSeries(queryArray, function (item,callback){
        videoModel.findOne({URL: decodeURI(item.VideoUrl)}, function (err, video){
            if(err){
                res.send({
                    status: 'error',
                    msg: 'video find error'
                });
            }
            else{
                var allSlots = video.slots;
                var targetSlotIndex = -1 ;
                for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                    if(item.slotIndex == allSlots[targetSlotIndex].slotIndex){
                        break;
                    }
                }

                var notesASlot = allSlots[targetSlotIndex].notes ;
                var targetNoteIndex = -1 ;
                for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                    if(item.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                        break;
                    }
                }
                var targetNote = notesASlot[targetNoteIndex] ;

                userModel.findOne({userID: targetNote.fromUserID},function (err,targetUser){
                    saveArray.push({
                        URL: item.VideoUrl,
                        name: video.videoName,
                        slotIndex: item.slotIndex,
                        noteIndex: item.noteIndex,
                        title: targetNote.title,
                        from: targetUser.nickname,
                        time: targetNote.time,
                        _time: targetNote._time,
                        videoTime :targetNote.videoTime,
                        relatedRangeContent: targetNote.relatedRangeContent,
                        abstract: targetNote.abstract,
                        body: targetNote.body,
                        clickCnt:targetNote.clickCnt
                    });
                    callback();
                });
            }
        });
    }, function (err){
        console.log(err);
        welldone(null,saveArray);
    });
}
function createMessage(slotIndex,noteIndex,url,note,res){
    //console.log(note);
    userModel.findOne({userID:note.fromUserID},function(err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error!'
            });
            return;
        }
        if (user) {
            //console.log(user);
            var noteStruct = {
                VideoUrl: decodeURI(url),
                slotIndex: Number(slotIndex),
                noteIndex: Number(noteIndex)
            };
            if (objectIndexInArray(noteStruct, user.myMessages.myNotesMessage) < 0)
                user.myMessages.myNotesMessage.push(noteStruct);
            //console.log(note.concerns);
            for (var i = 0; i < note.concerns.length; i++) {
                userModel.findOne({userID: note.concerns[i]}, function (err, usr) {
                    if (err) {
                        res.send({
                            status: 'error',
                            msg: 'user find error!'
                        });
                        return;
                    }
                    if (!usr) {
                        res.send({
                            status: 'error',
                            msg: 'no user found.'
                        });
                    }
                    else {
                        if (objectIndexInArray(noteStruct, usr.myMessages.myConcernsMessage) < 0)
                            usr.myMessages.myConcernsMessage.push(noteStruct);
                        usr.save(function (err) {
                            if (err) {
                                res.send({
                                    status: 'error',
                                    msg: 'user save error!'
                                });
                                return;
                            }
                            else {
                                //console.log("createMessage success");
                            }
                        });
                    }
                })
            }
            user.save(function (err) {
                if (err) {
                    res.send({
                        status: 'error',
                        msg: 'user save error!'
                    });
                    return;
                }
                else {
                    //console.log("createMessage success");
                }
            });
        } else {
            res.send({
                status: 'error',
                msg: 'no user found.'
            });
        }
    })
}
//用户注册
exports.register = function(req,res){
    //console.log(req.body);
    var newUser = req.body;
    userModel.findOne({userID : newUser.userID}, function (err, user){
        if(user){
            res.send({
                status:'error',
                msg:'ID already exists.'
            });
            return;
        }
        hash(newUser.password, function (err, salt, hash){
            if(err){
                res.send({
                    status:'error',
                    msg:'hash error!'
                });
                return;
            }
            var userToSave = new userModel({
                userID: newUser.userID,
                salt: salt,
                hash: hash,
                nickname: newUser.nickname,
                mobilephone: newUser.mobilephone,
                email: newUser.email,
                myNotes: [],
                myConcerns: [],
                myCollects: [],
                myMessages:{
                    myNotesMessage:[],
                    myConcernsMessage:[]
                }
            });
            userToSave.save(function (err){
                if(err){
                    res.send({
                        status: 'error',
                        msg: 'user save error!'
                    });
                    return;
                }
                else{
                    res.send({
                        status: 'success',
                        msg: 'user register ok.',
                        result: userToSave
                    });
                }
            });
        });
    });
}
//用户登录
exports.login = function(req,res){
    var userToLogin = req.body;
    userModel.findOne({userID: userToLogin.userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error!'
            });
            return;
        }
        if(!user){
            res.send({
                status: 'error',
                msg: 'no user found.'
            });
        }
        else{
            hash(userToLogin.password, user.salt, function (err, hash){
                if(err){
                    res.send({
                        status: 'error',
                        msg: 'user hash error!'
                    });
                    return;
                }
                if(hash == user.hash){
                    res.send({
                        status: 'success',
                        msg: 'user login ok.',
                        result: user
                    });
                }
                else{
                    res.send({
                        status: 'error',
                        msg: 'wrong password.'
                    });
                }
            })
        }
    })
}
//上传图片
exports.imageUpload = function(req,res){
    var form = new multiparty.Form({
        autoFiles:true ,
        uploadDir: './uploads/tmp'
    });
    var fileName = new Date().getTime() + '_';
    //用时间命名，防止文件冲突
    form.on('part', function(part){
        if(!part.filename) return;
        fileName += part.filename;
    });
    form.on('file', function(name, file){
        //console.log('fileName:'+ fileName);
        var tmp_path = file.path;
        var images_path = '/usersUploads/images/';
        var target_path = './public'+ images_path + fileName;
        fs.renameSync(tmp_path, target_path, function(err) {
            if(err) console.error(err.stack);
        });
        res.send('<a href="'+ images_path + fileName +'" target="_blank"><img style="max-width:300px" src="http://127.0.0.1:8880'+ images_path + fileName +'" alt="'+ fileName +'"/></a>');
    });
    form.parse(req);
}
//上传文件
exports.fileUpload = function(req,res){
    var form = new multiparty.Form({
        autoFiles:true ,
        uploadDir: './uploads/tmp'
    });
    var fileName = new Date().getTime() + '_';
    //用时间命名，防止文件冲突
    var originalName = '';
    //显示出来的时候以原文件名显示
    form.on('part', function(part){
        if(!part.filename) return;
        originalName += part.filename;
        fileName += part.filename;
    });
    form.on('file', function(name, file){
        //console.log('fileName:'+ fileName);
        var tmp_path = file.path;
        var files_path = '/usersUploads/files/';
        var target_path = './public'+ files_path + fileName;
        fs.renameSync(tmp_path, target_path, function(err) {
            if(err) console.error(err.stack);
        });
        res.send('<a style="max-width:300px" href="http://127.0.0.1:8880'+ files_path + fileName +'" target="_blank">'+ originalName +'</a>');
    });
    form.parse(req);
}
//提交笔记
exports.submitNote = function(req,res){
    var NOTE = {};
    NOTE.userID = req.body.userID;
    if(!NOTE.userID){
        res.send({
            status:'error',
            msg:'no user log in.'
        });
        return;
    }
    //用decode存URL
    NOTE.URL = decodeURI(req.body.URL);
    if(!NOTE.URL){
        res.send({
            status:'error',
            msg:'url error! please reopen video page.'
        });
        return;
    }
    NOTE.VideoName = req.body.VideoName;
    if(!NOTE.VideoName){
        res.send({
            status:'error',
            msg:'name error! please reopen video page.'
        });
        return;
    }
    NOTE.VideoTime = req.body.VideoTime;
    if(!NOTE.VideoTime || NOTE.VideoTime<0){
        res.send({
            status:'error',
            msg:'note time error! please check and submit the note again.'
        });
        return;
    }
    NOTE.slotIndex = req.body.slotIndex;
    if(!NOTE.slotIndex || NOTE.slotIndex<0){
        res.send({
            status:'error',
            msg:'slot index error! please check and submit the note again.'
        });
        return;
    }
    NOTE.TotalTime = req.body.TotalTime;
    if(!NOTE.TotalTime || NOTE.TotalTime<0){
        res.send({
            status:'error',
            msg:'video note total time error! please check and submit the note again.'
        });
        return;
    }
    NOTE.SubmitTime = req.body.SubmitTime;
    if(!NOTE.SubmitTime || NOTE.SubmitTime<0){
        res.send({
            status:'error',
            msg:'video note submit time error! please check and submit the note again.'
        });
        return;
    }
    NOTE.note = req.body.note;
    if(!NOTE.note){
        res.send({
            status:'error',
            msg:'note error! please check and submit the note again.'
        });
        return;
    }
    userModel.findOne({userID: NOTE.userID},function (err,user) {
        if (err) {
            res.send({
                status: 'error',
                msg: 'user find error!'
            });
        }
        else {
            if (!user) {
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
            }
            else {
                videoModel.findOne({URL: NOTE.URL}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        if(!video){
                            video = new videoModel({
                                URL: NOTE.URL,
                                VideoName: NOTE.VideoName,
                                TotalTime: NOTE.TotalTime,
                                slots: []
                            });
                        }
                        var allSlots = video.slots ;	//所有已存slots
                        var indexToSave = -1;		//现在要存到哪个slot下。如果没有，新建；如果有，找到存进去
                        for(var i = 0 ; i < allSlots.length ; i++){
                            if(allSlots[i].slotIndex == NOTE.slotIndex){
                                indexToSave = i ;
                                break;
                            }
                        }
                        if(indexToSave < 0){
                            indexToSave = allSlots.push({
                                slotIndex: NOTE.slotIndex,
                                notes: [],
                                relatedUsers: [NOTE.userID]
                            }) - 1;
                        }
                        //添加user到当前video slot关联的users中
                        //console.log(NOTE.userID,allSlots[indexToSave].relatedUsers);
                        if(inArray(NOTE.userID, allSlots[indexToSave].relatedUsers) < 0){
                            allSlots[indexToSave].relatedUsers.push(NOTE.userID);
                        }

                        //note放置策略：后置
                        var note_index = -1 ;
                        var slotNotes = allSlots[indexToSave].notes;
                        for(var i = 0 ; i < slotNotes.length ; i++){
                            if(slotNotes[i].noteIndex > note_index){
                                note_index = slotNotes[i].noteIndex;
                            }
                        }
                        note_index ++;

                        var now = new Date(parseInt(NOTE.SubmitTime));
                        allSlots[indexToSave].notes.push({
                            noteIndex: note_index,
                            title: NOTE.note.title,
                            fromUserID: NOTE.userID,
                            videoTime: NOTE.VideoTime,
                            time: easyTime(now),
                            _time: Number(now.getTime()),
                            screenshot: '/usersUploads/screenshot/'+ now.getTime() + "_.jpeg",
                            //relatedRange: NOTE.note.relatedRange,   //相关区域
                            //relatedRangeContent: NOTE.note.relatedRangeContent,
                            abstract: NOTE.note.abstract,
                            body: NOTE.note.body,
                            clickCnt:0,
                            //clickCnt: 0,
                            praises: [],
                            concerns: [],
                            collects: [],
                            replys:[]
                        });
                        //console.log(video);
                        video.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'video save error!'
                                });
                            }
                            else{
                                //维护我的笔记数组
                                user.myNotes.push({
                                    VideoUrl: NOTE.URL,
                                    slotIndex: NOTE.slotIndex,
                                    noteIndex: note_index
                                });
                                user.save(function (err){
                                    if(err){
                                        console.log(err);
                                        res.send({
                                            status: 'error',
                                            msg: 'note save error!'
                                        });
                                    }
                                    else{
                                        res.send({
                                            status: 'success',
                                            msg: 'Note save successfully!'
                                        });
                                    }
                                });

                            }
                        })
                    }
                })
            }
        }
    })
}
//回复笔记
exports.replyToNote = function(req,res){
    var reply = {};
    reply.userID = req.body.userID;
    if(!reply.userID){
        res.send({
            status:'error',
            msg:'no user log in.'
        });
        return;
    }
    reply.URL = decodeURI(req.body.URL);
    if(!reply.URL){
        res.send({
            status:'error',
            msg:'url error! please reopen video page.'
        });
        return;
    }
    reply.slotIndex = req.body.slotIndex;
    if(!reply.slotIndex || reply.slotIndex<0){
        res.send({
            status:'error',
            msg:'slot error! please reopen video page.'
        });
        return;
    }
    reply.noteIndex = req.body.noteIndex;
    if(!reply.noteIndex || reply.noteIndex<0){
        res.send({
            status:'error',
            msg:'note index error! please submit note again.'
        });
        return;
    }
    reply.body = req.body.body;
    userModel.findOne({userID: reply.userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found'
                });
            }
            else{
                videoModel.findOne({URL: reply.URL}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        var allSlots = video.slots;
                        var targetSlotIndex = -1 ;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(reply.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }
                        //存相关用户
                        if(inArray(reply.userID, allSlots[targetSlotIndex].relatedUsers) < 0){
                            allSlots[targetSlotIndex].relatedUsers.push(reply.userID);
                        }

                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        var targetNoteIndex = -1 ;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(reply.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }
                        var targetNote = notesASlot[targetNoteIndex] ;

                        //note的放置策略：后置
                        var reply_index = -1 ;
                        var noteReplys = targetNote.replys;
                        for(var i = 0 ; i < noteReplys.length ; i++){
                            if(noteReplys[i].replyIndex > reply_index){
                                reply_index = noteReplys[i].replyIndex;
                            }
                        }
                        reply_index ++;

                        var now = new Date();
                        targetNote.replys.push({
                            replyIndex: reply_index,
                            fromUserID: reply.userID,
                            time: easyTime(now),
                            _time: Number(now.getTime()),
                            body: reply.body.body,
                            abstract: reply.body.abstract,
                            praises: [],
                            comments: []
                        });
                        video.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'video save error'
                                });
                            }
                            else{
                                createMessage(reply.slotIndex,reply.noteIndex,reply.URL,targetNote,res);
                                res.send({
                                    status: 'success',
                                    msg: 'reply successfully',
                                    result: targetNote
                                });
                            }
                        })
                    }
                })
            }
        }
    })
}
//评论回复
exports.commentToReply = function(req,res){
    var comment = req.body;
    if(!comment.userID){
        res.send({
            status:'error',
            msg:'no user log in.'
        });
        return;
    }
    if(!comment.URL){
        res.send({
            status:'error',
            msg:'url error! please reopen video page.'
        });
        return;
    }
    if(!comment.slotIndex || comment.slotIndex<0){
        res.send({
            status:'error',
            msg:'slot error! please reopen video page.'
        });
        return;
    }
    if(!comment.noteIndex || comment.noteIndex<0){
        res.send({
            status:'error',
            msg:'note index error! please submit note again.'
        });
        return;
    }
    if(!comment.replyIndex || comment.replyIndex<0){
        res.send({
            status:'error',
            msg:'reply index error! please submit reply error.'
        });
        return;
    }

    userModel.findOne({userID: comment.userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error.'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
            }
            else{
                videoModel.findOne({URL: decodeURI(comment.URL)}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error.'
                        });
                    }
                    else{
                        var allSlots = video.slots;

                        var targetSlotIndex = -1 ;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(comment.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }
                        //存相关用户
                        if(inArray(comment.userID, allSlots[targetSlotIndex].relatedUsers) < 0){
                            allSlots[targetSlotIndex].relatedUsers.push(comment.userID);
                        }

                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        var targetNoteIndex = -1 ;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(comment.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }

                        var replysANote = notesASlot[targetNoteIndex].replys ;
                        var targetReplyIndex = -1 ;
                        //console.log(replysANote);
                        for(targetReplyIndex = 0 ; targetReplyIndex < replysANote.length ; targetReplyIndex++){
                            if(comment.replyIndex == replysANote[targetReplyIndex].replyIndex){
                                break;
                            }
                        }
                        var targetReply = replysANote[targetReplyIndex];
                        var now = new Date();
                        var newComment = {
                            fromUserID: comment.userID,
                            toUserID: comment.to,
                            time: easyTime(now),
                            _time: Number(now.getTime()),
                            body: comment.body
                        };
                        targetReply.comments.push(newComment);
                        video.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'video save error.'
                                });
                            }
                            else{
                                createMessage(comment.slotIndex,comment.noteIndex,comment.URL,notesASlot[targetNoteIndex],res);
                                res.send({
                                    status: 'success',
                                    msg: 'comment successfully.',
                                    result: newComment
                                });
                            }
                        })
                    }
                })
            }
        }
    })
}
//操作笔记
exports.operateNote = function(req,res){
    //console.log(req.body);
    var operation = req.body;
    if(!operation.userID){
        res.send({
            status:'error',
            msg:'no user log in.'
        });
        return;
    }
    if(!operation.URL){
        res.send({
            status:'error',
            msg:'url error! please reopen video page.'
        });
        return;
    }
    if(!operation.slotIndex || operation.slotIndex<0){
        res.send({
            status:'error',
            msg:'slot index error!  please reopen note page.'
        });
        return;
    }
    if(!operation.noteIndex || operation.noteIndex<0){
        res.send({
            status:'error',
            msg:'note index error!  please submit note again.'
        });
        return;
    }

    userModel.findOne({userID: operation.userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
            }
            else{
                videoModel.findOne({URL: decodeURI(operation.URL)}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        var allSlots = video.slots;
                        var targetSlotIndex = -1 ;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(operation.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }
                        //存相关用户
                        if(inArray(operation.userID, allSlots[targetSlotIndex].relatedUsers) < 0){
                            allSlots[targetSlotIndex].relatedUsers.push(operation.userID);
                        }

                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        //console.log(notesASlot);
                        var targetNoteIndex = -1 ;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(operation.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }
                        var targetNote = notesASlot[targetNoteIndex] ;
                        //console.log(targetNote);
                        var targetOperation = null ;//什么操作
                        var targetUserArray = null;//用户里的记录
                        if(operation.which == 0){
                            targetOperation = targetNote.praises ;
                        }
                        else if(operation.which == 1){
                            targetOperation = targetNote.concerns ;
                            targetUserArray = user.myConcerns ;
                        }
                        else{
                            targetOperation = targetNote.collects ;
                            targetUserArray = user.myCollects ;
                        }
                        var index = inArray(operation.userID,targetOperation) ;//video里的记录
                        if(operation.upordown == 0 || index == -1){//加
                            if(index < 0){
                                targetOperation.push(operation.userID);
                            }
                        }
                        else{//减
                            if(index >= 0){
                                targetOperation.splice(index,1);
                            }
                        }

                        if(targetUserArray){//如果这个array不是null，记user里的记录
                            var noteStruct = {	VideoUrl: operation.URL,
                                slotIndex: Number(operation.slotIndex),
                                noteIndex: Number(operation.noteIndex)
                            };
                            var userArrayIndex = objectIndexInArray(noteStruct,targetUserArray) ;
                            //console.log(userArrayIndex);
                            if(operation.upordown == 0 || userArrayIndex < 0){//加
                                    targetUserArray.push(noteStruct);
                            }
                            else{//减
                                if(userArrayIndex >= 0){
                                    targetUserArray.splice(userArrayIndex,1);
                                }
                            }
                        }

                        video.save(function (err){
                            if(err){
                                //console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'video save error'
                                });
                            }
                            else{
                                user.save(function (err){
                                    if(err){
                                        //console.log(err);
                                        res.send({
                                            status: 'error',
                                            msg: '操作用户存储error'
                                        });
                                    }
                                    else{
                                        createMessage(operation.slotIndex,operation.noteIndex,operation.URL,targetNote,res);
                                        res.send({
                                            status: 'success',
                                            msg: '操作成功',
                                            result: targetOperation,
                                            which:operation.which
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    })
}
//操作回复
exports.praiseOrNotReply = function(req,res){
    var operation = req.body;
    if(!operation.userID){
        res.send({
            status:'error',
            msg:'no user log in.'
        });
        return;
    }
    if(!operation.URL){
        res.send({
            status:'error',
            msg:'url error! please reopen video page.'
        });
        return;
    }
    if(!operation.slotIndex || operation.slotIndex<0){
        res.send({
            status:'error',
            msg:'slot index error!  please reopen note page.'
        });
        return;
    }
    if(!operation.noteIndex || operation.noteIndex<0){
        res.send({
            status:'error',
            msg:'note index error!  please submit note again.'
        });
        return;
    }
    if(!operation.replyIndex || operation.replyIndex<0){
        res.send({
            status:'error',
            msg:'reply index error!  please submit note again.'
        });
        return;
    }

    userModel.findOne({userID: operation.userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
            }
            else{
                videoModel.findOne({URL: decodeURI(operation.URL)}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        //console.log(video);
                        var allSlots = video.slots;
                        //console.log(allSlots.length);
                        var targetSlotIndex = -1 ;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(operation.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }
                        //存相关用户
                        if(inArray(operation.userID, allSlots[targetSlotIndex].relatedUsers) < 0){
                            allSlots[targetSlotIndex].relatedUsers.push(operation.userID);
                        }

                        //console.log(targetSlotIndex);
                        //console.log(allSlots[targetSlotIndex]);

                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        var targetNoteIndex = -1 ;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(operation.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }

                        var replysANote = notesASlot[targetNoteIndex].replys ;
                        var targetReplyIndex = -1 ;
                        for(targetReplyIndex = 0 ; targetReplyIndex < replysANote.length ; targetReplyIndex++){
                            if(operation.replyIndex == replysANote[targetReplyIndex].replyIndex){
                                break;
                            }
                        }
                        var targetReply = replysANote[targetReplyIndex];
                        var targetOperation = targetReply.praises ;

                        var index = inArray(operation.userID,targetOperation) ;
                        if(operation.upordown == 0 || index == -1){//加
                            if(index < 0){
                                targetOperation.push(operation.userID);
                            }
                        }
                        else{//减
                            if(index >= 0){
                                targetOperation.splice(index,1);
                            }
                        }
                        //console.log(video);
                        video.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'video save error'
                                });
                            }
                            else{
                                createMessage(operation.slotIndex,operation.noteIndex,operation.URL,notesASlot[targetNoteIndex],res);
                                res.send({
                                    status: 'success',
                                    msg: '回复赞相关操作成功',
                                    result: targetOperation
                                });
                            }
                        })
                    }
                })
            }
        }
    })
}
//编辑回复
exports.editReply = function(req,res){
    var reply = req.body.replyToEdit;
    if(!req.body.userID){
        res.send({
            status:'error',
            msg:'no user log in.'
        });
        return;
    }
    //console.log(NOTE.URL);
    if(!reply.URL){
        res.send({
            status:'error',
            msg:'url error! please reopen video page.'
        });
        return;
    }
    if(!reply.slotIndex || reply.slotIndex<0){
        res.send({
            status:'error',
            msg:'slot index error!  please reopen note page.'
        });
        return;
    }
    if(!reply.noteIndex || reply.noteIndex<0){
        res.send({
            status:'error',
            msg:'note index error!  please submit note again.'
        });
        return;
    }
    if(!reply.replyIndex || reply.replyIndex<0){
        res.send({
            status:'error',
            msg:'reply index error!  please submit note again.'
        });
        return;
    }

    userModel.findOne({userID: req.body.userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
            }
            else{
                videoModel.findOne({URL: decodeURI(reply.URL)}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        var allSlots = video.slots;
                        //console.log(allSlots.length);

                        var targetSlotIndex;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(reply.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }

                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(reply.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }

                        var replysANote = notesASlot[targetNoteIndex].replys ;
                        var targetReplyIndex;
                        for(targetReplyIndex = 0 ; targetReplyIndex < replysANote.length ; targetReplyIndex++){
                            if(reply.replyIndex == replysANote[targetReplyIndex].replyIndex){
                                break;
                            }
                        }
                        replysANote[targetReplyIndex].body = reply.body;
                        video.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'video save error'
                                });
                            }
                            else{
                                res.send({
                                    status: 'success',
                                    msg: 'edit successfully.',
                                    result: reply.body
                                });
                            }
                        })
                    }
                })
            }
        }
    })
}
//删除回复
exports.deleteReply = function(req,res){
    var reply = req.body.replyToDel;
    if(!req.body.userID){
        res.send({
            status:'error',
            msg:'no user log in.'
        });
        return;
    }
    //console.log(NOTE.URL);
    if(!reply.URL){
        res.send({
            status:'error',
            msg:'url error! please reopen video page.'
        });
        return;
    }
    if(!reply.slotIndex || reply.slotIndex<0){
        res.send({
            status:'error',
            msg:'slot index error!  please reopen note page.'
        });
        return;
    }
    if(!reply.noteIndex || reply.noteIndex<0){
        res.send({
            status:'error',
            msg:'note index error!  please submit note again.'
        });
        return;
    }
    if(!reply.replyIndex || reply.replyIndex<0){
        res.send({
            status:'error',
            msg:'reply index error!  please submit note again.'
        });
        return;
    }

    userModel.findOne({userID: req.body.userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
            }
            else{
                videoModel.findOne({URL: decodeURI(reply.URL)}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        var allSlots = video.slots;
                        //console.log(allSlots.length);

                        var targetSlotIndex;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(reply.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }

                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(reply.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }

                        var replysANote = notesASlot[targetNoteIndex].replys ;
                        var targetReplyIndex;
                        for(targetReplyIndex = 0 ; targetReplyIndex < replysANote.length ; targetReplyIndex++){
                            if(reply.replyIndex == replysANote[targetReplyIndex].replyIndex){
                                break;
                            }
                        }
                        replysANote.splice(targetReplyIndex,1);
                        video.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'video save error'
                                });
                            }
                            else{
                                res.send({
                                    status: 'success',
                                    msg: '删除成功'
                                });
                            }
                        })
                    }
                })
            }
        }
    })
}
//删除评论
exports.deleteComment = function(req,res){
    var comment = req.body.commentToDel;
    //console.log(comment);
    if(!req.body.userID){
        res.send({
            status:'error',
            msg:'no user log in.'
        });
        return;
    }
    //console.log(NOTE.URL);
    if(!comment.URL){
        res.send({
            status:'error',
            msg:'url error! please reopen video page.'
        });
        return;
    }
    if(!comment.slotIndex || comment.slotIndex<0){
        res.send({
            status:'error',
            msg:'slot index error!  please reopen note page.'
        });
        return;
    }
    if(!comment.noteIndex || comment.noteIndex<0){
        res.send({
            status:'error',
            msg:'note index error!  please submit note again.'
        });
        return;
    }
    if(!comment.replyIndex || comment.replyIndex<0){
        res.send({
            status:'error',
            msg:'reply index error!  please submit note again.'
        });
        return;
    }

    userModel.findOne({userID: req.body.userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
            }
            else{
                videoModel.findOne({URL: decodeURI(comment.URL)}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        var allSlots = video.slots;
                        //console.log(allSlots.length);

                        var targetSlotIndex;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(comment.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }

                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(comment.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }

                        var replysANote = notesASlot[targetNoteIndex].replys ;
                        var targetReplyIndex;
                        for(targetReplyIndex = 0 ; targetReplyIndex < replysANote.length ; targetReplyIndex++){
                            if(comment.replyIndex == replysANote[targetReplyIndex].replyIndex){
                                break;
                            }
                        }

                        var targetReply = replysANote[targetReplyIndex];
                        targetReply.comments.splice(comment.commentIndex,1);
                        video.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'video save error'
                                });
                            }
                            else{
                                res.send({
                                    status: 'success',
                                    msg: '删除成功'
                                });
                            }
                        })
                    }
                })
            }
        }
    })
}
//上传头像
exports.uploadHead = function(req,res){
    //console.log(req.files);
    var form = new multiparty.Form({	autoFiles:true ,
        uploadDir: './uploads/tmp'
    });
    var fileName = new Date().getTime() + '_';
    //为了文件名不冲突，用时间做标志
    form.on('part', function(part){
        if(!part.filename) return;
        fileName += part.filename;
    });
    form.on('file', function(name, file){
        var tmp_path = file.path;
        var heads_path = '/usersUploads/heads/';
        var target_path = './public'+ heads_path + fileName;
        fs.renameSync(tmp_path, target_path, function(err) {
            if(err) console.error(err.stack);
        });
        res.send(heads_path + fileName);
    });
    form.parse(req);
}
//保存头像
exports.saveHead = function(req,res){
    var userID = req.body.userID;
    if(!userID){
        res.send({
            status:'error',
            msg:'没有用户信息'
        });
        return;
    }
    var headURL = req.body.headURL;

    userModel.findOne({userID: userID}, function (err,user){
        if(err){
            console.log(err);
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: '没找到该用户'
                });
            }
            user.head = headURL;
            user.save(function (err){
                if(err){
                    console.log(err);
                    res.send({
                        status: 'error',
                        msg: 'user save error'
                    });
                }
                else{
                    res.send({
                        status: 'success',
                        msg: '修改成功！'
                    });
                }
            });
        }
    });
}
//上传视频截图
exports.uploadScreenShot = function(req,res){
    var imgData = req.body.imgData;
    var regex = /^data:.+\/(.+);base64,(.*)$/;
    var matches = imgData.match(regex);
    var ext = matches[1];
    var data = matches[2];
    var buffer = new Buffer(data, 'base64');
    var fileName = req.body.name + '_.' + ext;
    var pathName = './public/usersUploads/screenshot/' + fileName;
    fs.writeFileSync(pathName, buffer);
    res.send({'path':pathName});
}
//修改个人信息
exports.updateProfiles = function(req,res){
    var fixedUser=req.body;
    if(!fixedUser.userID){
        res.send({
            status:'error',
            msg:'没有用户信息'
        });
        return;
    }
    userModel.findOne({userID: fixedUser.userID},function (err,user){
        if(err){
            console.log(err);
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: '没找到该用户'
                });
            }
            user.nickname = fixedUser.nickname;
            user.mobilephone = fixedUser.mobilephone;
            user.email = fixedUser.email;
            user.save(function (err){
                if(err){
                    console.log(err);
                    res.send({
                        status: 'error',
                        msg: 'user save error'
                    });
                }
                else{
                    res.send({
                        status: 'success',
                        msg: '修改成功！'
                    });
                }
            });
        }
    })
}
//删除笔记
exports.deleteNote = function(req,res){
    var noteToDel = req.body;
    //console.log(noteToDel);
    userModel.findOne({userID: noteToDel.userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
            }
            else{
                videoModel.findOne({URL: decodeURI(noteToDel.URL)}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        var allSlots = video.slots;
                        var targetSlotIndex;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(noteToDel.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }
                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(noteToDel.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }
                        if(targetNoteIndex < notesASlot.length){
                            var noteDeleted = notesASlot[targetNoteIndex];
                            notesASlot.splice(targetNoteIndex,1);

                            video.save(function (err){
                                if(err){
                                    console.log(err);
                                    res.send({
                                        status: 'error',
                                        msg: 'video save error'
                                    });
                                }
                                else{
                                    //删除相关用户 还要有关注它的和收藏它的
                                    var indexToDel = objectIndexInArray({VideoUrl:decodeURI(noteToDel.URL),
                                        slotIndex:noteToDel.slotIndex,
                                        noteIndex:noteToDel.noteIndex},user.myNotes);
                                    //console.log(indexToDel);
                                    user.myNotes.splice(indexToDel,1);
                                    user.save(function (err) {
                                        //(noteDeleted.concerns);
                                        //console.log(noteDeleted.collects);
                                        async.series([
                                                //关注它的所有用户，删关注
                                                function(delCallback){
                                                    async.each(noteDeleted.concerns, function( userIDtoDel, callback) {

                                                        userModel.findOne({userID: userIDtoDel},function (err,user){
                                                            if(err){
                                                                res.send({
                                                                    status: 'error',
                                                                    msg: 'user find error'
                                                                });
                                                            }else{
                                                                var indexToDel = objectIndexInArray({VideoUrl:decodeURI(noteToDel.URL),
                                                                    slotIndex:noteToDel.slotIndex,
                                                                    noteIndex:noteToDel.noteIndex},user.myConcerns);
                                                                //console.log("concern"+indexToDel);
                                                                user.myConcerns.splice(indexToDel,1);
                                                                user.save(function(err){
                                                                    if(err){
                                                                        res.send({
                                                                            status: 'error',
                                                                            msg: 'user save err'
                                                                        })
                                                                    }else{
                                                                        callback();
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }, function(err){
                                                        if( err ) {
                                                            console.log('async concerns error');
                                                        } else {
                                                            delCallback();
                                                        }
                                                    });
                                                },
                                                //收藏它的所有用户，删收藏
                                                function(delCallback){
                                                    async.each(noteDeleted.collects, function( userIDtoDel, callback) {
                                                        userModel.findOne({userID: userIDtoDel},function (err,user){
                                                            if(err){
                                                                res.send({
                                                                    status: 'error',
                                                                    msg: 'user find error'
                                                                });
                                                            }else{
                                                                var indexToDel = objectIndexInArray({VideoUrl:decodeURI(noteToDel.URL),
                                                                    slotIndex:noteToDel.slotIndex,
                                                                    noteIndex:noteToDel.noteIndex},user.myCollects);
                                                                user.myCollects.splice(indexToDel,1);
                                                                user.save(function(err){
                                                                    if(err){
                                                                        console.log(err);
                                                                        res.send({
                                                                            status: 'error',
                                                                            msg: 'user save err'
                                                                        })
                                                                    }else{
                                                                        callback();
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }, function(err){
                                                        if( err ) {
                                                            console.log('async concerns error');
                                                        } else {
                                                            delCallback();
                                                        }
                                                    });
                                                }
                                            ],
                                            function(err, results){
                                                if(err){
                                                    res.send({
                                                        status: 'error',
                                                        msg: results
                                                    })
                                                }else{
                                                    res.send({
                                                        status: 'success',
                                                        msg: 'delete note and the related successfully.'
                                                    })
                                                }
                                            });
                                    });
                                }
                            })
                        }
                        else{
                            res.send({
                                status: "error",
                                msg: "none to delete found"
                            });
                        }

                    }
                })
            }
        }
    })
}
//记录笔记点击量
exports.clickThisNote = function(req,res){
    var Note = req.body;
    if(!Note.userID){
        res.send({
            status:'error',
            msg:'no user!'
        });
        return;
    }
    if(!Note.URL){
        res.send({
            status:'error',
            msg:'url error, please reopen the note page!'
        });
        return;
    }
    if(!Note.slotIndex || Note.slotIndex<0){
        res.send({
            status:'error',
            msg:'slot index error,please reopen the note page!'
        });
        return;
    }
    if(!Note.noteIndex || Note.noteIndex<0){
        res.send({
            status:'error',
            msg:'note index error,please submit note again!'
        });
        return;
    }
    userModel.findOne({userID: Note.userID}, function (err, user) {
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found'
                });
            }
            else{
                videoModel.findOne({URL: decodeURI(Note.URL)}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        var allSlots = video.slots;
                        var targetSlotIndex = -1 ;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(Note.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }

                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        var targetNoteIndex = -1 ;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(Note.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }
                        var targetNote = notesASlot[targetNoteIndex] ;
                        if(!targetNote.clickCnt)
                            targetNote.clickCnt = 1;
                        else targetNote.clickCnt ++;

                        video.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'video save error'
                                });
                            }
                            else{
                                res.send({
                                    status: 'success',
                                    msg: 'click record success',
                                    result: targetNote
                                });
                            }
                        })
                    }
                })
            }
        }
    })
}

//个人主页中编辑笔记
exports.editNote = function(req,res){
    var userID = req.body.userID;
    var noteToEdit = req.body.note;
    //console.log(noteToEdit);
    userModel.findOne({userID: userID},function (err,user){
        if(err){
            res.send({
                status: 'error',
                msg: 'user find error'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
            }
            else{
                videoModel.findOne({URL: decodeURI(noteToEdit.URL)}, function (err, video){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video find error'
                        });
                    }
                    else{
                        var allSlots = video.slots;
                        var targetSlotIndex;
                        for(targetSlotIndex = 0 ; targetSlotIndex < allSlots.length ; targetSlotIndex++){
                            if(noteToEdit.slotIndex == allSlots[targetSlotIndex].slotIndex){
                                break;
                            }
                        }

                        var notesASlot = allSlots[targetSlotIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesASlot.length ; targetNoteIndex++){
                            if(noteToEdit.noteIndex == notesASlot[targetNoteIndex].noteIndex){
                                break;
                            }
                        }
                        if(targetNoteIndex < notesASlot.length){
                            var noteWillEdit = notesASlot[targetNoteIndex];
                            noteWillEdit.title = noteToEdit.title;
                            noteWillEdit.type = noteToEdit.type;
                            noteWillEdit.body = noteToEdit.body;
                            noteWillEdit.abstract = noteToEdit.abstract;
                            video.save(function (err){
                                if(err){
                                    console.log(err);
                                    res.send({
                                        status: 'error',
                                        msg: 'video save error'
                                    });
                                }
                                else{
                                    res.send({
                                        status: 'success',
                                        msg: 'edit successfully.',
                                        result: {
                                            title: noteWillEdit.title,
                                            abstract: noteWillEdit.abstract,
                                            body: noteWillEdit.body
                                        }
                                    });
                                }
                            })
                        }
                        else{
                            res.send({
                                status: "error",
                                msg: "none to edit found"
                            });
                        }

                    }
                })
            }
        }
    })
}

//获取个人简要信息
exports.getMyBriefProfile = function(req,res){
    var userID = req.query.userID;
    if(!userID){
        res.send({
            status: "error",
            msg: "user id error!"
        });
        return;
    }
    userModel.findOne({userID: userID},function (err,user){
        if(err){
            res.send({
                status: "error",
                msg: "user find error!"
            });
        }
        else{
            if(!user){
                res.send({
                    status: "error",
                    msg: "no user found."
                });
            }
            else{
                res.send({
                    status: "success",
                    msg: "ok",
                    nickname: user.nickname,
                    head: user.head
                });
            }
        }
    })
}
//获取视频基本信息
exports.getVideoBasicInfo = function(req,res){
    var url = decodeURI(req.query.url);
    if(!url){
        res.send({
            status: "error",
            msg: "video url error!"
        });
        return;
    }
    videoModel.findOne({URL:url},function(err,video){
        if(err){
            res.send({
                status: "error",
                msg: "video find error!"
            });
        }
        else{
            if(!video){
                res.send({
                    status: "error",
                    msg: "no video found."
                });
            }
            else{
                var notes = [];
                var replys = [];
                var comments = [];
                var maxNotesNum = 0;
                for(var i = 0;i <= parseInt(video.TotalTime / 10) + 1;i ++){
                    if(i < video.slots.length){
                        notes.push([i,video.slots[i].notes.length]);
                        var replysOnNotes = 0;
                        var commentsOnNotes = 0;
                        for(var j = 0;j < video.slots[i].notes.length;j ++){
                            replysOnNotes += video.slots[i].notes[j].replys.length;
                            for(var k = 0;k < video.slots[i].notes[j].replys.length; k ++){
                                commentsOnNotes += video.slots[i].notes[j].replys[k].comments.length;
                            }
                        }
                        replys.push([i,replysOnNotes]);
                        comments.push([i,commentsOnNotes]);
                        if(maxNotesNum < video.slots[i].notes.length + replysOnNotes + commentsOnNotes);
                            maxNotesNum = video.slots[i].notes.length + replysOnNotes + commentsOnNotes;
                    }
                    else {
                        notes.push([i, 0]);
                        replys.push([i,0]);
                        comments.push([i,0]);
                    }
                }
                res.send({
                    status: "success",
                    msg: "ok",
                    notes:notes,
                    replys:replys,
                    comments:comments,
                    totaltime:video.TotalTime,
                    maxnotesnum:maxNotesNum
                });
            }
        }
    })
}
//获取用户信息
exports.getProfiles = function(req,res){
    var userID = req.query.userID;

    if(!userID){
        res.send({
            status:'error',
            msg:'user id error!'
        });
        return;
    }
    userModel.findOne({userID:userID},function (err,user){
        if(err){
            res.send({
                status:'error',
                msg:'user find error!'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
                return;
            }
            else{
                var baseInfo = {
                    userID: user.userID,
                    nickname: user.nickname,
                    head: user.head, //存头像的path
                    mobilephone: user.mobilephone,
                    email: user.email
                };
                //console.log(user);
                //利用async的parallel完成并行
                async.parallel({
                        note: function(callback){
                            arrayQuerySave(user.myNotes,callback);
                        },
                        collect: function(callback){
                            arrayQuerySave(user.myCollects,callback);
                        },
                        concern: function(callback){
                            arrayQuerySave(user.myConcerns,callback);
                        },
                        noteMessage:function(callback){
                            arrayQuerySave(user.myMessages.myNotesMessage,callback);
                        },
                        concernMessage:function(callback){
                            arrayQuerySave(user.myMessages.myConcernsMessage,callback);
                        }
                    },
                    function (err, results) {
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.send({
                                status: "success",
                                baseInfo: baseInfo,
                                notes: results.note,
                                collects: results.collect,
                                concerns: results.concern,
                                messages:{
                                    noteMessage:results.noteMessage,
                                    concernMessage:results.concernMessage
                                }
                            });
                            user.myMessages.myNotesMessage.splice(0,user.myMessages.myNotesMessage.length);
                            user.myMessages.myConcernsMessage.splice(0,user.myMessages.myConcernsMessage.length);
                            user.save(function (err) {
                                if (err) {
                                    res.send({
                                        status: 'error',
                                        msg: 'user save error!'
                                    });
                                    return;
                                }
                                else {
                                    //console.log("createMessage success");
                                }
                            });
                        }
                    });
            }
        }
    });
}
//获取消息列表
exports.getMessage = function(req,res){
    var userID = req.query.userID;

    if(!userID){
        res.send({
            status:'error',
            msg:'user id error!'
        });
        return;
    }
    userModel.findOne({userID:userID},function (err,user){
        if(err){
            res.send({
                status:'error',
                msg:'user find error!'
            });
        }
        else{
            if(!user){
                res.send({
                    status: 'error',
                    msg: 'no user found.'
                });
                return;
            }
            else{
                var userID = user.userID;
                async.parallel({
                        noteMessage:function(callback){
                            arrayQuerySave(user.myMessages.myNotesMessage,callback);
                        },
                        concernMessage:function(callback){
                            arrayQuerySave(user.myMessages.myConcernsMessage,callback);
                        }
                    },
                    function (err, results) {
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.send({
                                status: "success",
                                userID:userID,
                                messages:{
                                    noteMessage:results.noteMessage,
                                    concernMessage:results.concernMessage
                                }
                            });
                        }
                    });
            }
        }
    });
}
//得到一页的笔记
exports.getNotesOnASlot = function(req,res){
    //都改用decode来作为数据库中存储的url，与submit也保持一致。
    var video_url = decodeURI(req.body.video_url);
    var video_slot = parseInt(req.body.video_slot) ;
    var totalTime = parseInt(req.body.total_time) ;
    videoModel.findOne({URL: video_url}, function (err, video){
        //console.log(video);
        if(err){
            res.send({
                status: 'error',
                msg: 'video find error'
            });
        }
        else{
            if(!video){
                var video_name = video_url.substring(video_url.lastIndexOf("\/")+1);
                video = new videoModel({
                    URL:video_url,
                    VideoName:video_name,
                    TotalTime: totalTime,
                    slots: []
                });
                video.save(function(err){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'video save error.'
                        });
                    }else{
                        res.send({
                            status:'new',
                            msg:'video save successfully.',
                            result: video
                        });
                    }
                })
            }
            else{
                var slots = video.slots;
                var targetIndex = 0 ;
                for(targetIndex = 0 ; targetIndex < slots.length ; targetIndex++){
                    if(slots[targetIndex].slotIndex == video_slot){
                        break;
                    }
                }
                if(targetIndex < slots.length){
                    userModel.find().where('userID').in(slots[targetIndex].relatedUsers).select('userID nickname head role').exec(function (err,users){
                        if(err){
                            res.send({
                                status:'error',
                                msg:'users find error'
                            });
                        }
                        else{
                            res.send({
                                status: 'success',
                                msg: 'notes on slot ' + video_slot + ' get successfully',
                                result: {'users': users, 'notes': slots[targetIndex].notes}
                            });
                        }
                    });

                }
                else{
                    res.send({
                        status: 'success',
                        msg: 'no notes this page',
                        result: {'users': [], 'notes': []}
                    });
                }
            }
        }
    });
}
//110 记录视频时间切换事件
exports.recordTimeChange = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;

    videoModel.findOne({URL: decodeURI(event.which_video)}, function (err, video) {
        if (err) {
            res.send({
                status: 'error',
                msg: 'video find error'
            });
        }
        else {
            if (!video) {
                res.send({
                    status: 'error',
                    msg: 'no video.'
                });
            }
            else {
                var slots = video.slots;
                //console.log(slots);
                var targetIndex = 0;
                for (targetIndex = 0; targetIndex < slots.length; targetIndex++) {
                    if (slots[targetIndex].slotIndex == event.whatSlot) {
                        break;
                    }
                }
                logContent += "::" + slots[targetIndex].notes.length;
                for(var i = 0; i < event.status.length; i++){
                    logContent += "::" + event.status[i];
                }
                if(logContent[logContent.length - 1] != '\n')
                    logContent += "\n";
                //console.log(logContent);
                fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
                    if(err){
                        //console.log(err);
                        console.error("write log error");
                    }else{
                        res.send("ok");
                    }
                });
            }
        }
    })
}
//130/131: 切换查看我的/其他笔记
exports.recordMyOrOther = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//200: 查看某个笔记(该笔记一套相关信息)
exports.recordViewANote = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//210: 假回复
exports.recordFakeReply = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//211: 真回复
exports.recordRealReply = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//记录对笔记的操作
//220/221: 赞/取消赞(该笔记一套相关信息)
//230/231: 关注/取消关注(该笔记一套相关信息)
//240/241: 收藏/取消收藏(该笔记一套相关信息)
exports.recordOperateNote = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//250: 记录编辑操作
exports.recordEdit = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//260: 记录删除操作
exports.recordDelete = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//300: 查阅某人资料
exports.recordViewInfo = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//401: 真的发布笔记
exports.recordRealNote = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    //console.log(logContent[logContent.length - 1]);
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//400: 假发布笔记
exports.recordFakeNote = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//100: 打开某个video
exports.recordOpenVideo = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//120/121 显示/关闭笔记区域
exports.recordOpenNoteOrNot = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//132 查看视频分析
exports.recordViewAnalysis = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//160 暂停
exports.recordPause = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            //console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//140 下载视频
exports.recordVideoDownload = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            //console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}
//150 切换视频
exports.recordVideoChange = function(req,res){
    var event = req.body;
    var logContent = event.doWhat + "::" + event.when + "::" + event.who + "::" + event.which_video + "::" +
        event.which_time + "::" + event.whatSlot;
    for(var i = 0; i < event.status.length; i++){
        logContent += "::" + event.status[i];
    }
    if(logContent[logContent.length - 1] != '\n')
        logContent += "\n";
    //console.log(logContent);
    fs.appendFile("logs/trace.log",logContent,"utf-8",function(err){
        if(err){
            //console.log(err);
            console.error("write log error");
        }else{
            res.send("ok");
        }
    });
}