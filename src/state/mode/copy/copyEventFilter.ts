import {
  ContainerEventType,
  DragEventType,
  MouseClickEventType,
  WheelEventType
} from 'diagramMaker/service/ui/UIEventManager';
import { NormalizedDragEvent, NormalizedEvent } from 'diagramMaker/service/ui/UIEventNormalizer';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';

const { WORKSPACE } = DiagramMakerComponentsType;


export default function copyEventFilter(event: NormalizedEvent): boolean {
  const { type } = event;

  switch (type) {
    case ContainerEventType.DIAGRAM_MAKER_CONTAINER_UPDATE:
    case MouseClickEventType.LEFT_CLICK:
    case MouseClickEventType.MOUSE_DOWN:
    case WheelEventType.MOUSE_WHEEL:
      return true;
    case DragEventType.DRAG_START:
    case DragEventType.DRAG_END:
    case DragEventType.DRAG: {
      const { target } = event as NormalizedDragEvent;
      return target.type === WORKSPACE;
    }
    default: return false;
  }
}
