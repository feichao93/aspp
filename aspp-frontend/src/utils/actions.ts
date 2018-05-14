import { Intent } from '@blueprintjs/core'
import { Map, Set } from 'immutable'
import InlineAlgorithm from '../inline-algorithms/InlineAlgorithm'
import { TreeState } from '../reducers/treeReducer'
import Annotation from '../types/Annotation'
import Decoration, { Hint, Slot } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import MainState from '../types/MainState'

type Action = Action.ALL

namespace Action {
  export type ALL =
    | SetMainState
    | AddAnnotations
    | AnnotationsSaved
    | AddSlots
    | AddHints
    | DeleteDecorations
    | SetSel
    | SelectBlockText
    | AcceptBlock
    | ClearBlockDecorations
    | SetRange
    | Toast
    | AnnotateCurrent
    | ClickDecoration
    | DeleteCurrent
    | AcceptCurrent
    | SelectMatch
    | ToggleDarkTheme
    | ToggleTaskTreeVisibility
    | AcceptHints
    | RequestDownloadResult
    | LoadFileContent
    | SubscribeAlgorithm
    | UnsubscribeAlgorithm
    | LoadData
    | ClickDocTreeNode
    | ClickAnnotationSetTreeNode
    | RequestAddAnnotationSet
    | RequestDeleteAnnotationSet
    | RequestSaveCurrentAnnotationSet
    | RequestOpenAnnotationSetFile

  export interface SetMainState {
    type: 'R_SET_MAIN_STATE'
    mainState: MainState
  }

  export interface AddAnnotations {
    type: 'R_ADD_ANNOTATIONS'
    annotations: Map<string, Annotation>
  }

  export interface AnnotationsSaved {
    type: 'R_ANNOTATIONS_SAVED'
  }

  export interface AddSlots {
    type: 'R_ADD_SLOTS'
    slots: Map<string, Slot>
  }

  export interface AddHints {
    type: 'R_ADD_HINTS'
    hints: Map<string, Hint>
  }

  export interface DeleteDecorations {
    type: 'R_DELETE_DECORATIONS'
    idSet: Set<string>
  }

  export interface SetSel {
    type: 'R_SET_SEL'
    sel: Set<string>
  }

  export interface SelectBlockText {
    type: 'SELECT_BLOCK_TEXT'
    blockIndex: number
  }

  export interface AcceptBlock {
    type: 'ACCEPT_BLOCK'
    blockIndex: number
  }

  // TODO rename to DELETE_BLOCK_DECORATIONS
  export interface ClearBlockDecorations {
    type: 'CLEAR_BLOCK_DECORATIONS'
    blockIndex: number
  }

  export interface SetRange {
    type: 'R_SET_RANGE'
    range: DecorationRange
  }

  export interface Toast {
    type: 'TOAST'
    message: string
    intent: Intent
  }

  export interface AnnotateCurrent {
    type: 'ANNOTATE_CURRENT'
    tag: string
  }

  export interface ClickDecoration {
    type: 'CLICK_DECORATION'
    decoration: Decoration
    ctrlKey: boolean
  }

  export interface DeleteCurrent {
    type: 'DELETE_CURRENT'
  }

  export interface AcceptCurrent {
    type: 'ACCEPT_CURRENT'
  }

  export interface SelectMatch {
    type: 'SELECT_MATCH'
    pattern: string | RegExp
  }

  export interface ToggleDarkTheme {
    type: 'R_TOGGLE_DARK_THEME'
  }

  export interface ToggleTaskTreeVisibility {
    type: 'R_TOGGLE_TASK_TREE_VISIBILITY'
  }

  export interface AcceptHints {
    type: 'ACCEPT_HINTS'
    accepting: Map<string, Hint>
  }

  export interface RequestDownloadResult {
    type: 'REQUEST_DOWNLOAD_RESULT'
    format: 'json' | 'bio'
  }

  export interface LoadFileContent {
    type: 'LOAD_FILE_CONTENT'
    content: string
  }

  export interface SubscribeAlgorithm {
    type: 'SUBSCRIBE_ALGORITHM'
    id: string
    // TODO add support for 'worker' and 'websocket'
    algorithmType: 'inline'
    inlineImplementation: { new (): InlineAlgorithm }
  }

  export interface UnsubscribeAlgorithm {
    type: 'UNSUBSCRIBE_ALGORITHM'
    id: string
  }

  export interface LoadData {
    type: 'LOAD_DATA'
    data: TreeState
  }

  /** @deprecated useless */
  export interface ClickDocTreeNode {
    type: 'CLICK_DOC_TREE_NODE'
    docname: string
  }

  /** @deprecated useless */
  export interface ClickAnnotationSetTreeNode {
    type: 'CLICK_ANNOTATION_SET_TREE_NODE'
    docname: string
    annotationSetName: string
  }

  export interface RequestAddAnnotationSet {
    type: 'REQUEST_ADD_ANNOTATION_SET'
    docname: string
  }

  export interface RequestDeleteAnnotationSet {
    type: 'REQUEST_DELETE_ANNOTATION_SET'
    docname: string
    annotationSetName: string
  }

  export interface RequestSaveCurrentAnnotationSet {
    type: 'REQUEST_SAVE_CURRENT_ANNOTATION_SET'
  }

  export interface RequestOpenAnnotationSetFile {
    type: 'REQUEST_OPEN_ANNOTATION_SET_FILE'
    docname: string
    annotationSetName: string
  }
}

export default Action
