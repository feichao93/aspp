import { Button, Classes, Dialog, Icon, Intent, Tooltip } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import ASPP_CONFIG from '../../aspp-config'
import { State } from '../../reducers'
import Action from '../../utils/actions'

export interface HelpOverlayProps {
  isOpen: boolean
  dispatch: Dispatch<Action>
}

const Shortcut = ({ code, desc }: { code: string; desc: string }) => (
  <p>
    <code>{code}</code> {desc}
  </p>
)

class HelpOverlay extends React.PureComponent<HelpOverlayProps> {
  onClose = () => {
    this.props.dispatch(Action.toggleHelpOverlay())
  }

  render() {
    const { isOpen } = this.props

    return (
      <Dialog
        icon="help"
        title="标注工具帮助"
        isOpen={isOpen}
        onClose={this.onClose}
        style={{ width: 800 }}
      >
        <div className={Classes.DIALOG_BODY}>
          <h4>
            快捷键
            <Tooltip
              content={
                <div style={{ width: 350 }}>
                  如果当前选中了部分修饰对象，那么「当前的修饰对象」指的是这些选中的对象；<br />
                  如果当前没有没有选中对象，则「当前的修饰对象」指的是与当前选中文本有重叠的那些标注对象。
                </div>
              }
            >
              <Icon style={{ margin: 2 }} icon="info-sign" />
            </Tooltip>
          </h4>
          <div style={{ fontSize: '16px' }}>
            <Shortcut code="ctrl + z" desc="撤销" />
            <Shortcut code="ctrl + y" desc="重做" />
            <Shortcut code="ctrl + s" desc="保存当前标注文件" />
            <Shortcut code="s" desc="选中当前的修饰对象" />
            <Shortcut code="d" desc="删除当前的修饰对象" />
            <Shortcut code="a" desc="接受当前的提示" />
            <Shortcut code="Escape" desc="清空选择" />
            <h4>自定义快捷键</h4>
            <p>
              {ASPP_CONFIG.shortcutMap
                .map((name, key) => (
                  <React.Fragment key={key}>
                    <code>{key}</code>
                    <span style={{ marginRight: 8, marginLeft: 2 }}>{name}</span>
                  </React.Fragment>
                ))
                .valueSeq()}
            </p>
          </div>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={this.onClose} intent={Intent.PRIMARY}>
              关闭帮助
            </Button>
          </div>
        </div>
      </Dialog>
    )
  }
}

export default connect((s: State) => ({ isOpen: s.config.helpOverlay }))(HelpOverlay)
