import { createRoot, Root } from 'react-dom/client';
import { CommandPalette } from './CommandPalette';
import rawCssText from './CommandPalette.css?inline';

/**
 * UniversalCommandPalette Native Custom Element (Web Component)
 * Encapsulated via Shadow DOM for zero CSS leakage & React version isolation.
 */
export class UniversalCommandPalette extends HTMLElement {
  private mountPoint: HTMLDivElement | null = null;
  private reactRoot: Root | null = null;

  connectedCallback() {
    if (this.shadowRoot) return; // Prevent double initialization

    // 1. Attach Shadow DOM in 'open' mode
    const shadowRoot = this.attachShadow({ mode: 'open' });

    // 2. Inject raw Vanilla CSS directly into Shadow DOM
    const styleElement = document.createElement('style');
    styleElement.textContent = rawCssText;
    shadowRoot.appendChild(styleElement);

    // 3. Create mounting root element inside Shadow DOM
    this.mountPoint = document.createElement('div');
    this.mountPoint.setAttribute('id', 'ucp-shadow-container');
    shadowRoot.appendChild(this.mountPoint);

    // 4. Mount React 19 root inside Shadow DOM
    this.reactRoot = createRoot(this.mountPoint);
    this.reactRoot.render(<CommandPalette shadowRootContainer={this.mountPoint} />);
  }

  disconnectedCallback() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }
}

// Auto-register Custom Element if not already defined
if (!customElements.get('universal-command-palette')) {
  customElements.define('universal-command-palette', UniversalCommandPalette);
}
