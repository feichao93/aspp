import { Button, ButtonGroup, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { primaryTagConfigs, secondaryTagConfigs } from '../../taskConfig'
import { annotateCurrent } from '../../utils/actionCreators'

interface AnnotationButtonGroupProps {
  style: React.CSSProperties
  dispatch: Dispatch
}

class AnnotationButtonGroup extends React.Component<AnnotationButtonGroupProps> {
  render() {
    const { style, dispatch } = this.props
    return (
      <ButtonGroup style={style}>
        {primaryTagConfigs.map(tagConfig => (
          <Button key={tagConfig.name} onClick={() => dispatch(annotateCurrent(tagConfig.name))}>
            {tagConfig.shortcut} {tagConfig.label}
          </Button>
        ))}
        {secondaryTagConfigs.length > 0 && (
          <Popover
            content={
              <Menu>
                {secondaryTagConfigs.map(tagConfig => (
                  <MenuItem
                    key={tagConfig.name}
                    text={tagConfig.label}
                    label={tagConfig.shortcut}
                    onClick={() => dispatch(annotateCurrent(tagConfig.name))}
                  />
                ))}
              </Menu>
            }
            position={Position.BOTTOM_LEFT}
            minimal
            transitionDuration={0}
          >
            <Button text="更多标签" rightIcon="caret-down" />
          </Popover>
        )}
      </ButtonGroup>
    )
  }
}

export default connect()(AnnotationButtonGroup)
