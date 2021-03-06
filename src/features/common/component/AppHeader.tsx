import React from 'react'
import {
  Menu,
  Layout,
  Icon,
  Input,
  Badge,
  Dropdown,
  Avatar,
  Button,
  List,
  notification,
  message
} from 'antd'
import { NavLink, Route, Link } from 'react-router-dom'

import './AppHeader.less'
import { SignModalType } from './SignModal'
import Notification, { INotification, IMessage, NotificationTabKey } from './Notification'
import { OtherAPI } from '@common/api/config'

const Header = Layout.Header
const Search = Input.Search

interface IAppHeaderProps {
  onUserSignout: (e: React.MouseEvent) => void
  onOpenSignModal: (t: SignModalType) => void
  isAuth: boolean
  notifications: INotification[]
  messages: IMessage[]
  dataOnload: boolean
  reloadNotifications: () => void
  onRedirect: (url: string) => void
  onSearch: (keyword: string) => void
}

interface IAppHeaderState {
  showNotif: boolean
  readNotifs: INotification['id'][]
  readMsgs: IMessage['id'][]
}

export default class AppHeader extends React.Component<IAppHeaderProps, IAppHeaderState> {
  constructor(props: IAppHeaderProps) {
    super(props)
    this.state = {
      showNotif: false,
      readNotifs: [],
      readMsgs: []
    }
  }

  markRead = (type: NotificationTabKey, id?: number, markAll?: boolean) => {
    let ids: number[]
    const data = type === 'notification' ? this.props.notifications : this.props.messages
    const state = type === 'notification' ? 'readNotifs' : 'readMsgs'
    if (markAll) {
      ids = (data as { id: number }[]).map(d => d.id)
      this.setState({
        ...this.state,
        [state]: ids
      })
    } else {
      if (this.state[state].find(iid => iid === id)) {
        return
      }
      this.setState({
        ...this.state,
        [state]: [...this.state[state], id]
      })
      ids = [id]
    }
    OtherAPI.MarkRead(ids, type).then(() => this.props.reloadNotifications())
  }

  toggleNotif = (e: React.MouseEvent) => {
    e.stopPropagation()
    this.setState({
      showNotif: !this.state.showNotif
    })
  }
  closeNotif = () => {
    this.setState({
      showNotif: false
    })
  }
  componentDidMount() {
    // using window instead of document for React Event
    window.addEventListener('click', this.closeNotif)
  }
  componentWillUnmount() {
    window.removeEventListener('click', this.closeNotif)
  }

  render() {
    const readNotifs = this.state.readNotifs
    const notifications = this.props.notifications.filter(n => !readNotifs.find(id => id === n.id))
    const readMsgs = this.state.readMsgs
    const messages = this.props.messages.filter(m => !readMsgs.find(id => id === m.id))

    const onload = this.props.dataOnload
    const countAll = onload ? 0 : notifications.length + messages.length
    const count = {
      notifCount: notifications.length,
      msgCount: messages.length
    }

    const UserOverlay = (
      <Menu>
        <Menu.Item>
          <Link to="/profile">
            <Icon type="user" /> ????????????
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/profile/setting">
            <Icon type="setting" /> ??????
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="" onClick={this.props.onUserSignout}>
            <Icon type="poweroff" /> ??????
          </Link>
        </Menu.Item>
      </Menu>
    )
    const UserViewer = (
      <div className="user-viewer">
        <Search placeholder="????????????" onSearch={this.props.onSearch} />
        <div className="trigger trigger-notif" onClick={this.toggleNotif}>
          <Badge count={countAll}>
            <Icon type="bell" style={{ fontSize: '20px' }} />
          </Badge>
          {this.state.showNotif ? (
            <Notification
              messages={messages}
              notifications={notifications}
              count={count}
              onMarkRead={this.markRead}
              onRedirect={this.props.onRedirect}
              closeNotif={this.closeNotif}
            />
          ) : null}
        </div>
        <Dropdown overlay={UserOverlay}>
          <div className="trigger trigger-user">
            <Avatar shape="square" icon="user" />
          </div>
        </Dropdown>
      </div>
    )
    const SignButtonGroup = (
      <div className="sign-button-group">
        <Button type="primary" ghost onClick={() => this.props.onOpenSignModal('signin')}>
          ??????
        </Button>
        <Button type="primary" onClick={() => this.props.onOpenSignModal('signup')}>
          ??????
        </Button>
      </div>
    )

    return (
      <Header>
        <Route
          children={({ location }) => (
            <Menu theme="light" mode="horizontal" selectedKeys={[location.pathname.split('/')[1]]}>
              <Menu.Item key="home">
                <NavLink to="/">??????</NavLink>
              </Menu.Item>
              <Menu.Item key="article">
                <NavLink to="/article">??????</NavLink>
              </Menu.Item>
              <Menu.Item key="ask">
                <NavLink to="/ask">??????</NavLink>
              </Menu.Item>
              <Menu.Item key="counseling">
                <NavLink to="/counseling">??????</NavLink>
              </Menu.Item>
            </Menu>
          )}
        />
        {this.props.isAuth ? UserViewer : SignButtonGroup}
      </Header>
    )
  }
}
