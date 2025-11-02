import { Mark, mergeAttributes } from '@tiptap/core'

export type URLPartType = 'protocol' | 'domain' | 'port' | 'path' | 'query' | 'fragment' | 'separator'

export interface URLHighlightAttributes {
  partType: URLPartType
  partValue?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    urlHighlight: {
      setURLHighlight: (attributes: URLHighlightAttributes) => ReturnType
      toggleURLHighlight: (attributes: URLHighlightAttributes) => ReturnType
      unsetURLHighlight: () => ReturnType
    }
  }
}

export const URLHighlight = Mark.create<URLHighlightAttributes>({
  name: 'urlHighlight',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-url-part]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false
          const element = node as HTMLElement
          const partType = element.getAttribute('data-url-part')
          if (!partType) return false
          return {
            partType: partType as URLPartType,
            partValue: element.getAttribute('data-url-value') || undefined,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const partType = HTMLAttributes.partType || 'separator'
    const partValue = HTMLAttributes.partValue || ''
    
    const classMap: Record<URLPartType, string> = {
      protocol: 'text-blue-600 font-semibold',
      domain: 'text-green-600 font-medium',
      port: 'text-orange-600 font-medium',
      path: 'text-purple-600',
      query: 'text-yellow-600',
      fragment: 'text-gray-600',
      separator: 'text-gray-400',
    }

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: classMap[partType] || '',
        'data-url-part': partType,
        'data-url-value': partValue,
      }),
      0,
    ]
  },

  addAttributes() {
    return {
      partType: {
        default: 'separator' as URLPartType,
        parseHTML: (element) => element.getAttribute('data-url-part') as URLPartType,
        renderHTML: (attributes) => {
          if (!attributes.partType) {
            return {}
          }
          return {
            'data-url-part': attributes.partType,
          }
        },
      },
      partValue: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-url-value'),
        renderHTML: (attributes) => {
          if (!attributes.partValue) {
            return {}
          }
          return {
            'data-url-value': attributes.partValue,
          }
        },
      },
    }
  },

  addCommands() {
    return {
      setURLHighlight:
        (attributes: URLHighlightAttributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      toggleURLHighlight:
        (attributes: URLHighlightAttributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },
      unsetURLHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})
