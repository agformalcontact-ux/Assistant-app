import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the app with tooltip provider', () => {
    render(<App />);
    // Since App uses lazy loading, we expect it to render the loading text initially
    expect(screen.getByText('Loading Nova...')).toBeInTheDocument();
  });
});