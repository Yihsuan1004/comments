import { CommentContainer } from './Comment.style';

const Comment: React.FC<any> = (
  {onAddComment,onChange,onKeyDown,disabled,top,left}
) => {
  
  return (
    <CommentContainer  id="comment_input_container" top={top} left={left}>
      <textarea autoFocus id="comment_input" rows={1} onChange={onChange} onKeyDown={onKeyDown}></textarea >
      <button  onClick={onAddComment} disabled={disabled}>add</button >
    </CommentContainer>
  );
};

export default Comment;