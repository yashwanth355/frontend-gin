import { render, screen } from '@testing-library/react';
import Settings from '.';


test('renders learn react link', () => {
  render(<Settings />);
  const linkElement = screen.getByText(/Tax Master/i);
  expect(linkElement).toBeInTheDocument();
});
