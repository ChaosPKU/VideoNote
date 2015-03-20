/*$("#login").click(function(){
	var profile_url = "../../profile";
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendRequest(tab.id, { "hello": "ok" }, function (response) {
            chrome.tabs.create({url: profile_url + "/index.html" + "?mp4=" + response.mp4}, function (tab) {
                //chrome.tabs.executeScript(tab.id, {code: 'window.postMessage(' + userID + ',"' + profile_url + '");'});
            });

        });
    });
})*/
//jQuery time
window.onload = function(){

	$("#logForm").validate({
		rules: {
			logstuID: {
				required: true,
				digits: true
			},
			logpass: {
				required: true,
				minlength: 6
			}
		},
		messages: {
			logstuID: {
				required: "请输入用户名",
				digits: "学号/教工号应由数字组成"
			},
			logpass: {
				required: "请输入密码",
				minlength: "密码不能小于6个字符"
			}
		}
	});

	$("#signForm").validate({
		rules: {
			stuID: {
				required: true,
				digits: true
			},
			pass: {
				required: true,
				minlength: 6
			},
			name: {
				required: true
			},
			phonenumber: {
				digits: true
			},
			email: {
				email: true
			}
		},
		messages: {
			stuID: {
				required: "请输入用户名",
				digits: "学号/教工号应由数字组成"
			},
			pass: {
				required: "请输入密码",
				minlength: "密码不能小于6个字符"
			},
			name: {
				required: "请填写你的姓名"
			},
			phonenumber: {
				digits: "请输入正确的电话号码"
			},
			email: {
				email: "请输入正确的email地址"
			}
		}
	});

    if (('logged' in localStorage) && localStorage.logged == "true") {
        $("#before").css("display", "none");
        $("#after").css("display", "block");
        //得到最新的个人简要信息
        getMyBriefProfile(localStorage.id);
        //传给新页面他需要的数据！
        $("#myProfile").click(function () {
            var userID = localStorage.id;
            var profile_url = "http://127.0.0.1:8880/profile";
            chrome.tabs.create({url: profile_url + "?want=" + userID}, function (tab) {
                chrome.tabs.executeScript(tab.id, {code: 'window.postMessage(' + userID + ',"' + profile_url + '");'});
            });
            return false;
        });

        $("#logout").click(function () {
            if (delete localStorage.logged) {
                delete localStorage.id;
                delete localStorage.token;
                delete localStorage.nickname;
                delete localStorage.head;
                alert("注销成功！请重新登录~");
                //window.location.reload();
                $("#after").css("display", "none");
                $("#before").css("display", "block");
            }
            else {
                alert("注销失败，请再次注销！")
            }
            return false;
        });

    }

	var current_fs, next_fs, previous_fs; //fieldsets
	var left, opacity, scale; //fieldset properties which we will animate
	var animating; //flag to prevent quick multi-click glitches

	$(".next").click(function(){
		if($("#signForm").valid()){
			if(animating) return false;
			animating = true;
			
			current_fs = $(this).parent();
			next_fs = $(this).parent().next();
			//console.log(next_fs);
			
			//activate next step on progressbar using the index of next_fs
			$("#progressbar").find("li").eq($("fieldset").index(next_fs)-1).addClass("active");
			
			//show the next fieldset
			next_fs.show(); 
			//hide the current fieldset with style
			current_fs.animate({opacity: 0}, {
				step: function(now, mx) {
					//as the opacity of current_fs reduces to 0 - stored in "now"
					//1. scale current_fs down to 80%
					scale = 1 - (1 - now) * 0.2;
					//2. bring next_fs from the right(50%)
					left = (now * 50)+"%";
					//3. increase opacity of next_fs to 1 as it moves in
					opacity = 1 - now;
					current_fs.css({'transform': 'scale('+scale+')'});
					next_fs.css({'left': left, 'opacity': opacity});
				}, 
				duration: 800, 
				complete: function(){
					current_fs.hide();
					animating = false;
				}, 
				//this comes from the custom easing plugin
				easing: 'easeInOutBack'
			});
		}
		else{
			return false;
		}
		
	});

	$(".previous").click(function(){
		if(animating) return false;
		animating = true;
		
		current_fs = $(this).parent();
		previous_fs = $(this).parent().prev();
		
		//de-activate current step on progressbar
		$("#progressbar").find("li").eq($("fieldset").index(current_fs)-1).removeClass("active");
		
		//show the previous fieldset
		previous_fs.show(); 
		//hide the current fieldset with style
		current_fs.animate({opacity: 0}, {
			step: function(now, mx) {
				//as the opacity of current_fs reduces to 0 - stored in "now"
				//1. scale previous_fs from 80% to 100%
				scale = 0.8 + (1 - now) * 0.2;
				//2. take current_fs to the right(50%) - from 0%
				left = ((1-now) * 50)+"%";
				//3. increase opacity of previous_fs to 1 as it moves in
				opacity = 1 - now;
				current_fs.css({'left': left});
				previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
			}, 
			duration: 800, 
			complete: function(){
				current_fs.hide();
				animating = false;
			}, 
			//this comes from the custom easing plugin
			easing: 'easeInOutBack'
		});
	});

	$("#login").click(function(){	
		if($("#logForm").valid()){
			var uid = $("#logstuID").val();
			var password = $("#logpass").val();
			doLogin(uid,password);
			return false;
		}
		return false ;
	});

	$("#gosignup").click(function(){
		$("#log").css("display","none");
		$("#sign").css("display","block");
	});

	$("#backlog").click(function(){
		$("#log").css("display","block");
		$("#sign").css("display","none");
	});


	$("#signup").click(function(){
		if($("#signForm").valid()){
			var uid = $("#stuID").val();
			var password = $("#pass").val();
			var role = $("input[type='radio']:checked").val();
			var name = $("#name").val();
			var phonenum = $("#phonenumber").val();
			var email = $("#email").val();
			doReg(uid,password,name,role,phonenum,email);
			return false;
		}
		else{
			alert("注册信息有误!");
			return false;	
		}
		
	})

};