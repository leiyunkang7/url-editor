import { Template, URLState } from './types';

export class TemplateEngine {
  private static readonly DEFAULT_TEMPLATES: Template[] = [
    {
      name: '测试环境',
      url: 'https://test.{domain}:8080/{path}',
      variables: {}
    },
    {
      name: '生产环境',
      url: 'https://www.{domain}/{path}?env=prod',
      variables: {}
    },
    {
      name: '本地调试',
      url: 'http://localhost:3000/{path}',
      variables: {}
    }
  ];

  private templates: Template[] = [...TemplateEngine.DEFAULT_TEMPLATES];

  addTemplate(template: Template): void {
    this.templates.push(template);
  }

  getTemplates(): Template[] {
    return this.templates;
  }

  applyTemplate(templateName: string, currentState: URLState): URLState {
    const template = this.templates.find(t => t.name === templateName);
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }

    const variables = this.extractVariables(currentState);
    let processedUrl = template.url;

    // 替换变量
    Object.entries(variables).forEach(([key, value]) => {
      processedUrl = processedUrl.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    // 解析处理后的URL
    const { URLParser } = require('./url-parser');
    return URLParser.parse(processedUrl);
  }

  private extractVariables(state: URLState): Record<string, string> {
    return {
      domain: state.domain,
      path: state.path,
      protocol: state.protocol,
      port: state.port,
      query: state.query,
      fragment: state.fragment,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      timestamp: Date.now().toString()
    };
  }

  searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return this.templates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery)
    );
  }
} 