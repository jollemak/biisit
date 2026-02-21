import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorMessage from '../shared/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message when provided', () => {
    const errorMessage = 'This is an error';
    render(<ErrorMessage message={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('does not render when message is empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render when message is null', () => {
    const { container } = render(<ErrorMessage message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows close button when onClose is provided', () => {
    const mockOnClose = vi.fn();
    render(<ErrorMessage message="Error" onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close error message/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('does not show close button when onClose is not provided', () => {
    render(<ErrorMessage message="Error" />);

    const closeButton = screen.queryByRole('button', { name: /close error message/i });
    expect(closeButton).not.toBeInTheDocument();
  });
});