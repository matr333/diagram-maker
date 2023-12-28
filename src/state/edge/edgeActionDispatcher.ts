import { Store } from 'redux';
import { v4 as uuid } from 'uuid';

import { DiagramMakerData, Position } from 'diagramMaker/state/types';

import { DeselectAction, WorkspaceActionsType } from 'diagramMaker/state';
import {
  CreateEdgeAction, DeselectEdgeAction,
  DragEdgeAction,
  DragEndEdgeAction,
  DragStartEdgeAction,
  EdgeActionsType,
  MouseOutAction,
  MouseOverAction,
  SelectEdgeAction,
} from './edgeActions';

function createDragStartEdgeAction(id: string, position: Position, connectorType?: string): DragStartEdgeAction {
  const action: DragStartEdgeAction = {
    type: EdgeActionsType.EDGE_DRAG_START,
    payload: { id, position },
  };
  if (connectorType) {
    action.payload.connectorSrcType = connectorType;
  }
  return action;
}

function createDragEndEdgeAction(): DragEndEdgeAction {
  return {
    type: EdgeActionsType.EDGE_DRAG_END,
  };
}

function createDragEdgeAction(position: Position): DragEdgeAction {
  return {
    type: EdgeActionsType.EDGE_DRAG,
    payload: { position },
  };
}

function createNewEdgeAction<EdgeType>(
  id: string,
  src: string,
  dest: string,
  connectorSrcType?: string,
  connectorDestType?: string,
): CreateEdgeAction<EdgeType> {
  return {
    type: EdgeActionsType.EDGE_CREATE,
    payload: {
      id, src, dest, connectorSrcType, connectorDestType,
    },
  };
}

function createSelectEdgeAction(id: string): SelectEdgeAction {
  return {
    type: EdgeActionsType.EDGE_SELECT,
    payload: { id },
  };
}
function createDeselectEdgeAction(id: string): DeselectEdgeAction {
  return {
    type: EdgeActionsType.EDGE_DESELECT,
    payload: { id },
  };
}

function createMouseOverEdgeAction(id: string): MouseOverAction {
  return {
    type: EdgeActionsType.EDGE_MOUSE_OVER,
    payload: { id },
  };
}

function createMouseOutEdgeAction(id: string): MouseOutAction {
  return {
    type: EdgeActionsType.EDGE_MOUSE_OUT,
    payload: { id },
  };
}

function createDeselectAction(): DeselectAction {
  return {
    type: WorkspaceActionsType.WORKSPACE_DESELECT,
  };
}

export function handleEdgeDragStart<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
  position: Position,
  connectorType?: string | undefined,
) {
  if (id) {
    if (connectorType) {
      store.dispatch(createDragStartEdgeAction(id, position, connectorType));
    } else {
      store.dispatch(createDragStartEdgeAction(id, position));
    }
  }
}

export function handleEdgeDragEnd<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
) {
  if (id) {
    store.dispatch(createDragEndEdgeAction());
  }
}

export function handleEdgeDrag<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  position: Position,
) {
  store.dispatch(createDragEdgeAction(position));
}

export function handleEdgeCreate<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  src: string | undefined,
  dest: string | undefined,
  connectorSrcType?: string | undefined,
  connectorDestType?: string | undefined,
) {
  if (src && dest) {
    const state = store.getState();
    const edgeIds = Object.keys(state.edges);
    const duplicate = edgeIds.filter((edgeId) => state.edges[edgeId].src === src
      && state.edges[edgeId].dest === dest
      && state.edges[edgeId].connectorSrcType === connectorSrcType
      && state.edges[edgeId].connectorDestType === connectorDestType);
    if (!!state.nodes[src] && !!state.nodes[dest] && duplicate.length === 0) {
      const id = `${uuid()}`;
      store.dispatch(createNewEdgeAction(id, src, dest, connectorSrcType, connectorDestType));
    }
  }
}

export function handleEdgeClick<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
  withCtrl: boolean,
) {
  if (!id) {
    return;
  }

  if (!withCtrl) {
    store.dispatch(createDeselectAction());
  }

  const edgeSelected = store.getState().edges[id].diagramMakerData.selected;

  if (withCtrl && edgeSelected) {
    store.dispatch(createDeselectEdgeAction(id));
  } else {
    store.dispatch(createSelectEdgeAction(id));
  }
}

export function handleEdgeMouseOver<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
) {
  if (id) {
    store.dispatch(createMouseOverEdgeAction(id));
  }
}

export function handleEdgeMouseOut<NodeType, EdgeType>(
  store: Store<DiagramMakerData<NodeType, EdgeType>>,
  id: string | undefined,
) {
  if (id) {
    store.dispatch(createMouseOutEdgeAction(id));
  }
}
