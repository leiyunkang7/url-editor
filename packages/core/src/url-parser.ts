import { URLState, URLBlock } from './types';

export class URLParser {
  static parse(url: string): URLState {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    
    const blocks: URLBlock[] = [];
    let currentIndex = 0;

    // 协议
    const protocol = urlObj.protocol.replace(':', '');
    blocks.push({
      type: 'protocol',
      value: protocol,
      start: 0,
      end: protocol.length,
      focused: false
    });
    currentIndex += protocol.length + 3;

    // 域名
    const domain = urlObj.hostname;
    blocks.push({
      type: 'domain',
      value: domain,
      start: currentIndex,
      end: currentIndex + domain.length,
      focused: false
    });
    currentIndex += domain.length;

    // 端口
    const port = urlObj.port || '';
    blocks.push({
      type: 'port',
      value: port,
      start: currentIndex,
      end: currentIndex + port.length + (port ? 1 : 0),
      focused: false
    });
    currentIndex += port.length + (port ? 1 : 0);

    // 路径
    const path = urlObj.pathname;
    blocks.push({
      type: 'path',
      value: path,
      start: currentIndex,
      end: currentIndex + path.length,
      focused: false
    });
    currentIndex += path.length;

    // 查询参数
    const query = urlObj.search.substring(1);
    blocks.push({
      type: 'query',
      value: query,
      start: currentIndex,
      end: currentIndex + query.length + (query ? 1 : 0),
      focused: false
    });
    currentIndex += query.length + (query ? 1 : 0);

    // 锚点
    const fragment = urlObj.hash.substring(1);
    blocks.push({
      type: 'fragment',
      value: fragment,
      start: currentIndex,
      end: currentIndex + fragment.length + (fragment ? 1 : 0),
      focused: false
    });

    return {
      protocol,
      domain,
      port,
      path,
      query,
      fragment,
      blocks,
      currentBlockIndex: 0
    };
  }

  static build(state: URLState): string {
    let url = '';
    url += state.protocol + '://';
    url += state.domain;
    if (state.port) url += ':' + state.port;
    url += state.path;
    if (state.query) url += '?' + state.query;
    if (state.fragment) url += '#' + state.fragment;
    return url;
  }

  static validate(url: string): boolean {
    try {
      new URL(url.startsWith('http') ? url : `http://${url}`);
      return true;
    } catch {
      return false;
    }
  }
} 