import { Button, ButtonGroup, Intent } from '@blueprintjs/core'
import { is, Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducer'
import AnnotatedDoc from '../../types/AnnotatedDoc'
import Decoration, { Slot } from '../../types/Decoration'
import DecorationRange from '../../types/DecorationRange'
import { clearAnnotation, clickDecoration, selectMatch, setSel } from '../../utils/actionCreators'
import { shortenText } from '../../utils/common'
import layout, { SpanInfo } from '../../utils/layout'
import Span from '../AnnotationEditorView/Span'
import './DetailPanel.styl'

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

const Rich = {
  string(str: string) {
    return <span className="string">{JSON.stringify(str)}</span>
  },
  number(num: number | string) {
    return <span className="number">{num}</span>
  },
  reserved(s: string) {
    return <span className="reserved">{s}</span>
  },
}

function HorizontalLine() {
  return <hr style={{ margin: '8px 0' }} />
}

type DecorationSetPreviewProps = {
  doc: AnnotatedDoc
  set: Set<Decoration>
  dispatch: Dispatch
}

function DecorationSetPreview({ doc, set, dispatch }: DecorationSetPreviewProps) {
  if (set.isEmpty()) {
    return null
  }
  const blockIndex = set.first().range.blockIndex
  const block = doc.plainDoc.blocks.get(blockIndex)

  return (
    <div className="block preview">
      {layout(block, blockIndex, set).children.map((spanInfo, index) => (
        <Span
          key={index}
          info={spanInfo}
          onMouseDown={(d: Decoration, ctrlKey: boolean) => dispatch(clickDecoration(d, ctrlKey))}
          isSelected={() => false}
          block={block}
          shortenLongText
        />
      ))}
    </div>
  )
}

type SelMode = 'empty' | 'text' | 'decoration' | 'decoration-set'

class DetailPanel extends React.Component<State & { dispatch: Dispatch }> {
  resolveMode(): SelMode {
    const { sel, range } = this.props
    if (sel.isEmpty()) {
      return range == null ? 'empty' : 'text'
    } else {
      return sel.count() > 1 ? 'decoration-set' : 'decoration'
    }
  }

  renderTextPart(mode: SelMode) {
    if (mode !== 'text') {
      return null
    }
    const { range, doc, dispatch } = this.props
    const selectedText = DecorationRange.getText(doc, range)

    return (
      <div>
        <HorizontalLine />
        <div className="code">
          <p>
            text:&nbsp;
            {range
              ? Rich.string(shortenText(14, DecorationRange.getText(doc, range)))
              : Rich.reserved('[invalid-range]')}
          </p>
          <p>blockIndex: {Rich.number(range ? range.blockIndex : 'N/A')}</p>
          <p>startOffset: {Rich.number(range ? range.startOffset : 'N/A')}</p>
          <p>endOffset: {Rich.number(range ? range.endOffset : 'N/A')}</p>
        </div>
        <Button onClick={() => dispatch(selectMatch(selectedText))}>
          选中所有相同的文本(TODO count here!)
        </Button>
      </div>
    )
  }

  renderIntersectionPart(mode: SelMode) {
    if (mode !== 'text') {
      return null
    }
    const { range, doc, dispatch } = this.props
    const intersected = range.filterIntersected(doc.annotationSet).map(Decoration.fromAnnotation)

    return (
      <div>
        <HorizontalLine />
        <h2 className="part-title">
          Intersections: {intersected.isEmpty() ? 'None' : intersected.count()}
        </h2>
        <DecorationSetPreview set={intersected} doc={doc} dispatch={dispatch} />
        <ButtonGroup vertical style={{ marginTop: 8 }}>
          <Button
            icon="locate"
            disabled={intersected.isEmpty()}
            onClick={() => dispatch(setSel(intersected))}
          >
            选中标注(s:{intersected.count()})
          </Button>
          <Button icon="confirm" disabled={intersected.isEmpty()} onClick={() => 0 /* TODO */}>
            接受提示(a:?)
          </Button>
          <Button
            intent={Intent.DANGER}
            disabled={intersected.isEmpty()}
            icon="trash"
            onClick={() => dispatch(clearAnnotation())}
          >
            删除标注(d:{intersected.count()})
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  renderDecorationPart(mode: SelMode) {
    if (mode !== 'decoration') {
      return null
    }
    const { doc, sel, dispatch } = this.props
    const decoration = sel.first()
    const { range } = decoration

    return (
      <div>
        <HorizontalLine />
        <DecorationSetPreview doc={doc} set={Set.of(decoration)} dispatch={dispatch} />
        <div className="code">
          {Decoration.isAnnotation(decoration) ? (
            <React.Fragment>
              <p>id: {Rich.string(decoration.annotation.id)}</p>
              <p>tag: {Rich.string(decoration.annotation.tag)}</p>
              <p>confidence: {Rich.number(decoration.annotation.confidence)}</p>
            </React.Fragment>
          ) : null}
          <p>blockIndex: {Rich.number(range.blockIndex)}</p>
          <p>startOffset: {Rich.number(range.startOffset)}</p>
          <p>endOffset: {Rich.number(range.endOffset)}</p>
        </div>
        <ButtonGroup vertical>
          <Button icon="confirm" onClick={() => 0 /* TODO */} disabled={true}>
            接受提示(a:?)
          </Button>
          <Button icon="trash" intent={Intent.DANGER} onClick={() => dispatch(clearAnnotation())}>
            删除标注(d:{sel.count()})
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  renderHierarchyPart(mode: SelMode) {
    if (mode !== 'decoration') {
      return null
    }
    const { doc, sel, dispatch } = this.props
    const decoration = sel.first()

    const blockIndex = decoration.range.blockIndex
    const block = doc.plainDoc.blocks.get(blockIndex)

    const blockSpanInfo = layout(
      block,
      blockIndex,
      doc.annotationSet.map(Decoration.fromAnnotation),
    )
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
              <DecorationSetPreview doc={doc} set={Set.of(parent.decoration)} dispatch={dispatch} />
            )}
          </React.Fragment>
        )}
        <h3 className="subtitle">
          siblings
          {siblings.length <= 1 && ' [no siblings]'}
        </h3>
        {siblings.length > 1 && (
          <DecorationSetPreview
            doc={doc}
            set={Set(siblings)
              .remove(decoration)
              .add(
                new Slot({
                  slotType: 'selection',
                  range: decoration.range,
                }),
              )
              .add(parent.decoration)}
            dispatch={dispatch}
          />
        )}
        <h3 className="subtitle">
          children
          {children.length === 0 && ' [no children]'}
        </h3>
        {children.length > 0 && (
          <DecorationSetPreview
            doc={doc}
            set={Set(children)
              .map(span => span.decoration)
              .add((decoration as Slot).set('type', 'slot'))}
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
    const { doc, sel, dispatch } = this.props

    return (
      <div>
        <HorizontalLine />
        <DecorationSetPreview doc={doc} set={sel} dispatch={dispatch} />
        <ButtonGroup vertical>
          <Button icon="confirm" onClick={() => 0 /* TODO */} disabled={true}>
            接受提示(a:?)
          </Button>
          <Button icon="trash" intent={Intent.DANGER} onClick={() => dispatch(clearAnnotation())}>
            删除标注(d:{sel.count()})
          </Button>
        </ButtonGroup>
      </div>
    )
  }

  render() {
    const mode = this.resolveMode()
    return (
      <div className="panel detail-panel">
        <div>
          <h2 className="part-title">{mode}</h2>
        </div>
        {this.renderTextPart(mode)}
        {this.renderIntersectionPart(mode)}
        {this.renderDecorationPart(mode)}
        {this.renderHierarchyPart(mode)}
        {this.renderDecorationSetPart(mode)}
      </div>
    )
  }
}

export default connect((s: State) => s)(DetailPanel)
