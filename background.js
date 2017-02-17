chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var parameters = JSON.parse(localStorage.getItem('parameters')),
            redirect = false;
        if (!parameters)
            parameters = [];
        var url = details.url;
        for (var i = 0; i < parameters.length; i++) {
            if (parameters[i].locked && url.indexOf(parameters[i].value) == -1) {
                if (url.indexOf('?') > -1)
                    url += '&';
                else
                    url += '?';
                url += parameters[i].value;
                redirect = true;
            }
        }
        if (redirect)
            return {redirectUrl: url};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);
