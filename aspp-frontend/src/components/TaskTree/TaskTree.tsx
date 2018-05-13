import { ContextMenu, ITreeNode, Menu, MenuItem, Tree } from '@blueprintjs/core'
import { saveAs } from 'file-saver'
import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { MiscState } from '../../reducers/miscReducer'
import { TreeState } from '../../reducers/treeReducer'
import './TaskTree.styl'
import fetchHost from '../../sagas/fetchHost'
import {
  clickAnnotationSetTreeNode,
  clickDocTreeNode,
  requestAddAnnotationSet,
  requestDeleteAnnotationSet,
  toast,
} from '../../utils/actionCreators'

export interface TaskTreeProps {
  misc: MiscState
  tree: TreeState
  dispatch: Dispatch
}

export interface TaskTreeState {
  contents: ITreeNode[]
  treeState: TreeState
}

function genTreeNodes({ docs }: TreeState, prevState: ITreeNode[]): ITreeNode[] {
  return docs.map(
    doc =>
      ({
        id: doc.id,
        icon: 'document',
        label: doc.name,
        isExpanded: isExpanded(prevState, doc.id),
        childNodes: doc.annotations.map(
          name =>
            ({
              id: `${doc.id}-${name}`,
              icon: 'annotation',
              label: name,
            } as ITreeNode),
        ),
      } as ITreeNode),
  )

  function isExpanded(prevState: ITreeNode[], docId: string) {
    const docEntry = prevState.find(node => node.id === docId)
    return Boolean(docEntry && docEntry.isExpanded)
  }
}

class TaskTree extends React.Component<TaskTreeProps, TaskTreeState> {
  static getDerivedStateFromProps(nextProps: TaskTreeProps, prevState: TaskTreeState) {
    if (prevState.treeState != nextProps.tree) {
      console.log('updating state from props...')
      return {
        contents: genTreeNodes(nextProps.tree, prevState.contents),
        treeState: nextProps.tree,
      }
    }
    return null
  }

  state = {
    contents: [] as ITreeNode[],
    treeState: null as TreeState,
  }

  onDownloadResult = async (docId: string, annotationSetName: string) => {
    const {
      tree: { docs },
    } = this.props
    const docName = docs.find(doc => doc.id === docId).name
    const response = await fetchHost(`/api/annotation-set/${docId}/${annotationSetName}`)
    if (response.ok) {
      saveAs(await response.blob(), `${docName}.${annotationSetName}.json`)
    } else {
      this.props.dispatch(toast('Fail to download'))
    }
  }

  handleNodeClick = (nodeData: ITreeNode, nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    if (!e.ctrlKey) {
      this.forEachNode(this.state.contents, n => (n.isSelected = false))
      nodeData.isSelected = true
      this.forceUpdate()
    } // TODO 考虑按住 ctrl 键多选的情况 if (!e.ctrlKey) { }

    const { dispatch } = this.props
    const { treeState } = this.state
    if (nodePath.length === 1) {
      const doc = treeState.docs[nodePath[0]]
      dispatch(clickDocTreeNode(doc.id))
    } else if (nodePath.length === 2) {
      const doc = treeState.docs[nodePath[0]]
      const annotationSetName = doc.annotations[nodePath[1]]
      dispatch(clickAnnotationSetTreeNode(doc.id, annotationSetName))
    } else {
      throw new Error('invalid click node path')
    }
  }

  handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false
    this.forceUpdate()
  }

  handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true
    this.setState(this.state)
  }

  handleNodeContextMenu = (
    nodeData: ITreeNode,
    nodePath: number[],
    e: React.MouseEvent<HTMLElement>,
  ) => {
    e.preventDefault()
    if (!nodeData.isSelected) {
      this.forEachNode(this.state.contents, n => (n.isSelected = false))
      nodeData.isSelected = true
      this.forceUpdate()
    }

    const { dispatch } = this.props
    const { treeState } = this.state
    if (nodePath.length === 1) {
      const doc = treeState.docs[nodePath[0]]
      ContextMenu.show(
        <Menu>
          <MenuItem
            icon="new-object"
            text="New Annotation Set"
            onClick={() => dispatch(requestAddAnnotationSet(doc.id))}
          />
          <MenuItem icon="comparison" text="Compare" disabled />
          <MenuItem icon="download" text="Download Result" disabled />
        </Menu>,
        { left: e.clientX, top: e.clientY },
      )
    } else if (nodePath.length === 2) {
      const doc = treeState.docs[nodePath[0]]
      const annotationSetName = doc.annotations[nodePath[1]]
      ContextMenu.show(
        <Menu>
          <MenuItem
            icon="trash"
            text="Delete"
            onClick={() => dispatch(requestDeleteAnnotationSet(doc.id, annotationSetName))}
          />
          <MenuItem
            icon="download"
            text="Download JSON"
            onClick={() => this.onDownloadResult(doc.id, annotationSetName)}
          />
          <MenuItem icon="download" text="Download BME(TODO)" disabled />
        </Menu>,
        { left: e.clientX, top: e.clientY },
      )
    } else {
      throw new Error('invalid click node path')
    }
  }

  private forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
    if (nodes == null) {
      return
    }

    for (const node of nodes) {
      callback(node)
      this.forEachNode(node.childNodes, callback)
    }
  }

  render() {
    const { misc } = this.props
    return (
      <div className={classNames('task-tree', { hide: misc.hideTaskTree })}>
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

export default connect((s: State) => ({ misc: s.misc, tree: s.tree }))(TaskTree)
