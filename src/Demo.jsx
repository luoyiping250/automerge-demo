import { useEffect, useState, useRef } from 'react'
import './App.css'
import * as Automerge from '@automerge/automerge'
import socket from './socket';
import './demo.css';
import RichEditor from './components/RichEditor';


function Demo() {
  // 初始化文本对象
  const [doc, setDoc] = useState(Automerge.init());
  let docRef = useRef(doc);

  useEffect(() => { 
    handleSocketMsg();
  }, [])

  const handleSocketMsg = () => {
    // 监听文档更新消息
    socket.onmessage = (event) => {
      const msgStr = event.data;
      console.log('接收消息：' + msgStr);
      
     if(msgStr){
       let msg = msgStr && JSON.parse(msgStr);
       const {type, changes} = msg;
       if(type == 'update' && changes){
        // 特殊处理：将普通数组changes转为Uint8Array
        changes[0].length = Object.keys(changes[0])?.length;
        const changesUnit8 = new Uint8Array(Array.from(changes[0]));
        changes[0] = changesUnit8;

        // 解析文档内容更新
        let [newDoc] = Automerge.applyChanges(Automerge.clone(doc), changes);

        // 更新文档对象
        setDoc(newDoc)
        docRef.current = newDoc;
       }
     }
    };
  }

  const handleDocChange = (newContent) => {
    let newDoc = Automerge.change(Automerge.clone(doc), d => {
      // 设置文本初始内容
        d.text = [new Automerge.Text(newContent)];
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

    // 更新文档对象
    setDoc(newDoc)
    docRef.current = newDoc;
  }

  return (
    <div className='demo'>
      <div>
        <h3>编辑器：</h3>
        <RichEditor text={doc?.text?.[0]?.toJSON()}
          onChange={(value) => {
            const oldTxt = docRef.current?.text?.[0]?.toJSON();
            if(value !== oldTxt){
              handleDocChange(value);
            }
          }}
          height={1000}
        />
      </div>

      <div style={{ marginTop: '15px' }}>
        <h3>文档字符串：</h3>
        {doc?.text?.[0]?.toJSON()}
      </div>
    </div>
  )
}

export default Demo