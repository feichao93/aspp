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
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { Config } from '../../reducers/configReducer'
import { TreeDoc, TreeState } from '../../reducers/treeReducer'
import MainState from '../../types/MainState'
import {
  requestAddColl,
  requestDeleteColl,
  requestLoadTree,
  requestOpenColl,
  requestOpenDocStat,
  toast,
} from '../../utils/actionCreators'
import { generateANNFile } from '../../utils/annFileUtils'
import './TaskTree.styl'

export interface TaskTreeProps {
  docname: string
  collName: string
  config: Config
  tree: TreeState
  dispatch: Dispatch
}

export interface TaskTreeState {
  contents: ITreeNode[]
  treeState: TreeState
  docname: string
  collName: string
}

function forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
  if (nodes == null) {
    return
  }

  for (const node of nodes) {
    callback(node)
    forEachNode(node.childNodes, callback)
  }
}

function genTreeNodes({ docs }: TreeState, prevState: ITreeNode[]): ITreeNode[] {
  return docs.map(
    doc =>
      ({
        id: doc.name,
        icon: 'document',
        label: doc.name,
        isExpanded: isExpanded(prevState, doc.name),
        childNodes: doc.annotations.map(
          name =>
            ({
              id: `${doc.name}-${name}`,
              icon: 'annotation',
              label: name,
              // TODO secondaryLabel: '<someone> is editing...',
            } as ITreeNode),
        ),
      } as ITreeNode),
  )

  function isExpanded(prevState: ITreeNode[], docname: string) {
    const docEntry = prevState.find(node => node.id === docname)
    return Boolean(docEntry && docEntry.isExpanded)
  }
}

class TaskTree extends React.PureComponent<TaskTreeProps, TaskTreeState> {
  static getDerivedStateFromProps(
    nextProps: TaskTreeProps,
    prevState: TaskTreeState,
  ): Partial<TaskTreeState> {
    // 文档列表发生了更新
    // tslint:disable-next-line
    if (prevState.treeState != nextProps.tree) {
      return {
        contents: genTreeNodes(nextProps.tree, prevState.contents),
        treeState: nextProps.tree,
      }
    }
    // 如果用户新建了文件，应该选中该文件
    if (nextProps.docname !== prevState.docname || nextProps.collName !== prevState.collName) {
      const docname = nextProps.docname
      const collName = nextProps.collName

      forEachNode(prevState.contents, node => {
        node.isSelected = node.id === `${docname}-${collName}`
      })
      for (const node of prevState.contents) {
        if (node.id === docname) {
          node.isExpanded = true
        }
      }
      return {
        docname,
        collName,
        contents: prevState.contents,
      }
    }
    return null
  }

  state = {
    contents: [] as ITreeNode[],
    treeState: null as TreeState,
    docname: '',
    collName: '',
  }

  onDownloadResultJSON = async (docName: string, collName: string) => {
    const response = await fetch(`/api/annotation-set/${docName}/${collName}`)
    if (response.ok) {
      saveAs(await response.blob(), `${docName}.${collName}.json`)
    } else {
      this.props.dispatch(toast('Fail to download', Intent.DANGER))
    }
  }

  onDownloadResultANN = async (docname: string, collName: string) => {
    const { dispatch } = this.props

    try {
      const res1 = await fetch(`/api/doc/${docname}`)
      if (res1.ok) {
        const block = await res1.text()
        const res2 = await fetch(`/api/annotation-set/${docname}/${collName}`)
        if (res2.ok) {
          const json = await res2.json()
          const mainState = MainState.fromJS({
            docname,
            collName,
            blocks: [block],
            annotations: json.annotations,
          })
          const { filename, content } = generateANNFile(mainState)
          saveAs(new Blob([content], { type: 'text/plain;charset=utf-8' }), filename)
        } else {
          throw new Error(`${res2.status} ${res2.statusText}`)
        }
      } else {
        throw new Error(`${res1.status} ${res1.statusText}`)
      }
    } catch (e) {
      console.error(e)
      dispatch(toast(e.message, Intent.DANGER))
    }
  }

  onRequestAddColl = (doc: TreeDoc) => {
    const { dispatch } = this.props
    dispatch(requestAddColl(doc.name))
  }

  onRefresh = () => {
    const { dispatch } = this.props
    dispatch(requestLoadTree(true))
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
    const { docname, collName } = this.props
    forEachNode(this.state.contents, node => {
      node.isSelected = node.id === `${docname}-${collName}`
    })
    for (const node of this.state.contents) {
      if (node.id === docname) {
        node.isExpanded = true
      }
    }
    this.forceUpdate()
  }

  handleNodeClick = (nodeData: ITreeNode, nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    if (!e.ctrlKey) {
      forEachNode(this.state.contents, n => (n.isSelected = false))
      nodeData.isSelected = true
      this.forceUpdate()
    } // TODO 考虑按住 ctrl 键多选的情况 if (!e.ctrlKey) { }
  }

  handleNodeDoubleClick = (nodeData: ITreeNode, nodePath: number[]) => {
    const { dispatch } = this.props
    const { treeState } = this.state
    if (nodePath.length === 1) {
      nodeData.isExpanded = true
      const doc = treeState.docs[nodePath[0]]
      dispatch(requestOpenDocStat(doc.name))
    }
    if (nodePath.length === 2) {
      const doc = treeState.docs[nodePath[0]]
      const collName = doc.annotations[nodePath[1]]
      dispatch(requestOpenColl(doc.name, collName))
    }
    this.forceUpdate()
  }

  handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false
    this.forceUpdate()
  }

  handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true
    this.setState(this.state)
    this.forceUpdate()
  }

  handleNodeContextMenu = (
    nodeData: ITreeNode,
    nodePath: number[],
    e: React.MouseEvent<HTMLElement>,
  ) => {
    e.preventDefault()
    if (!nodeData.isSelected) {
      forEachNode(this.state.contents, n => (n.isSelected = false))
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
            onClick={() => this.onRequestAddColl(doc)}
          />
          <MenuItem icon="comparison" text="Compare" disabled />
          <MenuItem icon="download" text="Download Result" disabled />
        </Menu>,
        { left: e.clientX, top: e.clientY },
      )
    } else if (nodePath.length === 2) {
      const doc = treeState.docs[nodePath[0]]
      const collName = doc.annotations[nodePath[1]]
      ContextMenu.show(
        <Menu>
          <MenuItem
            icon="trash"
            text="Delete"
            onClick={() => dispatch(requestDeleteColl(doc.name, collName))}
          />
          <MenuItem
            icon="download"
            text="Download JSON"
            onClick={() => this.onDownloadResultJSON(doc.name, collName)}
          />
          <MenuItem
            icon="download"
            text="Download ANN"
            onClick={() => this.onDownloadResultANN(doc.name, collName)}
          />
        </Menu>,
        { left: e.clientX, top: e.clientY },
      )
    } else {
      throw new Error('invalid click node path')
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

function mapStateToProps({ main: { docname, collName }, config, tree }: State) {
  return { docname, collName, config, tree }
}

export default connect(mapStateToProps)(TaskTree)
