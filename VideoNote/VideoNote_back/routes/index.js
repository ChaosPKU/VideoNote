//the routes only
var controller = require('../controllers/index.js');
module.exports = function(app){
	app.get('/',controller.index); //大白纸
	app.get('/noteRecord',controller.noteRecord);	//跳转去笔记记录页面
	app.get('/noteDisplayTRY',controller.noteDisplayTRY);	//笔记展示静态页面模型
	app.get('/noteDisplay',controller.noteDisplay);		//跳转去笔记展示页面
	app.get('/getNotesOnAPage',controller.getNotesOnAPage);		//拿一页pdf上的所有笔记
	app.get('/profile',controller.profile);	//跳转去个人信息展示页面
	app.get('/profileTRY',controller.profileTRY);	//个人信息展示静态页面模型
	app.get('/getProfiles',controller.getProfiles);	//得到某人的个人信息
	app.get('/getMyBriefProfile',controller.getMyBriefProfile);	//得到我简短的信息

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
	app.post('/saveHead',controller.saveHead);	//保存头像
	app.post('/updateProfiles',controller.updateProfiles);	//修改个人信息
    app.post('/deleteNote',controller.deleteNote);	//个人主页中删除笔记
    app.post('/editNote',controller.editNote);	//个人主页中编辑笔记
};
