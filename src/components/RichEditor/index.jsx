import '@wangeditor/editor/dist/css/style.css' // 引入 css

import React, { useState, useEffect } from 'react'
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { Boot } from '@wangeditor/editor'
import markdownModule from '@wangeditor/plugin-md'


function RichEditor({text, onChange}) {
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
                server: '/image/upload',
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
            <div style={{ border: '1px solid #ccc', zIndex: 100}}>
                <Toolbar
                    editor={editor}
                    defaultConfig={toolbarConfig}
                    mode="default"
                    style={{ borderBottom: '1px solid #ccc' }}
                />
                <Editor
                    defaultConfig={editorConfig}
                    value={text}
                    onCreated={setEditor}
                    onChange={editor => onChange && onChange(editor.getHtml())}
                    mode="default"
                    style={{ minHeight: 800, overflowY: 'hidden' }}
                />
            </div>
        </>
    )
}

export default RichEditor