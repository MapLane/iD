import { t } from '../util/locale';
import { behaviorDrawWay } from '../behavior';


export function modeDrawArea(context, wayId, startGraph) {
    var mode = {
        button: 'area',
        id: 'draw-area'
    };

    var behavior;


    mode.enter = function() {
        var way = context.entity(wayId);

        behavior = behaviorDrawWay(context, wayId, undefined, mode, startGraph)
            .tail(t('modes.draw_area.tail'));

        var addNode = behavior.addNode;

        this.context = context;

        behavior.addNode = function(node) {

            var length = way.nodes.length,
                penultimate = length > 2 ? way.nodes[length - 2] : null;

            if (node.id === way.first() || node.id === penultimate) {
                var bbox = way.nodes.reduce(function(pre, cur) {
                   var loc = this.context.hasEntity(cur).loc;

                   // calculate bbox
                   if(pre instanceof Array) {
                       if(loc[0] > pre[0] && loc[0] > pre[2]) {
                           pre[2] = loc[0];
                       } else if(loc[0] < pre[0] && loc[0] < pre[2]) {
                           pre[0] = loc[0];
                       }

                       if(loc[1] > pre[1] && loc[1] > pre[3]) {
                           pre[3] = loc[1];
                       } else if(loc[1] < pre[1] && loc[1] < pre[3]) {
                           pre[1] = loc[1];
                       }

                       return pre;
                   } else {
                       return [loc[0], loc[1], loc[0], loc[1]];
                   }
                }.bind(this));

                way.tags.bbox = bbox.join(',');

                behavior.finish();
            } else {
                addNode(node);
            }
        }.bind(this);

        context.install(behavior);
    };


    mode.exit = function() {
        context.uninstall(behavior);
    };


    mode.selectedIDs = function() {
        return [wayId];
    };


    return mode;
}
