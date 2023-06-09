import React, { useEffect, useState, CSSProperties, ChangeEvent } from 'react';
import { DialogProps, Comment } from '../interface';
import './dialog.css';


const Dialog: React.FC<DialogProps> = ({onClose,onDelete,top,left,comments,cacheKey}) => {

  const style: CSSProperties = {
    position: 'absolute',
    top: (top || 0),
    left: (left || 0)
  };

  const [thread,setThread] = useState<DialogProps["comments"]>(comments || []);
  const [disabled,setDisabled] = useState(true);

  useEffect(() => {
    setThread(comments || []);
  }, [comments]);
 
  const onAddComment = () => {
    const input = document.getElementById('comment_input') as HTMLInputElement;

    let updateObj!: Comment;

    if(cacheKey){
      let currentVal : Comment[] = JSON.parse(sessionStorage.getItem(cacheKey) || "");
      updateObj =  {
        name: "Cielo",
        value:input.value,
        time: new Date().toLocaleString()
      }
      const updateVal = JSON.stringify([...currentVal,updateObj]);
      sessionStorage.setItem(cacheKey, updateVal);
    }
    
    setThread([
      ...(thread || []),
      updateObj
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
    <div style={style} className='dialog-container'>
      {
        thread &&
        thread.map((comment,index) =>(
          <div key={index}>
            <div>Comment:{comment.value}</div>
            <div>name:{comment.name}</div>
            <div>time:{comment.time}</div>
          </div>
        ))
      }
      <input id="comment_input" type="text" onChange={(event) => onTypeText(event)}/>
      <button onClick={onAddComment} disabled={disabled}>add</button>
      <button onClick={onClose}>Close</button>
      <button onClick={onDelete}>Delete</button>

    </div>
  );
};

export default Dialog;