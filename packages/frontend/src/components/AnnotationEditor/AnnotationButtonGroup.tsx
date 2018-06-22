import { Button, ButtonGroup, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import ASPP_CONFIG from '../../aspp-config'
import Action from '../../utils/actions'

interface AnnotationButtonGroupProps {
  dispatch: Dispatch
}

class AnnotationButtonGroup extends React.PureComponent<AnnotationButtonGroupProps> {
  render() {
    const { dispatch } = this.props
    return (
      <ButtonGroup>
        {ASPP_CONFIG.defaultGroup.map(tagConfig => (
          <Button
            key={tagConfig.name}
            onClick={() => dispatch(Action.userAnnotateCurrent(tagConfig.name))}
          >
            {tagConfig.shortcut} {tagConfig.label}
          </Button>
        ))}
        {ASPP_CONFIG.otherGroups
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
                      onClick={() => dispatch(Action.userAnnotateCurrent(tagConfig.name))}
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
