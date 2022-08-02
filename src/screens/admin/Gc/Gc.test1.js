import { render, screen } from '@testing-library/react';
import Gc from '.';

test('renders learn react link', () => {
  render(<Gc />);
  const linkElement = screen.getByText(/All GCs/i);
  expect(linkElement).toBeInTheDocument();
});
