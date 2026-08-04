export type Category = 'Navigation' | 'Actions' | 'System' | 'Documentation' | 'Users';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: Category;
  shortcut?: string[];
  icon: string;
  badge?: string;
  action: () => void;
}

export interface SearchResponse {
  results: CommandItem[];
  query: string;
}
