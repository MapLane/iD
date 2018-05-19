import _each from 'lodash-es/each';
import _uniq from 'lodash-es/uniq';
import _uniqWith from 'lodash-es/uniqWith';
import _without from 'lodash-es/without';
import _clone from 'lodash-es/clone';

import {
    geoEuclideanDistance,
    geoInterp
} from '../geo';

import { osmNode ,osmWay ,osmRelation} from '../osm';
import { actionAddMember,
         actionAddEntity } from '../actions';
import { modeSelect } from '../modes';


export function actionJoinLanegroup(wayId, projection,context) {


    var action = function(graph) {
        var id = wayId;
        var relation = osmRelation();

        graph = graph.replace(relation);
        var tags= _clone(graph.entity(relation.id).tags);
        tags.route = 'bus';
        tags.type = 'lane_group';
        tags.name = wayId[0];
        var role = 'test';

        graph = graph.replace(graph.entity(relation.id).update({tags: tags}));
        var centerLineNum = 1;
        var laneNum = 0;

        for (var i = 0; i < wayId.length; ++i)
        {
            var wayTemp = graph.entity(wayId[i]);
            if (wayTemp.tags &&  wayTemp.tags.highway === 'lane-centerline') {
                role = 'c-' + centerLineNum;
                centerLineNum++;
            }
            else {
                role = 'l-' + laneNum;
                laneNum++;
            }
            // actionAddMember(relation.id, { id: id[i], type: context.entity(id[i]).type, role: role });
            // graph = graph.replace(graph.entity(relation.id).addMember(graph.entity(wayId[i])));
            graph = graph.replace(graph.entity(relation.id).addMember({id: id[i], type: 'way', role: role}));
        }

        //context.enter(modeSelect(context, [relation.id]));
        return graph;

    };

    action.makeConvex = function(graph) {
        return graph;
    };

    action.disabled = function(graph) {
        if (!graph.entity(wayId).isClosed())
            return 'not_closed';
    };

    action.transitionable = true;


    return action;
}
