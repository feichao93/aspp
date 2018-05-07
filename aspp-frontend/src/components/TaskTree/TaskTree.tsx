import { ContextMenu, ITreeNode, Menu, MenuItem, Tree } from '@blueprintjs/core'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { State } from '../../reducers'
import { MiscState } from '../../reducers/miscReducer'
import { getNextId } from '../../utils/common'
import './TaskTree.styl'

const INIT_CONTENTS: ITreeNode[] = [
  {
    id: getNextId('tree-node'),
    icon: 'document',
    label: 'Doc-34de',
    isExpanded: true,
    childNodes: [
      {
        id: getNextId('tree-node'),
        icon: 'annotation',
        label: 'feichao-1',
      },
      {
        id: getNextId('tree-node'),
        isSelected: true,
        icon: 'annotation',
        label: 'feichao-2',
      },
      {
        id: getNextId('tree-node'),
        icon: 'annotation',
        label: '[dbscan]-run-3f4052',
      },
    ],
  },
  {
    id: getNextId('tree-node'),
    icon: 'document',
    label: 'Doc-190f',
    isExpanded: true,
    childNodes: [
      {
        id: getNextId('tree-node'),
        icon: 'annotation',
        label: 'aoba-1',
      },
      {
        id: getNextId('tree-node'),
        icon: 'annotation',
        label: '[dbscan]-run-3f4052',
      },
    ],
  },
  {
    id: getNextId('tree-node'),
    icon: 'document',
    label: 'Doc-6a43',
    hasCaret: true,
  },
]

class TaskTree extends React.Component<MiscState> {
  state = {
    contents: INIT_CONTENTS,
  }

  handleNodeClick = (
    nodeData: ITreeNode,
    _nodePath: number[],
    e: React.MouseEvent<HTMLElement>,
  ) => {
    const originallySelected = nodeData.isSelected
    if (!e.ctrlKey) {
      this.forEachNode(this.state.contents, n => (n.isSelected = false))
    }
    nodeData.isSelected = originallySelected == null ? true : !originallySelected
    this.forceUpdate()
  }

  handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false
    this.setState(this.state)
  }

  handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true
    this.setState(this.state)
  }

  handleNodeContextMenu = (
    nodeData: ITreeNode,
    _nodePath: any,
    e: React.MouseEvent<HTMLElement>,
  ) => {
    e.preventDefault()
    if (!nodeData.isSelected) {
      this.forEachNode(this.state.contents, n => (n.isSelected = false))
      nodeData.isSelected = true
      this.forceUpdate()
    }
    ContextMenu.show(
      <Menu>
        <MenuItem icon="new-object" text="New Annotation Set" />
        <MenuItem icon="comparison" text="Compare" disabled />
        <MenuItem icon="download" text="Download Result" />
      </Menu>,
      { left: e.clientX, top: e.clientY },
    )
  }

  forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
    if (nodes == null) {
      return
    }

    for (const node of nodes) {
      callback(node)
      this.forEachNode(node.childNodes, callback)
    }
  }

  render() {
    const { hideTaskTree } = this.props
    return (
      <div className={classNames('task-tree', { hide: hideTaskTree })}>
        <Tree
          contents={this.state.contents}
          onNodeClick={this.handleNodeClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          onNodeContextMenu={this.handleNodeContextMenu}
        />
      </div>
    )
  }
}

export default connect((s: State) => s.misc)(TaskTree)
