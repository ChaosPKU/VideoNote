ServerIP = "http://127.0.0.1:8880";

var nickname="" ;
var head="/attachments/head.jpg" ;

//regTest
getType = function(o){
	var _t;
	return ((_t = typeof(o)) == "object" ? Object.prototype.toString.call(o).slice(8,-1):_t).toLowerCase();
}
dfsObject = function(ele){
	var type = getType(ele);
	if(type == 'object'||type == 'array'){
		for(var key in ele){
			console.log(key);
			dfsObject(ele[key]);
		}
	}
	else{
		console.log(ele);
	}
}

/*后 加 前*/
//注册
function doReg(account,password,nickname,role,mobile,email){
	//console.log();
	jQuery.ajax({
		url:ServerIP+'/register',
		type:'post',
		data:{
			userID:account,
			password:password,
			nickname:nickname,
			role:role,
			mobilephone:mobile,
			email:email
		},
		success:function(response){
			if (response.status == "success") {
				localStorage.logged = "true";

				var newUser = response.result ;
				console.log(newUser);
				localStorage.id = newUser.userID;
				localStorage.nickname = newUser.nickname;
				localStorage.head = newUser.head;
				localStorage.role = newUser.role;

				chrome.windows.getCurrent(function(w){
					var wid = w.id ;
					chrome.tabs.getSelected(wid,function(t){
						chrome.tabs.update(t.id,{url:t.url},function(){
							console.log("注册成功，已直接登录！可以正常使用了！");
							window.close();
						});
					});
				});
			}
			else {
				console.log(response.msg);
			}
		},
		error:function(response){
			console.log('ajax error');
			for(var key in response){
				console.log(key+'='+response[key])
			}
		}
	})
}

//登录
function doLogin(account,password){
	//console.log();
	jQuery.ajax({
		url:ServerIP+'/login',
		type:'post',
		data:{
			userID:account,
			password:password
		},
		success:function(response){
			if (response.status == "success") {
				localStorage.logged = "true";
				
				var newUser = response.result ;
				localStorage.id = newUser.userID;
				localStorage.nickname = newUser.nickname;
				localStorage.head = newUser.head;
				localStorage.role = newUser.role;
				
				chrome.windows.getCurrent(function(w){
					var wid = w.id ;
					chrome.tabs.getSelected(wid,function(t){
						chrome.tabs.update(t.id,{url:t.url},function(){
							console.log("登录成功！可以正常使用了！");
							window.close();
						});
					});
				});
			}
			else {
				console.log(response.msg);
			}
		},
		error:function(response){
			console.log('ajax error');
			for(var key in response){
				console.log(key+'='+response[key])
			}
		}
	})
}

//获取自己的信息，头像和昵称即可
function getMyBriefProfile(account){
	jQuery.ajax({
		url:ServerIP+'/getMyBriefProfile',
		type:'get',
		data:{
			userID:account
		},
		success:function(response){
			if (response.status == "success") {
				//更新个人信息
				localStorage.nickname = response.nickname;
				localStorage.head = response.head;
				document.getElementById('disnickname').innerHTML = "" + localStorage.nickname;
				$("#headicon").attr("src",ServerIP+localStorage.head);
			}
			else {
				console.log(response.msg);
			}
		},
		error:function(response){
			console.log('ajax error');
		}
	});
}
