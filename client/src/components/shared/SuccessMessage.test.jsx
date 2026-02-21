import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SuccessMessage from '../shared/SuccessMessage';

describe('SuccessMessage', () => {
  it('renders success message when provided', () => {
    const successMessage = 'Operation successful';
    render(<SuccessMessage message={successMessage} />);

    expect(screen.getByText(successMessage)).toBeInTheDocument();
  });

  it('does not render when message is empty', () => {
    const { container } = render(<SuccessMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('auto-dismisses after default duration', async () => {
    const mockOnClose = vi.fn();
    const successMessage = 'Success';

    render(<SuccessMessage message={successMessage} onClose={mockOnClose} />);

    expect(screen.getByText(successMessage)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 3500 });
  });

  it('shows close button when onClose is provided', () => {
    const mockOnClose = vi.fn();
    render(<SuccessMessage message="Success" onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close success message/i });
    expect(closeButton).toBeInTheDocument();
  });
});