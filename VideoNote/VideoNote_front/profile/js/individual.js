function request(paras) {
    var url = location.href;
    var paraString = url.substring(url.indexOf("?") + 1, url.length).split("&");
    var paraObj = {}
    for (i = 0; j = paraString[i]; i++){
        paraObj[ j.substring(0,j.indexOf("=")).toLowerCase() ] = j.substring(j.indexOf("=") + 1, j.length);
    }
    var returnValue = paraObj[paras.toLowerCase()];
    if( typeof( returnValue ) == "undefined" ) {
        return "";
    } else {
        return returnValue;
    }
}
function formatTime(second) {
    return [parseInt(second / 60 / 60), parseInt(second / 60) % 60, parseInt(second % 60)].join(":").replace(/\b(\d)\b/g, "0$1");
}
function updateProfileUI(response){
    $("#user_id").html(response.baseInfo.userID);
    if(response.baseInfo.userID != localStorage.id)
        $('#userProfile .btn').attr({"disabled":"true"});
    $("#nickname").val(response.baseInfo.nickname);
    $("#cellphone").val(response.baseInfo.mobilephone);
    $("#email").val(response.baseInfo.email);
    $(".headarea").find("img").attr({"src":response.baseInfo.head});
    var str = '';
    for(var i = 0;i < response.messages.noteMessage.length; ++ i){
        str += "<div class='timeNotes' data-slotIndex='";
        str += response.messages.noteMessage[i].slotIndex;
        str += "' data-noteIndex='";
        str += response.messages.noteMessage[i].noteIndex;
        str += "' data-URL = '";
        str += response.messages.noteMessage[i].URL;
        str += "' data-from = '";
        str += response.messages.noteMessage[i].from;
        str += "' data-videoTime = '";
        str += response.messages.noteMessage[i].videoTime;
        str += "' ><img src = ";
        str += "http://127.0.0.1:8880/usersUploads/screenshot/" + response.messages.noteMessage[i]._time + "_.jpeg";
        str += " class='capImg'/><div class='noFocused focused'><div class='round'></div></div><div class='notesCard '><div class='notesmsg'>";
        str += response.messages.noteMessage[i].title;
        str += "</div><div class='fromUser'><span class='fui-user'></span>";
        str += response.messages.noteMessage[i].from;
        str += "</div><div class='createTime'><span class='fui-calendar'></span>";
        str += response.messages.noteMessage[i].time;
        str += "</div><div class='videoTime'>";
        str += formatTime(response.messages.noteMessage[i].videoTime);
        str += "</div></div></div>";
    }
    for(var i = 0;i < response.messages.concernMessage.length; ++ i){
        str += "<div class='timeNotes' data-slotIndex='";
        str += response.messages.concernMessage[i].slotIndex;
        str += "' data-noteIndex='";
        str += response.messages.concernMessage[i].noteIndex;
        str += "' data-URL = '";
        str += response.messages.concernMessage[i].URL;
        str += "' data-from = '";
        str += response.messages.concernMessage[i].from;
        str += "' data-videoTime = '";
        str += response.messages.concernMessage[i].videoTime;
        str += "' ><img src = ";
        str += "http://127.0.0.1:8880/usersUploads/screenshot/" + response.messages.concernMessage[i]._time + "_.jpeg";
        str += " class='capImg'/><div class='noFocused focused'><div class='round'></div></div><div class='notesCard '><div class='notesmsg'>";
        str += response.messages.concernMessage[i].title;
        str += "</div><div class='fromUser'><span class='fui-user'></span>";
        str += response.messages.concernMessage[i].from;
        str += "</div><div class='createTime'><span class='fui-calendar'></span>";
        str += response.messages.concernMessage[i].time;
        str += "</div><div class='videoTime'>";
        str += formatTime(response.messages.concernMessage[i].videoTime);
        str += "</div></div></div>";
    }
    $("#nav-div-2 .notesGroup").html(str);
    str = '';
    for(var i = 0;i < response.notes.length; ++ i){
        str += "<div class='timeNotes' data-slotIndex='";
        str += response.notes[i].slotIndex;
        str += "' data-noteIndex='";
        str += response.notes[i].noteIndex;
        str += "' data-URL = '";
        str += response.notes[i].URL;
        str += "' data-from = '";
        str += response.notes[i].from;
        str += "' data-videoTime = '";
        str += response.notes[i].videoTime;
        str += "' ><img src = ";
        str += "http://127.0.0.1:8880/usersUploads/screenshot/" + response.notes[i]._time + "_.jpeg";
        str += " class='capImg'/><div class='noFocused focused'><div class='round'></div></div><div class='notesCard '><div class='notesmsg'>";
        str += response.notes[i].title;
        str += "</div><div class='fromUser'><span class='fui-user'></span>";
        str += response.notes[i].from;
        str += "</div><div class='createTime'><span class='fui-calendar'></span>";
        str += response.notes[i].time;
        str += "</div><div class='videoTime'>";
        str += formatTime(response.notes[i].videoTime);
        str += "</div></div></div>";
    }
    $("#nav-div-3 .notesGroup").html(str);
    str = '';
    for(var i = 0;i < response.concerns.length; ++ i){
        str += "<div class='timeNotes' data-slotIndex='";
        str += response.concerns[i].slotIndex;
        str += "' data-noteIndex='";
        str += response.concerns[i].noteIndex;
        str += "' data-URL = '";
        str += response.concerns[i].URL;
        str += "' data-from = '";
        str += response.concerns[i].from;
        str += "' data-videoTime = '";
        str += response.concerns[i].videoTime;
        str += "' ><img src = ";
        str += "http://127.0.0.1:8880/usersUploads/screenshot/" + response.concerns[i]._time + "_.jpeg";
        str += " class='capImg'/><div class='noFocused focused'><div class='round'></div></div><div class='notesCard '><div class='notesmsg'>";
        str += response.concerns[i].title;
        str += "</div><div class='fromUser'><span class='fui-user'></span>";
        str += response.concerns[i].from;
        str += "</div><div class='createTime'><span class='fui-calendar'></span>";
        str += response.concerns[i].time;
        str += "</div><div class='videoTime'>";
        str += formatTime(response.concerns[i].videoTime);
        str += "</div></div></div>";
    }
    $("#nav-div-4 .notesGroup").html(str);
    str = '';
    for(var i = 0;i < response.collects.length; ++ i){
        str += "<div class='timeNotes' data-slotIndex='";
        str += response.collects[i].slotIndex;
        str += "' data-noteIndex='";
        str += response.collects[i].noteIndex;
        str += "' data-URL = '";
        str += response.collects[i].URL;
        str += "' data-from = '";
        str += response.collects[i].from;
        str += "' data-videoTime = '";
        str += response.collects[i].videoTime;
        str += "' ><img src = ";
        str += "http://127.0.0.1:8880/usersUploads/screenshot/" + response.collects[i]._time + "_.jpeg";
        str += " class='capImg'/><div class='noFocused focused'><div class='round'></div></div><div class='notesCard '><div class='notesmsg'>";
        str += response.collects[i].title;
        str += "</div><div class='fromUser'><span class='fui-user'></span>";
        str += response.collects[i].from;
        str += "</div><div class='createTime'><span class='fui-calendar'></span>";
        str += response.collects[i].time;
        str += "</div><div class='videoTime'>";
        str += formatTime(response.collects[i].videoTime);
        str += "</div></div></div>";
    }
    $("#nav-div-5 .notesGroup").html(str);

    $(".timeNotes").click(function(){
        var content = $(this).data();
        chrome.tabs.create({url: "./profile/index.html"}, function (tab) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {operation:"setNote",contents:content}, function(result) {
                    console.log(result);
                });
            })
        });
    })
}
$(document).ready(function() {
    //SWTICH SVG TO PNG
    if (!$("html").hasClass("svg")) {
        $("span.svg").remove();
        $('.nosvg').attr('style', 'display:block !important;');
    }
    else{
        $("span.svg").attr('style', 'display:block !important;');
        $('.nosvg').remove();
    }
    //================================================================================================
    //================================================================================================
    //==================================                            ==================================
    //==================================        SVG ANIMATION       ==================================
    //==================================                            ==================================
    //================================================================================================
    //================================================================================================

    //CLOCK ANIMATION
    function startTicking() {
        newInt = window.setInterval(function() {

            var d = new Date();
            var h = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();

            h = (h > 12) ? h - 12 : h;
            h = (h == '00') ? 12 : h;

            var secangle = (s) * 6;
            var minangle = (m) * 6;
            var hrsangle = h * 30;

            jQuerysvg = jQuery("#clock");

            if (s == 0) {
                jQuery("#sec", jQuerysvg).attr('transform', "rotate(" + secangle + ",50,50)");
            }

            jQuery("#sec", jQuerysvg).animate({
                svgTransform: 'rotate(' + secangle + ',50,50)'
            }, {
                duration: 400,
                easing: 'easeOutElastic'
            });
            jQuery("#min", jQuerysvg).animate({
                svgTransform: 'rotate(' + minangle + ',50,50)'
            }, {
                duration: 600,
                easing: 'easeOutElastic'
            });
            jQuery("#hrs", jQuerysvg).animate({
                svgTransform: 'rotate(' + hrsangle + ',50,50)'
            }, {
                duration: 800,
                easing: 'easeOutElastic'
            });

        }, 1000);
    }
    jQuery('#clock').hover(function() {

        var d = new Date();
        var h = d.getHours();
        var m = d.getMinutes();
        var s = d.getSeconds();

        h = (h > 12) ? h - 12 : h;
        h = (h == '00') ? 12 : h;

        var secangle = (s) * 6;
        var minangle = (m) * 6;
        var hrsangle = h * 30;

        jQuerysvg = jQuery("#clock");

        jQuery("#sec", jQuerysvg).animate({
            svgTransform: 'rotate(' + secangle + ',50,50)'
        }, {
            duration: 400,
            easing: 'easeOutElastic'
        });
        jQuery("#min", jQuerysvg).animate({
            svgTransform: 'rotate(' + minangle + ',50,50)'
        }, {
            duration: 400,
            easing: 'easeOutElastic'
        });
        jQuery("#hrs", jQuerysvg).animate({
            svgTransform: 'rotate(' + hrsangle + ',50,50)'
        }, {
            duration: 600,
            easing: 'easeOutElastic'
        });

        startTicking();

    }, function() {
        window.clearInterval(newInt);
    });


    //================================================================================================
    //SWATCHES
    jQuery('#swatches').hover(function() {
        jQuerysvg = jQuery('#swatches');
        rotate();

    }, function() {
        jQuery('#body-1').stop(true).animate({
            svgFill: "#29bb9c"
        }, 500);
        jQuery('#body-2').stop(true).animate({
            svgFill: "#e54d42"
        }, 500);

    }).click(function() {
        jQuerysvg = jQuery('#swatches');
        var colors = new Array('#1abc9c', '#2dc86f', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#34495e');

        newcolor1 = getRandomInt(0, colors.length)
        newcolor2 = getRandomInt(0, colors.length)

        if (newcolor1 == newcolor2) {
            newcolor1 = getRandomInt(0, colors.length);
        }

        jQuery('#body-1').stop(true).animate({
            svgFill: colors[newcolor1]
        }, 500);
        jQuery('#body-2').stop(true).animate({
            svgFill: colors[newcolor2]
        }, 500);

        rotate();
    });
    newangle = 0;
    function rotate() {
        newangle = newangle - 180;
        jQuery('#pen-1', jQuerysvg).stop(true).animate({
            svgTransform: 'rotate(' + newangle + ',50,50)'
        }, {
            duration: 1400,
            easing: 'easeOutElastic'
        });
        jQuery('#pen-2', jQuerysvg).stop(true).animate({
            svgTransform: 'rotate(' + newangle + ',50,50)'
        }, {
            duration: 1500,
            easing: 'easeOutElastic'
        });

        var nf1 = jQuery('#inner-2', jQuerysvg).attr('fill');
        var nf2 = jQuery('#inner-1', jQuerysvg).attr('fill');
    }

    //服务器部分
    getProfiles(request("want"),updateProfileUI);
    $("button[type=button]").click(function(){
        var user_id = $("#user_id").html();
        if(user_id == localStorage.id) {
            updateProfiles(user_id,$("#nickname").val(),$("#cellphone").val(),$("#email").val());
        }
        else
            alert("抱歉，你不能修改此人的基本信息！");
    })
    var headPopSetting = {
        placement: "bottom",
        html: true,
        container: "body",
        selector: "#changehead",
        animation:true,
        title: function() {
            return "头像的最佳尺寸为128*128";
        },
        content: function() {
            return '<form id="headForm" enctype="multipart/form-data" method="post" action="">' +
                '<input type="file" name="file" id="headUpdate" style="width:240px" accept="image/*" />' +
                '</form>' +
                '<button class="btn btn-primary" id="uploadHead" style="margin-left:20px">上传头像</button>'+
                '<button class="btn btn-success" id="saveHead" style="margin-left:30px">保存修改</button>';
        }
    };
    $("#changehead").popover(headPopSetting);
    $("#changehead").click(function(){
        $("#changehead").popover("toggle");
        $("#uploadHead").click(function(){
            if($("#headUpdate").val()){
                var form = document.getElementById("headForm");
                var form_data = new FormData(form);
                uploadHead(form_data);
                $(this).text("上传中...");
            }
        })
        $("#saveHead").click(function(){
            if($("#headUpdate").val()){
                var userID = localStorage.id;
                var head = $(".headarea").find("img").attr("src");
                saveHead(userID, head);
                $(this).text("保存中...");
            }
        })
    })
});
$(".todo > ul > li").click(function(){
    $(this.dataset.target).toggle();
})