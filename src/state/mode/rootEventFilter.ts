import { NormalizedEvent } from 'diagramMaker/service/ui/UIEventNormalizer';
import { EditorMode, EditorModeType } from 'diagramMaker/state/types';

import readOnlyEventFilter from './readOnly/readOnlyEventFilter';
import copyEventFilter from './copy/copyEventFilter';

const { READ_ONLY, COPY } = EditorMode;

export default function rootEventFilter(e: NormalizedEvent, editorMode: EditorModeType): boolean {
  switch (editorMode) {
    case READ_ONLY:
      return readOnlyEventFilter(e);
    case COPY:
      return copyEventFilter(e);
    default:
      return true;
  }
}
