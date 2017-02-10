var parameters = JSON.parse(localStorage.getItem('parameters'));
if (!parameters)
    parameters = []

function addParam(value, locked) {
    if (value) {
        var param = '<p class="parameter"><span class="value">';
        param += value;
        param += '</span><span class="settings"><span class="';
        if (locked)
            param += 'unlock';
        else
            param += 'lock';
        param += '" title="Add this parameter to future requests"></span>';
        param += '<span class="remove" title="Remove parameter from list">-</span></span></p>';
        $('.parameters').append(param);
    }
}

function removeParam(param) {
    var value = param.find('.value').text();
    param.remove();
    for(var i = 0; i < parameters.length; i++) {
        if(parameters[i].value == value) {
            parameters.splice(i, 1);
            break;
        }
    }
    saveParams('');
}

function saveParams(value) {
    if (value)
        parameters.push({'value':value, 'locked':false});
    localStorage.setItem('parameters', JSON.stringify(parameters));
}

function toggleLocked(param) {
    var value = param.find('.value').text();
    for(var i = 0; i < parameters.length; i++) {
        if(parameters[i].value == value) {
            parameters[i].locked = !parameters[i].locked;
            break;
        }
    }
    saveParams('');
}

$(document).ready(function() {
    $.each(parameters, function() {
        addParam(this.value, this.locked);
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
            addParam($(this).val(), false);
            saveParams($(this).val());
            $(this).parent().remove();
        }
    });
    $('body').on('click', '.remove', function(e) {
        e.stopPropagation();
        console.log($(this).parent().parent());
        removeParam($(this).parent().parent());
    });
    $('body').on('click', '.lock, .unlock', function(e) {
        e.stopPropagation();
        if($(this).hasClass('lock'))
            $(this).removeClass('lock').addClass('unlock');
        else
            $(this).removeClass('unlock').addClass('lock');
        toggleLocked($(this).parent().parent());
    });
});
