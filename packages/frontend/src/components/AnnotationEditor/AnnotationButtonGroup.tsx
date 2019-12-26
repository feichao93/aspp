import { Button, ButtonGroup, Menu, MenuItem, Popover, Position } from '@blueprintjs/core'
import React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import ASPP_CONFIG from '../../aspp-config'
import { State } from '../../reducers'
import Action from '../../utils/actions'

interface AnnotationButtonGroupProps {
  dispatch: Dispatch
  activeGroup: string
}

class AnnotationButtonGroup extends React.PureComponent<AnnotationButtonGroupProps> {
  render() {
    const { dispatch, activeGroup } = this.props
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
          .map((tagConfigList, groupName) => {
            const groupConfig = ASPP_CONFIG.asppConfig.groups.find(g => g.name === groupName)

            return (
              <Popover
                key={groupName}
                isOpen={activeGroup === groupName}
                onClose={() => dispatch(Action.setActiveGroup(''))}
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
                target={
                  <Button
                    onClick={() => dispatch(Action.setActiveGroup(groupName))}
                    rightIcon="caret-down"
                  >
                    {groupConfig && groupConfig.shortcutPrefix} {groupName}
                  </Button>
                }
                position={Position.BOTTOM_LEFT}
                minimal
                transitionDuration={0}
              />
            )
          })
          .valueSeq()}
      </ButtonGroup>
    )
  }
}

export default connect((state: State) => ({ activeGroup: state.editor.activeGroup }))(
  AnnotationButtonGroup,
)
