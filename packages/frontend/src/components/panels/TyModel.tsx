import { Button, Checkbox, Classes, Dialog, Intent, Label } from '@blueprintjs/core'
import React from 'react'

export const TY_DESCRIPTION = '田野的模型，具体是什么我也不知道'

export interface TyModelConfig {
  addr: string
  // TODO runWhenOpenDoc
  // TODO skipNonEmptyDoc
}

export interface TyModelDialogProps {
  initConfig: TyModelConfig
  isOpen: boolean
  onClose(): void
  onChangeConfig(newConfig: TyModelConfig): void
}

export interface TyModelDialogState {
  runWhenOpenDoc: boolean
  skipNonEmptyDoc: boolean
  addr: string
  cache: { isOpen: boolean }
}

export class TyModelDialog extends React.Component<TyModelDialogProps, TyModelDialogState> {
  static getDerivedStateFromProps(nextProps: TyModelDialogProps, prevState: TyModelDialogState) {
    const nextAddr =
      !prevState.cache.isOpen && nextProps.isOpen ? prevState.addr : nextProps.initConfig.addr
    return {
      addr: nextAddr,
      cache: { isOpen: nextProps.isOpen },
    }
  }

  state = {
    runWhenOpenDoc: true,
    skipNonEmptyDoc: true,
    addr: '',
    cache: { isOpen: this.props.isOpen },
  }

  onConfirm = () => {
    const { addr } = this.state
    const { onClose, onChangeConfig } = this.props
    onChangeConfig({ addr })
    onClose()
  }

  render() {
    const { isOpen, onClose } = this.props
    const { runWhenOpenDoc, skipNonEmptyDoc, addr } = this.state

    return (
      <Dialog isOpen={isOpen}>
        <div className={Classes.DIALOG_HEADER}>配置 ty-model</div>
        <div className={Classes.DIALOG_BODY}>
          <Label text="服务地址" inline>
            <input
              value={addr}
              className={Classes.INPUT}
              style={{ width: '60%' }}
              placeholder="http://10.214......"
              onChange={e => this.setState({ addr: e.target.value })}
            />
          </Label>
          <Checkbox
            disabled
            checked={runWhenOpenDoc}
            label="在打开新的文档时自动运行"
            onChange={() => this.setState({ runWhenOpenDoc: !runWhenOpenDoc })}
          />
          <Checkbox
            disabled
            checked={skipNonEmptyDoc}
            label="跳过已经有内容的文档"
            onChange={() => this.setState({ skipNonEmptyDoc: !skipNonEmptyDoc })}
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button onClick={this.onConfirm} intent={Intent.PRIMARY}>
              确认
            </Button>
            <Button onClick={onClose}>取消</Button>
          </div>
        </div>
      </Dialog>
    )
  }
}
