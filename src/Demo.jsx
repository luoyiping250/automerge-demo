import { useEffect, useState } from 'react'
import './App.css'
import * as Automerge from '@automerge/automerge'
import { Input } from 'antd';
import socket from './socket';
import './demo.css';

function Demo() {
  const [msg, setMsg] = useState('消息为空');
  let doc = Automerge.init();

  useEffect(() => {

    // 监听消息
    socket.addEventListener('message', (event) => {
      const msgStr = event.data;
      let changes = msgStr && JSON.parse(msgStr)?.changes;
     if(changes){
       // eslint-disable-next-line no-debugger
       changes[0].length = Object.keys(changes[0])?.length;
       const changesUnit8 = new Uint8Array(Array.from(changes[0]));
       changes[0] = changesUnit8;
       let [newDoc, patch] = Automerge.applyChanges(doc, changes);
       // 解析文档内容
       const text1 = newDoc.ideas[0]?.toJSON();
       doc = newDoc;
       setMsg(text1);
     }
    });

  }, [])

  return (
    <div className='demo'>
      <div className='receive-msg'>
        <span className='title'>收消息：</span>
        <span>{msg}</span>
      </div>
      <div className='send-msg'>
        <span className='title'>发消息：</span>
        <Input placeholder="Basic usage" onPressEnter={e => {

          let newDoc = Automerge.change(Automerge.clone(doc), d => {
            // 设置文本初始内容
              d.ideas = [new Automerge.Text(e.target.value)];
          })

          // 获取文档内容变化
          let changes = Automerge.getChanges(doc, newDoc);

          // 通知changes
          if(changes?.length > 0){
            const msg = {
              type: 'update',
              changes: changes
            };
            socket.send(msg ? JSON.stringify(msg) : msg);
          }

          doc = newDoc;

        }}/>
      </div>
    </div>
  )
}

export default Demo