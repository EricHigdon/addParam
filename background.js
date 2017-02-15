chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var parameters = JSON.parse(localStorage.getItem('parameters'));
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
            }
        }
        return {redirectUrl: url};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);
