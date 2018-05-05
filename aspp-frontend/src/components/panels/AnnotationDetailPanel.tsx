import { Button, ButtonGroup, Intent } from '@blueprintjs/core'
import { Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducer'
import AnnotatedDoc from '../../types/AnnotatedDoc'
import Decoration from '../../types/Decoration'
import DecorationRange from '../../types/DecorationRange'
import { clearAnnotation, clickDecoration, selectMatch, setSel } from '../../utils/actionCreators'
import { shortenText } from '../../utils/common'
import digest from '../../utils/digest'
import Span from '../AnnotationEditorView/Span'
import './AnnotationDetailPanel.styl'

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

interface TextDetailProps {
  range: DecorationRange
  sel: Set<Decoration>
  doc: AnnotatedDoc
  dispatch: Dispatch
}

function TextDetail({ range, doc, dispatch }: TextDetailProps) {
  const intersected = range.intersect(doc.annotationSet).map(Decoration.fromAnnotation)
  const selectedText = DecorationRange.getText(doc, range)

  return (
    <div className="text-detail">
      <div className="part text-preview">
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
        <Button onClick={() => dispatch(selectMatch(selectedText))}>选中所有相同的文本</Button>
      </div>
      <hr style={{ margin: 8, border: '1px solid #ccc' }} />
      <div className="part">
        <h2>{intersected.isEmpty() ? 'No Intersected Decorations' : 'Intersected Decorations:'}</h2>
        <DecorationSetPreview set={intersected} doc={doc} dispatch={dispatch} />
        <ButtonGroup vertical>
          <Button
            icon="locate"
            disabled={intersected.isEmpty()}
            onClick={() => dispatch(setSel(intersected))}
          >
            选中标注({intersected.count()})
          </Button>
          <Button icon="confirm" disabled={intersected.isEmpty()} onClick={() => 0 /* TODO */}>
            接受提示(0)
          </Button>
          <Button
            intent={Intent.DANGER}
            disabled={intersected.isEmpty()}
            icon="trash"
            onClick={() => dispatch(clearAnnotation())}
          >
            删除标注({intersected.count()})
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}

function DecorationSetDetail({ doc, sel, dispatch }: TextDetailProps) {
  return (
    <div className="part">
      <DecorationSetPreview doc={doc} set={sel} dispatch={dispatch} />
      <ButtonGroup vertical>
        <Button icon="confirm" onClick={() => 0 /* TODO */}>
          接受提示(0)
        </Button>
        <Button icon="trash" intent={Intent.DANGER} onClick={() => dispatch(clearAnnotation())}>
          删除标注({sel.count()})
        </Button>
      </ButtonGroup>
    </div>
  )
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
      {digest(block, blockIndex, set).map((spanInfo, index) => (
        <Span
          key={index}
          info={spanInfo}
          onMouseDown={(d: Decoration, ctrlKey: boolean) => dispatch(clickDecoration(d, ctrlKey))}
          isSelected={() => false}
          block={block}
        />
      ))}
    </div>
  )
}

type SelMode = 'empty' | 'text' | 'decoration-set'

class AnnotationDetailPanel extends React.Component<State & { dispatch: Dispatch }> {
  render() {
    const { doc, sel, range, dispatch } = this.props
    const mode: SelMode = sel.isEmpty() ? (range ? 'text' : 'empty') : 'decoration-set'

    return (
      <div className="panel annotation-detail-panel">
        <div className="part">
          <h2>Current Mode：{mode}</h2>
        </div>
        {mode === 'text' && <TextDetail doc={doc} range={range} sel={sel} dispatch={dispatch} />}
        {mode === 'decoration-set' && (
          <DecorationSetDetail doc={doc} range={range} sel={sel} dispatch={dispatch} />
        )}
      </div>
    )
  }
}

export default connect((s: State) => s)(AnnotationDetailPanel)
