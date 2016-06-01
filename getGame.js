var userData;

function getData() {
    $.ajax({
        type: "GET",
        url: chrome.extension.getURL('/games.json'),
        success: function(data) {
        	userData = data;
        	//console.log(userData);
			var s = document.createElement('script');
			s.src = chrome.extension.getURL('script.js');
			s.dataset.userData = userData;
			s.onload = function() {
			    s.parentNode.removeChild(s);
			};
			(document.head||document.documentElement).appendChild(s);
            //setTimeout(begin, 5000);
        }
    });
}
getData();


