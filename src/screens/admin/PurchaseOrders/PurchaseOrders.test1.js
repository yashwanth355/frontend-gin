import { render, screen } from '@testing-library/react';
import PurchaseOrders from '.';

test('renders learn react link', () => {
  render(<PurchaseOrders />);
  const linkElement = screen.getByText(/All GC Purchase Orders/i);
  expect(linkElement).toBeInTheDocument();
});
