import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { URLPartType } from './url-highlight'

export interface URLClickableOptions {
  onPartClick?: (partType: URLPartType, start: number, end: number) => void
  onPartDoubleClick?: (partType: URLPartType, start: number, end: number) => void
}

export const URLClickable = Extension.create<URLClickableOptions>({
  name: 'urlClickable',

  addOptions() {
    return {
      onPartClick: undefined,
      onPartDoubleClick: undefined,
    }
  },

  addProseMirrorPlugins() {
    const extension = this
    const { onPartClick, onPartDoubleClick } = extension.options

    return [
      new Plugin({
        key: new PluginKey('urlClickable'),
        props: {
          handleClick(view, pos, event) {
            if (!onPartClick) return false

            const { state } = view
            const $pos = state.doc.resolve(pos)
            const node = $pos.nodeAfter || $pos.nodeBefore
            
            if (!node) return false

            // 查找包含此位置的URL部分标记
            const marks = node.marks.filter((mark) => mark.type.name === 'urlHighlight')
            
            if (marks.length > 0) {
              const mark = marks[0]
              const partType = mark.attrs.partType as URLPartType
              const start = $pos.start()
              const end = $pos.end()
              
              onPartClick(partType, start, end)
              
              // 选中整个部分
              const tr = state.tr.setSelection(
                state.selection.constructor.create(state.doc, start, end)
              )
              view.dispatch(tr)
              
              return true
            }
            
            return false
          },
          handleDoubleClick(view, pos, event) {
            if (!onPartDoubleClick) return false

            const { state } = view
            const $pos = state.doc.resolve(pos)
            const node = $pos.nodeAfter || $pos.nodeBefore
            
            if (!node) return false

            // 查找包含此位置的URL部分标记
            const marks = node.marks.filter((mark) => mark.type.name === 'urlHighlight')
            
            if (marks.length > 0) {
              const mark = marks[0]
              const partType = mark.attrs.partType as URLPartType
              const start = $pos.start()
              const end = $pos.end()
              
              onPartDoubleClick(partType, start, end)
              
              // 选中整个部分以便快速编辑
              const tr = state.tr.setSelection(
                state.selection.constructor.create(state.doc, start, end)
              )
              view.dispatch(tr)
              
              return true
            }
            
            return false
          },
          decorations(state) {
            const decorations: Decoration[] = []
            const doc = state.doc

            doc.descendants((node, pos) => {
              const marks = node.marks.filter((mark) => mark.type.name === 'urlHighlight')
              
              if (marks.length > 0) {
                const mark = marks[0]
                const partType = mark.attrs.partType as URLPartType
                
                // 为可点击区域添加样式类
                const decoration = Decoration.inline(pos, pos + node.nodeSize, {
                  class: 'url-part-clickable cursor-pointer hover:underline',
                  'data-url-part': partType,
                })
                decorations.push(decoration)
              }
            })

            return DecorationSet.create(doc, decorations)
          },
        },
      }),
    ]
  },
})
