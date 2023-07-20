/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import React, { useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { Boot } from '@wangeditor/editor'
import markdownModule from '@wangeditor/plugin-md'
import { Row, Col } from 'antd'
import './index.css';


function RichEditor(props) {
    const {text, onChange, uploadUrl} = props;
    // editor 实例
    const [editor, setEditor] = useState(null)                   // JS 语法

    // 注册插件
    Boot.registerModule(markdownModule)

    // 工具栏配置
    const toolbarConfig = { }                        // JS 语法

    // 编辑器配置
    const editorConfig = {                         // JS 语法
        placeholder: '请输入内容...',
        // 修改 uploadImage 菜单配置
        MENU_CONF: {
            uploadImage: {
                server: uploadUrl || '/image/upload',
                fieldName: 'file',
            }
        }
    }

    // 及时销毁 editor ，重要！
    useEffect(() => {
        return () => {
            if (editor == null) return
            editor.destroy()
            setEditor(null)
        }
    }, [editor])

    return (
        <>
            <div className='rich-editor'>
                <Toolbar
                    editor={editor}
                    defaultConfig={toolbarConfig}
                    mode="default"
                    className='rich-editor-toobar'
                />
                <Row className='rich-editor-body'>
                    <Col span={6} className='rich-editor-outline'>
                    文档大纲
                    </Col>
                    <Col span={16} className='rich-editor-content'>
                        <Editor
                        defaultConfig={editorConfig}
                        value={text}
                        onCreated={setEditor}
                        onChange={editor => onChange && onChange(editor.getHtml())}
                        mode="default"
                        style={{ minHeight: 800, overflowY: 'auto' }}
                    />
                    </Col>
                    <Col span={2} className='rich-editor-right-tab'>
                        右侧tab
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default RichEditor