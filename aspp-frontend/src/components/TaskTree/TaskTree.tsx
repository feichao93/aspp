import { ContextMenu, ITreeNode, Menu, MenuItem, Tooltip, Tree } from '@blueprintjs/core'
import React from 'react'
import { getNextId } from '../../utils/common'
import './TaskTree.styl'

const INIT_CONTENTS: ITreeNode[] = [
  {
    id: getNextId('tree-node'),
    isExpanded: true,
    label: <Tooltip content="已完成 95%">Task-001</Tooltip>,
    childNodes: [
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
      },
    ],
  },
  {
    id: 1,
    isExpanded: true,
    label: <Tooltip content="已完成 45%">Task-002</Tooltip>,
    childNodes: [
      {
        id: getNextId('tree-node'),
        icon: 'document',
        label: 'Doc-5377',
      },
      {
        id: getNextId('tree-node'),
        icon: 'document',
        label: 'Doc-0a68',
      },
    ],
  },
]

export default class TaskTree extends React.Component {
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
    return (
      <div className="task-tree">
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
