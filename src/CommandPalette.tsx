import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  Settings, 
  User, 
  Terminal, 
  Zap, 
  Moon, 
  HelpCircle, 
  LogOut, 
  Compass, 
  Folder,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { CommandItem, Category } from './types';

// Helper icon renderer mapping string keys to Lucide icons
const IconMap: Record<string, React.FC<{ className?: string }>> = {
  Search,
  FileText,
  Settings,
  User,
  Terminal,
  Zap,
  Moon,
  HelpCircle,
  LogOut,
  Compass,
  Folder,
  ShieldCheck,
  Sparkles,
};

// Initial Mock Dataset
const INITIAL_COMMANDS: CommandItem[] = [
  {
    id: 'cmd-1',
    title: 'Go to Dashboard',
    subtitle: 'Main metrics overview and analytics',
    category: 'Navigation',
    shortcut: ['G', 'D'],
    icon: 'Compass',
    badge: 'Page',
    action: () => alert('Navigating to Dashboard...'),
  },
  {
    id: 'cmd-2',
    title: 'System Settings',
    subtitle: 'Configure theme, keys, and security',
    category: 'Navigation',
    shortcut: ['G', 'S'],
    icon: 'Settings',
    badge: 'Page',
    action: () => alert('Opening System Settings...'),
  },
  {
    id: 'cmd-3',
    title: 'Toggle Dark / Light Mode',
    subtitle: 'Switch application color palette',
    category: 'Actions',
    shortcut: ['⌘', 'T'],
    icon: 'Moon',
    action: () => alert('Theme toggled!'),
  },
  {
    id: 'cmd-4',
    title: 'Clear Local Cache & Refresh',
    subtitle: 'Flush stored session tokens and app state',
    category: 'Actions',
    icon: 'Zap',
    badge: 'Action',
    action: () => alert('Cache cleared successfully.'),
  },
  {
    id: 'cmd-5',
    title: 'API Reference & Specs',
    subtitle: 'View GraphQL schema & REST endpoint docs',
    category: 'Documentation',
    shortcut: ['G', 'A'],
    icon: 'FileText',
    action: () => window.open('https://developer.mozilla.org', '_blank'),
  },
  {
    id: 'cmd-6',
    title: 'User Profile & Roles',
    subtitle: 'Manage active permissions & workspace access',
    category: 'Users',
    icon: 'User',
    action: () => alert('Viewing User Profile...'),
  },
  {
    id: 'cmd-7',
    title: 'Run Diagnostic Terminal Check',
    subtitle: 'Execute health check across micro-services',
    category: 'System',
    shortcut: ['⌘', 'Shift', 'D'],
    icon: 'Terminal',
    badge: 'System',
    action: () => alert('Running diagnostic tests...'),
  },
  {
    id: 'cmd-8',
    title: 'Security Audit Log',
    subtitle: 'Inspect login attempts & OAuth tokens',
    category: 'System',
    icon: 'ShieldCheck',
    action: () => alert('Opening Security Audit Log...'),
  },
  {
    id: 'cmd-9',
    title: 'Help & Support Desk',
    subtitle: 'Open ticket or talk to engineering support',
    category: 'Documentation',
    icon: 'HelpCircle',
    action: () => alert('Connecting to support...'),
  },
  {
    id: 'cmd-10',
    title: 'Sign Out Session',
    subtitle: 'Terminate active session safely',
    category: 'Actions',
    shortcut: ['⌥', 'Q'],
    icon: 'LogOut',
    action: () => alert('Logged out.'),
  },
];

// Async Mock API Call with AbortController signal support
const mockSearchApi = (query: string, signal: AbortSignal): Promise<CommandItem[]> => {
  return new Promise((resolve, reject) => {
    // Random latency between 150ms and 350ms to simulate real network round-trip
    const delay = 150 + Math.random() * 200;
    
    const timeoutId = setTimeout(() => {
      if (signal.aborted) {
        reject(new DOMException('Aborted by user typing', 'AbortError'));
        return;
      }

      if (!query.trim()) {
        resolve(INITIAL_COMMANDS);
        return;
      }

      const q = query.toLowerCase();
      const filtered = INITIAL_COMMANDS.filter(cmd => 
        cmd.title.toLowerCase().includes(q) ||
        cmd.subtitle?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
      );

      resolve(filtered);
    }, delay);

    // Abort listener
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Aborted by user typing', 'AbortError'));
    });
  });
};

interface CommandPaletteProps {
  shadowRootContainer?: HTMLElement;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ shadowRootContainer: _shadowRootContainer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommandItem[]>(INITIAL_COMMANDS);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Detect OS for shortcut display (⌘K vs Ctrl+K)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  // 1. Global Keyboard Listener (Cmd+K / Ctrl+K & Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      
      if (isCmdK) {
        e.preventDefault();
        setIsOpen(prev => {
          if (!prev) {
            previousFocusRef.current = document.activeElement as HTMLElement;
          }
          return !prev;
        });
      }

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closePalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus trap & Focus restoration when modal toggles
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow transition/DOM rendering inside Shadow DOM
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // 2. Race Condition Handling with AbortController
  useEffect(() => {
    if (!isOpen) return;

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);

    mockSearchApi(query, signal)
      .then((data) => {
        setResults(data);
        setSelectedIndex(0);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') {
          // Stale request aborted - ignore safely
          return;
        }
        setLoading(false);
      });

    return () => {
      // Cancel pending async request when query changes before response returns
      controller.abort();
    };
  }, [query, isOpen]);

  const closePalette = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Execute selected item
  const executeItem = useCallback((item: CommandItem) => {
    closePalette();
    // Execute after modal animation
    setTimeout(() => {
      item.action();
    }, 150);
  }, [closePalette]);

  // 3. Accessibility Keyboard Navigation (ArrowUp, ArrowDown, Enter)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentItem = results[selectedIndex];
      if (currentItem) {
        executeItem(currentItem);
      }
    }
  };

  // Group results by category
  const groupedResults = results.reduce<Record<Category, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<Category, CommandItem[]>);

  // Focus trap inside Shadow DOM for Tab / Shift+Tab
  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      // Focus stays trapped on input in command palette UX
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  let globalIndexCounter = 0;

  return (
    <div 
      className={`ucp-overlay ${isOpen ? 'ucp-open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePalette();
      }}
      aria-hidden={!isOpen}
    >
      <div 
        ref={modalRef}
        className="ucp-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Universal Command Palette"
        onKeyDown={handleModalKeyDown}
      >
        {/* Search Header */}
        <div className="ucp-header">
          <Search className="ucp-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="ucp-input"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="ucp-results-list"
            aria-activedescendant={results[selectedIndex] ? `ucp-item-${results[selectedIndex].id}` : undefined}
          />
          {loading && <div className="ucp-spinner" aria-label="Loading results" />}
        </div>

        {/* Content & Results List */}
        <div id="ucp-results-list" className="ucp-content" role="listbox">
          {results.length === 0 && !loading ? (
            <div className="ucp-empty">
              <Search className="ucp-empty-icon" />
              <div className="ucp-empty-title">No commands found</div>
              <div className="ucp-empty-desc">No matching results for "{query}"</div>
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="ucp-group">
                <div className="ucp-group-title">{category}</div>
                {items.map((item) => {
                  const currentIndex = globalIndexCounter++;
                  const isSelected = currentIndex === selectedIndex;
                  const IconComponent = IconMap[item.icon] || Sparkles;

                  return (
                    <div
                      key={item.id}
                      id={`ucp-item-${item.id}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`ucp-item ${isSelected ? 'ucp-selected' : ''}`}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <div className="ucp-item-left">
                        <div className="ucp-item-icon-wrapper">
                          <IconComponent className="ucp-icon" />
                        </div>
                        <div className="ucp-item-text">
                          <span className="ucp-item-title">{item.title}</span>
                          {item.subtitle && (
                            <span className="ucp-item-subtitle">{item.subtitle}</span>
                          )}
                        </div>
                      </div>

                      <div className="ucp-item-right">
                        {item.badge && <span className="ucp-badge">{item.badge}</span>}
                        {item.shortcut && (
                          <div className="ucp-kbd-container">
                            {item.shortcut.map((key, kIdx) => (
                              <kbd key={kIdx}>{key}</kbd>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Hints */}
        <div className="ucp-footer">
          <div className="ucp-footer-hints">
            <span className="ucp-footer-hint">
              <kbd>↑</kbd> <kbd>↓</kbd> navigate
            </span>
            <span className="ucp-footer-hint">
              <kbd>↵</kbd> select
            </span>
            <span className="ucp-footer-hint">
              <kbd>esc</kbd> close
            </span>
          </div>

          <div className="ucp-status-pill">
            <span className="ucp-status-dot" />
            Press <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd> <kbd>K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
