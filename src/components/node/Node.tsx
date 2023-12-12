import * as Preact from 'preact';

import { ComposeView } from 'diagramMaker/components/common';
import { Connector, ConnectorProps, ConnectorType } from 'diagramMaker/components/connector';
import {
  BoundRenderCallback,
  ConnectorPlacement,
  ConnectorPlacementType,
  ConnectorRenderCallback,
  DestroyCallback,
  ShouldUpdateNodeCallback,
  TypeForVisibleConnectorTypes,
  VisibleConnectorTypes,
} from 'diagramMaker/service/ConfigService';
import { DiagramMakerComponentsType } from 'diagramMaker/service/ui/types';
import { DiagramMakerNode, DiagramMakerPlugins } from 'diagramMaker/state/types';

import './Node.scss';

export interface NodeProps<NodeType> {
  connectorPlacement?: ConnectorPlacementType;
  renderCallback: BoundRenderCallback;
  renderConnectorCallback: ConnectorRenderCallback;
  destroyCallback: DestroyCallback;
  diagramMakerNode: DiagramMakerNode<NodeType>;
  visibleConnectorTypes?: TypeForVisibleConnectorTypes;
  plugins?: DiagramMakerPlugins;
  shouldUpdateCallback?: ShouldUpdateNodeCallback<NodeType>;
}

export default class Node<NodeType> extends Preact.Component<NodeProps<NodeType>, {}> {
  public render(): JSX.Element {
    const {
      diagramMakerData,
      id
    } = this.props.diagramMakerNode;
    const { x, y } = diagramMakerData.position;
    const { width, height } = diagramMakerData.size;
    const transform = `translate3d(${x}px, ${y}px, 0)`;
    const { renderCallback, destroyCallback } = this.props;

    return (
      <div
        className={`dm-node ${diagramMakerData.classNames?.join(' ') || ''}`}
        style={{ width, height, transform }}
        data-id={id}
        data-type={DiagramMakerComponentsType.NODE}
        data-event-target
        data-draggable
      >
        <ComposeView
          renderCallback={renderCallback}
          destroyCallback={destroyCallback}
        />
        {this.renderConnectors()}
      </div>
    );
  }

  public shouldComponentUpdate = (
    nextProps: NodeProps<NodeType>,
  ) => {
    if (this.props.shouldUpdateCallback) {
      return this.props.shouldUpdateCallback(this.props, nextProps);
    }
    return nextProps.diagramMakerNode !== this.props.diagramMakerNode;
  }

  private getConnectors(): ConnectorProps[] {
    const { id, diagramMakerData } = this.props.diagramMakerNode;
    const { connectorPlacement, renderConnectorCallback, destroyCallback } = this.props;
    const { width, height } = diagramMakerData.size;
    const horizontalCenter = width / 2;
    const verticalCenter = height / 2;
    const { INPUT, OUTPUT } = ConnectorType;

    switch (connectorPlacement) {
      case ConnectorPlacement.LEFT_RIGHT:
        return [
          {
            id,
            position: { x: 0, y: verticalCenter },
            type: INPUT,
            renderCallback: renderConnectorCallback.bind(null, {
              id,
              position: { x: 0, y: verticalCenter },
              type: INPUT,
            }),
            destroyCallback,
          },
          {
            id,
            position: { x: width, y: verticalCenter },
            type: OUTPUT,
            renderCallback: renderConnectorCallback.bind(null, {
              id,
              position: { x: width, y: verticalCenter },
              type: OUTPUT,
            }),
            destroyCallback,
          },
        ];
      case ConnectorPlacement.TOP_BOTTOM:
        return [
          {
            id,
            position: { x: horizontalCenter, y: 0 },
            type: INPUT,
            renderCallback: renderConnectorCallback.bind(null, {
              id,
              position: { x: horizontalCenter, y: 0 },
              type: INPUT,
            }),
            destroyCallback,
          },
          {
            id,
            position: { x: horizontalCenter, y: height },
            type: OUTPUT,
            renderCallback: renderConnectorCallback.bind(null, {
              id,
              position: { x: horizontalCenter, y: height },
              type: OUTPUT,
            }),
            destroyCallback,
          },
        ];
      default:
        return [];
    }
  }

  private getFilteredConnectors(): ConnectorProps[] {
    const connectorProps = this.getConnectors();

    if (!this.props.visibleConnectorTypes) {
      return connectorProps;
    }

    const { INPUT, OUTPUT } = ConnectorType;
    switch (this.props.visibleConnectorTypes) {
      case VisibleConnectorTypes.INPUT_ONLY:
        return connectorProps.filter((connectorProp) => connectorProp.type === INPUT);
      case VisibleConnectorTypes.OUTPUT_ONLY:
        return connectorProps.filter((connectorProp) => connectorProp.type === OUTPUT);
      case VisibleConnectorTypes.NONE:
        return [];
      default:
        return connectorProps;
    }
  }

  private renderConnectors(): JSX.Element[] {
    return this.getFilteredConnectors().map((connector) => {
      const {
        id, type, position, renderCallback, destroyCallback,
      } = connector;
      return (
        <Connector
          key={`${id}-${type}`}
          id={id}
          type={type}
          position={position}
          renderCallback={renderCallback}
          destroyCallback={destroyCallback}
        />
      );
    });
  }
}
