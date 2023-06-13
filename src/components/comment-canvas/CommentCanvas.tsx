import React, { useRef, useEffect, useState, ChangeEvent } from 'react';

// Fabric
import { fabric } from 'fabric';
import { Point } from 'fabric/fabric-impl';

// Components
import Dialog from '../dialog/Dialog';
import Comment from '../comment/Comment';

// Icons
import CommentMode from '../../assets/icon/icon_comment_mode.svg';
import MoveMode from '../../assets/icon/icon_move_mode.svg';
import AddImage from '../../assets/icon/icon_add_image.svg';

// Constants
import { DefaultUserInfo, commentOffsetX } from '../../constant';

// Classes
import { CommentPanel, DialogConfig, UserInfo } from '../../interface';
import { CommentImage, CustomImage } from '../../class';
import { Img, Mode } from '../../enum';

//Style-components
import { Avatar, ButtonContainer, FlexContainer, Header, ModeButton, ToolBar, UserContainer, UserName } from './CommentCanvas.style';

import { Tooltip } from 'react-tooltip'
import { ModeType } from '../../type';


const CommentCanvas: React.FC = () => {

  const [userInfo,setUserInfo] = useState<UserInfo | null>(null);  // State for storing user information
  const [mode, setMode] = useState<ModeType>(Mode.move); // State for managing the mode (e.g., move, comment.)
  const [image, setImage] = useState<CustomImage | null>(null); // State for storing image which is click to create comment.
  const [dialog, setDialog] = useState<DialogConfig>({ show: false}); // State for managing dialog configuration
  const [disabled, setDisabled] = useState<boolean>(true); // State for managing the disabled state of a comment component.
  const [isCommentCreated, setCommentCreated] = useState<boolean>(false); // State for tracking whether a comment has been created.
  const [isComplete, setCompleted] = useState<boolean>(false); // State for tracking whether a comment has been created completly.
  const [currentSelect, setCurrentSelect] = useState<CustomImage | CommentImage | null>(null); // State for storing currently selected image or comment
  const [isInsideObject, setInsideObject] =  useState<boolean>(false); // State for tracking whether an object is inside another.
  const [counter, setCounter] = useState(1); // State for storing serialNumber.


  const canvasRef = useRef<HTMLCanvasElement>(null); // Reference to a canvas element
  const canvasInstance = useRef<fabric.Canvas | null>(null); // Reference to the fabric.js canvas instance
  const dialogRef = useRef<DialogConfig>(dialog); // Reference to the dialog configuration
  const currentSelectRef = useRef<CustomImage | CommentImage | null>(currentSelect); // Reference to the currently selected image or comment
  const insideObjectRef = useRef<boolean>(isInsideObject); // Reference to the insideObject state
  const modeRef = useRef<string>(mode); // Reference to the mode state
  const isCompleteRef = useRef<boolean>(isComplete); // Reference to the isComplete state
  const isCommentCreatedRef = useRef<boolean>(isCommentCreated); // Reference to the isComplete state

  const {show ,cacheKey, comments , top , left,} = dialog;



  const generateSerialNumber = (): string => {
    const serialNumber = `SN-${counter}`;
    setCounter((prevCounter: number) => prevCounter + 1);
    return(serialNumber);
  };


  /**
   * Handles the "mouse:down:before" event from canvas.
   * @param event 
   */
  const handleBeforeMousedown = (event:fabric.IEvent):void => {

    const canvas = canvasInstance.current as fabric.Canvas;
    if (canvas) {

      //Update the img with click target
      const target = canvas.findTarget(event.e, false)  as CustomImage || CommentImage;
      if (target && target.imgType === Img.picture) setImage(target);
      else setImage(null);

      if(modeRef.current === Mode.move) return;

      // Check if the click was inside an object
      const isInsideObject = target !== null && target !== undefined && target.imgType === 'commentIcon';

      // Update the state value
      setInsideObject(isInsideObject); 

      insideObjectRef.current = isInsideObject;
    }
  }

  /**
   * Handles the "mouse:down" event from canvas.
   * @param event 
   */
  const handleMousedown = (event:fabric.IEvent): void => {
  
    if(modeRef.current === Mode.move) return;

    if (insideObjectRef.current) {
      setInsideObject(false); // Reset the flag
      return; // Ignore the event
    }

    const canvas = canvasInstance.current as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);

    if(isCommentCreatedRef.current){
      resetComment();
      if(!isCompleteRef.current) removeObject(currentSelect);
      return; // Ignore the event
    }

    // Create a new comment object
    createComment(canvas,pointer);
  }


  /**
   * Handles the "keydown" event from document, triggered when a key is pressed down.
   * @param event - The event object containing information about the key press.
   */
  const handleDocumentKeyDown = (event:any) =>{
    // If the pressed key is the "Backspace" key, it removes the currently selected CustomImage object and its associated comments from the canvas.
    if(event.code === 'Backspace'){
      const canvas = canvasInstance.current;

      const curSelectObject = canvas?.getActiveObject() as CustomImage;

      if(!curSelectObject || !canvas || curSelectObject.imgType !== 'picture') return;

      curSelectObject.collections?.forEach(comment =>{
        canvas.remove(comment);
      });

      canvas.remove(curSelectObject);
    }
  };


  /**
   * Create a comment on the canvas at the specified pointer location.
   * @param canvas - The fabric.Canvas object representing the canvas.
   * @param pointer - The object containing the x and y coordinates of the pointer.
   * @param event - The fabric.IEvent object representing the event.
   */
  const createComment = (canvas:fabric.Canvas, pointer: any) => {
    fabric.Image.fromURL(`${process.env.PUBLIC_URL}/icon_comment_create.svg`, function(cmImg:CommentImage) {
      // The CommentImage object (cmImg) is customized with properties.
      cmImg.hasControls = false;
      cmImg.hasBorders = false;
      cmImg.originY = 'bottom';
      cmImg.left = pointer.x + commentOffsetX;
      cmImg.top = pointer.y;
      cmImg.cacheKey = "";
      cmImg.imgType = Img.commentIcon;
      canvas.add(cmImg);
      canvas.setActiveObject(cmImg);

      let originPosition = {
        left: parseInt(pointer.x + commentOffsetX),
        top: parseInt(pointer.y),
      };

      //Update comment state
      setCommentCreated(true);

      //Update storage of currently selected comment
      setCurrentSelect(cmImg);
      
      
      //Event handlers are attached to cmImg for mouseup, selected, deselected, and moving events.

      // Mouseup events
      cmImg.on('mouseup', (event) => {  
        detectCommentIntersection(cmImg);

        toggleDialog(event,cmImg);

        if(cmImg.relationship){
          cmImg.relationship = cmImg.calcTransformMatrix();
        }

      });


      // Selected events
      cmImg.on('selected', (event) => { 
        cmImg.isFirstSelected = true;
        cmImg.opacity = 0.7;

        setCurrentSelect(cmImg);

        const target = event.target as CommentImage;

        //If target has a cacheKey means it has been created completely.
        if(target.cacheKey){

          setCommentCreated(true);

          setCompleted(true);

          //Get comments by cacheKey.
          const comments  = JSON.parse(sessionStorage.getItem(target.cacheKey) || "[]");

          //Display the comments in dialog,
          setDialog({
            show: dialogRef.current.show,
            comments: comments,
            top:((cmImg.top || 0) - (cmImg.height || 0)), 
            left:(cmImg.left || 0) + (cmImg.width || 0),
            cacheKey: target.cacheKey
          });
        }
          
      });
  
      // Deselected events
      cmImg.on('deselected', () => {
        cmImg.opacity = 1;
        cmImg.isFirstSelected = false;

        //If cmImg doesn't have a cacheKey, it means cmImg has not been fully created by the user..
        //So it should be removed when it is deselected.
        if(cmImg.cacheKey === "") removeObject(cmImg);
  
        setDialog({
          ...dialog,
          show: false
        });

        resetComment();
      });


      // Moving events
      cmImg.on('moving',(event)=>{
        /** 
         * Fabric.js enables the default behavior of allowing the user to select, move, and modify the object. 
         * This includes triggering the moving events when the object is clicked and dragged.
         * Using the position value to determine if there has been any movement.
         */
        const currentPostion = {
          top: parseInt(`${(cmImg.top || 0)}`),
          left: parseInt(`${(cmImg.left || 0)}`),
        }
        if(currentPostion.left === originPosition.left && currentPostion.top === originPosition.top) return;
       
        cmImg.isMoved = true;

        //Update input position.
        const input =  document.getElementById('comment_input_container') as HTMLElement;
        if(!input || isComplete) return;
        input.style.left = `${(cmImg.left || 0) + (cmImg.width || 0) + commentOffsetX}px`;
        input.style.top = `${((cmImg.top || 0) - (cmImg.height || 0))}px`;
      })

    });
  }

  /**
   * Remove Object from canvas and reset comment state.
   * @param {(fabric.Object | CommentImage | null)} obj
   * @return {*} 
   */
  const removeObject = (obj: fabric.Object | CommentImage | null) => {
    if(!obj) return;
    const canvas = canvasInstance.current as fabric.Canvas;
    if(canvas) canvas.remove(obj);
    resetComment();
  }


  /** Reset comment state */
  const resetComment = () =>{
    setCompleted(false);
    setCommentCreated(false);
    setDisabled(true);
  }


  /**
   * This function detects the intersection between a CommentImage (cmImg) and other objects on a canvas.
   * @param cmImg - The CommentImage object to be checked for intersection with other objects on the canvas.
   * */
  const detectCommentIntersection = (cmImg: CommentImage) =>{
    // If cmImg has a parentImg and does not intersect with it, it removes itself from the parentImg's collections.
    if (cmImg.parentImg &&!cmImg.intersectsWithObject(cmImg.parentImg)) {
      cmImg.parentImg.collections = cmImg.parentImg.collections?.filter(obj => obj !== cmImg);
      cmImg.parentImg = undefined;
    }

    const canvas = canvasInstance.current as fabric.Canvas;

    if(!canvas) return;

    let intObj: CustomImage | undefined;

    // If an intersection is found with a CustomImage object of type 'picture', it adds cmImg to the collections of that object and sets it as the parentImg of cmImg.
    canvas.forEachObject(obj => {
      // Skip itself
      if (obj === cmImg) return;

      if (!cmImg.intersectsWithObject(obj)) return;

      // Find the object that the comment intersects with
      intObj = obj as CustomImage;
      if (intObj && intObj.imgType === Img.picture) {
        intObj.collections?.push(cmImg);
        cmImg.parentImg = intObj;
      }
    });

  }


  /**
   * This function toggles a dialog associated with a CommentImage (cmImg) based on the provided event and cmImg parameters.
   * @param event - The event that triggered the function.
   * @param cmImg - The CommentImage object associated with the dialog.
   */
  const toggleDialog = (event:fabric.IEvent,cmImg: CommentImage) =>{
    const target = event.target as CommentImage;

    //If cmImg is the first selected and has not been moved, the function resets the relevant values and sets the dialog properties.
    if(cmImg.isFirstSelected && !cmImg.isMoved) {
      //reset value
      cmImg.isFirstSelected = false;
      setDialog({
        show: true,
        comments: dialogRef.current.comments,
        top:((cmImg.top || 0) - (cmImg.height || 0)), 
        left:(cmImg.left || 0) + (cmImg.width || 0),
        cacheKey: target.cacheKey
      });
      return;
    }

    //If cmImg has a cacheKey(means has been created) and has been moved, the function updates the dialog properties based on the current state.
    if(cmImg.cacheKey){
      if(cmImg.isMoved){
        cmImg.isMoved = false;
        setDialog({
          show: dialogRef.current.show,
          comments: dialogRef.current.comments,
          top:((cmImg.top || 0) - (cmImg.height || 0)), 
          left:(cmImg.left || 0) + (cmImg.width || 0),
          cacheKey: target.cacheKey
        });
      }
      
      // If cmImg has a cacheKey and has not been moved, the function toggles the show property of the dialog.
      else{
        setDialog({
          show: !dialogRef.current.show,
          comments: dialogRef.current.comments,
          top:((cmImg.top || 0) - (cmImg.height || 0)), 
          left:(cmImg.left || 0) + (cmImg.width || 0),
          cacheKey: target.cacheKey
        });
      }
    }
  }

  /**
   * Handle the keydown event for comment input.
   * @param event - The KeyboardEvent object representing the keydown event.
   */
  const handleCommentKeydown = (event: KeyboardEvent)=> {
    
    //Creates a CommentPanel object based on the event and user information.
    const comment : CommentPanel = {
      name: userInfo?.name || '',
      value: (event.target as HTMLInputElement).value,
      time: new Date().toLocaleString()
    } ;

    //If the Enter key is pressed and the comment value is not empty,
    //it sets the completed state to true and creates a comment thread for the current selection.
    if(event.code === 'Enter' && comment.value !== ''){
      setCompleted(true);
      if(currentSelect) createCommentThread(currentSelect as CommentImage,comment);
    }

    // If the Escape key is pressed, it removes the current selection image and resets the comment.
    if(event.code === 'Escape' ){
      if(currentSelect) removeObject(currentSelect);
      resetComment();
    }
  }

  /**
   * Handle the click event for comment input.
   * @param event - The MouseEvent object.
   */
  const handleCommentClick = (event:MouseEvent) =>{
    //Creates a CommentPanel object based on the event and user information.
    const comment : CommentPanel = {
      name: userInfo?.name || '',
      value: (event.target as HTMLInputElement).value,
      time: new Date().toLocaleString()
    } ;
    
    if(comment.value !== ''){
      setCompleted(true);
      if(currentSelect) createCommentThread(currentSelect as CommentImage,comment);
    }
  }


  /**
   * Creates a comment thread associated with a CommentImage (cmImg) and a CommentPanel (comment).
   * @param cmImg - The CommentImage object associated with the comment thread.
   * @param comment - The CommentPanel object representing the comment.
   */
  const createCommentThread = (cmImg:CommentImage,comment: CommentPanel) =>{
    //Key to get current comment's val.
    cmImg.cacheKey = generateSerialNumber(); 
    cmImg.imgType = Img.commentIcon;

    //Update the icon source that represents a successful creation.
    const canvas = canvasInstance.current as fabric.Canvas;
    cmImg.setSrc(`${process.env.PUBLIC_URL}/icon_comment.svg`, ()=> canvas.renderAll());

    //If user click image to creat comment.
    if(image){
      image.collections?.push(cmImg);
      cmImg.parentImg = image;
    }

    const val = JSON.stringify([comment]);
    sessionStorage.setItem(cmImg.cacheKey, val);

    //Sets the dialog properties to show the comment thread
    setDialog({
      show:true, 
      comments: [comment],
      top:((cmImg.top || 0) - (cmImg.height || 0)), 
      left:(cmImg.left || 0) + (cmImg.width || 0),
      cacheKey: cmImg.cacheKey
    });
  }


  /** Handle to resolve the thread. */
  const handleResolveThread = () =>{
    const canvas = canvasInstance.current as fabric.Canvas;
    const activeObj = canvas.getActiveObject() as CustomImage | CommentImage;
    if(activeObj) {
      //delete dialog from canvas
      removeObject(activeObj);
      resetComment();
      //clear session data
      sessionStorage.removeItem(activeObj.cacheKey as string);
    };
  }


  /**
   * Update the positions and transformations of comments associated with a CustomImage object (oImg) based on their relationship with oImg.
   * @param oImg - The CustomImage object whose comments need to be updated.
   * */
  const updateComments = (oImg:CustomImage) =>{

    if(!oImg.collections ||  oImg.collections.length === 0) return;

    var multiply = fabric.util.multiplyTransformMatrices;
    
    oImg.collections.forEach(cmImg =>{
      if(!cmImg.relationship) return;
      var relationship = cmImg.relationship;
      var newTransform = multiply(
        oImg.calcTransformMatrix(),
        relationship
      );

      var opt = fabric.util.qrDecompose(newTransform);
      cmImg.set({
        flipX: false,
        flipY: false,
      });

      const position = { x: opt.translateX, y: opt.translateY } as Point;

      cmImg.setPositionByOrigin(
         position, 
        'center',
        'center'
      )
      cmImg.set(opt);
      cmImg.setCoords();
    });

  }


 /**
  * Bind the comments associated with a CustomImage object (oImg) to the image.
  * @param oImg - The CustomImage object to which the comments need to be bound.
  */
  const bindCommentToImage = (oImg: CustomImage) =>{
    //If oImg has collections (comments) and is not the first selected,
    //the function calculates the desired transform for each CommentImage object (cmImg) based on the inverse of oImg's current transform.
    if((oImg.collections || []).length > 0 && !oImg.isFirstSelected){
      let invert = fabric.util.invertTransform;
      let multiply = fabric.util.multiplyTransformMatrices;

      let currTransform = oImg.calcTransformMatrix();
      let invertCurrTransform = invert(currTransform);

      oImg.collections?.forEach(cmImg =>{
        var desiredTransform = multiply(
          invertCurrTransform,
          cmImg.calcTransformMatrix()
        );

        cmImg.relationship = desiredTransform;
      })
    }
  }


  /** Add an image to the canvas.*/
  const addImage = () =>{
    const canvas = canvasInstance.current as fabric.Canvas;

    fabric.Image.fromURL(`${process.env.PUBLIC_URL}/cat.png`, function(oImg:CustomImage) {
      oImg.left = 200;
      oImg.top = 200;
      oImg.hasBorders = true;
      oImg.hasControls = false;
      oImg.imgType = Img.picture;
      oImg.scale(0.7);
      oImg.collections = [];
      canvas.add(oImg);
      oImg.sendToBack();

      oImg.on('selected',()=>{
        if((oImg.collections || []).length > 0 && !oImg.isFirstSelected){
          bindCommentToImage(oImg);
          oImg.isFirstSelected = true;
        }
      })

      oImg.on('deselected',()=> oImg.isFirstSelected = false);

      oImg.on('moving',() => updateComments(oImg));

    });
  }

  /** Update the mode state. */
  const handleChangeMode = (mode: ModeType) =>{
    setMode(mode);
  }

  /** Update the user state. */
  const handleChangeUser = (name: string) =>{
    setUserInfo({...userInfo,name});
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



  useEffect(() => {
    dialogRef.current = dialog;
  }, [dialog]);

  useEffect(() => {
    currentSelectRef.current = currentSelect;
  }, [currentSelect]);

  useEffect(() => {
    insideObjectRef.current = isInsideObject;
  }, [isInsideObject]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    isCommentCreatedRef.current = isCommentCreated;
  }, [isCommentCreated]);


  useEffect(() => {
    modeRef.current = mode;
    const canvas = canvasInstance.current;
    const selectable =  modeRef.current === Mode.move;

    const imgs = (canvas?.getObjects())?.filter((obj:any)=> obj.imgType === 'picture') || [];

    if(imgs.length > 0){
      imgs.forEach(img =>{
        img.selectable = selectable;
      });
    }
   
  }, [mode]);
  

  useEffect(() => {

    /**
     * Retrieve the current dimensions of the window.
     * @returns An object with the width and height of the window.
     * */
    const getWindowDimensions = ():{width:number; height: number;} => {
      const { innerWidth: width, innerHeight: height } = window;
      return { width, height };
    };

    /** Initialize the canvas. */
    const initCanvas = () =>{
      const canvas = new fabric.Canvas(canvasRef.current);
      canvasInstance.current = canvas;
  
      const { width, height } = getWindowDimensions();

      canvas.setWidth(width);
      canvas.setHeight(height);
      canvas.preserveObjectStacking = true;
      canvas.selection = false; //disabled group selection.
      canvas.on('mouse:down:before', handleBeforeMousedown);
      canvas.on('mouse:down', handleMousedown);
    }

    /** 
     * Dispose of the canvas.
     * It calls the dispose() method on the canvas instance to clean up resources.
     * */
    const disposeCanvas = () =>{
      canvasInstance.current?.dispose();
    }

    const getUserInfo = () =>{
      const user = DefaultUserInfo;
      setUserInfo(user);
    }


    if (canvasRef.current) {

      initCanvas();

      getUserInfo();

      document.addEventListener('keydown',handleDocumentKeyDown);

      return(()=>{
        document.removeEventListener('keydown',handleDocumentKeyDown);
        sessionStorage.clear();
        disposeCanvas();
      })
    }
  }, []);


  return (
    <>
      <div id="canvas-container">
        <canvas ref={canvasRef} />
        {
          show 
          && 
          <Dialog onResolve = {handleResolveThread}
                  onClose = {() => setDialog({...dialog , show: false})} 
                  top = {top} 
                  left = {(left || 0) + commentOffsetX}
                  comments = {comments}
                  cacheKey={cacheKey}
                  userInfo={userInfo}
          />
        }
        {
          isCommentCreated && !isComplete
          &&
          <Comment top={(currentSelect?.top || 0 ) - (currentSelect?.height || 0)} 
                   left={(currentSelect?.left || 0) + (currentSelect?.width || 0) + commentOffsetX} 
                   disabled={disabled}
                   onAddComment={(event:MouseEvent)=>(handleCommentClick(event))}
                   onChange={(event: ChangeEvent | KeyboardEvent) => onTypeText(event)}
                   onKeyDown={(event:KeyboardEvent) => handleCommentKeydown(event)}/>
        }
        <ToolBar>
          <Header>
            <UserContainer>
              <FlexContainer id="clickable">
                <Avatar>{(userInfo?.name || 'A')[0] }</Avatar>
                <UserName>{userInfo?.name}</UserName>
              </FlexContainer>
              <Tooltip anchorSelect="#clickable" clickable noArrow>
                <ButtonContainer>
                  <button onClick={()=> handleChangeUser('Yihsuan Hung')}>Yihsuan Hung</button>
                  <button onClick={()=> handleChangeUser('Ava Mitchell')}>Ava Mitchell</button>
                  <button onClick={()=> handleChangeUser('Harper Reynolds')}>Harper Reynolds</button>
                </ButtonContainer>
              </Tooltip>
            </UserContainer>
          </Header>
          <div>
            <ModeButton mode={mode} onClick={() => handleChangeMode(Mode.move)}>
              <img src={MoveMode} alt="move mode" />
              <div>Move Mode</div>
            </ModeButton>
            <ModeButton mode={mode} onClick={() => handleChangeMode(Mode.comment)}>
              <img src={CommentMode} alt="comment mode" />
              <div>Comment Mode</div>
            </ModeButton>
            {
              mode === 'move' &&
              <ModeButton onClick={addImage}>
                <img src={AddImage} alt="add icon" />
                <div>add Image</div>
              </ModeButton>
            }
          
          </div>
        </ToolBar>
      </div>
    </>
  );
};

export default CommentCanvas;