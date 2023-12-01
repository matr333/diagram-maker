import * as Preact from 'preact';

import { ComposeView } from 'diagramMaker/components/common';
import { BoundRenderCallback, DestroyCallback } from 'diagramMaker/service/ConfigService';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { Position, Size } from 'diagramMaker/state/types';

import './Node.scss';

export interface PotentialNodeProps<NodeType> {
  typeId: string;
  position: Position;
  size: Size;
  renderCallback: BoundRenderCallback;
  destroyCallback: DestroyCallback;
  consumerData?: NodeType;
}

export default class PotentialNode<NodeType> extends Preact.Component<PotentialNodeProps<NodeType>, {}> {
  public render(): JSX.Element {
    const {
      typeId, position, renderCallback, destroyCallback, size, consumerData,
    } = this.props;
    const { x, y } = position;
    const { width, height } = size;
    const transform = `translate3d(${x}px, ${y}px, 0)`;

    return (
      <div
        className="dm-potential-node"
        style={{ width, height, transform }}
        data-id={typeId}
        data-type={DiagramMakerComponentsType.POTENTIAL_NODE}
        data-event-target
        data-consumer-data={JSON.stringify(consumerData)}
      >
        <ComposeView
          renderCallback={renderCallback}
          destroyCallback={destroyCallback}
        />
      </div>
    );
  }
}
