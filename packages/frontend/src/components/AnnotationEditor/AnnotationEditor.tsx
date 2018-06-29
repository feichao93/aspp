import { is, Set } from 'immutable'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State } from '../../reducers'
import { Config } from '../../reducers/configReducer'
import Decoration from '../../types/Decoration'
import EditorState from '../../types/EditorState'
import FileInfo from '../../types/FileInfo'
import SelectionUtils from '../../utils/SelectionUtils'
import AnnotationButtonGroup from './AnnotationButtonGroup'
import './AnnotationEditor.styl'
import Block from './Block'
import EditHistoryButtonGroup from './EditHistoryButtonGroup'
import HintButtonGroup from './HintButtonGroup'

interface AnnotationEditorProps {
  editor: EditorState
  fileInfo: FileInfo
  config: Config
  dispatch: Dispatch
}

class AnnotationEditor extends React.Component<AnnotationEditorProps> {
  componentDidUpdate(prevProps: AnnotationEditorProps) {
    const currentRange = SelectionUtils.getCurrentRange()
    const { editor, fileInfo } = this.props
    // Synchronize native selection if necessary
    if (
      prevProps.fileInfo.docname === fileInfo.docname &&
      prevProps.fileInfo.collname === fileInfo.collname &&
      !is(currentRange, editor.range)
    ) {
      if (DEV_VERBOSE) {
        console.log(
          '%cSYNC_NATIVE_SELECTION',
          'background: #fedcd4;',
          `${currentRange} -> ${editor.range}`,
        )
      }
      SelectionUtils.setCurrentRange(editor.range)
    }
  }

  render() {
    const { dispatch, editor, config, fileInfo } = this.props

    const decorations = editor.gather()
    const decorationsByBlockIndex = decorations.groupBy(dec => dec.range.blockIndex)
    const selByBlockIndex = editor.sel
      .map(id => decorations.get(id))
      .groupBy(dec => dec.range.blockIndex)
    const hintCountMap = decorationsByBlockIndex.map(decSet => decSet.count(Decoration.isHint))

    return (
      <div className="annotation-editor">
        <div className="button-groups">
          <AnnotationButtonGroup />
          <EditHistoryButtonGroup />
          <HintButtonGroup />
        </div>
        <p style={{ marginLeft: 8 }}>{fileInfo.getFullName()}</p>
        <div className="editor">
          {editor.blocks.map((block, blockIndex) => (
            <Block
              key={blockIndex}
              block={block}
              blockIndex={blockIndex}
              hintCount={hintCountMap.get(blockIndex, 0)}
              decorations={decorationsByBlockIndex.get(blockIndex, Set()).toSet()}
              sel={selByBlockIndex
                .get(blockIndex, Set())
                .toSet()
                .map(dec => dec.id)}
              config={config}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ editor, config, fileInfo }: State) => ({ editor, config, fileInfo })

export default connect(mapStateToProps)(AnnotationEditor)
