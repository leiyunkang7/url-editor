export interface URLBlock {
  type: 'protocol' | 'domain' | 'port' | 'path' | 'query' | 'fragment';
  value: string;
  start: number;
  end: number;
  focused: boolean;
}

export interface URLState {
  protocol: string;
  domain: string;
  port: string;
  path: string;
  query: string;
  fragment: string;
  blocks: URLBlock[];
  currentBlockIndex: number;
}

export interface Template {
  name: string;
  url: string;
  variables: Record<string, string>;
}

export interface URLHistory {
  id: string;
  url: string;
  timestamp: number;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
} 