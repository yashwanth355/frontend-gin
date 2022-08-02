import { render, screen } from '@testing-library/react';
import PackingType from '.';

test('renders learn react link', () => {
  render(<PackingType />);
  const linkElement = screen.getByText(/Export to excel/i);
  expect(linkElement).toBeInTheDocument();
});
