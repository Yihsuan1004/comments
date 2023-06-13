import { render } from '@testing-library/react';
import Dialog from './Dialog';

describe('Dialog', () => {
  test('renders Dialog component', () => {
    render(<Dialog onClose={function (): void {
      throw new Error('Function not implemented.');
    } } onResolve={function (): void {
      throw new Error('Function not implemented.');
    } } top={undefined} left={undefined} cacheKey={undefined} userInfo={null} />);
  });
});
