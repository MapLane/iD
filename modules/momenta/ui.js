import {d3keybinding as d3_keybinding} from '../lib/d3.keybinding';
import {utilDetect} from '../util/detect';
import {uiCmd} from '../ui/cmd';
import {
    select as d3_select
} from 'd3-selection';
import {uiSave} from '../ui/save';
import {svgIcon} from '../svg';
import {t} from '../util/locale';
import {sendPost} from './utils';
import {url} from './url';

function addHideSideBarKEY() {
    var keybinding = d3_keybinding('hide-sideBar');
    var detected = utilDetect();
    var keys = detected.os === 'mac' ? uiCmd('⌘B') : uiCmd('⌘B');
    var setHide = function () {
        var select = window.id.container().select('#sidebar');
        select.classed('hide', !select.classed('hide'));
        window.onresizea();
    };
    // setTimeout(setHide,100);
    keybinding.on(keys, setHide);

    d3_select(document)
        .call(keybinding);
}
function uploadOSM(judgeResult) {
    var checkResult = {
        'user_id': 'pavelliu',
        'passwd': 'liushuming',
        'task_id': window.momentaPool.currentPackage,
        'task_type': 'check',
        'audit_flag': judgeResult.result
    }
    if (window.momentaPool && window.momentaPool.currentPackage){
        sendPost(url.check_ok,checkResult,function (result) {
            result = JSON.parse(result)
            console.log(result)
            if (result.status === 0){
                alert('审核通过:'+window.momentaPool.currentPackage);
            } else {
                alert('上传错误:'+window.momentaPool.currentPackage);
            }
        });
    }
}


function createPassButton() {
    var select = window.id.container().select('#bar');
    var dataSet = [{name: 'OK', 'result': 0}, {name:'NG', 'result':1}];
    var div = select
        .append('div')
        .attr('style','right: 10px;   width: 100px;  position: fixed;   z-index: 100;')
        .attr('class', 'button-wrap col1');
    var text = div.selectAll('text')
        .data(dataSet)
        .enter()
        .append('button')
        // .attr('id','checkPass')
        .attr('tabindex', -1)
        .attr('style', 'width: 50px')
        .on('click', uploadOSM)
        .append('span')
        .attr('class', 'label')
        .text(function(d,i){return d.name;});

    function changeButtonState() {
        var select = window.id.container().select('#checkButton');
        if (window.momentaPool && window.momentaPool.currentPackage){
            select.classed('disabled',false);
        } else {
            select.classed('disabled',true);
        }
    }
    window.momentaPool.changeButtonState =changeButtonState;
}
setTimeout(createPassButton,1000)
// window.createPassButton = createPassButton;
addHideSideBarKEY();
export {addHideSideBarKEY};

