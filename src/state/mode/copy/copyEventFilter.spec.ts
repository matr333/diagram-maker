import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import {
  ContainerEventType,
  DragEventType,
  KeyboardEventType,
  WheelEventType,
  WindowEventType,
} from 'diagramMaker/service/ui/UIEventManager';
import { NormalizedEvent } from 'diagramMaker/service/ui/UIEventNormalizer';

import copyEventFilter from './copyEventFilter';

describe('copyEventFilter', () => {
  it('allows all MOUSE_WHEEL events, regardless of the target', () => {
    const event = {
      type: WheelEventType.MOUSE_WHEEL,
    };

    const result = copyEventFilter(event as NormalizedEvent);

    expect(result).toBe(true);
  });

  it('allows all WORKSPACE_RESIZE events, regardless of the target', () => {
    const event = {
      type: ContainerEventType.DIAGRAM_MAKER_CONTAINER_UPDATE,
    };

    const result = copyEventFilter(event as NormalizedEvent);

    expect(result).toBe(true);
  });

  it('allows DRAG events when the target is the workspace', () => {
    const event = {
      target: {
        type: DiagramMakerComponentsType.WORKSPACE,
      },
      type: DragEventType.DRAG,
    };

    const result = copyEventFilter(event as NormalizedEvent);

    expect(result).toBe(true);
  });

  it('allows KEY_DOWN events', () => {
    const event = {
      type: KeyboardEventType.KEY_DOWN,
      code: 'KeyC',
    };

    const result = copyEventFilter(event as NormalizedEvent);

    expect(result).toBe(true);
  });

  it('does not allow DRAG_START events when the target is not the workspace', () => {
    const event = {
      target: {
        type: DiagramMakerComponentsType.NODE,
      },
      type: DragEventType.DRAG_START,
    };

    const result = copyEventFilter(event as NormalizedEvent);

    expect(result).toBeFalsy();
  });

  it('does not allow DRAG events when the target is not the workspace', () => {
    const event = {
      target: {
        type: DiagramMakerComponentsType.NODE,
      },
      type: DragEventType.DRAG,
    };

    const result = copyEventFilter(event as NormalizedEvent);

    expect(result).toBeFalsy();
  });

  it('does not allow any events except DRAG and MOUSE_WHEEL regardless of the target', () => {
    const eventTypesToTest = [
      WindowEventType.RESIZE,
      KeyboardEventType.KEY_UP,
    ];

    eventTypesToTest.forEach((type) => {
      const event = { type };

      const result = copyEventFilter(event as NormalizedEvent);

      expect(result).toBe(false);
    });
  });
});
