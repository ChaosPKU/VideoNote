//$(document).ready(function(){
//    parseURL();
//    if(SiteType == 'edx')
//    {
//        $('video')[0].addEventListener('contextmenu',function(){
//            if($('.edx-contextmenu').length && !$('#VideoNoteMunu').length)
//            {
//                var str = '<li class="menu-item edx-menu-item " aria-selected="false" role="menuitem" tabindex="-1" id="VideoNoteMunu">使用VideoNote对本视频做笔记</li>';
//                $('.edx-contextmenu').append(str);
//                $('#VideoNoteMunu')[0].addEventListener('click',function(){
//                	window.open("chrome-extension://pkhjpigaehcjobgbikjkpfmbdeehmfhh/profile/index.html", '_blank');
//                	var result = {'site':SiteType,'source':''};
//                	result.source = $("video")[0].innerHTML;
//                	chrome.runtime.sendMessage({operation:'setVideo',contents:result}, function(response) {
//					  console.log(response);
//					});
//                });
//            }
//        })
//    }
//        chrome.runtime.sendMessage({operation:'setVideo',contents:$("video")}, function(response) {
//            console.log(response);
//        });
//})

$(document).ready(function(){
        chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
            if(message == "getVideo"){
                var result = {'src':'','poster':'','tracks':[]};
                var node = $("video")[0];
                result.src = $(node).attr('src');
                result.poster = $(node).attr('poster');
                $($(node)[0].children).each(function(){
                    var track = {'kind':'','label':'','srclang':'','src':''};
                    track.kind = $(this).attr('kind');
                    track.label = $(this).attr('label');
                    track.srclang = $(this).attr('srclang');
                    track.src = $(this).attr('src');
                    result.tracks.push(track);
                })
                sendResponse(result);
            }
        })
})