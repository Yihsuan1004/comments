import { CommentContainer } from './Comment.style';
import  Submit from '../icon/icon_submit.svg';

const Comment: React.FC<any> = (
  {onAddComment,onChange,onKeyDown,disabled,top,left}
) => {
  
  return (
    <CommentContainer  id="comment_input_container" top={top} left={left}>
      <input autoFocus id="comment_input" type="text" onChange={onChange} onKeyDown={onKeyDown}/>
      <button  onClick={onAddComment} disabled={disabled}>
        <img src={Submit} alt="submit icon" />
      </button >
    </CommentContainer>
  );
};

export default Comment;