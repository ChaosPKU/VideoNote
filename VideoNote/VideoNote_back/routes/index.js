//the routes only
var controller = require('../controllers/index.js');
module.exports = function(app){
	app.post('/register',controller.register);	//注册
	app.post('/login',controller.login);	//登录
	app.post('/imageUpload',controller.imageUpload);	//图片上传
	app.post('/fileUpload',controller.fileUpload);	//文件上传
	app.post('/submitNote',controller.submitNote);	//提交笔记
	app.post('/replyToNote',controller.replyToNote);	//回复笔记
	app.post('/commentToReply',controller.commentToReply);	//评论回复
	app.post('/operateNote',controller.operateNote);	//操作笔记
	app.post('/praiseOrNotReply',controller.praiseOrNotReply);	//操作回复
    app.post('/editReply',controller.editReply);	//编辑回复
    app.post('/deleteReply',controller.deleteReply);	//删除回复
    app.post('/deleteComment',controller.deleteComment);	//删除评论
	app.post('/uploadHead',controller.uploadHead);	//上传头像
    app.post('/uploadScreenShot',controller.uploadScreenShot);	//上传视频截图
	app.post('/saveHead',controller.saveHead);	//保存头像
	app.post('/updateProfiles',controller.updateProfiles);	//修改个人信息
    app.post('/deleteNote',controller.deleteNote);	//个人主页中删除笔记
    app.post('/editNote',controller.editNote);	//个人主页中编辑笔记
    app.post('/getNotesOnASlot',controller.getNotesOnASlot);		//拿一个video上的所有笔记
    app.post('/clickThisNote',controller.clickThisNote); //点击量记录

    app.post('/recordOpenVideo',controller.recordOpenVideo); //100: 打开某个video
    app.post('/recordTimeChange',controller.recordTimeChange); //110 记录视频时间切换事件
    app.post('/recordOpenNoteOrNot',controller.recordOpenNoteOrNot); //120/121 显示/关闭笔记区域
    app.post('/recordMyOrOther',controller.recordMyOrOther); //130/131: 切换查看我的/其他笔记
    app.post('/recordViewAnalysis',controller.recordViewAnalysis); //132 查看视频分析
    app.post('/recordPause',controller.recordPause); //160 暂停
    app.post('/recordViewANote',controller.recordViewANote);  //200: 查看某个笔记(该笔记一套相关信息)
    app.post('/recordFakeReply',controller.recordFakeReply);  //210: 假回复
    app.post('/recordRealReply',controller.recordRealReply); //211: 真回复
    app.post('/recordOperateNote',controller.recordOperateNote);  //记录对笔记的操作
                                                                    //220/221: 赞/取消赞(该笔记一套相关信息)
                                                                    //230/231: 关注/取消关注(该笔记一套相关信息)
                                                                    //240/241: 收藏/取消收藏(该笔记一套相关信息)
    app.post('/recordEdit',controller.recordEdit);  //250: 记录编辑操作
    app.post('/recordDelete',controller.recordDelete); //260: 记录删除操作
    app.post('/recordViewInfo',controller.recordViewInfo);  //300: 查阅某人资料
    app.post('/recordFakeNote',controller.recordFakeNote); //400: 假发布笔记
    app.post('/recordRealNote',controller.recordRealNote); //401: 真发布笔记



    app.get('/getProfiles',controller.getProfiles);	//得到个人信息
    app.get('/getMessage',controller.getMessage);	//得到个人信息
    app.get('/getMyBriefProfile',controller.getMyBriefProfile);	//得到个人简短的信息
    app.get('/getVideoBasicInfo',controller.getVideoBasicInfo);	//得到视频简短的信息
};
