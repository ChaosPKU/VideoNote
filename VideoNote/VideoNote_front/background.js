chrome.contextMenus.create({
	'type':'normal',
	'title':'使用VideoNote对本视频做笔记',
	'id':'VideoMenus',
	'contexts':['video'],
    'onclick':getVideo,
    'documentUrlPatterns':[
        "http://*/*",
        "https://*/*",
        "ftp://*/*",
        "file://*/*"
    ]
});
function getVideo(info,tab){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { 
        chrome.tabs.sendMessage(tabs[0].id, "getVideo", function(response) {  
            window.open("/profile/index.html", '_blank');
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { 
                chrome.tabs.sendMessage(tabs[0].id, {operation:"setVideo",contents:response}, function(result) {  
                        console.log(result);
                });
            })
        });
    })
}
