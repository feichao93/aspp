import { Button, ButtonGroup, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import CONFIG from '../../taskConfig'
import { annotateCurrent } from '../../utils/actionCreators'

interface AnnotationButtonGroupProps {
  dispatch: Dispatch
}

class AnnotationButtonGroup extends React.Component<AnnotationButtonGroupProps> {
  render() {
    const { dispatch } = this.props
    return (
      <ButtonGroup>
        {CONFIG.defaultGroup.map(tagConfig => (
          <Button key={tagConfig.name} onClick={() => dispatch(annotateCurrent(tagConfig.name))}>
            {tagConfig.shortcut} {tagConfig.label}
          </Button>
        ))}
        {CONFIG.otherGroups
          .map((tagConfigList, groupName) => (
            <Popover
              key={groupName}
              content={
                <Menu>
                  {tagConfigList.map(tagConfig => (
                    <MenuItem
                      key={tagConfig.name}
                      text={tagConfig.label}
                      label={tagConfig.shortcut}
                      onClick={() => dispatch(annotateCurrent(tagConfig.name))}
                    />
                  ))}
                </Menu>
              }
              target={<Button text={groupName} rightIcon="caret-down" />}
              position={Position.BOTTOM_LEFT}
              minimal
              transitionDuration={0}
            />
          ))
          .valueSeq()}
      </ButtonGroup>
    )
  }
}

export default connect()(AnnotationButtonGroup)
