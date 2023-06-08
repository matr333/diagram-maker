import { v4 as uuid } from 'uuid';

import { asMock } from 'diagramMaker/testing/testUtils';

import {
  handleNodeClick, handleNodeCreate, handleNodeDrag, handleNodeDragEnd,
  handleNodeDragStart, handlePotentialNodeDrag, handlePotentialNodeDragEnd, handlePotentialNodeDragStart,
} from './nodeActionDispatcher';
import { NodeActionsType } from './nodeActions';
import { WorkspaceActionsType } from 'diagramMaker/state';

jest.mock('uuid', () => ({ v4: jest.fn() }));
jest.mock('lodash', () => ({
  clamp: jest.fn(() => 567),
}));

describe('nodeActionDispatcher', () => {
  const canvasSize = { width: 100, height: 100 };
  const store: any = {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      nodes: {
        node1: {
          diagramMakerData: {
            size: { width: 0, height: 0 },
            selected: false,
          },
        },
        node2: {
          diagramMakerData: {
            size: { width: 0, height: 0 },
            selected: true,
          },
        },
      },
      potentialNode: {
        size: { width: 10, height: 10 },
      },
      workspace: {
        canvasSize,
      },
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleNodeCreate', () => {
    it('dispatches a node create action when id is present & potential node position is present', () => {
      const typeId = 'node1';
      const position = { x: 0, y: 0 };
      const size = { width: 200, height: 200 };
      const potentialNode = { position, size };
      const mockId = '1';
      const id = `dm-node-${mockId}`;
      asMock(uuid).mockReturnValueOnce(mockId);
      asMock(store.getState).mockReturnValueOnce({ potentialNode });
      handleNodeCreate(store, typeId);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: {
          id, typeId, position, size,
        },
        type: NodeActionsType.NODE_CREATE,
      });
    });

    it('dispatches nothing when id is present but potential node is absent', () => {
      const typeId = 'node1';
      asMock(store.getState).mockReturnValueOnce({});
      handleNodeCreate(store, typeId);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches nothing when id is absent', () => {
      const typeId = undefined;
      handleNodeCreate(store, typeId);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handleNodeClick', () => {
    it('dispatches nothing when id is absent', () => {
      const nodeId = undefined;
      handleNodeClick(store, nodeId, false);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches a workspace deselect action when id is present and ctrl is not pressed', () => {
      const nodeId = 'node1';
      handleNodeClick(store, nodeId, false);
      expect(store.dispatch).toHaveBeenCalledWith({
        type: WorkspaceActionsType.WORKSPACE_DESELECT,
      });
    });

    it('dispatches a node select action when node is not selected', () => {
      const nodeId = 'node1';
      handleNodeClick(store, nodeId, false);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id: nodeId },
        type: NodeActionsType.NODE_SELECT,
      });
    });

    it('skips workspace deselect action when ctrl is pressed', () => {
      const nodeId = 'node1';
      handleNodeClick(store, nodeId, true);
      expect(store.dispatch).not.toHaveBeenCalledWith({
        type: WorkspaceActionsType.WORKSPACE_DESELECT,
      });
    });

    it('skips node select action when ctrl is pressed and node is selected', () => {
      const nodeId = 'node2';
      handleNodeClick(store, nodeId, true);
      expect(store.dispatch).not.toHaveBeenCalledWith({
        payload: { id: nodeId },
        type: NodeActionsType.NODE_SELECT,
      });
    });

    it('dispatches node deselect action when ctrl is pressed and node is selected', () => {
      const nodeId = 'node2';
      handleNodeClick(store, nodeId, true);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id: nodeId },
        type: NodeActionsType.NODE_DESELECT,
      });
    });
  });

  describe('handleNodeDragStart', () => {
    it('dispatches a node drag start action when id is present', () => {
      const nodeId = 'node1';
      handleNodeDragStart(store, nodeId);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { id: nodeId },
        type: NodeActionsType.NODE_DRAG_START,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const nodeId = undefined;
      handleNodeDragStart(store, nodeId);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handleNodeDragEnd', () => {
    it('dispatches a node drag end action when id is present', () => {
      const nodeId = 'node1';
      handleNodeDragEnd(store, nodeId, {
        x: 0,
        y: 0,
      }, {
        height: 0,
        width: 0,
      });
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: {
          id: nodeId,
          position: { x: 0, y: 0 },
          size: { height: 0, width: 0 },
        },
        type: NodeActionsType.NODE_DRAG_END,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const nodeId = undefined;
      handleNodeDragEnd(store, nodeId, {
        x: 0,
        y: 0,
      }, {
        height: 0,
        width: 0,
      });
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handleNodeDrag', () => {
    it('dispatches a node drag action when id is present', () => {
      const nodeId = 'node1';
      const nodePosition = { x: 567, y: 567 };
      handleNodeDrag(store, nodeId, nodePosition);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: {
          id: nodeId,
          position: nodePosition,
          size: {
            height: 0,
            width: 0,
          },
          workspaceRectangle: {
            position: { x: 0, y: 0 },
            size: canvasSize,
          },
        },
        type: NodeActionsType.NODE_DRAG,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const nodeId = undefined;
      const nodePosition = { x: 0, y: 0 };
      handleNodeDrag(store, nodeId, nodePosition);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handlePotentialNodeDragStart', () => {
    const config: any = {
      getSizeForNodeType: jest.fn(),
    };

    it('dispatches a potential node drag start action when id & size is present on data attrs', () => {
      const id = 'nodeType1';
      const getAttributeMock = jest.fn();
      const target: any = { id, originalTarget: { getAttribute: getAttributeMock } };
      const originalPosition = { x: 0, y: 0 };
      const width = 10;
      const height = 10;
      const size = { width, height };
      const position = { x: originalPosition.x - (size.width / 2), y: originalPosition.y - (size.height / 2) };
      asMock(getAttributeMock).mockImplementation((attr) => {
        if (attr === 'data-width') return width;
        if (attr === 'data-height') return height;
        return undefined;
      });

      handlePotentialNodeDragStart(store, config, target, originalPosition);
      const typeId = id;
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { position, size, typeId },
        type: NodeActionsType.POTENTIAL_NODE_DRAG_START,
      });
    });

    it('dispatches a potential node drag start action when id & size is present on config', () => {
      const id = 'nodeType1';
      const getAttributeMock = jest.fn();
      const target: any = { id, originalTarget: { getAttribute: getAttributeMock } };
      const originalPosition = { x: 0, y: 0 };
      const size = { width: 10, height: 10 };
      const position = { x: originalPosition.x - (size.width / 2), y: originalPosition.y - (size.height / 2) };
      asMock(config.getSizeForNodeType).mockReturnValueOnce(size);

      handlePotentialNodeDragStart(store, config, target, originalPosition);
      const typeId = id;
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: { position, size, typeId },
        type: NodeActionsType.POTENTIAL_NODE_DRAG_START,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const id = undefined;
      const target: any = { id };
      const position = { x: 0, y: 0 };
      handlePotentialNodeDragStart(store, config, target, position);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('dispatches nothing when size is absent', () => {
      const id = 'nodeType1';
      const getAttributeMock = jest.fn();
      const target: any = { id, originalTarget: { getAttribute: getAttributeMock } };
      const position = { x: 0, y: 0 };
      handlePotentialNodeDragStart(store, config, target, position);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handlePotentialNodeDragEnd', () => {
    it('dispatches a potential node drag end action when id is present', () => {
      const typeId = 'nodeType1';
      handlePotentialNodeDragEnd(store, typeId);
      expect(store.dispatch).toHaveBeenCalledWith({
        type: NodeActionsType.POTENTIAL_NODE_DRAG_END,
      });
    });

    it('dispatches nothing when id is absent', () => {
      const typeId = undefined;
      handlePotentialNodeDragEnd(store, typeId);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handlePotentialNodeDrag', () => {
    it('dispatches a potential node drag action when id is present', () => {
      const originalPosition = { x: 0, y: 0 };
      const size = { width: 10, height: 10 };
      const position = { x: originalPosition.x - (size.width / 2), y: originalPosition.y - (size.height / 2) };
      asMock(store.getState).mockReturnValueOnce({
        potentialNode: { size },
        workspace: {
          canvasSize,
        },
      });
      handlePotentialNodeDrag(store, originalPosition);
      expect(store.dispatch).toHaveBeenCalledWith({
        payload: {
          position,
          workspaceRectangle: {
            position: { x: 0, y: 0 },
            size: canvasSize,
          },
        },
        type: NodeActionsType.POTENTIAL_NODE_DRAG,
      });
    });
  });
});
