import React, { useEffect, useState, ChangeEvent } from 'react';
import { DialogProps, CommentPanel } from '../interface';
import { DialogContainer, DialogContent, UserInfo, UserName,UserTime,UserComment, CommentContainer , ToolBar } from './Dialog.style';
import '../comment/Comment';
import Comment from '../comment/Comment';

const Dialog: React.FC<DialogProps> = ({onClose,onDelete,top,left,comments,cacheKey}) => {
  
  const [thread,setThread] = useState<DialogProps["comments"]>(comments || []);
  const [disabled,setDisabled] = useState<boolean>(true);

  useEffect(() => {
    setThread(comments || []);
  }, [comments]);
 
  const onAddComment = () => {
    const input = document.getElementById('comment_input') as HTMLInputElement;

    let updateObj!: CommentPanel;

    if(cacheKey){
      let currentVal : CommentPanel[] = JSON.parse(sessionStorage.getItem(cacheKey) || "");
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

  const onTypeText = (event:ChangeEvent | KeyboardEvent) => {

    const val = (event.target as HTMLInputElement).value;
    if(val && val.length > 0){
      setDisabled(false);
    }
    else{
      setDisabled(true);
    }
  }

  
  return (
    <DialogContainer top={top} left={left}>
      <ToolBar>
        <button onClick={onDelete}>Delete</button>
        <button onClick={onClose}>Close</button>
      </ToolBar>
      {
        thread &&
        thread.map((comment,index) =>(
          <DialogContent key={index}>
            <UserInfo>
              <UserName>{comment.name}</UserName>
              <UserTime>{comment.time}</UserTime>
            </UserInfo>
            <UserComment>{comment.value}</UserComment>
          </DialogContent>
        ))
      }
      <Comment onAddComment={onAddComment} 
               disabled={disabled}
               onChange={(event: ChangeEvent | KeyboardEvent) => onTypeText(event)}/>
    </DialogContainer>
  );
};

export default Dialog;