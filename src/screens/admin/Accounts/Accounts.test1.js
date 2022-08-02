import { render, screen } from '@testing-library/react';
import Accounts from '.';

test('renders learn react link', () => {
  render(<Accounts />);
  const linkElement = screen.getByText(/My Accounts/i);
  expect(linkElement).toBeInTheDocument();
});
