import React, { useEffect, useState, ChangeEvent } from 'react';
import { Tooltip } from 'react-tooltip'
import { DialogProps, CommentPanel } from '../../interface';

//Components
import Comment from '../comment/Comment';

//Style-components
import { DialogContainer, DialogContent, UserInfo, UserName,UserTime,UserComment, DialogToolBar } from './Dialog.style';

// Icons
import Resolve from '../../assets/icon/icon_resolve.svg';
import Close from '../../assets/icon/icon_close.svg';


const Dialog: React.FC<DialogProps> = ({onClose,onResolve,top,left,comments,cacheKey,userInfo}) => {
  
  const [thread,setThread] = useState<DialogProps["comments"]>(comments || []); // State for managing the thread of comments
  const [disabled,setDisabled] = useState<boolean>(true); // State for managing the disabled state of a comment component

  useEffect(() => {
    setThread(comments || []);
  }, [comments]);
 
  /**
   * This function is called when a comment is added.
   * It retrieves the input element for the comment text and updates the comment thread and storage accordingly.
   */
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
    resetInput();
  }

  /**
   * Reset the comment input.
   * It clears the input value and disables the comment submission button.
   */
  const resetInput  = () =>{
    const input = document.getElementById('comment_input') as HTMLInputElement;
    input.value = "";
    setDisabled(true);
  } 


  const handleKeyDown = (event: KeyboardEvent)=>{
    const target = event.target as HTMLInputElement;
    if(event.code === 'Enter' && target.value !== ''){
      onAddComment();
    }
  }


  /**
   * Triggered when there is a change in the input text.
   * It checks the value of the input text and enables or disables the "disabled" state based on the length of the value.
   * @param event - The event object containing the input element.
   * */
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