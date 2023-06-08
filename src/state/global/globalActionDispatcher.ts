import { Store } from 'redux';

import {
  DiagramMakerData,
  DiagramMakerEdge,
  DiagramMakerNode,
} from 'diagramMaker/state/types';
import { CreateNodeAction, DragNodeAction, NodeActionsType } from 'diagramMaker/state';
import { CreateItemsAction, DeleteItemsAction, GlobalActionsType } from './globalActions';

export function createDeleteItemsAction(
  nodeIds: string[],
  edgeIds: string[],
): DeleteItemsAction {
  return {
    type: GlobalActionsType.DELETE_ITEMS,
    payload: {
      nodeIds,
      edgeIds,
    },
  };
}

export function createNewItemsAction<NodeType, EdgeType>(
  nodes: DiagramMakerNode<NodeType>[],
  edges: DiagramMakerEdge<EdgeType>[],
): CreateItemsAction<NodeType, EdgeType> {
  return {
    type: GlobalActionsType.CREATE_ITEMS,
    payload: {
      nodes,
      edges,
    },
  };
}

export function createNewNodeAction<NodeType>(
  node: DiagramMakerNode<NodeType>,
): CreateNodeAction<NodeType> {
  return {
    type: NodeActionsType.NODE_CREATE,
    payload: {
      id: node.id,
      typeId: node.typeId || '',
      position: node.diagramMakerData.position,
      size: node.diagramMakerData.size,
      consumerData: node.consumerData,
    },
  };
}

export function handleDeleteSelectedItems<NodeType, EdgeType>(store: Store<DiagramMakerData<NodeType, EdgeType>>) {
  const { edges, nodes } = store.getState();
  const nodeIds: string[] = Object.keys(nodes).filter((id) => nodes[id].diagramMakerData.selected);
  const edgeIds: string[] = Object.keys(edges).filter((id) => {
    const edge = edges[id];
    const { src, dest } = edge;

    return edge.diagramMakerData.selected
           || nodeIds.indexOf(src) > -1
    || nodeIds.indexOf(dest) > -1;
  });
  const action = createDeleteItemsAction(nodeIds, edgeIds);

  store.dispatch(action);
}

export function handleMoveNodeAction<NodeType, EdgeType>(
  node: DiagramMakerNode<NodeType>,
  state: DiagramMakerData<NodeType, EdgeType>,
): DragNodeAction {
  const { canvasSize } = state.workspace;
  const workspaceRectangle = {
    position: { x: 0, y: 0 },
    size: canvasSize,
  };
  return {
    type: NodeActionsType.NODE_DRAG,
    payload: {
      id: node.id,
      position: node.diagramMakerData.startDragPosition || node.diagramMakerData.position,
      size: node.diagramMakerData.size,
      workspaceRectangle,
    },
  };
}
