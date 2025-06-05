import { render, screen } from '@testing-library/react';
import ProfessionalTodo from './ProfessionalTodo';

test('renders To-Do List header', () => {
  render(<ProfessionalTodo />);
  expect(screen.getByText(/To-Do List/i)).toBeInTheDocument();
}); 