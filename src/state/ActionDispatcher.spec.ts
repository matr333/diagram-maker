import { Store } from 'redux';

import ConfigService from 'diagramMaker/service/ConfigService';
import Observer from 'diagramMaker/service/observer/Observer';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import {
  ContainerEventType,
  DragEventType,
  DropEventType,
  KeyboardEventType,
  MouseClickEventType,
  MouseMoveEventType,
  WheelEventType,
} from 'diagramMaker/service/ui/UIEventManager';
import { KeyboardCode } from 'diagramMaker/service/ui/UIEventNormalizer';
import UITargetNormalizer from 'diagramMaker/service/ui/UITargetNormalizer';
import * as EdgeActionHandlers from 'diagramMaker/state/edge/edgeActionDispatcher';
import * as EditorActionHandlers from 'diagramMaker/state/editor/editorActionDispatcher';
import * as GlobalActionHandlers from 'diagramMaker/state/global/globalActionDispatcher';
import * as NodeActionHandlers from 'diagramMaker/state/node/nodeActionDispatcher';
import * as PanelActionHandlers from 'diagramMaker/state/panel/panelActionDispatcher';
import {
  DiagramMakerContextMenu,
  DiagramMakerEdge,
  DiagramMakerEditor,
  DiagramMakerNode,
  DiagramMakerWorkspace,
  EditorMode,
  EditorModeType,
  Position,
  Size,
} from 'diagramMaker/state/types';
import * as WorkspaceActionHandlers from 'diagramMaker/state/workspace/workspaceActionDispatcher';
import { asMock } from 'diagramMaker/testing/testUtils';

import ActionDispatcher from './ActionDispatcher';
import { rootEventFilter } from './mode';

jest.mock('diagramMaker/state/mode/rootEventFilter', () => ({ default: jest.fn(() => true) }));
jest.mock('diagramMaker/service/ui/UITargetNormalizer', () => ({ default: { getTarget: jest.fn(() => true) } }));
jest.mock('diagramMaker/service/ui/UIEventNormalizer', () => {
  const original = jest.requireActual('diagramMaker/service/ui/UIEventNormalizer');
  return {
    ...original,
    IS_MAC: jest.fn().mockReturnValue(false),
  };
});

interface MockStore {
  getState: () => {
    editor: DiagramMakerEditor,
    workspace: DiagramMakerWorkspace,
    nodes: Record<string, DiagramMakerNode<any>>,
    edges: Record<string, DiagramMakerEdge<any>>,
  };
}

const { LEFT_CLICK, MOUSE_DOWN, RIGHT_CLICK } = MouseClickEventType;
const { DRAG, DRAG_START, DRAG_END } = DragEventType;
const { DROP } = DropEventType;
const { MOUSE_WHEEL } = WheelEventType;
const { KEY_DOWN } = KeyboardEventType;
const { DIAGRAM_MAKER_CONTAINER_UPDATE } = ContainerEventType;
const { MOUSE_OUT, MOUSE_OVER } = MouseMoveEventType;

const {
  NODE, EDGE, EDGE_BADGE, NODE_CONNECTOR, PANEL_DRAG_HANDLE, POTENTIAL_NODE, WORKSPACE,
} = DiagramMakerComponentsType;

let observer: Observer;
let store: MockStore;
let config: ConfigService<{}, {}>;
let actionDispatcher: ActionDispatcher<{}, {}>;

const getMockStore = (workspace: DiagramMakerWorkspace, editor: DiagramMakerEditor, nodes = {}, edges = {}) => ({
  dispatch: jest.fn(),
  getState: () => ({
    workspace, editor, nodes, edges,
  }),
});

const initialize = (
  position: Position,
  scale: number,
  mode: EditorModeType = EditorMode.DRAG,
  contextMenu?: DiagramMakerContextMenu,
) => {
  const canvasSize: Size = {
    width: 1200,
    height: 800,
  };
  const viewContainerSize: Size = {
    width: 1000,
    height: 600,
  };

  observer = new Observer();
  config = { getRenderNode: jest.fn(), getSizeForNodeType: jest.fn() } as any;
  store = getMockStore({
    position, scale, canvasSize, viewContainerSize,
  }, { contextMenu, mode });
  actionDispatcher = new ActionDispatcher(observer, store as Store, config);
};

describe('ActionDispatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('the anonymous function returned from createEventFilterCallback', () => {
    it('does not call the handler if rootEventFilter returns false', () => {
      initialize({ x: 200, y: 300 }, 2);

      asMock(rootEventFilter).mockImplementationOnce(() => false);

      const handleNodeClickSpy = jest.spyOn(NodeActionHandlers, 'handleNodeClick');
      const target = {
        id: 1234,
        type: NODE,
      };

      observer.publish(LEFT_CLICK, { target });
      expect(handleNodeClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleLeftMouseClick', () => {
    it('calls handleNodeClick if type is DiagramMakerComponents.NODE', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleNodeClickSpy = jest.spyOn(NodeActionHandlers, 'handleNodeClick');
      const id = 1234;
      const target = {
        id,
        type: NODE,
      };
      const originalEvent = { ctrlKey: false };
      store.getState().nodes[id] = { diagramMakerData: { selected: false } } as DiagramMakerNode<any>;

      observer.publish(LEFT_CLICK, { target, originalEvent });
      expect(handleNodeClickSpy).toHaveBeenCalledTimes(1);
      expect(handleNodeClickSpy).toHaveBeenCalledWith(store, id, false);
    });

    it('calls handleEdgeClick if type is DiagramMakerComponents.EDGE', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleEdgeClickSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeClick');
      const id = 1234;
      const target = {
        id,
        type: EDGE,
      };
      const originalEvent = { ctrlKey: false };
      store.getState().edges[id] = { diagramMakerData: { selected: false } } as DiagramMakerEdge<any>;

      observer.publish(LEFT_CLICK, { target, originalEvent });
      expect(handleEdgeClickSpy).toHaveBeenCalledTimes(1);
      expect(handleEdgeClickSpy).toHaveBeenCalledWith(store, id, false);
    });

    it('calls handleEdgeClick if type is DiagramMakerComponents.EDGE_BADGE', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleEdgeClickSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeClick');
      const id = 1234;
      const target = {
        id,
        type: EDGE_BADGE,
      };
      const originalEvent = { ctrlKey: false };
      store.getState().edges[id] = { diagramMakerData: { selected: false } } as DiagramMakerEdge<any>;

      observer.publish(LEFT_CLICK, { target, originalEvent });
      expect(handleEdgeClickSpy).toHaveBeenCalledTimes(1);
      expect(handleEdgeClickSpy).toHaveBeenCalledWith(store, id, false);
    });

    it('calls handleWorkspaceClick if type is DiagramMakerComponents.WORKSPACE', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleWorkspaceClickSpy = jest.spyOn(WorkspaceActionHandlers, 'handleWorkspaceClick');
      const target = {
        type: WORKSPACE,
      };

      observer.publish(LEFT_CLICK, { target });
      expect(handleWorkspaceClickSpy).toHaveBeenCalledTimes(1);
      expect(handleWorkspaceClickSpy).toHaveBeenCalledWith(store);
    });
  });

  describe('handleMouseOver', () => {
    [EDGE, EDGE_BADGE].forEach((type) => {
      it(`calls handleMouseOver if type is DiagramMakerComponents.${type}`, () => {
        initialize({ x: 200, y: 300 }, 2);

        const handleEdgeMouseOverSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeMouseOver');
        const id = 1234;
        const target = { id, type };

        observer.publish(MOUSE_OVER, { target });
        expect(handleEdgeMouseOverSpy).toHaveBeenCalledTimes(1);
        expect(handleEdgeMouseOverSpy).toHaveBeenCalledWith(store, id);
      });
    });
  });

  describe('handleMouseOut', () => {
    [EDGE, EDGE_BADGE].forEach((type) => {
      it(`calls handleMouseOut if type is DiagramMakerComponents.${type}`, () => {
        initialize({ x: 200, y: 300 }, 2);

        const handleEdgeMouseOutSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeMouseOut');
        const id = 1234;
        const target = { id, type };

        observer.publish(MOUSE_OUT, { target });
        expect(handleEdgeMouseOutSpy).toHaveBeenCalledTimes(1);
        expect(handleEdgeMouseOutSpy).toHaveBeenCalledWith(store, id);
      });
    });
  });

  describe('handleDrag', () => {
    const id = 1234;

    it('calls handlePanelDrag if type is DiagramMakerComponents.PANEL_DRAG_HANDLE', () => {
      const position: Position = { x: 200, y: 200 };
      const offset: Position = { x: 50, y: 50 };
      const { viewContainerSize } = store.getState().workspace;
      const draggableElement = document.createElement('div');
      initialize({ x: 200, y: 300 }, 2);
      const handlePanelDragSpy = jest.spyOn(PanelActionHandlers, 'handlePanelDrag');

      const normalizedPosition = { x: position.x - offset.x, y: position.y - offset.y };

      const target = {
        id,
        originalTarget: draggableElement,
        type: PANEL_DRAG_HANDLE,
      };

      const event = {
        offset,
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handlePanelDragSpy).toHaveBeenCalledTimes(1);
      expect(handlePanelDragSpy).toHaveBeenCalledWith(
        store,
        id,
        draggableElement,
        normalizedPosition,
        viewContainerSize,
      );
    });

    it('calls handleNodeDrag if type is DiagramMakerComponents.NODE and workspace has offset', () => {
      const position: Position = { x: 200, y: 200 };
      const offset: Position = { x: 50, y: 50 };
      initialize({ x: 200, y: 300 }, 2);
      const handleNodeDragSpy = jest.spyOn(NodeActionHandlers, 'handleNodeDrag');
      const normalizedPosition = { x: -25, y: -75 };
      const target = {
        id,
        type: NODE,
      };
      const event = {
        offset,
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleNodeDragSpy).toHaveBeenCalledTimes(1);
      expect(handleNodeDragSpy).toHaveBeenCalledWith(store, id, normalizedPosition);
    });

    it('calls handleNodeDrag if type is DiagramMakerComponents.NODE and workspace no offset, but is scaled', () => {
      const position: Position = { x: 200, y: 200 };
      const offset: Position = { x: 50, y: 50 };
      initialize({ x: 0, y: 0 }, 5);
      const handleNodeDragSpy = jest.spyOn(NodeActionHandlers, 'handleNodeDrag');
      const normalizedPosition = { x: 30, y: 30 };
      const target = {
        id,
        type: NODE,
      };
      const event = {
        offset,
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleNodeDragSpy).toHaveBeenCalledTimes(1);
      expect(handleNodeDragSpy).toHaveBeenCalledWith(store, id, normalizedPosition);
    });

    it('calls handleNodeDrag if type is DiagramMakerComponents.NODE and workspace has no offset', () => {
      const position: Position = { x: 200, y: 200 };
      const offset: Position = { x: 50, y: 50 };
      initialize({ x: 0, y: 0 }, 1); // No workspace offet, scale of 1

      const handleNodeDragSpy = jest.spyOn(NodeActionHandlers, 'handleNodeDrag');
      const normalizedPosition = { x: position.x - offset.x, y: position.y - offset.y };
      const target = {
        id,
        type: NODE,
      };
      const event = {
        offset,
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleNodeDragSpy).toHaveBeenCalledTimes(1);
      expect(handleNodeDragSpy).toHaveBeenCalledWith(store, id, normalizedPosition);
    });

    it('calls handleUpdateSelectionMarquee if type is WORKSPACE, mode is SELECT, and workspace has no offset', () => {
      const position: Position = { x: 200, y: 200 };
      initialize({ x: 0, y: 0 }, 1, EditorMode.SELECT);

      const handleUpdateSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleUpdateSelectionMarquee');
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledWith(store, position);
    });

    it('calls handleUpdateSelectionMarquee if type is WORKSPACE, mode is COPY, and workspace has no offset', () => {
      const position: Position = { x: 200, y: 200 };
      initialize({ x: 0, y: 0 }, 1, EditorMode.COPY);

      const handleUpdateSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleUpdateSelectionMarquee');
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledWith(store, position);
    });

    it('calls handleUpdateSelectionMarquee if type is WORKSPACE, mode is SELECT, and workspace has offset', () => {
      const position: Position = { x: 200, y: 200 };
      initialize({ x: 200, y: 300 }, 1, EditorMode.SELECT);

      const handleUpdateSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleUpdateSelectionMarquee');
      const workspaceState = store.getState().workspace;
      const normalizedPosition = {
        x: (position.x - workspaceState.position.x) / workspaceState.scale,
        y: (position.y - workspaceState.position.y) / workspaceState.scale,
      };
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledWith(store, normalizedPosition);
    });

    it('calls handleUpdateSelectionMarquee if type is WORKSPACE, mode is COPY, and workspace has offset', () => {
      const position: Position = { x: 200, y: 200 };
      initialize({ x: 200, y: 300 }, 1, EditorMode.COPY);

      const handleUpdateSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleUpdateSelectionMarquee');
      const workspaceState = store.getState().workspace;
      const normalizedPosition = {
        x: (position.x - workspaceState.position.x) / workspaceState.scale,
        y: (position.y - workspaceState.position.y) / workspaceState.scale,
      };
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledWith(store, normalizedPosition);
    });

    it('calls handleUpdateSelectionMarquee if type is WORKSPACE, mode is SELECT, and workspace has scale', () => {
      const position: Position = { x: 200, y: 200 };
      initialize({ x: 200, y: 300 }, 2, EditorMode.SELECT);

      const handleUpdateSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleUpdateSelectionMarquee');
      const workspaceState = store.getState().workspace;
      const normalizedPosition = {
        x: (position.x - workspaceState.position.x) / workspaceState.scale,
        y: (position.y - workspaceState.position.y) / workspaceState.scale,
      };
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledWith(store, normalizedPosition);
    });

    it('calls handleUpdateSelectionMarquee if type is WORKSPACE, mode is COPY, and workspace has scale', () => {
      const position: Position = { x: 200, y: 200 };
      initialize({ x: 200, y: 300 }, 2, EditorMode.COPY);

      const handleUpdateSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleUpdateSelectionMarquee');
      const workspaceState = store.getState().workspace;
      const normalizedPosition = {
        x: (position.x - workspaceState.position.x) / workspaceState.scale,
        y: (position.y - workspaceState.position.y) / workspaceState.scale,
      };
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleUpdateSelectionMarqueeSpy).toHaveBeenCalledWith(store, normalizedPosition);
    });

    it('calls handleWorkspaceDrag if type is DiagramMakerComponents.WORKSPACE and EditorMode is DRAG', () => {
      const position: Position = { x: 200, y: 200 };
      const offset: Position = { x: 50, y: 50 };
      initialize({ x: 200, y: 300 }, 2, EditorMode.DRAG);

      const handleWorkspaceDragSpy = jest.spyOn(WorkspaceActionHandlers, 'handleWorkspaceDrag');
      const normalizedPosition = { x: position.x - offset.x, y: position.y - offset.y };
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        offset,
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handleWorkspaceDragSpy).toHaveBeenCalledTimes(1);
      expect(handleWorkspaceDragSpy).toHaveBeenCalledWith(store, normalizedPosition);
    });

    it('calls handleEdgeDrag if type is DiagramMakerComponents.NODE_CONNECTOR', () => {
      initialize({ x: 200, y: 300 }, 2);
      const handleEdgeDragSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeDrag');
      const event = {
        offset: { x: 50, y: 50 },
        position: { x: 200, y: 200 },
        target: {
          id,
          type: NODE_CONNECTOR,
        },
      };
      const expectedPosition = { x: 0, y: -50 };
      observer.publish(DRAG, event);
      expect(handleEdgeDragSpy).toHaveBeenCalledTimes(1);
      expect(handleEdgeDragSpy).toHaveBeenCalledWith(store, expectedPosition);
    });

    it('calls handlePotentialNodeDrag if type is DiagramMakerComponents.POTENTIAL_NODE', () => {
      const position: Position = { x: 200, y: 200 };
      const offset: Position = { x: 50, y: 50 };
      initialize({ x: 0, y: 0 }, 1); // No workspace offet, scale of 1

      const handlePotentialNodeDragSpy = jest.spyOn(NodeActionHandlers, 'handlePotentialNodeDrag');
      const normalizedPosition = { x: position.x, y: position.y };
      const target = {
        id,
        type: POTENTIAL_NODE,
      };
      const event = {
        offset,
        position,
        target,
      };

      observer.publish(DRAG, event);
      expect(handlePotentialNodeDragSpy).toHaveBeenCalledTimes(1);
      expect(handlePotentialNodeDragSpy).toHaveBeenCalledWith(store, normalizedPosition);
    });
  });

  describe('handleDragStart', () => {
    const id = 1234;

    it('calls handleShowSelectionMarquee if type is DiagramMakerComponents.WORKSPACE and EditorMode is SELECT', () => {
      const position = { x: 200, y: 200 };
      initialize({ x: 0, y: 0 }, 1, EditorMode.SELECT);

      const handleShowSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleShowSelectionMarquee');
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG_START, event);
      expect(handleShowSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleShowSelectionMarqueeSpy).toHaveBeenCalledWith(store, position);
    });

    it('calls handleShowSelectionMarquee if type is DiagramMakerComponents.WORKSPACE and EditorMode is COPY', () => {
      const position = { x: 200, y: 200 };
      initialize({ x: 0, y: 0 }, 1, EditorMode.COPY);

      const handleShowSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleShowSelectionMarquee');
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG_START, event);
      expect(handleShowSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleShowSelectionMarqueeSpy).toHaveBeenCalledWith(store, position);
    });

    it('calls handlePanelDragStart if type is DiagramMakerComponents.PANEL_DRAG_HANDLE', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handlePanelDragStartSpy = jest.spyOn(PanelActionHandlers, 'handlePanelDragStart');
      const target = {
        id,
        type: PANEL_DRAG_HANDLE,
      };
      const event = {
        id, target,
      };

      observer.publish(DRAG_START, event);
      expect(handlePanelDragStartSpy).toHaveBeenCalledTimes(1);
      expect(handlePanelDragStartSpy).toHaveBeenCalledWith(store, id);
    });

    it('calls handleNodeDragStart if type is DiagramMakerComponents.NODE', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleNodeDragStartSpy = jest.spyOn(NodeActionHandlers, 'handleNodeDragStart');
      const target = {
        id,
        type: NODE,
      };
      const event = {
        target,
      };

      observer.publish(DRAG_START, event);
      expect(handleNodeDragStartSpy).toHaveBeenCalledTimes(1);
      expect(handleNodeDragStartSpy).toHaveBeenCalledWith(store, id);
    });

    it('calls handleEdgeDragStart if type is DiagramMakerComponents.NODE_CONNECTOR', () => {
      initialize({ x: 0, y: 0 }, 1); // No workspace offet, scale of 1

      const handleEdgeDragStartSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeDragStart');
      const target = {
        id,
        type: NODE_CONNECTOR,
      };
      const position = { x: 200, y: 200 };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG_START, event);
      expect(handleEdgeDragStartSpy).toHaveBeenCalledTimes(1);
      expect(handleEdgeDragStartSpy).toHaveBeenCalledWith(store, id, position);
    });

    it('calls handleEdgeDragStart if type is DiagramMakerComponents.NODE_CONNECTOR and is a custom connector', () => {
      initialize({ x: 0, y: 0 }, 1); // No workspace offet, scale of 1

      const handleEdgeDragStartSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeDragStart');
      const originalTarget = document.createElement('div');
      const CONNECTOR_TYPE = 'CONNECTORTYPE';
      originalTarget.setAttribute('data-connector-type', CONNECTOR_TYPE);
      const target = {
        id,
        type: NODE_CONNECTOR,
        originalTarget,
      };
      const position = { x: 200, y: 200 };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG_START, event);
      expect(handleEdgeDragStartSpy).toHaveBeenCalledTimes(1);
      expect(handleEdgeDragStartSpy).toHaveBeenCalledWith(store, id, position, CONNECTOR_TYPE);
    });

    it('calls handlePotentialNodeDragStart if type is DiagramMakerComponents.POTENTIAL_NODE', () => {
      const position: Position = { x: 200, y: 200 };
      const offset: Position = { x: 50, y: 50 };
      initialize({ x: 0, y: 0 }, 1); // No workspace offet, scale of 1

      const handlePotentialNodeDragStartSpy = jest.spyOn(NodeActionHandlers, 'handlePotentialNodeDragStart');
      const normalizedPosition = { x: position.x, y: position.y };
      const target = {
        id,
        originalTarget: {
          getAttribute: jest.fn(),
        },
        type: POTENTIAL_NODE,
      };
      const event = {
        offset,
        position,
        target,
      };

      observer.publish(DRAG_START, event);
      expect(handlePotentialNodeDragStartSpy).toHaveBeenCalledTimes(1);
      expect(handlePotentialNodeDragStartSpy).toHaveBeenCalledWith(store, config, target, normalizedPosition);
    });
  });

  describe('handleDragEnd', () => {
    const id = 1234;

    it('calls handleHideSelectionMarquee if type is WORKSPACE and EditorMode is SELECT', () => {
      const position = { x: 200, y: 200 };
      initialize({ x: 0, y: 0 }, 1, EditorMode.SELECT);

      const handleHideSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleHideSelectionMarquee');
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG_END, event);
      expect(handleHideSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleHideSelectionMarqueeSpy).toHaveBeenCalledWith(store);
    });

    it('calls handleHideSelectionMarquee if type is WORKSPACE and EditorMode is COPY', () => {
      const position = { x: 200, y: 200 };
      initialize({ x: 0, y: 0 }, 1, EditorMode.COPY);

      const handleHideSelectionMarqueeSpy = jest.spyOn(EditorActionHandlers, 'handleHideSelectionMarquee');
      const target = {
        id,
        type: WORKSPACE,
      };
      const event = {
        position,
        target,
      };

      observer.publish(DRAG_END, event);
      expect(handleHideSelectionMarqueeSpy).toHaveBeenCalledTimes(1);
      expect(handleHideSelectionMarqueeSpy).toHaveBeenCalledWith(store);
    });

    it('calls handleNodeDragEnd if type is DiagramMakerComponents.NODE', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleNodeDragEndSpy = jest.spyOn(NodeActionHandlers, 'handleNodeDragEnd');
      const target = {
        id,
        type: NODE,
      };
      const event = {
        target,
      };

      observer.publish(DRAG_END, event);
      expect(handleNodeDragEndSpy).toHaveBeenCalledTimes(1);
      expect(handleNodeDragEndSpy).toHaveBeenCalledWith(store, id, undefined, undefined);
    });

    it('calls handleEdgeCreate if type is DiagramMakerComponents.NODE_CONNECTOR', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleEdgeDragEndSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeDragEnd');
      const target = {
        id,
        type: NODE_CONNECTOR,
      };
      const event = {
        target,
      };

      observer.publish(DRAG_END, event);
      expect(handleEdgeDragEndSpy).toHaveBeenCalledTimes(1);
      expect(handleEdgeDragEndSpy).toHaveBeenCalledWith(store, id);
    });

    it('calls handlePotentialNodeDragEnd if type is DiagramMakerComponents.POTENTIAL_NODE', () => {
      const position: Position = { x: 200, y: 200 };
      const offset: Position = { x: 50, y: 50 };
      initialize({ x: 0, y: 0 }, 1); // No workspace offet, scale of 1

      const handlePotentialNodeDragEndSpy = jest.spyOn(NodeActionHandlers, 'handlePotentialNodeDragEnd');
      const target = {
        id,
        type: POTENTIAL_NODE,
      };
      const event = {
        offset,
        position,
        target,
      };

      observer.publish(DRAG_END, event);
      expect(handlePotentialNodeDragEndSpy).toHaveBeenCalledTimes(1);
      expect(handlePotentialNodeDragEndSpy).toHaveBeenCalledWith(store, id);
    });
  });

  describe('handleWheelScroll', () => {
    it('calls handleWorkspaceDragSpy', () => {
      jest.unmock('diagramMaker/service/ui/UIEventNormalizer');
      jest.mock('diagramMaker/service/ui/UIEventNormalizer', () => {
        const original = jest.requireActual('diagramMaker/service/ui/UIEventNormalizer');
        return {
          ...original,
          IS_MAC: jest.fn().mockReturnValue(true),
        };
      });
      const position: Position = { x: 200, y: 300 };
      initialize(position, 2, EditorMode.DRAG);
      const offset: Position = { x: 50, y: 50 };
      const handleWorkspaceDragSpy = jest.spyOn(WorkspaceActionHandlers, 'handleWorkspaceDrag');

      const delta = offset.y;
      const ctrlKey = false;

      const normalizedPosition = { x: position.x - 0.5 * offset.x, y: position.y - 0.5 * offset.y };

      const originalEvent = {
        preventDefault: jest.fn(),
        deltaX: offset.x,
        deltaY: offset.y,
      };

      observer.publish(MOUSE_WHEEL, {
        delta, originalEvent, position, ctrlKey,
      });

      expect(originalEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(handleWorkspaceDragSpy).toHaveBeenCalledTimes(1);
      expect(handleWorkspaceDragSpy).toHaveBeenCalledWith(store, normalizedPosition);
      expect(UITargetNormalizer.getTarget)
        .toHaveBeenCalledWith(originalEvent, 'data-type', DiagramMakerComponentsType.WORKSPACE);
    });
    it('calls handleWorkspaceZoom', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleWorkspaceZoomSpy = jest.spyOn(WorkspaceActionHandlers, 'handleWorkspaceZoom');
      const delta = 10;
      const ctrlKey = true;
      const position = {
        x: 10,
        y: 10,
      };

      const originalEvent = {
        preventDefault: jest.fn(),
      };

      observer.publish(MOUSE_WHEEL, {
        delta, originalEvent, position, ctrlKey,
      });

      expect(handleWorkspaceZoomSpy).toHaveBeenCalledTimes(1);
      expect(originalEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(handleWorkspaceZoomSpy).toHaveBeenCalledWith(store, -delta, position);
      expect(UITargetNormalizer.getTarget)
        .toHaveBeenCalledWith(originalEvent, 'data-type', DiagramMakerComponentsType.WORKSPACE);
    });

    it('doesnt call handleWorkspaceZoom if UITargetNormalizer cannot find workspace in target parent chain', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleWorkspaceZoomSpy = jest.spyOn(WorkspaceActionHandlers, 'handleWorkspaceZoom');
      const delta = 10;
      const ctrlKey = true;
      const position = {
        x: 10,
        y: 10,
      };

      const originalEvent = {
        preventDefault: jest.fn(),
      };

      asMock(UITargetNormalizer.getTarget).mockReturnValueOnce(false);

      observer.publish(MOUSE_WHEEL, {
        delta, originalEvent, position, ctrlKey,
      });

      expect(handleWorkspaceZoomSpy).toHaveBeenCalledTimes(0);
      expect(originalEvent.preventDefault).toHaveBeenCalledTimes(0);
      expect(UITargetNormalizer.getTarget)
        .toHaveBeenCalledWith(originalEvent, 'data-type', DiagramMakerComponentsType.WORKSPACE);
    });

    it('doesnt call handleWorkspaceZoom if context menu is open', () => {
      const contextMenu: DiagramMakerContextMenu = {
        position: { x: 0, y: 0 },
        targetType: DiagramMakerComponentsType.NODE,
      };

      initialize({ x: 200, y: 300 }, 2, EditorMode.DRAG, contextMenu);

      const handleWorkspaceZoomSpy = jest.spyOn(WorkspaceActionHandlers, 'handleWorkspaceZoom');
      const delta = 10;
      const ctrlKey = true;
      const position = {
        x: 10,
        y: 10,
      };

      const originalEvent = {
        preventDefault: jest.fn(),
      };

      observer.publish(MOUSE_WHEEL, {
        delta, originalEvent, position, ctrlKey,
      });

      expect(handleWorkspaceZoomSpy).toHaveBeenCalledTimes(0);
      expect(originalEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(UITargetNormalizer.getTarget)
        .toHaveBeenCalledWith(originalEvent, 'data-type', DiagramMakerComponentsType.WORKSPACE);
    });
  });

  describe('handleDrop', () => {
    it('calls handleEdgeCreate when both dropzone & target are NODE_CONNECTOR', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleEdgeCreateSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeCreate');
      const targetId = 1234;
      const dropId = 4567;
      const target = {
        id: targetId,
        type: NODE_CONNECTOR,
      };
      const dropzone = {
        id: dropId,
        type: NODE_CONNECTOR,
      };
      const event = {
        dropzone,
        target,
      };

      observer.publish(DROP, event);
      expect(handleEdgeCreateSpy).toHaveBeenCalledTimes(1);
      expect(handleEdgeCreateSpy).toHaveBeenCalledWith(store, targetId, dropId);
    });

    it('doesnt call handleEdgeCreate when dropzone is NODE_CONNECTOR but target is WORKSPACE', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleEdgeCreateSpy = jest.spyOn(EdgeActionHandlers, 'handleEdgeCreate');
      const targetId = 1234;
      const dropId = 4567;
      const target = {
        id: targetId,
        type: WORKSPACE,
      };
      const dropzone = {
        id: dropId,
        type: NODE_CONNECTOR,
      };
      const event = {
        dropzone,
        target,
      };

      observer.publish(DROP, event);
      expect(handleEdgeCreateSpy).not.toHaveBeenCalled();
    });

    it('calls handleNodeCreate when dropzone is WORKSPACE & target are POTENTIAL_NODE', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleNodeCreateSpy = jest.spyOn(NodeActionHandlers, 'handleNodeCreate');
      const targetId = 1234;
      const target = {
        id: targetId,
        type: POTENTIAL_NODE,
      };
      const dropzone = {
        type: WORKSPACE,
      };
      const event = {
        dropzone,
        target,
      };

      observer.publish(DROP, event);
      expect(handleNodeCreateSpy).toHaveBeenCalledTimes(1);
      expect(handleNodeCreateSpy).toHaveBeenCalledWith(store, targetId);
    });

    it('doesnt call handleNodeCreate when dropzone is WORKSPACE & target are NODE_CONNECTOR', () => {
      initialize({ x: 200, y: 300 }, 2);

      const handleNodeCreateSpy = jest.spyOn(NodeActionHandlers, 'handleNodeCreate');
      const targetId = 1234;
      const target = {
        id: targetId,
        type: NODE_CONNECTOR,
      };
      const dropzone = {
        type: WORKSPACE,
      };
      const event = {
        dropzone,
        target,
      };

      observer.publish(DROP, event);
      expect(handleNodeCreateSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleKeyDown', () => {
    it('calls handleSelectAll if key is "a" and OS modifier key is pressed', () => {
      const event = {
        code: 'KeyA',
        modKey: true,
      };
      const handleSelectAllSpy = jest.spyOn(WorkspaceActionHandlers, 'handleSelectAll');

      observer.publish(KEY_DOWN, event);

      expect(handleSelectAllSpy).toHaveBeenCalledTimes(1);
      expect(handleSelectAllSpy).toHaveBeenCalledWith(store);
    });

    it('calls handleDeleteSelectedItems if key is KeyboardCode.DELETE', () => {
      const event = {
        code: KeyboardCode.DELETE,
      };
      const handleDeleteSelectedItemsSpy = jest.spyOn(GlobalActionHandlers, 'handleDeleteSelectedItems');

      observer.publish(KEY_DOWN, event);

      expect(handleDeleteSelectedItemsSpy).toHaveBeenCalledTimes(1);
      expect(handleDeleteSelectedItemsSpy).toHaveBeenCalledWith(store);
    });

    it('calls handleDeleteSelectedItems if key is KeyboardCode.BACKSPACE', () => {
      const code = KeyboardCode.BACKSPACE;
      const originalEvent = new KeyboardEvent('keydown', { code });
      const event = { code, originalEvent };
      const handleDeleteSelectedItemsSpy = jest.spyOn(GlobalActionHandlers, 'handleDeleteSelectedItems');

      observer.publish(KEY_DOWN, event);

      expect(handleDeleteSelectedItemsSpy).toHaveBeenCalledTimes(1);
      expect(handleDeleteSelectedItemsSpy).toHaveBeenCalledWith(store);
    });

    it('calls handleCtrlZ if key is KeyboardCode.Z with no shift', () => {
      const code = KeyboardCode.Z;
      const originalEvent = new KeyboardEvent('keydown', { code, ctrlKey: true, shiftKey: false });
      const event = {
        code, modKey: true, shiftKey: false, originalEvent,
      };
      const handleCtrlZSpy = jest.fn();
      (actionDispatcher as any).handleCtrlZ = handleCtrlZSpy;

      observer.publish(KEY_DOWN, event);

      expect(handleCtrlZSpy).toHaveBeenCalledTimes(1);
      expect(handleCtrlZSpy).toHaveBeenCalledWith(event);
    });

    it('calls handleCtrlShiftZ if key is KeyboardCode.Z with shift', () => {
      const code = KeyboardCode.Z;
      const originalEvent = new KeyboardEvent('keydown', { code, ctrlKey: true, shiftKey: true });
      const event = {
        code, modKey: true, shiftKey: true, originalEvent,
      };
      const handleCtrlShiftZSpy = jest.fn();
      (actionDispatcher as any).handleCtrlShiftZ = handleCtrlShiftZSpy;

      observer.publish(KEY_DOWN, event);

      expect(handleCtrlShiftZSpy).toHaveBeenCalledTimes(1);
      expect(handleCtrlShiftZSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('handleMouseDown', () => {
    it('calls handleHideContextMenu', () => {
      const handleHideContextMenuSpy = jest.spyOn(EditorActionHandlers, 'handleHideContextMenu');

      observer.publish(MOUSE_DOWN, {});

      expect(handleHideContextMenuSpy).toHaveBeenCalledTimes(1);
      expect(handleHideContextMenuSpy).toHaveBeenCalledWith(store);
    });
  });

  describe('handleRightMouseClick', () => {
    it('calls handleShowContextMenu', () => {
      const handleShowContextMenuSpy = jest.spyOn(EditorActionHandlers, 'handleShowContextMenu');

      const event = { position: { x: 0, y: 0 }, target: {} };

      observer.publish(RIGHT_CLICK, event);

      expect(handleShowContextMenuSpy).toHaveBeenCalledTimes(1);
      expect(handleShowContextMenuSpy).toHaveBeenCalledWith(store, config, event);
    });
  });

  describe('handleContainerUpdate', () => {
    it('calls handleWorkspaceResize', () => {
      const handleContainerUpdateSpy = jest.spyOn(WorkspaceActionHandlers, 'handleWorkspaceResize');

      const contextRect = {
        height: 10,
        left: 10,
        top: 10,
        width: 10,
      };

      const mockEvent = { contextRect };
      const size = { height: mockEvent.contextRect.height, width: mockEvent.contextRect.width };

      observer.publish(DIAGRAM_MAKER_CONTAINER_UPDATE, mockEvent);

      expect(handleContainerUpdateSpy).toHaveBeenCalledTimes(1);
      expect(handleContainerUpdateSpy).toHaveBeenCalledWith(store, size);
    });
  });
});
