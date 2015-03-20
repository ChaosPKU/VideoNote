//载入数据model
var models = require('../models');
var userModel = models.UserModel;
var pdfModel = models.PDFModel;
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
			return true;
		}
	}
	return false;
}
//返回某个string在某个数组里的index；若没有，返回-1；比上一个函数功能更强，但上一个函数先写的，懒得改了。
function indexInArray(name, array){
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
	return (number.toString().length > 1) ? number.toString() : "0"+ number ;
}
//自定义的Date转string
function easyTime(date){
	return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+timePadZero(date.getHours())+':'+ timePadZero(date.getMinutes());
}
//controls
exports.index = function(req,res){
	res.render('index');
};
//记笔记页面
exports.noteRecord = function(req,res){
	res.render('noteRecord');
};
//展示笔记页面测试
exports.noteDisplayTRY = function(req,res){
	res.render('noteDisplayTRY');
};
//展示笔记页面
exports.noteDisplay = function(req,res){
	res.render('noteDisplay');
};
//用户注册
exports.register = function(req,res){
	var newUser = req.body;
	console.log(newUser);
	userModel.findOne({userID : newUser.userID}, function (err, user){
		if(user){
			res.send({
				status:'error',
				msg:'该ID已被注册'
			});
			return;
		}
		hash(newUser.password, function (err, salt, hash){
			if(err){
				res.send({
					status:'error',
					msg:'hash error'
				});
				return;
			}
			var userToSave = new userModel({
				userID: newUser.userID,
				salt: salt,
				hash: hash,
				nickname: newUser.nickname,
				role: Number(newUser.role),
				mobilephone: newUser.mobilephone,
				email: newUser.email,
				myNotes: [],
				myConcerns: [],
				myCollects: []
			});
			userToSave.save(function (err){
				if(err){
					res.send({
						status: 'error',
						msg: 'user save error'
					});
					return;
				}
				else{
					res.send({
						status: 'success',
						msg: 'user save ok',
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
				msg: 'user find error'
			});
			return;
		}
		if(!user){
			res.send({
				status: 'error',
				msg: '用户名不存在'
			});
		}
		else{
			hash(userToLogin.password, user.salt, function (err, hash){
				if(err){
					res.send({
						status: 'error',
						msg: 'user hash error'
					});
					return;
				}
				if(hash == user.hash){
					res.send({
						status: 'success',
						msg: 'user login ok',
						result: user
					});
				}
				else{
					res.send({
						status: 'error',
						msg: '密码错误'
					});
				}
			})
		}
	})
}
//上传图片
exports.imageUpload = function(req,res){
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
		//console.log(name);
	    //console.log(file.path);
	    console.log('fileName:'+ fileName);
	    var tmp_path = file.path;
	    var images_path = '/usersUploads/images/';
	    var target_path = './public'+ images_path + fileName;
	    fs.renameSync(tmp_path, target_path, function(err) {
	        if(err) console.error(err.stack);
	    });
	    res.send('<a href="'+ images_path + fileName +'" target="_blank"><img src="'+ images_path + fileName +'" alt="'+ fileName +'"/></a>');
	});
	form.parse(req);
}
//上传文件
exports.fileUpload = function(req,res){
	var form = new multiparty.Form({	autoFiles:true ,
										uploadDir: './uploads/tmp'
									});
	var fileName = new Date().getTime() + '_';
	//为了文件名不冲突，用时间做标志
	var originalName = '';
	//显示出来的时候还是以原文件名为好
    form.on('part', function(part){
	    if(!part.filename) return;
	    originalName += part.filename; 
	    fileName += part.filename;
	});
	form.on('file', function(name, file){
		//console.log(name);
	    //console.log(file.path);
	    console.log('fileName:'+ fileName);
	    var tmp_path = file.path;
	    var files_path = '/usersUploads/files/';
	    var target_path = './public'+ files_path + fileName;
	    fs.renameSync(tmp_path, target_path, function(err) {
	        if(err) console.error(err.stack);
	    });
	    res.send('<a href="'+ files_path + fileName +'" target="_blank">'+ originalName +'</a>');
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
			msg:'您尚未登录！'
		});
		return;
	}
    //用decode存，注意
	NOTE.URL = decodeURI(req.body.URL);
	console.log(NOTE.URL);
    if(!NOTE.URL){
		res.send({
			status:'error',
			msg:'url异常，请重新打开记笔记页面！'
		});
		return;
	}
	NOTE.pdfName = req.body.pdfName;
	if(!NOTE.pdfName){
		res.send({
			status:'error',
			msg:'name异常，请重新打开记笔记页面！'
		});
		return;
	}
	NOTE.pageIndex = req.body.pageIndex;
	if(!NOTE.pageIndex || NOTE.pageIndex<0){
		res.send({
			status:'error',
			msg:'页码异常，请重新打开记笔记页面！'
		});
		return;
	}
	NOTE.note = req.body.note;
	if(!NOTE.note){
		res.send({
			status:'error',
			msg:'笔记提交异常，请重新提交记笔！'
		});
		return;
	}
	userModel.findOne({userID: NOTE.userID},function (err,user){
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
					msg: '该用户不存在'
				});
			}
			else{
				pdfModel.findOne({URL: NOTE.URL}, function (err, pdf){
					if(err){
						res.send({
							status: 'error',
							msg: 'pdf find error'
						});	
					}
					else{
						if(!pdf){
							pdf = new pdfModel({
								URL: NOTE.URL,
								pdfName: NOTE.pdfName,
								pages: []
							});
						}
						var allPages = pdf.pages ;	//所有已存page
						var indexToSave = -1;		//现在要存到哪个page下。如果没有，新建；如果有，找到存进去
						for(var i = 0 ; i < allPages.length ; i++){
							if(allPages[i].pageIndex == NOTE.pageIndex){
								indexToSave = i ;
								break;
							}
						}
						if(indexToSave < 0){
							indexToSave = allPages.push({
								pageIndex: NOTE.pageIndex,
								notes: [],
								relatedUsers: [NOTE.userID]
							}) - 1;
						}

						if(!inArray(NOTE.userID, allPages[indexToSave].relatedUsers)){
							allPages[indexToSave].relatedUsers.push(NOTE.userID);
						}

                        //找最大的那个然后比他大
						var note_index = -1 ;
                        var pageNotes = allPages[indexToSave].notes;
                        for(var i = 0 ; i < pageNotes.length ; i++){
                            if(pageNotes[i].noteIndex > note_index){
                                note_index = pageNotes[i].noteIndex;
                            }
                        }
                        note_index ++;

						var now = new Date();
						allPages[indexToSave].notes.push({
							noteIndex: note_index,
							title: NOTE.note.title,  
				            type: NOTE.note.type,
				            fromUserID: NOTE.userID, 
				            time: easyTime(now),    
				            _time: Number(now.getTime()),
				            relatedRange: NOTE.note.relatedRange,   //相关区域
				            abstract: NOTE.note.abstract,   
				            body: NOTE.note.body,   
				            praises: [],  
				            concerns: [], 
				            collects: [], 
				            replys:[]
						});
						//console.log(pdf);
						pdf.save(function (err){
							if(err){
								console.log(err);
								res.send({
									status: 'error',
									msg: 'pdf save error'
								});
							}
							else{
								//维护我的笔记数组
								user.myNotes.push({
									PDFUrl: NOTE.URL, 
							        pageIndex: NOTE.pageIndex,  
							        noteIndex: note_index 
								});
								user.save(function (err){
									if(err){
										console.log(err);
										res.send({
											status: 'error',
											msg: '用户存储笔记错误'
										});
									}
									else{
										res.send({
											status: 'success',
											msg: '笔记发表成功！点击确认关闭。'
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


//得到一页的笔记
exports.getNotesOnAPage = function(req,res){
    //都改用decode来作为数据库中存储的url，与submit也保持一致。
	var pdf_url = decodeURI(req.query.pdf_url);
	var pdf_page = parseInt(req.query.pdf_page) ;
	console.log(pdf_url);
	console.log(pdf_page);
	pdfModel.findOne({URL: pdf_url}, function (err, pdf){
		//console.log(pdf);
		if(err){
			res.send({
				status: 'error',
				msg: 'pdf find error'
			});
		}
		else{
			if(!pdf){
				res.send({
					status:'error',
					msg:'url对应的pdf不存在'
				});
			}
			else{
				var pages = pdf.pages;
				var targetIndex = 0 ;
				for(targetIndex = 0 ; targetIndex < pages.length ; targetIndex++){
					if(pages[targetIndex].pageIndex == pdf_page){
						break;
					}
				}
				if(targetIndex < pages.length){
					userModel.find().where('userID').in(pages[targetIndex].relatedUsers).select('userID nickname head role').exec(function (err,users){
						if(err){
							res.send({
								status:'error',
								msg:'users find error'
							});
						}
						else{
							res.send({
								status: 'success',
								msg: 'ok',
								result: {'users': users, 'notes': pages[targetIndex].notes}
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

//回复某个笔记
exports.replyToNote = function(req,res){
	var reply = {};
	reply.userID = req.body.userID;
	if(!reply.userID){
		res.send({
			status:'error',
			msg:'您尚未登录！'
		});
		return;
	}
	reply.URL = req.body.URL;
	//console.log(NOTE.URL);
	if(!reply.URL){
		res.send({
			status:'error',
			msg:'url异常，请重新打开记笔记页面！'
		});
		return;
	}
	reply.pageIndex = req.body.pageIndex;
	if(!reply.pageIndex || reply.pageIndex<0){
		res.send({
			status:'error',
			msg:'页码异常，请重新打开记笔记页面！'
		});
		return;
	}
	reply.noteIndex = req.body.noteIndex;
	if(!reply.noteIndex || reply.noteIndex<0){
		res.send({
			status:'error',
			msg:'笔记索引异常，请重新提交'
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
					msg: '该用户不存在'
				});
			}
			else{
				pdfModel.findOne({URL: reply.URL}, function (err, pdf){
					if(err){
						res.send({
							status: 'error',
							msg: 'pdf find error'
						});	
					}
					else{
						var allPages = pdf.pages;
						//console.log(allPages.length);
						//console.log(reply.pageIndex);
						var targetPageIndex = -1 ;
						for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
							if(reply.pageIndex == allPages[targetPageIndex].pageIndex){
								break;
							}
						}
						//存相关用户
						if(!inArray(reply.userID, allPages[targetPageIndex].relatedUsers)){
							allPages[targetPageIndex].relatedUsers.push(reply.userID);
						}

						//console.log(targetPageIndex);
						//console.log(allPages[targetPageIndex]);

						var notesAPage = allPages[targetPageIndex].notes ;
						var targetNoteIndex = -1 ;
						for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
							if(reply.noteIndex == notesAPage[targetNoteIndex].noteIndex){
								break;
							}
						}
						var targetNote = notesAPage[targetNoteIndex] ;

                        //找最大的那个然后比他大
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
			                body: reply.body,   
			                praises: [],
			                comments: [] 
						});
						pdf.save(function (err){
							if(err){
								console.log(err);
								res.send({
									status: 'error',
									msg: 'pdf save error'
								});
							}
							else{
								res.send({
									status: 'success',
									msg: '回复成功',
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

//评论某个回复
exports.commentToReply = function(req,res){
	/*	userID: userID,
		URL: URL,
		pageIndex: pageIndex,
		noteIndex: noteIndex,
		replyIndex: replyIndex,
		to: to,
		body: body
	*/
	var comment = req.body;
	if(!comment.userID){
		res.send({
			status:'error',
			msg:'您尚未登录！'
		});
		return;
	}
	//console.log(NOTE.URL);
	if(!comment.URL){
		res.send({
			status:'error',
			msg:'url异常，请重新打开记笔记页面！'
		});
		return;
	}
	if(!comment.pageIndex || comment.pageIndex<0){
		res.send({
			status:'error',
			msg:'页码异常，请重新打开记笔记页面！'
		});
		return;
	}
	if(!comment.noteIndex || comment.noteIndex<0){
		res.send({
			status:'error',
			msg:'笔记索引异常，请重新提交'
		});
		return;
	}
	if(!comment.replyIndex || comment.replyIndex<0){
		res.send({
			status:'error',
			msg:'回复索引异常，请重新提交'
		});
		return;
	}

	userModel.findOne({userID: comment.userID},function (err,user){
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
					msg: '该用户不存在'
				});
			}
			else{
				pdfModel.findOne({URL: comment.URL}, function (err, pdf){
					if(err){
						res.send({
							status: 'error',
							msg: 'pdf find error'
						});	
					}
					else{
						var allPages = pdf.pages;
						//console.log(allPages.length);
						
						var targetPageIndex = -1 ;
						for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
							if(comment.pageIndex == allPages[targetPageIndex].pageIndex){
								break;
							}
						}
						//存相关用户
						if(!inArray(comment.userID, allPages[targetPageIndex].relatedUsers)){
							allPages[targetPageIndex].relatedUsers.push(comment.userID);
						}

						//console.log(targetPageIndex);
						//console.log(allPages[targetPageIndex]);

						var notesAPage = allPages[targetPageIndex].notes ;
						var targetNoteIndex = -1 ;
						for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
							if(comment.noteIndex == notesAPage[targetNoteIndex].noteIndex){
								break;
							}
						}

						var replysANote = notesAPage[targetNoteIndex].replys ;
						var targetReplyIndex = -1 ;
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
						pdf.save(function (err){
							if(err){
								console.log(err);
								res.send({
									status: 'error',
									msg: 'pdf save error'
								});
							}
							else{
								res.send({
									status: 'success',
									msg: '评论成功',
									result: newComment
								});
							}
						}) 
					}
				})
			}
		}
	})
};
//编辑回复
exports.editReply = function(req,res){
    /*	userID: userID,
     replyToDel: {URL, pageIndex, noteIndex, replyIndex}
     */
    var reply = req.body.replyToDel;
    console.log(reply);
    if(!req.body.userID){
        res.send({
            status:'error',
            msg:'您尚未登录！'
        });
        return;
    }
    //console.log(NOTE.URL);
    if(!reply.URL){
        res.send({
            status:'error',
            msg:'url异常，请重新打开记笔记页面！'
        });
        return;
    }
    if(!reply.pageIndex || reply.pageIndex<0){
        res.send({
            status:'error',
            msg:'页码异常，请重新打开记笔记页面！'
        });
        return;
    }
    if(!reply.noteIndex || reply.noteIndex<0){
        res.send({
            status:'error',
            msg:'笔记索引异常，请重新提交'
        });
        return;
    }
    if(!reply.replyIndex || reply.replyIndex<0){
        res.send({
            status:'error',
            msg:'回复索引异常，请重新提交'
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
                    msg: '该用户不存在'
                });
            }
            else{
                pdfModel.findOne({URL: reply.URL}, function (err, pdf){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'pdf find error'
                        });
                    }
                    else{
                        var allPages = pdf.pages;
                        //console.log(allPages.length);

                        var targetPageIndex;
                        for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
                            if(reply.pageIndex == allPages[targetPageIndex].pageIndex){
                                break;
                            }
                        }

                        var notesAPage = allPages[targetPageIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
                            if(reply.noteIndex == notesAPage[targetNoteIndex].noteIndex){
                                break;
                            }
                        }

                        var replysANote = notesAPage[targetNoteIndex].replys ;
                        var targetReplyIndex;
                        for(targetReplyIndex = 0 ; targetReplyIndex < replysANote.length ; targetReplyIndex++){
                            if(reply.replyIndex == replysANote[targetReplyIndex].replyIndex){
                                break;
                            }
                        }
                        replysANote[targetReplyIndex].body = reply.body;
                        pdf.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'pdf save error'
                                });
                            }
                            else{
                                res.send({
                                    status: 'success',
                                    msg: '编辑成功',
                                    result: reply.body
                                });
                            }
                        })
                    }
                })
            }
        }
    })
};
//删除回复
exports.deleteReply = function(req,res){
    /*	userID: userID,
     replyToDel: {URL, pageIndex, noteIndex, replyIndex}
     */
    var reply = req.body.replyToDel;
    console.log(reply);
    if(!req.body.userID){
        res.send({
            status:'error',
            msg:'您尚未登录！'
        });
        return;
    }
    //console.log(NOTE.URL);
    if(!reply.URL){
        res.send({
            status:'error',
            msg:'url异常，请重新打开记笔记页面！'
        });
        return;
    }
    if(!reply.pageIndex || reply.pageIndex<0){
        res.send({
            status:'error',
            msg:'页码异常，请重新打开记笔记页面！'
        });
        return;
    }
    if(!reply.noteIndex || reply.noteIndex<0){
        res.send({
            status:'error',
            msg:'笔记索引异常，请重新提交'
        });
        return;
    }
    if(!reply.replyIndex || reply.replyIndex<0){
        res.send({
            status:'error',
            msg:'回复索引异常，请重新提交'
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
                    msg: '该用户不存在'
                });
            }
            else{
                pdfModel.findOne({URL: reply.URL}, function (err, pdf){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'pdf find error'
                        });
                    }
                    else{
                        var allPages = pdf.pages;
                        //console.log(allPages.length);

                        var targetPageIndex;
                        for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
                            if(reply.pageIndex == allPages[targetPageIndex].pageIndex){
                                break;
                            }
                        }

                        var notesAPage = allPages[targetPageIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
                            if(reply.noteIndex == notesAPage[targetNoteIndex].noteIndex){
                                break;
                            }
                        }

                        var replysANote = notesAPage[targetNoteIndex].replys ;
                        var targetReplyIndex;
                        for(targetReplyIndex = 0 ; targetReplyIndex < replysANote.length ; targetReplyIndex++){
                            if(reply.replyIndex == replysANote[targetReplyIndex].replyIndex){
                                break;
                            }
                        }
                        replysANote.splice(targetReplyIndex,1);
                        pdf.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'pdf save error'
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
};
//删除评论
exports.deleteComment = function(req,res){
    /*	userID: userID,
        commentToDel: {URL, pageIndex, noteIndex, replyIndex, commentIndex}
     */
    var comment = req.body.commentToDel;
    console.log(comment);
    if(!req.body.userID){
        res.send({
            status:'error',
            msg:'您尚未登录！'
        });
        return;
    }
    //console.log(NOTE.URL);
    if(!comment.URL){
        res.send({
            status:'error',
            msg:'url异常，请重新打开记笔记页面！'
        });
        return;
    }
    if(!comment.pageIndex || comment.pageIndex<0){
        res.send({
            status:'error',
            msg:'页码异常，请重新打开记笔记页面！'
        });
        return;
    }
    if(!comment.noteIndex || comment.noteIndex<0){
        res.send({
            status:'error',
            msg:'笔记索引异常，请重新提交'
        });
        return;
    }
    if(!comment.replyIndex || comment.replyIndex<0){
        res.send({
            status:'error',
            msg:'回复索引异常，请重新提交'
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
                    msg: '该用户不存在'
                });
            }
            else{
                pdfModel.findOne({URL: comment.URL}, function (err, pdf){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'pdf find error'
                        });
                    }
                    else{
                        var allPages = pdf.pages;
                        //console.log(allPages.length);

                        var targetPageIndex;
                        for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
                            if(comment.pageIndex == allPages[targetPageIndex].pageIndex){
                                break;
                            }
                        }

                        var notesAPage = allPages[targetPageIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
                            if(comment.noteIndex == notesAPage[targetNoteIndex].noteIndex){
                                break;
                            }
                        }

                        var replysANote = notesAPage[targetNoteIndex].replys ;
                        var targetReplyIndex;
                        for(targetReplyIndex = 0 ; targetReplyIndex < replysANote.length ; targetReplyIndex++){
                            if(comment.replyIndex == replysANote[targetReplyIndex].replyIndex){
                                break;
                            }
                        }

                        var targetReply = replysANote[targetReplyIndex];
                        targetReply.comments.splice(comment.commentIndex,1);
                        pdf.save(function (err){
                            if(err){
                                console.log(err);
                                res.send({
                                    status: 'error',
                                    msg: 'pdf save error'
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
};
//功能性操作某个笔记
exports.operateNote = function(req,res){
	/*	userID: userID,
		URL: URL,
		pageIndex: pageIndex,
		noteIndex: noteIndex,
		which: which,
		upordown: upordown 
	*/
	var operation = req.body;
	if(!operation.userID){
		res.send({
			status:'error',
			msg:'您尚未登录！'
		});
		return;
	}
	if(!operation.URL){
		res.send({
			status:'error',
			msg:'url异常，请重新打开记笔记页面！'
		});
		return;
	}
	if(!operation.pageIndex || operation.pageIndex<0){
		res.send({
			status:'error',
			msg:'页码异常，请重新打开记笔记页面！'
		});
		return;
	}
	if(!operation.noteIndex || operation.noteIndex<0){
		res.send({
			status:'error',
			msg:'笔记索引异常，请重新提交'
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
					msg: '该用户不存在'
				});
			}
			else{
				pdfModel.findOne({URL: operation.URL}, function (err, pdf){
					if(err){
						res.send({
							status: 'error',
							msg: 'pdf find error'
						});	
					}
					else{
						var allPages = pdf.pages;
						//console.log(allPages.length);
						var targetPageIndex = -1 ;
						for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
							if(operation.pageIndex == allPages[targetPageIndex].pageIndex){
								break;
							}
						}
						//存相关用户
						if(!inArray(operation.userID, allPages[targetPageIndex].relatedUsers)){
							allPages[targetPageIndex].relatedUsers.push(operation.userID);
						}

						//console.log(targetPageIndex);
						//console.log(allPages[targetPageIndex]);

						var notesAPage = allPages[targetPageIndex].notes ;
						var targetNoteIndex = -1 ;
						for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
							if(operation.noteIndex == notesAPage[targetNoteIndex].noteIndex){
								break;
							}
						}
						var targetNote = notesAPage[targetNoteIndex] ;
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

						var index = indexInArray(operation.userID,targetOperation) ;//pdf里的记录
						if(operation.upordown == 0){//加
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
							var noteStruct = {	PDFUrl: operation.URL, 
										        pageIndex: Number(operation.pageIndex),  
										        noteIndex: Number(operation.noteIndex)
										    };
							var userArrayIndex = objectIndexInArray(noteStruct,targetUserArray) ;
							//console.log(userArrayIndex);
							if(operation.upordown == 0){//加
								if(userArrayIndex < 0){
									targetUserArray.push(noteStruct);
								}
							}
							else{//减
								if(userArrayIndex >= 0){
									targetUserArray.splice(userArrayIndex,1);
								}
							}
						}
						
						pdf.save(function (err){
							if(err){
								console.log(err);
								res.send({
									status: 'error',
									msg: 'pdf save error'
								});
							}
							else{
								user.save(function (err){
									if(err){
										console.log(err);
										res.send({
											status: 'error',
											msg: '操作用户存储error'
										});
									}
									else{
										res.send({
											status: 'success',
											msg: '操作成功',
											result: targetOperation
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

//功能性操作某个回复
exports.praiseOrNotReply = function(req,res){
	/*	userID: userID,
		URL: URL,
		pageIndex: pageIndex,
		noteIndex: noteIndex,
		replyIndex: replyIndex,
		upordown: upordown 
	*/
	var operation = req.body;
	if(!operation.userID){
		res.send({
			status:'error',
			msg:'您尚未登录！'
		});
		return;
	}
	if(!operation.URL){
		res.send({
			status:'error',
			msg:'url异常，请重新打开记笔记页面！'
		});
		return;
	}
	if(!operation.pageIndex || operation.pageIndex<0){
		res.send({
			status:'error',
			msg:'页码异常，请重新打开记笔记页面！'
		});
		return;
	}
	if(!operation.noteIndex || operation.noteIndex<0){
		res.send({
			status:'error',
			msg:'笔记索引异常，请重新提交'
		});
		return;
	}
	if(!operation.replyIndex || operation.replyIndex<0){
		res.send({
			status:'error',
			msg:'回复索引异常，请重新提交'
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
					msg: '该用户不存在'
				});
			}
			else{
				pdfModel.findOne({URL: operation.URL}, function (err, pdf){
					if(err){
						res.send({
							status: 'error',
							msg: 'pdf find error'
						});	
					}
					else{
						var allPages = pdf.pages;
						//console.log(allPages.length);
						var targetPageIndex = -1 ;
						for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
							if(operation.pageIndex == allPages[targetPageIndex].pageIndex){
								break;
							}
						}
						//存相关用户
						if(!inArray(operation.userID, allPages[targetPageIndex].relatedUsers)){
							allPages[targetPageIndex].relatedUsers.push(operation.userID);
						}

						//console.log(targetPageIndex);
						//console.log(allPages[targetPageIndex]);

						var notesAPage = allPages[targetPageIndex].notes ;
						var targetNoteIndex = -1 ;
						for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
							if(operation.noteIndex == notesAPage[targetNoteIndex].noteIndex){
								break;
							}
						}

						var replysANote = notesAPage[targetNoteIndex].replys ;
						var targetReplyIndex = -1 ;
						for(targetReplyIndex = 0 ; targetReplyIndex < replysANote.length ; targetReplyIndex++){
							if(operation.replyIndex == replysANote[targetReplyIndex].replyIndex){
								break;
							}
						}
						var targetReply = replysANote[targetReplyIndex];
						var targetOperation = targetReply.praises ;

						var index = indexInArray(operation.userID,targetOperation) ;
						if(operation.upordown == 0){//加
							if(index < 0){
								targetOperation.push(operation.userID);
							}
						}
						else{//减
							if(index >= 0){
								targetOperation.splice(index,1);
							}
						}

						pdf.save(function (err){
							if(err){
								console.log(err);
								res.send({
									status: 'error',
									msg: 'pdf save error'
								});
							}
							else{
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

//个人主页
exports.profile = function (req,res){
	var target_id= req.query.want; 
	//利用模版引擎，将这个参数传入
	res.render("profile",{targetID:target_id});
}
//个人主页测试
exports.profileTRY = function (req,res){
	res.render("profileTRY");
}

//async的eachSeries，为数组中的信息进行异步有序查询并将查询后得到的新数组返回而打造的吊炸天的函数
function arrayQuerySave(queryArray, welldone){
	var saveArray = [];
	async.eachSeries(queryArray, function (item,callback){
		pdfModel.findOne({URL: item.PDFUrl}, function (err, pdf){
			if(err){
				res.send({
					status: 'error',
					msg: 'pdf find error'
				});	
			}
			else{
				var allPages = pdf.pages;
				var targetPageIndex = -1 ;
				for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
					if(item.pageIndex == allPages[targetPageIndex].pageIndex){
						break;
					}
				}

				var notesAPage = allPages[targetPageIndex].notes ;
				var targetNoteIndex = -1 ;
				for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
					if(item.noteIndex == notesAPage[targetNoteIndex].noteIndex){
						break;
					}
				}
				var targetNote = notesAPage[targetNoteIndex] ;
				
	            userModel.findOne({userID: targetNote.fromUserID},function (err,targetUser){
	            	saveArray.push({
	            		URL: item.PDFUrl,
	            		name: pdf.pdfName,
	            		pageIndex: item.pageIndex,
	            		noteIndex: item.noteIndex,
						title: targetNote.title,
						type: (targetNote.type==0)?"笔记":"问题",
						from: targetUser.nickname,
						time: targetNote.time,
						abstract: targetNote.abstract,
                        body: targetNote.body
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
//获取用户信息
exports.getProfiles = function(req,res){
	//res.send({myself:true/false,user:user});
	var userID = req.query.userID;

	if(!userID){
		res.send({
			status:'error',
			msg:'用户ID参数错误'
		});
		return;
	}
	userModel.findOne({userID:userID},function (err,user){
		if(err){
			res.send({
				status:'error',
				msg:'find user error'
			});
		}
		else{
            //console.log(user);
			if(!user){
				res.send({
					status: 'error',
					msg: '该用户不存在'
				});
				return;
			}
			else{
				var baseInfo = {
					userID: user.userID,
				    nickname: user.nickname,
				    role: (user.role==0)?"学生":"教师", //0学生 1老师
				    head: user.head, //存头像的path
				    mobilephone: user.mobilephone,
				    email: user.email
				};
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
				    		concerns: results.concern
				    	});
				    }
				});
			}
		}
	});
}

//获取我的简要个人信息
exports.getMyBriefProfile = function(req,res){
	var userID = req.query.userID;
	if(!userID){
		res.send({
			status: "error",
			msg: "userID参数错误"
		});
		return;
	}
	userModel.findOne({userID: userID},function (err,user){
		if(err){
			res.send({
				status: "error",
				msg: "user find error"
			});
		}
		else{
			if(!user){
				res.send({
					status: "error",
					msg: "没找到该用户"
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

//上传头像
exports.uploadHead = function(req,res){
	console.log(req.files);
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

//修改个人资料
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
};
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
                    msg: '该用户不存在'
                });
            }
            else{
                pdfModel.findOne({URL: noteToDel.URL}, function (err, pdf){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'pdf find error'
                        });
                    }
                    else{
                        var allPages = pdf.pages;
                        //console.log(allPages.length);
                        //console.log(reply.pageIndex);
                        var targetPageIndex;
                        for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
                            if(noteToDel.pageIndex == allPages[targetPageIndex].pageIndex){
                                break;
                            }
                        }
                        //console.log(targetPageIndex);
                        //console.log(allPages[targetPageIndex]);

                        var notesAPage = allPages[targetPageIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
                            if(noteToDel.noteIndex == notesAPage[targetNoteIndex].noteIndex){
                                break;
                            }
                        }
                        //console.log(targetNoteIndex);
                        //找到了才可以删除
                        if(targetNoteIndex < notesAPage.length){
                            var noteDeleted = notesAPage[targetNoteIndex];
                            notesAPage.splice(targetNoteIndex,1);

                            pdf.save(function (err){
                                if(err){
                                    console.log(err);
                                    res.send({
                                        status: 'error',
                                        msg: 'pdf save error'
                                    });
                                }
                                else{
                                    //删除相关用户 还要有关注它的和收藏它的
                                    var indexToDel = objectIndexInArray({PDFUrl:noteToDel.URL,
                                        pageIndex:noteToDel.pageIndex,
                                        noteIndex:noteToDel.noteIndex},user.myNotes);
                                    //console.log(indexToDel);
                                    user.myNotes.splice(indexToDel,1);
                                    user.save(function (err) {
                                        console.log(noteDeleted.concerns);
                                        console.log(noteDeleted.collects);
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
                                                                var indexToDel = objectIndexInArray({PDFUrl:noteToDel.URL,
                                                                    pageIndex:noteToDel.pageIndex,
                                                                    noteIndex:noteToDel.noteIndex},user.myConcerns);
                                                                console.log("concern"+indexToDel);
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
                                                                var indexToDel = objectIndexInArray({PDFUrl:noteToDel.URL,
                                                                    pageIndex:noteToDel.pageIndex,
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
                                                        msg: '笔记及其关联删除成功'
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
                                msg: "没有找到要删的"
                            });
                        }

                    }
                })
            }
        }
    })
};
//编辑笔记
/*userID
editedNote.URL
editedNote.pageIndex
editedNote.noteIndex
editedNote.title
editedNote.type
editedNote.body
editedNote.abstract
*/
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
                    msg: '该用户不存在'
                });
            }
            else{
                pdfModel.findOne({URL: noteToEdit.URL}, function (err, pdf){
                    if(err){
                        res.send({
                            status: 'error',
                            msg: 'pdf find error'
                        });
                    }
                    else{
                        var allPages = pdf.pages;
                        //console.log(allPages.length);
                        //console.log(reply.pageIndex);
                        var targetPageIndex;
                        for(targetPageIndex = 0 ; targetPageIndex < allPages.length ; targetPageIndex++){
                            if(noteToEdit.pageIndex == allPages[targetPageIndex].pageIndex){
                                break;
                            }
                        }
                        //console.log(targetPageIndex);
                        //console.log(allPages[targetPageIndex]);

                        var notesAPage = allPages[targetPageIndex].notes ;
                        var targetNoteIndex;
                        for(targetNoteIndex = 0 ; targetNoteIndex < notesAPage.length ; targetNoteIndex++){
                            if(noteToEdit.noteIndex == notesAPage[targetNoteIndex].noteIndex){
                                break;
                            }
                        }
                        //console.log(targetNoteIndex);
                        //找到了才可以删除
                        if(targetNoteIndex < notesAPage.length){
                            var noteWillEdit = notesAPage[targetNoteIndex];
                            noteWillEdit.title = noteToEdit.title;
                            noteWillEdit.type = noteToEdit.type;
                            noteWillEdit.body = noteToEdit.body;
                            noteWillEdit.abstract = noteToEdit.abstract;
                            pdf.save(function (err){
                                if(err){
                                    console.log(err);
                                    res.send({
                                        status: 'error',
                                        msg: 'pdf save error'
                                    });
                                }
                                else{
                                    res.send({
                                        status: 'success',
                                        msg: '编辑成功',
                                        result: {
                                            title: noteWillEdit.title,
                                            type: (noteWillEdit.type==0)?"笔记":"问题",
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
                                msg: "没有找到要编辑的"
                            });
                        }

                    }
                })
            }
        }
    })
};