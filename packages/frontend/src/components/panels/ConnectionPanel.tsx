import React from 'react'
import { connect } from 'react-redux'
import { State } from '../../reducers'
import { ClientsState } from '../../reducers/clientsReducer'
import FileInfo from '../../types/FileInfo'
import './ConnectionPanel.styl'

export interface ConnectionPanelProps {
  clients: ClientsState
}

const Circle = ({ size, fill }: { size: number; fill: string }) => (
  <svg width={size} height={size}>
    <circle cx={size / 2} cy={size / 2} r={size / 2} fill={fill} />
  </svg>
)

class ConnectionPanel extends React.Component<ConnectionPanelProps> {
  render() {
    const { clients } = this.props
    const onlineClients = Object.values(clients)

    return (
      <div className="panel connection-panel">
        <p>
          {/*<Circle size={12} fill="#7bd80f" />*/}
          <span style={{ marginLeft: 8 }}>目前在线的标注人员列表：</span>
        </p>
        <div className="client-list">
          {onlineClients.map(client => {
            return (
              <div className="client" key={client.clientId}>
                <Circle size={12} fill={client.editingColl ? '#7bd80f' : 'black'} />
                <div className="username">{client.username}</div>
                <div className="status">
                  {client.online
                    ? client.editingColl
                      ? `正在编辑 ${new FileInfo(client.editingColl).getFullName()}`
                      : '空闲'
                    : '离线'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default connect((s: State) => ({ clients: s.clients }))(ConnectionPanel)
