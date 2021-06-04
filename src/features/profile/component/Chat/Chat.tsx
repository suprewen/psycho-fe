import { IStore } from '@common/storeConfig';
import { IUserInfo } from '@features/profile/Profile';
import Emitter from '@utils/events';
import { Typography, Input, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Element, scroller } from 'react-scroll';

import './Chat.less'

interface IChatProps {
  userInfo: IUserInfo
}

const messageList = [
  { reciverId: 2, senderId: 1, msg: 'hello' },
  { reciverId: 1, senderId: 2, msg: 'hi' }
]

function Chat(props: IChatProps & any) {
  const { userInfo, match } = props;
  const [text, settext] = useState('');
  const [wsMsg, setwsMsg] = useState<any>({});
  const [messages, setmessages] = useState([]);
  console.log('chatprops', props)
  // const { wsData, closeWebSocket } = useWebsocket({ url: `http://www.ragdoll.link:9800/websocket/${userInfo.id}/${userInfo.userName}/{unickname}/{uchathead}`, verify: true });
  let ws: WebSocket;

  const addMsg = (msg: any) => {
    scroller.scrollTo('button', {
      duration: 800,
      smooth: true,
      containerId: 'chat-container'
    })
    setmessages([...messages, msg])
  };

  useEffect(() => {
    addMsg(wsMsg)
  }, [wsMsg])

  useEffect(() => {
    if (userInfo) {
      const openWs = () => {
        ws = new WebSocket(`ws://www.ragdoll.link:8888/websocket/${userInfo.id}/${userInfo.userName}/{unickname}/{uchathead}`)
        ws.onopen = () => console.log('ws open')
        ws.onmessage = (e) => {
          const data = e.data.split('!∮@∮!')
          const [reciverId, senderId, msg] = data;
          setwsMsg({ reciverId, senderId, msg })
          console.log(e)
        }
        ws.onerror = (e) => console.error(e)
        ws.onclose = (e: any) => {
          console.log('onclose', e)
          openWs();
        }
      }
      openWs();

      Emitter.on('sendMsg', (msg) => {
        console.log(msg, ws.readyState)
        ws.send(msg)
      })
    }

    return () => {
      Emitter.removeAllListeners('sendMsg')
    }
  }, [userInfo]);

  const handleTextChange = (e: any) => {
    settext(e.target.value)
  }

  const handleSendBtn = () => {
    const sendMessage = [
      match.params.rID,
      match.params.sID,
      text
    ].join('!∮@∮!')
    Emitter.emit('sendMsg', sendMessage)
    // console.log(ws)
    // if (ws?.readyState === 1) ws.send(sendMessage.join('!∮@∮!'))
    // setmessages(messages.concat({ senderId: userInfo.id, reciverId: match.params.rID, msg: text }))
    addMsg({ senderId: userInfo.id, reciverId: match.params.rID, msg: text })
    settext('')
  }

  return (
    <div className="chat-detail">
      <div className="header">
        <Typography.Title level={3}>咨询室</Typography.Title>
      </div>
      <div className="main">
        <section id="chat-container">
          {messages.map((item, index) =>
          (
            <div className={`bubble-container ${item.senderId === userInfo?.id ? 'right' : 'left'}`} key={item.senderId + item.msg + index}>
              <div className="bubble">{item.msg}</div>
            </div>
          )
          )}
          <Element name="button"></Element>
        </section>
        {/* {JSON.stringify(props)} */}
      </div>
      <div className="footer">
        <Input.TextArea rows={4} onChange={handleTextChange} value={text} />
        <div className="send">
          <Button onClick={handleSendBtn} type="primary">发送</Button>
        </div>
      </div>
    </div>
  )
}

const mapState = (state: IStore) => ({
  // auth
  isAuth: state['@global'].auth.isAuth,
  authType: state['@global'].auth.authType,

  // data
  userInfo:
    state['info/pre'].response && state['info/pre'].response.data
      ? state['info/pre'].response.data
      : undefined,
})

export default connect(mapState)(Chat);