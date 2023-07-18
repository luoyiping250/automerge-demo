import React from 'react';
import './App.css'
import * as Automerge from '@automerge/automerge'
import socket from './socket';
import './demo.css';
import RichEditor from './components/RichEditor';
import axios from 'axios';
import { toUint8Array, fromUint8Array } from 'js-base64';


export default class Demo extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      doc: Automerge.init()
    }
  }
  // 初始化文本对象
  docRef = React.createRef();

  componentDidMount(){
    this.loadDoc();
    this.handleSocketMsg();
  }

  loadDoc = () => {
    axios.get('/doc?id=22').then(res => {
      const data = res.data?.data;
      const docUnit8 = toUint8Array(data);
      const loadedDoc = Automerge.load(docUnit8);
      this.setState(
        {
        doc: loadedDoc
        }
      );
      this.docRef.current = loadedDoc
    })
  }

  handleSocketMsg = () => {
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
        this.setState(
          {
          doc: newDoc
          }
        );
        this.docRef.current = newDoc
       }
     }
    };
  }

  handleDocChange = (newContent) => {
    const {doc} = this.state;
    let newDoc = Automerge.change(Automerge.clone(doc), d => {
      // 设置文本初始内容
        d.text = new Automerge.Text(newContent);
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
    this.setState(
      {
      doc: newDoc
      }
    );
    this.docRef.current = newDoc
  }

  render(){
    const {doc} = this.state;

    return (
      <div className='demo'>
        <div>
          <h3>编辑器：</h3>
          <RichEditor text={doc?.text?.[0]?.toJSON()}
            onChange={(value) => {
              const oldTxt = this.docRef.current?.text?.[0]?.toJSON();
              if(value !== oldTxt && value !== '<p><br></p>'){
                this.handleDocChange(value);
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
}