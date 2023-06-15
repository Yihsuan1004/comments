import React, { useRef } from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommentCanvas from './CommentCanvas';
import 'jest-canvas-mock';

describe('CommentCanvas', () => {

  test('renders CommentCanvas component', () => {
    render(<CommentCanvas />);
    // 檢查 CommentCanvas 是否成功渲染
    const commentCanvas = screen.getByTestId('comment-canvas');
    expect(commentCanvas).toBeInTheDocument();
  });

  test('change mode from move to comment', () => {

    render(<CommentCanvas/>);

    const commentButton = screen.getByTestId('comment-mode-button');

    fireEvent.click(commentButton)

    expect(commentButton).toHaveStyle({ backgroundColor: '#f0ad4e' });
  });

  test('change mode from comment to move', () => {

    render(<CommentCanvas/>);

    const moveButton = screen.getByTestId('move-mode-button');

    fireEvent.click(moveButton)

    expect(moveButton).toHaveStyle({ backgroundColor: '#f0ad4e' });
  });

  test('creates a new comment on canvas', async() => {
    render(<CommentCanvas />);

    // Click the mode button to switch to "commit" mode
    const commentButton = screen.getByTestId('comment-mode-button');
    fireEvent.click(commentButton);

    // Wait for the mode to change to "commit"
    await waitFor(() => { 
      expect(commentButton).toHaveStyle({ backgroundColor: '#f0ad4e' });
    });
    
    //(ERROR) Simulate mouse click event to create a new comment
    const commentCanvas = screen.getByTestId('comment-canvas');
    fireEvent.mouseDown(commentCanvas);

    // Check if a new comment is created on the canvas
    const commentInput = screen.getByLabelText('comment-input');
    expect(commentInput).toBeInTheDocument();
  });

  test('toggles dialog when comment is selected', () => {
    render(<CommentCanvas />);
  });


  test('adds comment to thread when Enter key is pressed', () => {
    render(<CommentCanvas />);
  });


  test('removes comment from canvas when Backspace key is pressed', () => {

  });

})
