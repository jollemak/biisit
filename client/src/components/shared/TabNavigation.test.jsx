import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import TabNavigation from '../shared/TabNavigation';

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('TabNavigation', () => {
  it('renders both navigation tabs', () => {
    renderWithRouter(<TabNavigation />);

    expect(screen.getByText('All Songs')).toBeInTheDocument();
    expect(screen.getByText('My Setlists')).toBeInTheDocument();
  });

  it('contains links with correct hrefs', () => {
    renderWithRouter(<TabNavigation />);

    const songsLink = screen.getByText('All Songs').closest('a');
    const setlistsLink = screen.getByText('My Setlists').closest('a');

    expect(songsLink).toHaveAttribute('href', '/');
    expect(setlistsLink).toHaveAttribute('href', '/setlists');
  });
});