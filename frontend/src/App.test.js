import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders learn react link', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  await waitFor(() => {
    expect(screen.getByText(/learn react/i)).toBeInTheDocument();
  });
});
