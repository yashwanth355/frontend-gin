import { render, screen } from '@testing-library/react';
import Contacts from '.';

test('renders learn react link', () => {
  render(<Contacts />);
  const linkElement = screen.getByText(/My contacts/i);
  expect(linkElement).toBeInTheDocument();
});
