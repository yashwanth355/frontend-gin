import { render, screen } from '@testing-library/react';
import Users from '.';

test('renders learn react link', () => {
  render(<Users />);
  const linkElement = screen.getByText(/Create User/i);
  expect(linkElement).toBeInTheDocument();
});
