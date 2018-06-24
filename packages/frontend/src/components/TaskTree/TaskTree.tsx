import {
  Button,
  ButtonGroup,
  ContextMenu,
  Intent,
  ITreeNode,
  Menu,
  MenuItem,
  Tree,
} from '@blueprintjs/core'
import classNames from 'classnames'
import { saveAs } from 'file-saver'
import { is } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { Config } from '../../reducers/configReducer'
import { TreeItem } from '../../reducers/treeReducer'
import FileInfo from '../../types/FileInfo'
import Action from '../../utils/actions'
import { DOC_STAT_NAME } from '../../utils/constants'
import server from '../../utils/server'
import './TaskTree.styl'

export interface TaskTreeProps {
  fileInfo: FileInfo
  config: Config
  tree: TreeItem[]
  dispatch: Dispatch
}

export interface TaskTreeState {
  contents: Array<ITreeNode<FileInfo>>
  treeState: TreeItem[]
  fileInfo: FileInfo
}

function forEachNode<T>(nodes: Array<ITreeNode<T>>, callback: (node: ITreeNode<T>) => void) {
  if (nodes == null) {
    return
  }

  for (const node of nodes) {
    callback(node)
    forEachNode(node.childNodes as Array<ITreeNode<T>>, callback)
  }
}

function shouldExpand(prevState: Array<ITreeNode<FileInfo>>, fileInfo: FileInfo) {
  let result
  let nodes = prevState
  for (const dirname of fileInfo.docPath) {
    const directoryNode = nodes.find(node => node.nodeData.docPath.last() === dirname)
    if (directoryNode == null) {
      return false
    }
    result = directoryNode.isExpanded
    nodes = directoryNode.childNodes as Array<ITreeNode<FileInfo>>
  }
  if (fileInfo.getType() === 'doc') {
    const docNode = nodes.find(node => node.nodeData.docname === fileInfo.docname)
    if (docNode == null) {
      return false
    }
    result = docNode.isExpanded
  }
  return result
}

function genTreeNodes(
  items: TreeItem[],
  prevState: Array<ITreeNode<FileInfo>>,
): Array<ITreeNode<FileInfo>> {
  const rootFileInfo = new FileInfo()
  return items.map(item => genItemTreeNode(item, rootFileInfo))

  function genItemTreeNode(item: TreeItem, parentInfo: FileInfo): ITreeNode<FileInfo> {
    let nodeData: FileInfo
    let childNodes: Array<ITreeNode<FileInfo>>
    if (item.type === 'doc') {
      nodeData = parentInfo.set('docname', item.name)
      childNodes = item.collnames.map(collname => genCollTreeNode(collname, nodeData))
    } else {
      nodeData = parentInfo.update('docPath', path => path.push(item.name))
      childNodes = item.items.map(item => genItemTreeNode(item, nodeData))
    }
    return {
      id: item.name,
      icon: item.type === 'doc' ? 'document' : 'folder-open',
      label: item.name,
      isExpanded: shouldExpand(prevState, nodeData),
      nodeData,
      childNodes,
    }
  }

  function genCollTreeNode(collname: string, parentInfo: FileInfo): ITreeNode<FileInfo> {
    return {
      id: `${collname}`,
      icon: 'annotation',
      label: collname,
      nodeData: parentInfo.set('collname', collname),
      // TODO secondaryLabel: '<someone> is editing...',
    }
  }
}

class TaskTree extends React.PureComponent<TaskTreeProps, TaskTreeState> {
  static getDerivedStateFromProps(
    nextProps: TaskTreeProps,
    prevState: TaskTreeState,
  ): Partial<TaskTreeState> {
    const partial: Partial<TaskTreeState> = {}
    // 文档列表发生了更新
    if (prevState.treeState !== nextProps.tree) {
      Object.assign(partial, {
        contents: genTreeNodes(nextProps.tree, prevState.contents),
        treeState: nextProps.tree,
      })
    }

    // 如果用户改变了当前打开的文件，应该选中该文件
    if (!is(nextProps.fileInfo, prevState.fileInfo)) {
      forEachNode(prevState.contents, node => {
        if (node.nodeData.isAncestorOf(nextProps.fileInfo)) {
          node.isExpanded = true
        }
        node.isSelected = is(node.nodeData, nextProps.fileInfo)
      })
      Object.assign(partial, { fileInfo: nextProps.fileInfo })
    }

    return partial
  }

  state = {
    contents: [] as Array<ITreeNode<FileInfo>>,
    treeState: null as TreeItem[],
    fileInfo: null as FileInfo,
  }

  onDownloadResultJSON = async (info: FileInfo) => {
    try {
      const coll = await server.getColl(info)
      saveAs(new Blob([JSON.stringify(coll)]), `${info.docname}.${info.collname}.json`)
    } catch (e) {
      this.props.dispatch(Action.toast(e.message, Intent.DANGER))
    }
  }

  onRefresh = () => {
    const { dispatch } = this.props
    dispatch(Action.requestLoadTree(true))
  }

  onExpandAll = () => {
    forEachNode(this.state.contents, node => {
      node.isExpanded = true
    })
    this.forceUpdate()
  }

  onCollapseAll = () => {
    forEachNode(this.state.contents, node => {
      node.isExpanded = false
    })
    this.forceUpdate()
  }

  onLocate = () => {
    const { fileInfo } = this.props
    forEachNode(this.state.contents, node => {
      if (node.nodeData.isAncestorOf(fileInfo)) {
        node.isExpanded = true
      }
      node.isSelected = is(node.nodeData, fileInfo)
    })
    this.forceUpdate()
  }

  handleNodeClick = (node: ITreeNode<FileInfo>) => {
    forEachNode(this.state.contents, n => (n.isSelected = false))
    node.isSelected = true
    this.forceUpdate()
  }

  handleNodeDoubleClick = (node: ITreeNode<FileInfo>) => {
    const { dispatch } = this.props
    const info = node.nodeData
    const fileInfoType = info.getType()
    if (fileInfoType === 'directory' || fileInfoType === 'doc') {
      node.isExpanded = true
      this.forceUpdate()
    }

    if (fileInfoType === 'doc') {
      dispatch(Action.requestOpenDocStat(info.set('collname', DOC_STAT_NAME)))
    } else if (fileInfoType === 'coll') {
      dispatch(Action.requestOpenColl(info))
    }
  }

  handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false
    this.forceUpdate()
  }

  handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true
    this.forceUpdate()
  }

  handleNodeContextMenu = (
    node: ITreeNode<FileInfo>,
    nodePath: number[],
    e: React.MouseEvent<HTMLElement>,
  ) => {
    e.preventDefault()
    if (!node.isSelected) {
      forEachNode(this.state.contents, n => (n.isSelected = false))
      node.isSelected = true
      this.forceUpdate()
    }

    const { dispatch } = this.props
    const info = node.nodeData
    const fileInfoType = info.getType()

    if (fileInfoType === 'doc') {
      ContextMenu.show(
        <Menu>
          <MenuItem
            icon="new-object"
            text="New Annotation Set"
            onClick={() => dispatch(Action.requestAddColl(info))}
          />
          <MenuItem icon="comparison" text="Compare" disabled />
          <MenuItem icon="download" text="Download Result" disabled />
        </Menu>,
        { left: e.clientX, top: e.clientY },
      )
    } else if (fileInfoType === 'coll') {
      ContextMenu.show(
        <Menu>
          <MenuItem
            icon="trash"
            text="Delete"
            onClick={() => dispatch(Action.requestDeleteColl(info))}
          />
          <MenuItem
            icon="download"
            text="Download JSON"
            onClick={() => this.onDownloadResultJSON(info)}
          />
        </Menu>,
        { left: e.clientX, top: e.clientY },
      )
    }
  }

  render() {
    const { config } = this.props
    return (
      <div className={classNames('task-tree', { hide: config.hideTaskTree })}>
        <header>
          <div>Task Tree</div>
          <ButtonGroup className="button-group">
            <Button icon="refresh" minimal onClick={this.onRefresh} />
            <Button icon="expand-all" minimal onClick={this.onExpandAll} />
            <Button icon="collapse-all" minimal onClick={this.onCollapseAll} />
            <Button icon="locate" minimal onClick={this.onLocate} />
          </ButtonGroup>
        </header>
        <Tree
          className="tree"
          contents={this.state.contents}
          onNodeClick={this.handleNodeClick}
          onNodeDoubleClick={this.handleNodeDoubleClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          onNodeContextMenu={this.handleNodeContextMenu}
        />
      </div>
    )
  }
}

function mapStateToProps(state: State) {
  return {
    fileInfo: state.fileInfo,
    config: state.config,
    tree: state.tree,
  }
}

export default connect(mapStateToProps)(TaskTree)
