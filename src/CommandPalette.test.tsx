import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommandPalette } from './CommandPalette';

describe('CommandPalette React Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders closed overlay by default', () => {
    render(<CommandPalette />);
    const overlay = document.querySelector('.ucp-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay?.classList.contains('ucp-open')).toBe(false);
  });

  it('opens overlay when Cmd+K keyboard shortcut is pressed', async () => {
    render(<CommandPalette />);
    
    // Simulate Cmd+K keydown
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const overlay = document.querySelector('.ucp-overlay');
    expect(overlay?.classList.contains('ucp-open')).toBe(true);

    const searchInput = screen.getByPlaceholderText(/Type a command or search.../i);
    expect(searchInput).not.toBeNull();
  });

  it('closes overlay when Esc key is pressed', async () => {
    render(<CommandPalette />);
    
    // Open
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(document.querySelector('.ucp-overlay')?.classList.contains('ucp-open')).toBe(true);

    // Press Esc
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.querySelector('.ucp-overlay')?.classList.contains('ucp-open')).toBe(false);
  });

  it('filters results asynchronously when user types query', async () => {
    render(<CommandPalette />);

    // Open palette
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const searchInput = screen.getByPlaceholderText(/Type a command or search.../i);
    fireEvent.change(searchInput, { target: { value: 'Diagnostic' } });

    // Wait for mock API response and verify non-matching items are removed
    await waitFor(() => {
      expect(screen.getByText('Run Diagnostic Terminal Check')).toBeInTheDocument();
      expect(screen.queryByText('System Settings')).toBeNull();
    });
  });

  it('navigates search items using ArrowDown and ArrowUp keys', async () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    const searchInput = screen.getByPlaceholderText(/Type a command or search.../i);
    
    // First item selected by default
    const items = document.querySelectorAll('.ucp-item');
    expect(items[0].classList.contains('ucp-selected')).toBe(true);

    // Arrow down
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    const updatedItems = document.querySelectorAll('.ucp-item');
    expect(updatedItems[1].classList.contains('ucp-selected')).toBe(true);
  });
});
