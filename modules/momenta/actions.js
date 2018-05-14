
import {
    convert2JSON,sendPost
} from './utils';
import {url} from './url';
import {actionAddEntity,actionDeleteNode,actionDeleteWay,actionCopyEntities} from '../actions';
import {osmNode,osmWay,osmRelation} from '../osm';
import {} from './ui';
import { services } from '../services';

function createEntity(ele,type){
    if (ele.type==='node'||type === 'node'||(ele.tags!=null && ele.tags.tableInfo==='poles'|| ele.tags.tableInfo==='boards')){
        delete ele.type;
        return new osmNode(ele);
    }
    if (ele.type === 'way'||type === 'way'||(ele.tags!=null && ele.tags.tableInfo==='lane_lines')){
        delete ele.type;
        return new osmWay(ele);
    }

}
function deleteLines(selectIds,context) {
    // var data = convert2JSON(selectIds,context);
    return function deleteLine(graph){
        selectIds.forEach(function (item,i) {
            if (item.indexOf('n')>-1){
                graph = actionDeleteNode(item)(graph);
            }
            if (item.indexOf('w')>-1){
                var ele = context.entity(item);
                graph = actionDeleteWay(item)(graph);
                var nodes = ele.nodes;
                nodes.forEach(function (node,index) {
                    graph = actionDeleteNode(node)(graph);
                });
            }
        });
        return graph;
    };
}
function actionFillInfo(selectIds,context) {
    return function deleteLine(graph){
        var sumValue=0.0,sumSize=0;
        selectIds.forEach(function (item,i) {
            var ele = context.entity(item);
            if (ele.type === 'node'){
                if (ele.tags.ele != null){
                    sumValue += parseFloat(ele.tags.ele);
                    sumSize++;
                }
            }
        });
        var eleValue = sumValue/sumSize;
        selectIds.forEach(function (item,i) {
            var ele = context.entity(item);
            if (ele.type === 'node'){
                if (ele.tags.ele == null){
                    ele.tags.ele = ''+eleValue;
                    graph = actionAddEntity(ele)(graph);
                }
            }
            if (ele.type === 'way'){
                var nodes = ele.nodes;
                nodes.forEach(function (it1) {
                    var n = context.entity(it1);
                    n.tags.ele = ''+eleValue;
                    graph = actionAddEntity(n)(graph);
                });
                // if (ele.tags.ele == null){
                //     ele.tags.ele = eleValue;
                //     graph = actionAddEntity(ele)(graph);
                // }
            }
        });
        return graph;
    };
}
function createLineSegment(selectIds,context) {
    var data = convert2JSON(selectIds,context);
    return function createLineSegmentAction(graph) {
        var result = sendPost(url.host+url.createSeg,{value:data,type:'new'});
        result = JSON.parse(result);
        var deleteEles = result.deleted;
        var createEles = result.created;
        var modifyEles = result.modified;//暂时没有modify
        var i=0,entity;
        for (i=0; i<deleteEles.length; i++){
            var ele = deleteEles[i];
            if (ele.id.indexOf('n')>-1){
                var node = graph.entity(ele.id);
                var parentWays = graph.parentWays(node);
                if (parentWays.length<=0){
                    graph = actionDeleteNode(ele.id)(graph);
                }
            }
            if (ele.id.indexOf('w')>-1){
                graph = actionDeleteWay(ele.id)(graph);
            }
        }
        for (i=0; i<createEles.length; i++){

            var ele2 = createEles[i];
            if (ele2.nodes!=null){
                var ids = [];
                var nodes = ele2.nodes;
                for (var i1=0; i1<nodes.length; i1++){
                    var node1 = nodes[i1];
                    var nod = createEntity(node1,'node');
                    ids.push(nod.id);
                    graph = actionAddEntity(nod)(graph);
                }
                ele2.nodes = ids;
                var way = createEntity(ele2,'way');
                graph = actionAddEntity(way)(graph);
            } else {
                graph = actionAddEntity(createEntity(ele2,'way'))(graph);
            }
            // entity = createEntity(ele2);
            // graph = actionAddEntity(entity)(graph);
        }
        for (i=0; i<modifyEles.length; i++){
            entity = createEntity(modifyEles[i]);

            graph = actionAddEntity(entity)(graph);
        }
        return graph;
    };
}

function brokeWay(selectIds,context) {
    var way_id = selectIds[0].substring(1);
    return function brokeWayAction(graph) {
        window.brokeWayCmd(way_id,false);
        return graph;
    };
}

function createAddMorePoints(selectIds,context) {
    var data = convert2JSON(selectIds,context);
    return function createAdd(graph) {
        var result = sendPost(url.host+url.createSeg,{value:data,type:'addpoints'});
        result = JSON.parse(result);
        var deleteEles = result.deleted;
        var createEles = result.created;
        var modifyEles = result.modified;//暂时没有modify
        var i=0,entity;
        for (i=0; i<deleteEles.length; i++){
            var ele = deleteEles[i];
            if (ele.id.indexOf('n')>-1){
                graph = actionDeleteNode(ele.id)(graph);
            }
            if (ele.id.indexOf('w')>-1){
                graph = actionDeleteWay(ele.id)(graph);
            }
        }
        for (i=0; i<createEles.length; i++){

            var ele2 = createEles[i];
            if (ele2.nodes!=null){
                var ids = [];
                var nodes = ele2.nodes;
                for (var i1=0; i1<nodes.length; i1++){
                    var node = nodes[i1];
                    var nod = createEntity(node,'node');
                    ids.push(nod.id);
                    graph = actionAddEntity(nod)(graph);
                }
                ele2.nodes = ids;
                var way = createEntity(ele2,'way');
                graph = actionAddEntity(way)(graph);
            } else {
                graph = actionAddEntity(createEntity(ele2,'way'))(graph);
            }
            // entity = createEntity(ele2);
            // graph = actionAddEntity(entity)(graph);
        }
        for (i=0; i<modifyEles.length; i++){
            entity = createEntity(modifyEles[i]);

            graph = actionAddEntity(entity)(graph);
        }
        return graph;
    };
}

function actionMerge(selectIds,context) {
    var data = convert2JSON(selectIds,context);
    return function createLineSegmentAction(graph) {
        var result = sendPost(url.host+url.mergePoints,data);
        result = JSON.parse(result);
        var deleteEles = result.deleted;
        var createEles = result.created;
        var modifyEles = result.modified;//暂时没有modify
        var i=0,entity;
        for (i=0; i<deleteEles.length; i++){
            var ele = deleteEles[i];
            if (ele.type === 'node'){
                graph = actionDeleteNode(ele.id)(graph);
            }
            if (ele.type === 'way'){
                graph = actionDeleteWay(ele.id)(graph);
            }
        }
        for (i=0; i<createEles.length; i++){
            entity = createEntity(createEles[i]);
            graph = actionAddEntity(entity)(graph);
        }
        for (i=0; i<modifyEles.length; i++){
            entity = createEntity(modifyEles[i]);

            graph = actionAddEntity(entity)(graph);
        }
        return graph;
    };
}

function actionMomentaStraighten(selectIds, context) {
    var data = convert2JSON(selectIds,context);
    return function createLineSegmentAction(graph) {
        var result = sendPost(url.host+url.createSeg,{value:data,type:'straighten'});
        result = JSON.parse(result);
        var deleteEles = result.deleted;
        var createEles = result.created;
        var modifyEles = result.modified;//暂时没有modify
        var i=0,entity;
        for (i=0; i<deleteEles.length; i++){
            var ele = deleteEles[i];
            if (ele.id.indexOf('n')>-1){
                graph = actionDeleteNode(ele.id)(graph);
            }
            if (ele.id.indexOf('w')>-1){
                graph = actionDeleteWay(ele.id)(graph);
            }
        }
        for (i=0; i<createEles.length; i++){

            var ele2 = createEles[i];
            if (ele2.nodes!=null){
                var ids = [];
                var nodes = ele2.nodes;
                for (var i1=0; i1<nodes.length; i1++){
                    var node = nodes[i1];
                    var nod = createEntity(node,'node');
                    ids.push(nod.id);
                    graph = actionAddEntity(nod)(graph);
                }
                ele2.nodes = ids;
                var way = createEntity(ele2,'way');
                graph = actionAddEntity(way)(graph);
            } else {
                graph = actionAddEntity(createEntity(ele2,'way'))(graph);
            }
            // entity = createEntity(ele2);
            // graph = actionAddEntity(entity)(graph);
        }
        for (i=0; i<modifyEles.length; i++){
            entity = createEntity(modifyEles[i]);

            graph = actionAddEntity(entity)(graph);
        }
        return graph;
    };
}

function actionConvertDirection(selectIds, context) {
    var data = convert2JSON(selectIds,context);
    return function createLineSegmentAction(graph) {
        var result = sendPost(url.host+url.createSeg,{value:data,type:'convertDirection'});
        result = JSON.parse(result);
        var deleteEles = result.deleted;
        var createEles = result.created;
        var modifyEles = result.modified;//暂时没有modify
        var i=0,entity;
        for (i=0; i<deleteEles.length; i++){
            var ele = deleteEles[i];
            if (ele.id.indexOf('n')>-1){
                graph = actionDeleteNode(ele.id)(graph);
            }
            if (ele.id.indexOf('w')>-1){
                graph = actionDeleteWay(ele.id)(graph);
            }
        }
        for (i=0; i<createEles.length; i++){

            var ele2 = createEles[i];
            if (ele2.nodes!=null){
                var ids = [];
                var nodes = ele2.nodes;
                for (var i1=0; i1<nodes.length; i1++){
                    var node = nodes[i1];
                    var nod = createEntity(node,'node');
                    ids.push(nod.id);
                    graph = actionAddEntity(nod)(graph);
                }
                ele2.nodes = ids;
                var way = createEntity(ele2,'way');
                graph = actionAddEntity(way)(graph);
            } else {
                graph = actionAddEntity(createEntity(ele2,'way'))(graph);
            }
            // entity = createEntity(ele2);
            // graph = actionAddEntity(entity)(graph);
        }
        for (i=0; i<modifyEles.length; i++){
            entity = createEntity(modifyEles[i]);

            graph = actionAddEntity(entity)(graph);
        }
        return graph;
    };
}


function actionConvertLineType(selectIds, context) {
    // var data = convert2JSON(selectIds,context);

    return function convertLineType(graph){
        var copies = {};
        selectIds.forEach(function (item,i) {
            var ele = context.entity(item);
            if (ele.type === 'way'){
                graph.entity(ele.id).copy(graph, copies);
                if (ele.tags.type === 'dashed'){
                    copies[ele.id].tags.highway = 'lane-white-solid';
                    copies[ele.id].tags.type = 'solid';
                } else if (ele.tags.type === 'solid'){
                    copies[ele.id].tags.highway = 'lane-white-dash';
                    copies[ele.id].tags.type = 'dashed';
                }
                actionDeleteWay(ele.id);
                actionAddEntity(copies[ele.id]);
            }
        });


        return graph;
    };

}

function actionGetLocation(selectIds, context) {
    // var data = convert2JSON(selectIds,context);

    return function convertLocation(graph){
        var copies = {};
        selectIds.forEach(function (item,i) {
            var ele = context.entity(item);
            if (ele.type === 'node'){
                var loc = ele.loc;
                alert(loc[0]+','+loc[1]);
            }
            if (ele.type === 'way'){
                var id = ele.id;
                alert(id.substr(1));
            }
        });


        return graph;
    };

}

function showMutiSegs(selectIds, context) {
    var data = convert2JSON(selectIds,context);
    return function createAdd(graph) {
        var result = sendPost(url.host+url.createSeg,{value:data,type:'showSegs'});
        result = JSON.parse(result);
        var deleteEles = result.deleted;
        var createEles = result.created;
        var modifyEles = result.modified;//暂时没有modify
        var i=0,entity;
        for (i=0; i<deleteEles.length; i++){
            var ele = deleteEles[i];
            if (ele.id.indexOf('n')>-1){
                graph = actionDeleteNode(ele.id)(graph);
            }
            if (ele.id.indexOf('w')>-1){
                graph = actionDeleteWay(ele.id)(graph);
            }
        }
        for (i=0; i<createEles.length; i++){

            var ele2 = createEles[i];
            if (ele2.nodes!=null){
                var ids = [];
                var nodes = ele2.nodes;
                for (var i1=0; i1<nodes.length; i1++){
                    var node = nodes[i1];
                    var nod = createEntity(node,'node');
                    ids.push(nod.id);
                    graph = actionAddEntity(nod)(graph);
                }
                ele2.nodes = ids;
                var way = createEntity(ele2,'way');
                graph = actionAddEntity(way)(graph);
            } else {
                graph = actionAddEntity(createEntity(ele2,'way'))(graph);
            }
            // entity = createEntity(ele2);
            // graph = actionAddEntity(entity)(graph);
        }
        for (i=0; i<modifyEles.length; i++){
            entity = createEntity(modifyEles[i]);

            graph = actionAddEntity(entity)(graph);
        }
        return graph;
    };
}

function actionAddStopLine(selectIds, context) {
    // var data = convert2JSON(selectIds,context);

    return function convertLineType(graph){
        var copies = {};
        selectIds.forEach(function (item,i) {
            var ele = context.entity(item);
            if (ele.type === 'way'){
                graph.entity(ele.id).copy(graph, copies);
                copies[ele.id].tags.highway = 'lane-white-solid';
                copies[ele.id].tags.type = 'solid';
                copies[ele.id].tags.tableInfo = 'lane_lines';
                copies[ele.id].tags.merge_count = 1;

                // if (ele.tags.type === 'dashed'){
                //     copies[ele.id].tags.highway = 'lane-white-solid';
                //     copies[ele.id].tags.type = 'solid';
                // }else if (ele.tags.type === 'solid'){
                //     copies[ele.id].tags.highway = 'lane-white-dash';
                //     copies[ele.id].tags.type = 'dashed';
                // }
                actionDeleteWay(ele.id);
                actionAddEntity(copies[ele.id]);
            }
        });


        return graph;
    };

}

function addPackage(result) {
    return function clearAll(graph) {
        // var graph = context.graph();

        // function deleteElement(entities) {
        //     for (var ele in entities) {
        //         // if (ele.indexOf('n')>-1){
        //         //     graph = actionDeleteNode(ele)(graph);
        //         // }
        //         if (ele.indexOf('w')>-1){
        //             var entity = entities[ele];
        //             if (entity){
        //                 graph = actionDeleteWay(ele)(graph);
        //                 for (var ndindex in entity.nodes){
        //                     graph = actionDeleteNode(entity.nodes[ndindex])(graph);
        //                 }
        //             }
        //         }
        //     }
        // }
        // var entities = graph.entities;
        // deleteElement(entities);

        // var result = sendPost(url.check_host,{'packageIds':packageId},function (data) {
        //
        // });
        // result = JSON.parse(result);
        // if (result.center){
        //     var center = result.center;
        //     window.id.map().center(center);
        //     window.id.map().zoom(18);
        // }
        // // window.id.map().center([-77.0, 38.9]);
        // // window.id.map().zoom(2.0);
        // var createEles = result.created;

        for (var i=0; i<result.length; i++){

            var ele2 = result[i];
            if (ele2.nodes!=null){
                var ids = [];
                var nodes = ele2.nodes;
                for (var i1=0; i1<nodes.length; i1++){
                    var node1 = nodes[i1];
                    var nod = createEntity(node1,'node');
                    ids.push(nod.id);
                    graph = actionAddEntity(nod)(graph);
                }
                ele2.nodes = ids;
                var way = createEntity(ele2,'way');
                graph = actionAddEntity(way)(graph);
            } else {
                graph = actionAddEntity(createEntity(ele2))(graph);
            }
            // entity = createEntity(ele2);
            // graph = actionAddEntity(entity)(graph);
        }

        return graph;
        // new Worker()
    };

}

if (!window.momentaPool ){
    window.momentaPool= {};
}

function addMomentaPackages(packageId) {
    while (window.id.undo().length()>0){
        window.id.undo();
        window.id.history().undoAnnotation();
    }
    if (packageId==null ||packageId === ''){
        return;
    }
    window.momentaPool['currentPackage']=packageId;
    window.momentaPool.changeButtonState();

    sendPost(url.check_host,{'packageIds':packageId},function (result) {
        result = JSON.parse(result);
        if (result.center){
            var center = result.center;
            window.id.map().center(center);
            window.id.map().zoom(18);
        }
        sendPost(url.queryPackageLocation,{'packetname':packageId},function (result) {
            result = JSON.parse(result);
            var location = result['loc'];
            var splitss = location.split(' ');
            window.id.map().center([parseFloat(splitss[0]),parseFloat(splitss[1])]);
            window.id.map().zoom(18);
        });

        services.mapillary.getCheckResults(packageId);

        var createEles = result.created;
        for (var i=0; i<createEles.length; i+=10){
            var eles = createEles.slice(i,i+10);
            setTimeout(function (eles) {
                return function () {
                    window.id.perform(addPackage(eles), 'addMomentaPackages');
                };
            }(eles),100);
        }
    });
    // setTimeout(function () {
    //
    // },10);
}

window.showLines = function (jsonobject, zoom=true) {
    sendPost(url.showLines,{'jsonObject':jsonobject},function (result) {
        result = JSON.parse(result);
        if (result.center){
            var center = result.center;
            window.id.map().center(center);
            if (zoom) {
                window.id.map().zoom(18);
            }
        }
        var createEles = result.created;
        for (var i=0; i<createEles.length; i+=10){
            var eles = createEles.slice(i,i+10);
            setTimeout(function (eles) {
                return function () {
                    window.id.perform(addPackage(eles), 'addMomentaPackages');
                };
            }(eles),100);
        }
    });
};
window.brokeWayCmd = function (way_id,zoom=true) {
    sendPost(url.brokeWay+way_id,{},function (result) {
        var resultObj = JSON.parse(result);
        console.log(resultObj);
        if (resultObj.result_lines && resultObj.result_lines.length>0) {
            window.showLines(result,zoom);
        } else {
            alert('no broke line');
        }
    });
}
function focusOnFrames(frameId) {
    // window.id.map().center([116.35815,39.82925]);
    // window.id.map().zoom(18);
    sendPost(url.queryFrameLocation,{'imagekey':frameId},function (result) {
        result = JSON.parse(result);
        var location = result['loc'];
        var splitss = location.split(' ');
        var packageID = result['packet_name'];
        window.id.map().center([parseFloat(splitss[0]),parseFloat(splitss[1])]);
        addPackage(packageID)
        window.id.map().zoom(18);
    });
}
window.focusOnFrames = focusOnFrames;
window.addPackages = addMomentaPackages;
export {createLineSegment,brokeWay,actionAddStopLine,showMutiSegs,actionGetLocation,deleteLines,actionFillInfo,actionMerge,actionMomentaStraighten,createAddMorePoints,actionConvertDirection,actionConvertLineType,addMomentaPackages};