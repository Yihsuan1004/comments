import React, { useEffect, useState, CSSProperties, ChangeEvent } from 'react';
import { DialogProps, Comment } from '../interface';


const Dialog: React.FC<DialogProps> = ({onClose,top,left,value,cacheKey}) => {

  const style: CSSProperties = {
    position: 'absolute',
    top: (top || 0),
    left: (left || 0)
  };

  const [comments,setComments] = useState<Comment[]>([{ value }]);
  const [disabled,setDisabled] = useState(true);

  useEffect(() => {
    setComments([{ value }]);
  }, [value]);
 
  const onAddComment = () => {
    const input = document.getElementById('comment_input') as HTMLInputElement;

    if(cacheKey){
      let currentVal : Comment[] = JSON.parse(sessionStorage.getItem(cacheKey) || "");
      const updateVal = JSON.stringify([...currentVal, {  value:input.value }]);
      sessionStorage.setItem(cacheKey, updateVal);
    }
    
    setComments([
      ...comments,
      {
        value:input.value
      }
    ]);
    input.value = "";
  }

  const onTypeText = (event:ChangeEvent) => {
    const val = (event.target as HTMLInputElement).value;
    if(val && val.length > 0){
      setDisabled(false);
    }
    else{
      setDisabled(true);
    }
  }

  

  return (
    <div style={style}>
      {
        comments.map((comment,index) =>(
          <div key={index}>My Comment:{comment.value}</div>
        ))
      }
      <input id="comment_input" type="text" onChange={(event) => onTypeText(event)}/>
      <button onClick={onAddComment} disabled={disabled}>add</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default Dialog;