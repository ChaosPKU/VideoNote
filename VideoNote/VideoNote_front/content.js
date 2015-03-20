var SiteType = '';
function parseURL(){
    var host = window.location.host;
    if(host == 'class.coursera.org')
        SiteType = 'coursea';
    else if(host == 'courses.edx.org')
        SiteType = 'edx';
    else SiteType = 'normal';
};
$(document).ready(function(){
	parseURL();
    if(SiteType == 'edx')
    {
        $('video')[0].addEventListener('contextmenu',function(){
            if($('.edx-contextmenu').length && !$('#VideoNoteMunu').length)
            {
                var str = '<li class="menu-item edx-menu-item " aria-selected="false" role="menuitem" tabindex="-1" id="VideoNoteMunu">使用VideoNote对本视频做笔记</li>';
                $('.edx-contextmenu').append(str);
                $('#VideoNoteMunu')[0].addEventListener('click',function(){
                	window.open("chrome-extension://pkhjpigaehcjobgbikjkpfmbdeehmfhh/profile/index.html", '_blank');
                	var result = {'site':SiteType,'source':''};
                	result.source = $("video")[0].innerHTML;
                	chrome.runtime.sendMessage({operation:'setVideo',contents:result}, function(response) {  
					  console.log(response);  
					});  
                });
            }    
        })
    }
    else if(SiteType == 'coursea'){
    	chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
			if(message == "getVideo")
			{	
				//sendResponse($("iframe").contents().find("video")[0].innerHTML);
				var result = {'site':SiteType,"webm":"","mp4":""};
				$($("iframe").contents().find("video")[0].children).each(function(){
					if($(this).attr('type') == 'video/webm')
						result.webm = $(this).attr('src');
					else if($(this).attr('type') == 'video/mp4')
						result.mp4 = $(this).attr('src');
				})
				sendResponse(result);
			}
		});
    }
})
