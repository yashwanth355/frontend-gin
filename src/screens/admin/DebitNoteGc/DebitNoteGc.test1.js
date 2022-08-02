import { render, screen } from '@testing-library/react';
import DebitNoteGc from '.';

test('renders learn react link', () => {
  render(<DebitNoteGc />);
  const linkElement = screen.getByText(/Debit Note GC Request/i);
  expect(linkElement).toBeInTheDocument();
});
