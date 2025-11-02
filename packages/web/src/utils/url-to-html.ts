import { URLPartType } from '../extensions/url-highlight'

export interface URLPart {
  type: URLPartType
  value: string
  start: number
  end: number
}

/**
 * 解析URL并返回各个部分的数组
 */
export function parseURLParts(url: string): URLPart[] {
  const parts: URLPart[] = []
  
  if (!url || !url.trim()) {
    return parts
  }
  
  try {
    // 如果URL没有协议，尝试添加http://
    let normalizedUrl = url.trim()
    let hasProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalizedUrl)
    
    if (!hasProtocol) {
      normalizedUrl = `http://${normalizedUrl}`
    }
    
    const urlObj = new URL(normalizedUrl)
    
    let currentPos = 0
    
    // 协议部分
    const protocol = urlObj.protocol.replace(':', '')
    if (hasProtocol) {
      parts.push({
        type: 'protocol',
        value: protocol,
        start: currentPos,
        end: currentPos + protocol.length,
      })
      currentPos += protocol.length
      
      // 分隔符 ://
      parts.push({
        type: 'separator',
        value: '://',
        start: currentPos,
        end: currentPos + 3,
      })
      currentPos += 3
    }
    
    // 域名部分
    const domain = urlObj.hostname || ''
    if (domain) {
      parts.push({
        type: 'domain',
        value: domain,
        start: currentPos,
        end: currentPos + domain.length,
      })
      currentPos += domain.length
    }
    
    // 端口部分（如果存在）
    if (urlObj.port) {
      parts.push({
        type: 'separator',
        value: ':',
        start: currentPos,
        end: currentPos + 1,
      })
      currentPos += 1
      
      parts.push({
        type: 'port',
        value: urlObj.port,
        start: currentPos,
        end: currentPos + urlObj.port.length,
      })
      currentPos += urlObj.port.length
    }
    
    // 路径部分
    const path = urlObj.pathname
    if (path && path !== '/') {
      parts.push({
        type: 'path',
        value: path,
        start: currentPos,
        end: currentPos + path.length,
      })
      currentPos += path.length
    } else if (path === '/') {
      parts.push({
        type: 'path',
        value: '/',
        start: currentPos,
        end: currentPos + 1,
      })
      currentPos += 1
    }
    
    // 查询参数部分（如果存在）
    if (urlObj.search) {
      parts.push({
        type: 'separator',
        value: '?',
        start: currentPos,
        end: currentPos + 1,
      })
      currentPos += 1
      
      const query = urlObj.search.substring(1)
      if (query) {
        parts.push({
          type: 'query',
          value: query,
          start: currentPos,
          end: currentPos + query.length,
        })
        currentPos += query.length
      }
    }
    
    // 锚点部分（如果存在）
    if (urlObj.hash) {
      parts.push({
        type: 'separator',
        value: '#',
        start: currentPos,
        end: currentPos + 1,
      })
      currentPos += 1
      
      const fragment = urlObj.hash.substring(1)
      if (fragment) {
        parts.push({
          type: 'fragment',
          value: fragment,
          start: currentPos,
          end: currentPos + fragment.length,
        })
      }
    }
  } catch (error) {
    // 如果URL解析失败，尝试简单解析
    // 检查是否包含协议
    const protocolMatch = url.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:)/)
    if (protocolMatch) {
      const protocol = protocolMatch[1].replace(':', '')
      parts.push({
        type: 'protocol',
        value: protocol,
        start: 0,
        end: protocol.length,
      })
      
      const rest = url.substring(protocol.length + 1)
      if (rest) {
        parts.push({
          type: 'separator',
          value: '://',
          start: protocol.length,
          end: protocol.length + 3,
        })
        
        parts.push({
          type: 'domain',
          value: rest,
          start: protocol.length + 3,
          end: url.length,
        })
      }
    } else {
      // 如果URL解析失败，返回原始文本作为域名部分
      parts.push({
        type: 'domain',
        value: url,
        start: 0,
        end: url.length,
      })
    }
  }
  
  return parts
}

/**
 * 将URL转换为TipTap可以使用的HTML格式，包含高亮标记
 */
export function urlToHTML(url: string): string {
  if (!url.trim()) {
    return '<p></p>'
  }
  
  const parts = parseURLParts(url)
  const htmlParts: string[] = []
  
  for (const part of parts) {
    if (part.type === 'separator') {
      htmlParts.push(`<span data-url-part="separator">${escapeHtml(part.value)}</span>`)
    } else {
      htmlParts.push(
        `<span data-url-part="${part.type}" data-url-value="${escapeHtml(part.value)}">${escapeHtml(part.value)}</span>`
      )
    }
  }
  
  return `<p>${htmlParts.join('')}</p>`
}

/**
 * 从HTML中提取纯文本URL
 */
export function htmlToURL(html: string): string {
  // 创建一个临时div来解析HTML
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

/**
 * HTML转义
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
