import { render, screen } from '@testing-library/react';
import Quotes from '.';

test('renders learn react link', () => {
  render(<Quotes />);
  const linkElement = screen.getByText(/Create Quote/i);
  expect(linkElement).toBeInTheDocument();
});
