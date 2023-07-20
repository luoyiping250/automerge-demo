/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable no-debugger */
import { useEffect, useState, useRef } from 'react'
import './App.css'
import * as Automerge from '@automerge/automerge'
import './OnlineEditor.css';
import RichEditor from './components/RichEditor';
import axios from 'axios';
import { toUint8Array, fromUint8Array } from 'js-base64';


function OnlineEditor(props) {
  const {wsUrl} = props;

  // 初始化文本对象
  const [doc, setDoc] = useState(Automerge.init());
  let docRef = useRef(doc);
  let socket;

  const createSocket = () => {
    socket = new WebSocket(wsUrl ? wsUrl : `wss://${location.host}`);

    socket.onopen = function(){
      console.log("websocket已连接");
    };

    socket.onclose = function(){ 
      console.log("websocket已关闭"); 
    };

    socket.onerror = function(error){ 
      console.log("websocket错误：" + error); 
      setTimeout(() => {
        createSocket()
      }, 10000);
    };
  }

  useEffect(() => { 
    createSocket()
    loadDoc();
    handleSocketMsg();
  }, [])

  const loadDoc = () => {
    axios.get('/doc?id=22').then(res => {
      const data = res.data?.data;
      const docUnit8 = toUint8Array(data);
      const loadedDoc = Automerge.load(docUnit8);
      setDoc(loadedDoc);
      docRef.current = loadedDoc
    })
  }

  const handleSocketMsg = () => {
    // 监听文档更新消息
    socket.onmessage = (event) => {
      const msgStr = event.data;
      console.log('接收消息：' + msgStr);
      
     if(msgStr){
       let msg = msgStr && JSON.parse(msgStr);
       const {type, changes} = msg;
       if(type == 'update' && changes){
        // 特殊处理：base64 string的changes转为Uint8Array
        const changesUnit8 = [];
        changes?.forEach(change => {
          changesUnit8.push(toUint8Array(change));
        })

        // 解析文档内容更新
        let [newDoc, patch] = Automerge.applyChanges(Automerge.clone(doc), changesUnit8);

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
        d.text = newContent;
    })

    // 获取文档内容变化
    let changes = Automerge.getChanges(doc, newDoc);

    // 通知changes，将unit8Array转为Base64 string
    const changesBase64 = [];
    changes.forEach((change) => {
      changesBase64.push(fromUint8Array(change))
    })
    if(changes?.length > 0){
      const msg = {
        type: 'update',
        changes: changesBase64
      };
      socket.send(msg ? JSON.stringify(msg) : msg);
    }

    // 更新文档对象
    setDoc(newDoc)
    docRef.current = newDoc;
  }

  return (
    <div className='online-editor'>
        <RichEditor text={doc?.text}
          {...props}
          onChange={(value) => {
            const oldTxt = docRef.current?.text;
            if(value !== oldTxt && value !== '<p><br></p>'){
              handleDocChange(value);
            }
          }}
        />
    </div>
  )
}

export default OnlineEditor