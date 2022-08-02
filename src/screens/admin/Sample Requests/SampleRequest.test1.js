import { render, screen } from '@testing-library/react';
import SampleRequest from '.';

test('renders learn react link', () => {
  render(<SampleRequest />);
  const linkElement = screen.getByText(/Sample Request/i);
  expect(linkElement).toBeInTheDocument();
});