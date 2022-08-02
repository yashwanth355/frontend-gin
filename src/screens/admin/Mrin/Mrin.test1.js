import { render, screen } from '@testing-library/react';
import Mrin from '.';

test('renders learn react link', () => {
  render(<Mrin />);
  const linkElement = screen.getByText(/Closed MRINs/i);
  expect(linkElement).toBeInTheDocument();
});
