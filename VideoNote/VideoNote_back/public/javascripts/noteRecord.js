window.addEventListener('message',function(e) {
    var msg = e.data;
    var $dataElement = $("#usrSelection");
    //console.log(msg);
    if(msg.key=="url"){
    	$dataElement.data("pdf_url",msg.value);
    	//alert(PDF_longurl);
    	//document.getElementById('PDFUrl').innerHTML = PDF_longurl;
    	//console.log($dataElement.data("pdf_url"));
    }
    else if(msg.key=="name"){
    	$dataElement.data("pdf_name",msg.value);
    	//alert(PDF_longurl);
    	//document.getElementById('PDFUrl').innerHTML = PDF_longurl;
    	//console.log($dataElement.data("pdf_name"));
    }
    else if(msg.key=="userid"){
    	$dataElement.data("user_ID",msg.value);
    	//alert(PDF_longurl);
    	//document.getElementById('PDFUrl').innerHTML = PDF_longurl;
    	//console.log($dataElement.data("user_ID"));
    }
    else if(msg.key=="selection"){
    	$dataElement.data("usr_selection",msg.value);
    	//console.log($dataElement.data("usr_selection"));
    }
    else if(msg.key=="about"){
    	if(msg.value != ""){
    		$dataElement.html('本页pdf中<strong class="text-info">"'+msg.value+'"</strong>这部分');
    	}
    	//console.log(msg.value);
    }
    else if(msg.key=="page"){
    	$dataElement.data("pdf_page",msg.value);
    	//console.log($dataElement.data("pdf_page"));
    }
	    
});

$(document).ready(
	function()
	{
		$('#redactor_content').redactor({ 	
			imageUpload: '/imageUpload',
			fileUpload: '/fileUpload'
		});

		$('#noteSubmit').click(function(){
			var $allData = $('#usrSelection');
			var note = {};
			note.title = $('#noteTitle').val();
			note.type = $('input[name="noteType"]:checked').val();
			note.relatedRange = $allData.data("usr_selection");
			note.body = $('#redactor_content').getCode();
            var smallAbstract = $(note.body).text();
            if(smallAbstract.length > 80){
                smallAbstract = smallAbstract.substring(0,80);
                smallAbstract = smallAbstract + "..."; 
            }
			note.abstract = smallAbstract;
			
			submitNote($allData.data("user_ID"), $allData.data("pdf_url"), $allData.data("pdf_name"), $allData.data("pdf_page"), note);
			/*
			console.log($allData.data("pdf_url"));
			console.log($allData.data("pdf_name"));
			console.log($allData.data("pdf_page"));
			*/
		});

		$('#mySuccessYes').click(function(){
			$('#myModalSuccess').modal('hide');
            var iframedata = new Object();
            iframedata.key="closeRecord" ;
			window.parent.postMessage(iframedata,'*');
		});

        //redactor的textarea被点得时候，大框框的边变化，聚焦美观一下。可惜不会
	}
);
