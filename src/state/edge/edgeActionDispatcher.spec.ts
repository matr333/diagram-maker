import { v4 as uuid } from 'uuid';

import { asMock } from 'diagramMaker/testing/testUtils';
import { WorkspaceActionsType } from 'diagramMaker/state';
import {
  handleEdgeClick,
  handleEdgeCreate,
  handleEdgeDrag,
  handleEdgeDragEnd,
  handleEdgeDragStart,
  handleEdgeMouseOut,
  handleEdgeMouseOver,
} from './edgeActionDispatcher';
import { EdgeActionsType } from './edgeActions';

jest.mock('uuid', () => ({ v4: jest.fn() }));

describe('edgeActionDispatcher', () => {
  let store: any;

  beforeEach(() => {
    store = {
      dispatch: jest.fn(),
      getState: jest.fn(),
    };
  });

  function mockState(mockedState: any) {
    asMock(store.getState).mockReturnValueOnce(mockedState);
  }

  describe('handleEdgeClick', () => {
    const edgeId = 'edge1';
    const selectedEdgeId = 'edge2';

    beforeEach(() => {
      mockState({
        edges: {
          [edgeId]: { diagramMakerData: { selected: false } },
          [selectedEdgeId]: { diagramMakerData: { selected: true } },
        },
      });
    });

    it('dispatches nothing when id is absent', () => {
      handleEdgeClick(store, undefined, false);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches a workspace deselect action when id is present and ctrl is not pressed', () => {
      handleEdgeClick(store, edgeId, false);
      expect(store.dispatch).toHaveBeenCalledWith({
        type: WorkspaceActionsType.WORKSPACE_DESELECT,
      });
    });

    it('skips workspace deselect action when ctrl is pressed', () => {
      handleEdgeClick(store, edgeId, true);
      expect(store.dispatch).not.toHaveBeenCalledWith({
        type: WorkspaceActionsType.WORKSPACE_DESELECT,
      });
    });

    it('dispatches an edge select action when id is present', () => {
      handleEdgeClick(store, edgeId, false);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id: edgeId },
        type: EdgeActionsType.EDGE_SELECT,
      });
    });

    it('dispatches an edge select action ctrl is not pressed and edge is selected', () => {
      handleEdgeClick(store, selectedEdgeId, false);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id: selectedEdgeId },
        type: EdgeActionsType.EDGE_SELECT,
      });
    });

    it('skips edge select action when ctrl is pressed and edge is selected', () => {
      handleEdgeClick(store, selectedEdgeId, true);
      expect(store.dispatch).not.toHaveBeenCalledWith({
        payload: { id: selectedEdgeId },
        type: EdgeActionsType.EDGE_SELECT,
      });
    });

    it('dispatches node deselect action when ctrl is pressed and edge is selected', () => {
      handleEdgeClick(store, selectedEdgeId, true);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id: selectedEdgeId },
        type: EdgeActionsType.EDGE_DESELECT,
      });
    });
  });

  describe('handleEdgeDragStart', () => {
    it('dispatches an edge drag start action when id is present', () => {
      const edgeId = 'edge1';
      const edgePosition = { x: 0, y: 0 };
      handleEdgeDragStart(store, edgeId, edgePosition);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id: edgeId, position: edgePosition },
        type: EdgeActionsType.EDGE_DRAG_START,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const edgeId = undefined;
      const edgePosition = { x: 0, y: 0 };
      handleEdgeDragStart(store, edgeId, edgePosition);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handleEdgeDragEnd', () => {
    it('dispatches an edge drag end action when id is present', () => {
      const edgeId = 'edge1';
      handleEdgeDragEnd(store, edgeId);
      expect(store.dispatch).toHaveBeenCalledWith({
        type: EdgeActionsType.EDGE_DRAG_END,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const edgeId = undefined;
      handleEdgeDragEnd(store, edgeId);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handleEdgeDrag', () => {
    it('dispatches an edge drag action when id is present', () => {
      const edgePosition = { x: 0, y: 0 };
      handleEdgeDrag(store, edgePosition);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { position: edgePosition },
        type: EdgeActionsType.EDGE_DRAG,
      });
    });
  });

  describe('handleEdgeCreate', () => {
    it('doesnt dispatch if src is missing', () => {
      const dest = 'node-2';
      handleEdgeCreate(store, undefined, dest);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('doesnt dispatch if dest is missing', () => {
      const src = 'node-1';
      handleEdgeCreate(store, src, undefined);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('doesnt dispatch if src is missing in state', () => {
      const src = 'node-1';
      const dest = 'node-2';
      mockState({ nodes: { 'node-2': {} }, edges: {} });
      handleEdgeCreate(store, src, dest);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('doesnt dispatch if dest is missing in state', () => {
      const src = 'node-1';
      const dest = 'node-2';
      mockState({ nodes: { 'node-1': {} }, edges: {} });
      handleEdgeCreate(store, src, dest);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('doesnt dispatch if an edge from same source & dest exists', () => {
      const src = 'node-1';
      const dest = 'node-2';
      mockState({ nodes: { 'node-1': {}, 'node-2': {} }, edges: { 'edge-1': { src: 'node-1', dest: 'node-2' } } });
      handleEdgeCreate(store, src, dest);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches an edge create action if src & dest exist in state & no existing edge between them', () => {
      const src = 'node-1';
      const dest = 'node-2';
      const mockId = '1';
      const id = `dm-edge-${mockId}`;
      mockState({ nodes: { 'node-1': {}, 'node-2': {} }, edges: {} });
      asMock(uuid).mockReturnValueOnce(mockId);
      handleEdgeCreate(store, src, dest);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id, src, dest },
        type: EdgeActionsType.EDGE_CREATE,
      });
    });
  });

  describe('handleEdgeMouseOver', () => {
    it('dispatches an edge mouse over action', () => {
      const edgeId = 'edge1';
      handleEdgeMouseOver(store, edgeId);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id: edgeId },
        type: EdgeActionsType.EDGE_MOUSE_OVER,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const edgeId = undefined;
      handleEdgeMouseOver(store, edgeId);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handleEdgeMouseOut', () => {
    it('dispatches an edge mouse out action', () => {
      const edgeId = 'edge1';
      handleEdgeMouseOut(store, edgeId);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id: edgeId },
        type: EdgeActionsType.EDGE_MOUSE_OUT,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const edgeId = undefined;
      handleEdgeMouseOut(store, edgeId);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });
});
