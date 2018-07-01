import { Button, ButtonGroup, Intent } from '@blueprintjs/core'
import { is, Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { Config } from '../../reducers/configReducer'
import { setSel } from '../../reducers/editorReducer'
import Decoration from '../../types/Decoration'
import EditorState from '../../types/EditorState'
import Action from '../../utils/actions'
import { always, shortenText, shortenText14, toIdSet } from '../../utils/common'
import layout, { SpanInfo } from '../../utils/layout'
import Span, { isVisibleFactory } from '../AnnotationEditor/Span'
import './DetailPanel.styl'
import { Rich } from './rich'

function findParent(spanInfo: SpanInfo, target: Decoration): SpanInfo {
  if (spanInfo.children == null) {
    return null
  }
  if (spanInfo.children.some(child => is(child.decoration, target))) {
    return spanInfo
  }
  for (const child of spanInfo.children) {
    const subResult = findParent(child, target)
    if (subResult) {
      return subResult
    }
  }
  return null
}

const notFound = Symbol('notFound')

function findChildren(blockSpanInfo: SpanInfo, target: Decoration): SpanInfo[] {
  function dfs(spanInfo: SpanInfo): SpanInfo[] | typeof notFound {
    if (is(spanInfo.decoration, target)) {
      return spanInfo.children
    }
    if (spanInfo.children) {
      for (const child of spanInfo.children) {
        const subResult = dfs(child)
        if (subResult !== notFound) {
          return subResult
        }
      }
    }
    return notFound
  }

  const dfsResult = dfs(blockSpanInfo)
  return dfsResult === notFound || dfsResult == null ? [] : dfsResult
}

function HorizontalLine() {
  return <hr style={{ margin: '8px 0' }} />
}

interface DecorationSetPreviewProps {
  block: string
  blockIndex: number
  set: Set<Decoration>
  dispatch: Dispatch
  isSelected?(d: Decoration): boolean
  isVisible?(d: Decoration): boolean
}

function DecorationSetPreview({
  block,
  blockIndex,
  set,
  dispatch,
  isSelected = always(false),
  isVisible = always(true),
}: DecorationSetPreviewProps) {
  if (set.isEmpty()) {
    return null
  }

  return (
    <div className="block preview">
      {layout(block, blockIndex, set).children.map((spanInfo, index) => (
        <Span
          key={index}
          info={spanInfo}
          handleClickDecoration={(d: Decoration, ctrlKey: boolean) =>
            dispatch(Action.userClickDecoration(d, ctrlKey))
          }
          isSelected={isSelected}
          isVisible={isVisible}
          block={block}
          processText={shortenText14}
        />
      ))}
    </div>
  )
}

type SelMode = 'empty' | 'text' | 'decoration' | 'decoration-set'

interface DetailPanelProps {
  editor: EditorState
  config: Config
  dispatch: Dispatch
}

class DetailPanel extends React.Component<DetailPanelProps> {
  resolveModes(): { mode: SelMode; subMode?: string } {
    const { editor } = this.props
    if (editor.sel.isEmpty()) {
      return { mode: editor.range == null ? 'empty' : 'text', subMode: null }
    } else {
      const mode = editor.sel.count() > 1 ? 'decoration-set' : 'decoration'
      const subMode = mode === 'decoration' ? editor.gather().get(editor.sel.first()).type : null
      return { mode, subMode }
    }
  }

  renderTextPart(mode: SelMode) {
    if (mode !== 'text') {
      return null
    }
    const { editor } = this.props

    return (
      <div data-part="text-part">
        <HorizontalLine />
        <div className="code">
          <p>
            text:&nbsp;
            {editor.range
              ? Rich.string(shortenText(14, editor.getSelectedText()))
              : Rich.reserved('[invalid-range]')}
          </p>
          <p>blockIndex: {Rich.number(editor.range ? editor.range.blockIndex : 'N/A')}</p>
          <p>startOffset: {Rich.number(editor.range ? editor.range.startOffset : 'N/A')}</p>
          <p>endOffset: {Rich.number(editor.range ? editor.range.endOffset : 'N/A')}</p>
        </div>
      </div>
    )
  }

  renderIntersectionPart(mode: SelMode) {
    if (mode !== 'text') {
      return null
    }
    const { editor, dispatch, config } = this.props
    const intersected = editor.range.intersected(editor.gather())
    const blockIndex = editor.range.blockIndex
    const block = editor.blocks.get(blockIndex)
    const intersectedHints = intersected.filter(Decoration.isHint)

    return (
      <div>
        <HorizontalLine />
        <h2 className="part-title">
          Intersections: {intersected.isEmpty() ? 'None' : intersected.count()}
        </h2>
        <DecorationSetPreview
          block={block}
          blockIndex={blockIndex}
          set={intersected.toSet()}
          isSelected={d => editor.sel.has(d.id)}
          isVisible={isVisibleFactory(config)}
          dispatch={dispatch}
        />
        <ButtonGroup vertical style={{ marginTop: 8 }}>
          <Button
            icon="locate"
            disabled={intersected.isEmpty()}
            onClick={() => dispatch(setSel(toIdSet(intersected)))}
          >
            选中标注(s:{intersected.count()})
          </Button>
          <Button
            icon="confirm"
            disabled={intersectedHints.isEmpty()}
            onClick={() => dispatch(Action.userAcceptCurrent())}
          >
            接受提示(a:{intersectedHints.count()})
          </Button>
          <Button
            intent={Intent.DANGER}
            disabled={intersected.isEmpty()}
            icon="trash"
            onClick={() => dispatch(Action.userDeleteCurrent())}
          >
            删除(d:{intersected.count()})
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  renderDecorationPart(mode: SelMode) {
    if (mode !== 'decoration') {
      return null
    }
    const { editor, dispatch } = this.props
    const decoration = editor.gather().get(editor.sel.first())
    const { range } = decoration

    return (
      <div>
        <HorizontalLine />
        <div className="block preview">
          <Span
            block={editor.blocks.get(range.blockIndex)}
            info={{ height: 0, decoration, children: [] }}
            processText={shortenText14}
          />
        </div>
        <div className="code">
          {Decoration.isAnnotation(decoration) ? (
            <React.Fragment>
              <p>id: {Rich.string(decoration.id)}</p>
              <p>tag: {Rich.string(decoration.tag)}</p>
              <p>
                entity:{' '}
                {Rich.string(
                  shortenText(12, decoration.entity),
                  range.substring(editor.blocks.get(range.blockIndex)) !== decoration.entity,
                )}
              </p>
            </React.Fragment>
          ) : null}
          {decoration.type === 'hint' ? <p>hint: {Rich.reserved(decoration.hint)}</p> : null}
          <p>blockIndex: {Rich.number(range.blockIndex)}</p>
          <p>startOffset: {Rich.number(range.startOffset)}</p>
          <p>endOffset: {Rich.number(range.endOffset)}</p>
        </div>
        <ButtonGroup vertical>
          <Button
            icon="confirm"
            onClick={() => dispatch(Action.userAcceptCurrent())}
            disabled={decoration.type !== 'hint'}
          >
            接受提示
          </Button>
          <Button
            icon="trash"
            intent={Intent.DANGER}
            onClick={() => dispatch(Action.userDeleteCurrent())}
          >
            删除
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  renderHierarchyPart(mode: SelMode) {
    if (mode !== 'decoration') {
      return null
    }
    const { editor, dispatch, config } = this.props
    const decoration = editor.gather().get(editor.sel.first())

    const blockIndex = decoration.range.blockIndex
    const block = editor.blocks.get(blockIndex)

    const decorationsInThisBlock = editor
      .gather()
      .filter(dec => dec.range.blockIndex === blockIndex)
      .toSet()
    const blockSpanInfo = layout(block, blockIndex, decorationsInThisBlock)
    const parent = findParent(blockSpanInfo, decoration)
    const children = findChildren(blockSpanInfo, decoration)

    const siblings =
      parent && parent.children
        ? parent.children
            .filter(child => child.decoration.type !== 'text')
            .map(spanInfo => spanInfo.decoration)
        : []

    return (
      <div>
        <HorizontalLine />
        <h2 className="part-title">hierarchy</h2>
        {parent && (
          <React.Fragment>
            <h3 className="subtitle">
              parent
              {parent === blockSpanInfo && ' [no-parent]'}
            </h3>
            {parent !== blockSpanInfo && (
              <DecorationSetPreview
                block={block}
                blockIndex={blockIndex}
                set={Set.of(parent.decoration)}
                isVisible={isVisibleFactory(config)}
                dispatch={dispatch}
              />
            )}
          </React.Fragment>
        )}
        <h3 className="subtitle">siblings {siblings.length}</h3>
        {siblings.length > 1 &&
          siblings.length <= 10 && (
            <DecorationSetPreview
              block={block}
              blockIndex={blockIndex}
              set={Set(siblings).add(Decoration.asPlainSlot(parent.decoration))}
              isSelected={d => d.id === decoration.id}
              isVisible={isVisibleFactory(config)}
              dispatch={dispatch}
            />
          )}
        <h3 className="subtitle">
          children
          {children.length === 0 && ' [no children]'}
        </h3>
        {children.length > 0 && (
          <DecorationSetPreview
            block={block}
            blockIndex={blockIndex}
            set={Set(children)
              .map(span => span.decoration)
              .add(Decoration.asPlainSlot(decoration))}
            isVisible={isVisibleFactory(config)}
            dispatch={dispatch}
          />
        )}
      </div>
    )
  }

  renderDecorationSetPart(mode: SelMode) {
    if (mode !== 'decoration-set') {
      return null
    }
    const { editor, dispatch, config } = this.props
    const gathered = editor.gather()
    const set = editor.sel.map(id => gathered.get(id))
    const decorationsByBlockIndex = set
      .groupBy(dec => dec.range.blockIndex)
      .sortBy((v, blockIndex) => blockIndex)
    const hintCount = set.count(Decoration.isHint)

    return (
      <div>
        <HorizontalLine />
        <div>
          {decorationsByBlockIndex
            .map((decorations, blockIndex) => (
              <div key={blockIndex} style={{ marginTop: 4 }}>
                <span>block: {blockIndex}</span>
                <DecorationSetPreview
                  block={editor.blocks.get(blockIndex)}
                  blockIndex={blockIndex}
                  set={decorations.toSet()}
                  isVisible={isVisibleFactory(config)}
                  dispatch={dispatch}
                />
              </div>
            ))
            .valueSeq()}
        </div>
        <ButtonGroup vertical style={{ marginTop: 8 }}>
          <Button
            icon="confirm"
            onClick={() => dispatch(Action.userAcceptCurrent())}
            disabled={hintCount === 0}
          >
            接受提示(a:{hintCount})
          </Button>
          <Button
            icon="trash"
            intent={Intent.DANGER}
            onClick={() => dispatch(Action.userDeleteCurrent())}
          >
            删除(d:{editor.sel.count()})
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  render() {
    const { mode, subMode } = this.resolveModes()
    return (
      <div className="panel detail-panel">
        <h2 className="part-title">
          {mode}
          {subMode ? `/${subMode}` : null}
        </h2>
        {this.renderTextPart(mode)}
        {this.renderIntersectionPart(mode)}
        {this.renderDecorationPart(mode)}
        {this.renderHierarchyPart(mode)}
        {this.renderDecorationSetPart(mode)}
      </div>
    )
  }
}

export default connect((s: State) => ({ editor: s.editor, config: s.config }))(DetailPanel)
