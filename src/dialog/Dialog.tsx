import React, { useEffect, useState, ChangeEvent } from 'react';
import { DialogProps, CommentPanel } from '../interface';
import { DialogContainer, DialogContent, UserInfo, UserName,UserTime,UserComment, DialogToolBar } from './Dialog.style';
import '../comment/Comment';
import Comment from '../comment/Comment';
import  Resolve from '../icon/icon_resolve.svg';
import  Close from '../icon/icon_close.svg';
import { Tooltip } from 'react-tooltip'


const Dialog: React.FC<DialogProps> = ({onClose,onResolve,top,left,comments,cacheKey,userInfo}) => {
  
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
        name: userInfo?.name || '',
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

  const handleKeyDown = (event: KeyboardEvent)=>{
    const target = event.target as HTMLInputElement;
    if(event.code === 'Enter' && target.value !== ''){
      onAddComment();
    }
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
      <DialogToolBar>
        <button onClick={onResolve}
                data-tooltip-id="resolve-tooltip"
                data-tooltip-content="Resolve"
                data-tooltip-place="top">
          <img src={Resolve} alt="resolve icon" />
          <Tooltip id="resolve-tooltip" />
        </button>
        <button onClick={onClose}
                data-tooltip-id="close-tooltip"
                data-tooltip-content="Close"
                data-tooltip-place="top">
          <img src={Close} alt="close icon" />
          <Tooltip id="close-tooltip" />
        </button>
      </DialogToolBar>
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
               onKeyDown={(event:KeyboardEvent) => handleKeyDown(event)}
               disabled={disabled}
               onChange={(event: ChangeEvent | KeyboardEvent) => onTypeText(event)}/>
    </DialogContainer>
  );
};

export default Dialog;