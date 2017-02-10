var parameters = JSON.parse(localStorage.getItem('parameters'));
if (!parameters)
    parameters = []
function addParam(value) {
    if (value) {
        var param = '<p class="parameter"><span class="value">' + value + '</span><span class="remove">-</span></p>';
        $('.parameters').append(param);
    }
}
function removeParam(param) {
    var value = param.find('.value').text(),
        index = parameters.indexOf(value);
    param.remove();
    if (index > -1) {
        parameters.splice(index, 1);
        saveParams('');
    }
}
function saveParams(value) {
    if (value)
        parameters.push(value);
    localStorage.setItem('parameters', JSON.stringify(parameters));
}
$(document).ready(function() {
    $.each(parameters, function() {
        addParam(this);
    });
    $('body').on('click', '.addParam', function() {
        $(this).before('<p><input type="text"/><span class="caption">Press Enter to save</span></p>');
        $('input').focus();
    });
    $('body').on('click', '.parameter', function() {
        var param = $(this).find('.value').text();
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            var tab = tabs[0],
                url = tab.url;
            if (url.indexOf('?') > -1)
                url += '&';
            else
                url += '?';
            url += param;
            chrome.tabs.update(tab.id, {url: url});
        });
    });
    $('body').on('keydown', 'input', function(e) {
        if (e.keyCode == 13) {
            addParam($(this).val());
            saveParams($(this).val());
            $(this).parent().remove();
        }
    });
    $('body').on('click', '.remove', function(e) {
        e.stopPropagation();
        console.log($(this).parent());
        removeParam($(this).parent());
    });
});
