import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './main';

describe('UniversalCommandPalette Custom Element', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('universal-command-palette');
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  it('registers <universal-command-palette> custom element', () => {
    expect(customElements.get('universal-command-palette')).toBeDefined();
  });

  it('attaches Shadow DOM in mode "open"', () => {
    expect(element.shadowRoot).not.toBeNull();
    expect(element.shadowRoot?.mode).toBe('open');
  });

  it('injects style tag into Shadow DOM for 100% CSS isolation', () => {
    const styleTag = element.shadowRoot?.querySelector('style');
    expect(styleTag).not.toBeNull();
  });

  it('creates React mount container inside Shadow DOM', () => {
    const mountContainer = element.shadowRoot?.querySelector('#ucp-shadow-container');
    expect(mountContainer).not.toBeNull();
  });
});
