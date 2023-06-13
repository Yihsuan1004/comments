import { render } from '@testing-library/react';
import Comment from './Comment';

describe('Comment', () => {
  test('renders Comment component', () => {
    render(<Comment />);
  });
});
