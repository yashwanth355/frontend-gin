import { render, screen } from '@testing-library/react';
import Supplier from '.';

test('renders learn react link', () => {
  render(<Supplier />);
  const linkElement = screen.getByText(/Create Supplier/i);
  expect(linkElement).toBeInTheDocument();
});