import { Draft, produce } from 'immer';

import { DiagramMakerAction } from 'diagramMaker/state/actions';
import { GlobalActionsType } from 'diagramMaker/state/global/globalActions';
import { DiagramMakerEdge, DiagramMakerEdges } from 'diagramMaker/state/types';
import { WorkspaceActionsType } from 'diagramMaker/state/workspace';

import { EdgeActionsType } from './edgeActions';

export default function edgeReducer<NodeType, EdgeType>(
  state: DiagramMakerEdges<EdgeType> | undefined,
  action: DiagramMakerAction<NodeType, EdgeType>,
): DiagramMakerEdges<EdgeType> {
  if (state === undefined) {
    return {};
  }
  switch (action.type) {
    case GlobalActionsType.CREATE_ITEMS:
      return produce(state, (draftState) => {
        action.payload.edges.forEach((edge) => {
          draftState[edge.id] = edge as Draft<DiagramMakerEdge<EdgeType>>;
        });
      });
    case EdgeActionsType.EDGE_DELETE:
      return produce(state, (draftState) => {
        delete draftState[action.payload.id];
      });
    case (EdgeActionsType.EDGE_CREATE):
      return produce(state, (draftState) => {
        const {
          id, src, dest, consumerData: untypedConsumerData, connectorSrcType, connectorDestType,
        } = action.payload;
        const consumerData = untypedConsumerData as Draft<EdgeType>;
        const diagramMakerData = {};
        draftState[id] = {
          consumerData,
          dest,
          diagramMakerData,
          id,
          src,
          connectorSrcType,
          connectorDestType,
        };
      });
    case (EdgeActionsType.EDGE_SELECT):
      return produce(state, (draftState) => {
        draftState[action.payload.id].diagramMakerData.selected = true;
      });
    case (EdgeActionsType.EDGE_DESELECT):
      return produce(state, (draftState) => {
        draftState[action.payload.id].diagramMakerData.selected = false;
      });
    case (WorkspaceActionsType.WORKSPACE_DESELECT):
      return produce(state, (draftState) => {
        const edgeIds = Object.keys(draftState);
        edgeIds.forEach((edgeId) => {
          draftState[edgeId].diagramMakerData.selected = false;
        });
      });
    case (GlobalActionsType.DELETE_ITEMS):
      return produce(state, (draftState) => {
        const { edgeIds } = action.payload;
        edgeIds.forEach((edgeId: string) => {
          delete draftState[edgeId];
        });
      });
    default:
      return state;
  }
}
