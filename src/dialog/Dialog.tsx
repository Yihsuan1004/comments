import React, { useRef, useEffect, useState, CSSProperties, KeyboardEvent, ChangeEvent } from 'react';

interface DialogProps{
  onClose: () => void,
  top: number | undefined,
  left: number |  undefined,
  value: string |  undefined
}

interface Comment{
  value: string |  undefined
}


const Dialog: React.FC<DialogProps> = ({onClose,top,left,value}) => {

  const style: CSSProperties = {
    position: 'absolute',
    top: (top || 0),
    left: (left || 0)
  };
  let nextId = 0;

  const [comments,setComments] = useState<Comment[]>([{value}]);
  const [disabled,setDisabled] = useState(true);

  const onAddComment = () => {
    const input = document.getElementById('comment_input') as HTMLInputElement;
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

  useEffect(()=>{

  },[comments,disabled])

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