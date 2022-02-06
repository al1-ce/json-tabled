var $ = jQuery = require('jquery');
const {clipboard} = require('electron');
const {dialog} = require('@electron/remote');

const fs = require('fs');



$(function() {
    updateTable();

    $('#add-col').on('click', function() {
        $('#num-col').val(function (i, val){ return Math.max(parseInt(val) + 1, 1);});
        updateTable();
    });
    $('#rem-col').on('click', function() {
        $('#num-col').val(function (i, val){ return Math.max(parseInt(val) - 1, 1); });
        updateTable();
    });
    $('#add-row').on('click', function() {
        $('#num-row').val(function (i, val){ return Math.max(parseInt(val) + 1, 1); });
        updateTable();
    });
    $('#rem-row').on('click', function() {
        $('#num-row').val(function (i, val){ return Math.max(parseInt(val) - 1, 1); });
        updateTable();
    });

    $('#num-col').on('change', function() {
        $('#num-col').val(Math.max(1, $('#num-col').val()));
        updateTable();
    });
    $('#num-row').on('change', function() {
        $('#num-row').val(Math.max(1, $('#num-row').val()));
        updateTable();
    });

    // $('#json-settings-button').on('click', function() {
    //     $('.dropdown-content').hide();
    // });
    
    $('#button-save-json').on('click', function() {
        $('#float-background').show();
        $('#json-input-window').show();
        $('#json-input').val(parseJSON());
    }); 
    $('#button-save-json-clip').on('click', async function() {
        updateClipboard(parseJSON());
    }); 
    $('#button-save-json-file').on('click', function() {
        // download(parseJSON(), 'json_table.json', 'json');
        let d = dialog.showSaveDialogSync(null, {
            defaultPath: "json_table.json"
        });
        if (typeof d == 'undefined') {
            dialog.showErrorBox('File Path is Incorrect.', '');
            return;
        }
        try { fs.writeFileSync(d, parseJSON(), 'utf-8'); }
        catch(e) { dialog.showErrorBox('Failed to save file.', ''); }
    }); 

    $('#button-load-json').on('click', function() {
        $('#float-background').show();
        $('#json-input-window').show();
        $('#json-input').val(function(i, val) {
            if (val == '') return '[]';
            return val;
        });
    }); 
    $('#button-load-json-clip').on('click', function() {
        let cont = clipboard.readText('selection');
        console.log(cont);
        readJSON(cont);
        // console.log(text);
    }); 
    $('#button-load-json-file').on('click', function() {
        // $('#json-file-input').trigger('click');
        
        let file = dialog.showOpenDialogSync(null, {
            'filters': [
                {name: 'JSON', extensions: ['json']},
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        console.log(file);
        let cont = fs.readFileSync(file[0], 'utf8');
        console.log(cont);
        readJSON(cont);
    }); 
    $('#json-input-load').on('click', function() {
        // TODO load JSON
        readJSON($('#json-input').val());
        $('#float-background').hide();
        $('#json-input-window').hide();
        $('#json-input').val('');
    }); 
    $('#json-input-cancel').on('click', function() {
        $('#float-background').hide();
        $('#json-input-window').hide();
    });
    $('#slider-col').on('change', function() {
        $('.table-input').css('min-width', `${$('#slider-col').val()}em`);
    });
});


function updateTable() {
    const tableHead = $('#table-head').children().eq(0);
    const tableBody = $('#table-body');

    const colNum = parseInt($('#num-col').val()) + 1;
    const rowNum = parseInt($('#num-row').val());

    const input = `input type="text" class="table-input" size="40"`;
    let headLength;
    while((headLength = tableHead.children().length) != colNum) {
        if (headLength > colNum) {
            tableHead.children().eq(headLength - 1).remove();
        } else
        if (headLength < colNum) {
            tableHead.append(`<th><${input} value="head_${headLength}" id="tb-head-${headLength - 1}" /></th>`);
        } 
    }
    
    let bodyLength;
    while((bodyLength = tableBody.children().length) != rowNum) {
        if (bodyLength > rowNum) {
            tableBody.children().eq(bodyLength - 1).remove();
        } else
        if (bodyLength < rowNum) {
            tableBody.append(`<tr><td>${bodyLength + 1}</td></tr>`);
        } 
    }

    for (let i = 0; i < bodyLength; i ++) {
        let col = tableBody.children().eq(i);
        let colLen;
        while((colLen = col.children().length) != colNum) {
            if (colLen > colNum) {
                col.children()[colLen - 1].remove();
            } else
            if (colLen < colNum) {
                col.append(`<td><${input} id="tb-val-${i}-${colLen - 1}" /></td>`);
            } 
        }
    }
    $('.table-input').css('min-width', `${$('#slider-col').val()}em`);
}

function readJSON(json_string) {
    let json;
    try {
        json = JSON.parse(json_string);
    } catch (e) {
        showError();
        return;
    }

    let len = json.length;
    let keys = [];
    for (let i = 0; i < len; i ++) {
        let row = json[i];
        for (let k in row) {
            if (!keys.includes(k)) {
                $(`#tb-head-${keys.length}`).val(k);
                keys.push(k);
            }
        }
    }
    console.log(keys);
    $('#num-col').val(keys.length);
    $('#num-row').val(len);
    updateTable();
    // head id's - tb-head-${idx}
    // val id's  - tb-val-${idx}-${val}

    for (let i = 0; i < len; i ++) {
        let row = json[i];
        for (let j = 0; j < keys.length; j ++) {
            let key = keys[j];
            if (key in row) {
                $(`#tb-val-${i}-${j}`).val(row[key]);
            }
        }
    }

    // $('#num-col').val();
    // $('#num-row').val();
}

function showError() {
    dialog.showErrorBox('JSON parse Error.', 'Please check your JSON.');
}

function parseJSON() {
    const colNum = parseInt($('#num-col').val());
    const rowNum = parseInt($('#num-row').val());

    let json = '[\n';

    // head id's - tb-head-${idx}
    // val id's  - tb-val-${idx}-${val}

    let headers = [];

    for (let i = 0; i < colNum; i ++) {
        let $elem = $(`#tb-head-${i}`);
        headers[i] = $elem.val().replace(' ', '') == '' ? 'null' : $elem.val();
    }

    for (let i = 0; i < rowNum; i ++) {
        let rowJSON = '    {\n';
        for (let j = 0; j < headers.length; j ++) {
            let $elem = $(`#tb-val-${i}-${j}`);
            rowJSON += `        "${headers[j]}" : "${$elem.val()}"`;
            rowJSON += (j == headers.length - 1) ? '\n' : ',\n';
        }
        rowJSON += '    }';
        rowJSON += (i == rowNum - 1) ? '\n' : ',\n';
        json += rowJSON;
    }

    json += ']';

    return json;
}

function updateClipboard(newClip) {
    clipboard.writeText(newClip, 'selection');
    dialog.showMessageBoxSync(null, {
        'message': 'JSON copied to clipboard',
        'title': 'JSON Tabled'
    });
    // alert('JSON copied to clipboard');
}


/*
    Table structure example:
    | index | type | value | time  |
    |:------|:-----|:------|:------|
    | 0     | n    | 1     | 12:00 |
    | 1     | s    | val   | 13:00 |
    | 2     | n    | 451   | 21:00 |
    Output JSON:
    [{
        "index": "0",
        "type": "n",
        "value": "1",
        "time": "12:00"
    }, {
        "index": "1",
        "type": "s",
        "value": "val",
        "time": "13:00"
    }, {
        "index": "2",
        "type": "n",
        "value": "451",
        "time": "21:00"
    }]
*/