var parameters = JSON.parse(localStorage.getItem('parameters')),
    types = ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"];
if (!parameters)
    parameters = []

function addParam(value, locked) {
    if (value) {
        var param = '<div class="parameter"><span class="value">';
        param += value;
        param += '</span><div class="settings"><div class="';
        if (locked.length > 0) {
            param += 'unlock';
            param += '" title="Stop adding this parameter to future requests">';
        }
        else {
            param += 'lock';
            param += '" title="Add this parameter to future requests">';
        }
        param += '<i class="gear"></i><div class="types"><i class="close">&times;</i><h3>Lock Parameter for Request Types</h3>';
        for (var i = 0; i < types.length; i++) {
            param += '<label><input value="' + types[i] + '" type="checkbox" ';
            if (locked.indexOf(types[i]) > -1)
                param += 'checked="checked" ';
            param += '/> ' + types[i] + '</label>';
        }
        param += '</div></div>';
        param += '<span class="remove" title="Remove parameter from list">-</span></div></div>';
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
    saveParams();
}

function saveParams(value=false) {
    if (value)
        parameters.push({'value':value, 'locked':[]});
    localStorage.setItem('parameters', JSON.stringify(parameters));
}

function lockFor(param, types=['main_frame']) {
    var value = param.find('.value').text();
    for(var i = 0; i < parameters.length; i++) {
        if(parameters[i].value == value) {
            param.find('.types input').each(function() {
                if (types.indexOf($(this).val()) > -1)
                    $(this).attr('checked', 'checked');
            });
            parameters[i].locked = types;
            break;
        }
    }
    saveParams();
}

function unlock(param) {
    var value = param.find('.value').text();
    for(var i = 0; i < parameters.length; i++) {
        if(parameters[i].value == value) {
            param.find('.types input').each(function() {
                $(this).removeAttr('checked');
            });
            parameters[i].locked = [];
            break;
        }
    }
    saveParams();
}
$(document).ready(function() {
    $.each(parameters, function() {
        addParam(this.value, this.locked);
    });
    $('body').on('click', '.addParam', function() {
        $(this).before('<div class="parameter"><input type="text"/><span class="caption">Press Enter to save</span></div>');
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
            addParam($(this).val(), []);
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
        if($(this).hasClass('lock')) {
            $(this).removeClass('lock').addClass('unlock');
            lockFor($(this).parent().parent());
        }
        else {
            $(this).removeClass('unlock').addClass('lock');
            unlock($(this).parent().parent());
        }
    });
    $('body').on('click', '.gear', function(e) {
        e.stopPropagation();
        var types = $(this).next();
        if (types.hasClass('active'))
            types.removeClass('active');
        else
            types.addClass('active');
    });
    $('body').on('change', '.types input', function() {
        var types = [],
            typeDiv = $(this).parent().parent();
        typeDiv.find('input:checked').each(function() {
            types.push($(this).val());
        });
        lockFor(typeDiv.parent().parent().parent(), types);
        if (types.length <=0) {
            typeDiv.parent().removeClass('unlock').addClass('lock');
        }
        else {
            typeDiv.parent().removeClass('lock').addClass('unlock');
        }
    });
    $('body').on('click', '.types', function(e) {
        e.stopPropagation();
    });
    $('body').on('click', '.types .close', function(e) {
        e.stopPropagation();
        $('.types.active').removeClass('active');
    });
});
