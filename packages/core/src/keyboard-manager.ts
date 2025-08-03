import { URLState, KeyboardShortcut } from './types';

export class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private state: URLState;

  constructor(state: URLState) {
    this.state = state;
    this.initializeShortcuts();
  }

  private initializeShortcuts(): void {
    // Tab/Shift+Tab - 区块间跳转
    this.addShortcut('tab', '下一个区块', () => this.nextBlock());
    this.addShortcut('shift+tab', '上一个区块', () => this.previousBlock());
    
    // Space - 切换协议
    this.addShortcut('space', '切换协议', () => this.toggleProtocol());
    
    // 端口操作
    this.addShortcut('up', '端口+1', () => this.incrementPort());
    this.addShortcut('down', '端口-1', () => this.decrementPort());
    this.addShortcut('ctrl+up', '快速端口80', () => this.setPort(80));
    this.addShortcut('ctrl+down', '快速端口443', () => this.setPort(443));
    
    // 路径操作
    this.addShortcut('ctrl+d', '插入日期', () => this.insertDate());
    this.addShortcut('enter', '插入斜杠', () => this.insertSlash());
    
    // 域名操作
    this.addShortcut('ctrl+left', '子域名跳转', () => this.previousSubdomain());
    this.addShortcut('ctrl+right', '子域名跳转', () => this.nextSubdomain());
    
    // 模板操作
    this.addShortcut('f1', '测试环境模板', () => this.applyTemplate('测试环境'));
    this.addShortcut('f2', '生产环境模板', () => this.applyTemplate('生产环境'));
    this.addShortcut('f3', '本地调试模板', () => this.applyTemplate('本地调试'));
    
    // 复制粘贴
    this.addShortcut('ctrl+c', '复制URL', () => this.copyURL());
    this.addShortcut('ctrl+v', '粘贴URL', () => this.pasteURL());
  }

  addShortcut(key: string, description: string, action: () => void): void {
    this.shortcuts.set(key, { key, description, action });
  }

  handleKeyEvent(event: KeyboardEvent): boolean {
    const key = this.getKeyString(event);
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
      return true;
    }
    
    return false;
  }

  private getKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    
    if (event.key === 'Tab') parts.push('tab');
    else if (event.key === ' ') parts.push('space');
    else if (event.key === 'ArrowUp') parts.push('up');
    else if (event.key === 'ArrowDown') parts.push('down');
    else if (event.key === 'ArrowLeft') parts.push('left');
    else if (event.key === 'ArrowRight') parts.push('right');
    else if (event.key === 'Enter') parts.push('enter');
    else if (event.key === 'c') parts.push('c');
    else if (event.key === 'v') parts.push('v');
    else if (event.key === 'd') parts.push('d');
    else if (event.key >= 'F1' && event.key <= 'F12') parts.push(event.key.toLowerCase());
    
    return parts.join('+');
  }

  private nextBlock(): void {
    this.state.currentBlockIndex = (this.state.currentBlockIndex + 1) % this.state.blocks.length;
    this.updateFocus();
  }

  private previousBlock(): void {
    this.state.currentBlockIndex = this.state.currentBlockIndex === 0 
      ? this.state.blocks.length - 1 
      : this.state.currentBlockIndex - 1;
    this.updateFocus();
  }

  private updateFocus(): void {
    this.state.blocks.forEach((block, index) => {
      block.focused = index === this.state.currentBlockIndex;
    });
  }

  private toggleProtocol(): void {
    if (this.state.protocol === 'http') {
      this.state.protocol = 'https';
      if (this.state.port === '80') this.state.port = '443';
    } else {
      this.state.protocol = 'http';
      if (this.state.port === '443') this.state.port = '80';
    }
  }

  private incrementPort(): void {
    const port = parseInt(this.state.port) || 0;
    if (port < 65535) {
      this.state.port = (port + 1).toString();
    }
  }

  private decrementPort(): void {
    const port = parseInt(this.state.port) || 0;
    if (port > 1) {
      this.state.port = (port - 1).toString();
    }
  }

  private setPort(port: number): void {
    this.state.port = port.toString();
  }

  private insertDate(): void {
    const date = new Date().toISOString().split('T')[0];
    this.state.path += `/${date}`;
  }

  private insertSlash(): void {
    this.state.path += '/';
  }

  private previousSubdomain(): void {
    const subdomains = ['www', 'api', 'test', 'dev', 'staging'];
    const currentIndex = subdomains.indexOf(this.state.domain.split('.')[0]);
    const newIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + subdomains.length) % subdomains.length;
    const domainParts = this.state.domain.split('.');
    domainParts[0] = subdomains[newIndex];
    this.state.domain = domainParts.join('.');
  }

  private nextSubdomain(): void {
    const subdomains = ['www', 'api', 'test', 'dev', 'staging'];
    const currentIndex = subdomains.indexOf(this.state.domain.split('.')[0]);
    const newIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % subdomains.length;
    const domainParts = this.state.domain.split('.');
    domainParts[0] = subdomains[newIndex];
    this.state.domain = domainParts.join('.');
  }

  private applyTemplate(templateName: string): void {
    // 这里需要集成模板引擎
    console.log(`Applying template: ${templateName}`);
  }

  private copyURL(): void {
    const { URLParser } = require('./url-parser');
    const url = URLParser.build(this.state);
    navigator.clipboard.writeText(url);
  }

  private pasteURL(): void {
    navigator.clipboard.readText().then(text => {
      const { URLParser } = require('./url-parser');
      this.state = URLParser.parse(text);
    });
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
} 