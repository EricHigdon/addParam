function lockedFor(param, type) {
    if (param.locked.length > 0 && param.locked.indexOf(type) != -1)
        return true;
    else
        return false;
}
function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var parameters = JSON.parse(localStorage.getItem('parameters')),
            redirect = false;
        if (!parameters)
            parameters = [];
        var url = details.url;
        for (var i = 0; i < parameters.length; i++) {
            if (lockedFor(parameters[i], details.type) && url.indexOf(parameters[i].value) == -1) {
				var match = false;
				for (var index = 0; index < parameters[i].lockedUrls.length; index++) {
					var lockedUrl = parameters[i].lockedUrls[index];
					var re = new RegExp(escapeRegExp(lockedUrl), 'g');
					if (lockedUrl == '*' || url.match(re)) {
						match = true;
						break
					}
				}
				if (match) {
                	if (url.indexOf('?') > -1)
                    	url += '&';
                	else
                    	url += '?';
                	url += parameters[i].value;
                	redirect = true;
				}
            }
        }
        if (redirect)
            return {redirectUrl: url};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);
