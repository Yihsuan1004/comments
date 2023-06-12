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

import { Avatar, ButtonContainer, FlexContainer, Header, ModeButton, ToolBar, UserContainer, UserName } from './CommentCanvas.style';
import { Tooltip } from 'react-tooltip'


const FabricCanvas: React.FC = () => {

  const [userInfo,setUserInfo] = useState<UserInfo | null>(null);  // State for storing user information
  const [mode, setMode] = useState<string>('move'); // State for managing the mode (e.g., move, comment.)
  const [image, setImage] = useState<CustomImage | null>(null); // State for storing image which is click to create comment.
  const [dialog, setDialog] = useState<DialogConfig>({ show: false}); // State for managing dialog configuration
  const [disabled, setDisabled] = useState<boolean>(true); // State for managing the disabled state of a comment component.
  const [isCommentCreated, setCommentCreated] = useState<boolean>(false); // State for tracking whether a comment has been created.
  const [isComplete, setCompleted] = useState<boolean>(false); // State for tracking whether a comment has been created completly.
  const [currentSelect, setCurrentSelect] = useState<CustomImage | CommentImage | null>(null); // State for storing currently selected image or comment
  const [init, setInit] =  useState<boolean>(false); // State for tracking initialization status.
  const [isInsideObject, setInsideObject] =  useState<boolean>(false); // State for tracking whether an object is inside another.
  const [counter, setCounter] = useState(1); // State for storing serialNumber.


  const canvasRef = useRef<HTMLCanvasElement>(null); // Reference to a canvas element
  const canvasInstance = useRef<fabric.Canvas | null>(null); // Reference to the fabric.js canvas instance
  const dialogRef = useRef<DialogConfig>(dialog); // Reference to the dialog configuration
  const currentSelectRef = useRef<CustomImage | CommentImage | null>(currentSelect); // Reference to the currently selected image or comment
  const insideObjectRef = useRef<boolean>(isInsideObject); // Reference to the insideObject state
  const modeRef = useRef<string>(mode); // Reference to the mode state

  const {show ,cacheKey, comments , top , left,} = dialog;


  const generateSerialNumber = (): string => {
    const serialNumber = `SN-${counter}`;
    setCounter((prevCounter: number) => prevCounter + 1);
    return(serialNumber);
  };


  const handleBeforeMousedown = (event:fabric.IEvent):void => {

    const canvas = canvasInstance.current as fabric.Canvas;
    if (canvas) {
      const target = canvas.findTarget(event.e, false)  as CustomImage || CommentImage;
      console.log('target',target);

      if (target && target.imgType ==='picture') setImage(target);
      else setImage(null);

      if(modeRef.current === 'move') return;

      // Check if the click was inside an object
      const isInsideObject = target !== null && target !== undefined && target.imgType === 'comment';

      // Update the state value
      setInsideObject(isInsideObject); 

      insideObjectRef.current = isInsideObject;
    }
  }


  const handleMousedown = (event:fabric.IEvent): void => {
    console.log('object click',event.target);
    console.log('isCommentCreated',isCommentCreated);
    console.log('isComplete',isComplete);

    if(modeRef.current === 'move') return;

    if (insideObjectRef.current) {
      setInsideObject(false); // Reset the flag
      return; // Ignore the event
    }

    const canvas = canvasInstance.current as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);

    if(isCommentCreated){
      resetComment();
      if(!isComplete) removeObject(currentSelect);
      return; // Ignore the event
    }

    // Create a new comment object
    createComment(canvas,pointer,event);
  }


  const handleKeyDown = (event:any) =>{
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


  const createComment = (canvas:fabric.Canvas, pointer: any, event:fabric.IEvent) => {
    fabric.Image.fromURL(`${process.env.PUBLIC_URL}/icon_comment_create.svg`, function(cmImg:CommentImage) {
      cmImg.hasControls = false;
      cmImg.hasBorders = false;
      cmImg.originY = 'bottom';
      cmImg.left = pointer.x + commentOffsetX;
      cmImg.top = pointer.y;
      cmImg.cacheKey = "";
      cmImg.imgType = "comment";
      canvas.add(cmImg);
      canvas.setActiveObject(cmImg);

      setCommentCreated(true);
      setCurrentSelect(cmImg);

      cmImg.on('mouseup', (event) => {  

        detectCommentIntersection(cmImg);

        toggleDialog(event,cmImg);

        if(cmImg.relationship){
          cmImg.relationship = cmImg.calcTransformMatrix();
        }

      });


      cmImg.on('selected', (event) => { 
        cmImg.isFirstSelected = true;
        const target = event.target as CommentImage;
        cmImg.opacity = 0.7;

        if(target.cacheKey){

          setCommentCreated(true);

          setCompleted(true);

          const comments  = JSON.parse(sessionStorage.getItem(target.cacheKey) || "[]");

          setDialog({
            show: dialogRef.current.show,
            comments: comments,
            top:((cmImg.top || 0) - (cmImg.height || 0)), 
            left:(cmImg.left || 0) + (cmImg.width || 0),
            cacheKey: target.cacheKey
          });
        }
      
        setCurrentSelect(cmImg);
      
      });
  

      cmImg.on('deselected', () => {
        cmImg.opacity = 1;
        cmImg.isFirstSelected = false;

        if(cmImg.cacheKey === "") removeObject(cmImg);
  
        setDialog({
          ...dialog,
          show: false
        });

        resetComment();
      });


      cmImg.on('moving',()=>{

        cmImg.isMoved = true;

        const input =  document.getElementById('comment_input_container') as HTMLElement;

        if(!input || isComplete) return;

        input.style.left = `${(cmImg.left || 0) + (cmImg.width || 0) + commentOffsetX}px`;
        input.style.top = `${((cmImg.top || 0) - (cmImg.height || 0))}px`;
      })

    });
  }


  const removeObject = (obj: fabric.Object | CommentImage | null) => {
    if(!obj) return;
    const canvas = canvasInstance.current as fabric.Canvas;
    if(canvas) canvas.remove(obj);
    resetComment();
  }


  const resetComment = () =>{
    setCompleted(false);
    setCommentCreated(false);
    setDisabled(true);
  }


  const detectCommentIntersection = (cmImg: CommentImage) =>{
    
    if (cmImg.parentImg &&!cmImg.intersectsWithObject(cmImg.parentImg)) {

      cmImg.parentImg.collections = cmImg.parentImg.collections?.filter(obj => obj !== cmImg);
      cmImg.parentImg = undefined;
    }

    const canvas = canvasInstance.current as fabric.Canvas;

    if(!canvas) return;

    let intObj: CustomImage | undefined;

    canvas.forEachObject(obj => {
      // Skip itself
      if (obj === cmImg) return;

      if (!cmImg.intersectsWithObject(obj)) return;

      // Find the object that the comment intersects with
      intObj = obj as CustomImage;
      if (intObj && intObj.imgType === 'picture') {
        intObj.collections?.push(cmImg);
        cmImg.parentImg = intObj;
      }
    });

  }


  const toggleDialog = (event:fabric.IEvent,cmImg: CommentImage) =>{

    const target = event.target as CommentImage;
        
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


  const handleCommentKeydown = (event: KeyboardEvent)=> {
    
    const comment : CommentPanel = {
      name: userInfo?.name || '',
      value: (event.target as HTMLInputElement).value,
      time: new Date().toLocaleString()
    } ;

    if(event.code === 'Enter' && comment.value !== ''){
      setCompleted(true);
      if(currentSelect) createCommentThread(currentSelect as CommentImage,comment);
    }

    if(event.code === 'Escape' ){
      if(currentSelect) removeObject(currentSelect);
      resetComment();
    }
  }


  const createCommentThread = (cmImg:CommentImage,comment: CommentPanel) =>{
    //Key to get current comment's val.
    cmImg.cacheKey = generateSerialNumber(); 
    cmImg.imgType = 'comment';

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

    setDialog({
      show:true, 
      comments: [comment],
      top:((cmImg.top || 0) - (cmImg.height || 0)), 
      left:(cmImg.left || 0) + (cmImg.width || 0),
      cacheKey: cmImg.cacheKey
    });
  }


  /** handle delete threads */
  const handleResolveDialog = () =>{
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


  const updateComments = (oImg:CustomImage) =>{

    if(!oImg.collections ||  oImg.collections.length === 0) return;

    var multiply = fabric.util.multiplyTransformMatrices;
    
    console.log('updateComments',oImg);

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
   * 
   * @param oImg Image
   */
  const bindCommentToImage = (oImg: CustomImage) =>{
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


  const addImage = () =>{
    const canvas = canvasInstance.current as fabric.Canvas;

    fabric.Image.fromURL(`${process.env.PUBLIC_URL}/cat.png`, function(oImg:CustomImage) {
      oImg.left = 200;
      oImg.top = 200;
      oImg.hasBorders = true;
      oImg.hasControls = false;
      oImg.imgType = 'picture';
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

  
  const handleChangeMode = (mode: string) =>{
    setMode(mode);
  }

  const handleChangeUser = (name: string) =>{
    setUserInfo({...userInfo,name});
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
    modeRef.current = mode;
    const canvas = canvasInstance.current;
    const selectable =  modeRef.current === 'move';

    const imgs = (canvas?.getObjects())?.filter((obj:any)=> obj.imgType === 'picture') || [];

    if(imgs.length > 0){
      imgs.forEach(img =>{
        img.selectable = selectable;
      });
    }
   
  }, [mode]);
  
  
  useEffect(()=>{

    if(canvasInstance.current){
      const canvas = canvasInstance.current;

      // Add event listener to track if the mousedown event is inside an object
      canvas.on('mouse:down:before', handleBeforeMousedown);

      canvas.on('mouse:down', handleMousedown);

      return () => {
        // Clean up resources, if necessary
        canvas.off('mouse:down:before', handleBeforeMousedown);
        canvas.off('mouse:down', handleMousedown);
      };
    }
    
  },[init,isCommentCreated,isComplete])

 
  useEffect(() => {
  
    const getWindowDimensions = () => {
      const { innerWidth: width, innerHeight: height } = window;
      return { width, height };
    };

    const initFabric = () =>{
      const canvas = new fabric.Canvas(canvasRef.current);
      canvasInstance.current = canvas;
  
      const { width, height } = getWindowDimensions();

      canvas.setWidth(width);
      canvas.setHeight(height);
      canvas.preserveObjectStacking = true;
    }


    const disposeFabric = () =>{
      canvasInstance.current?.dispose();
    }


    const getUserInfo = () =>{
      const user = DefaultUserInfo;
      setUserInfo(user);
    }


    if (canvasRef.current) {
      initFabric();

      getUserInfo();

      setInit(true);

      document.addEventListener('keydown',handleKeyDown);

      return(()=>{
        document.removeEventListener('keydown',handleKeyDown);
        sessionStorage.clear();
        disposeFabric();
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
          <Dialog onResolve = {handleResolveDialog}
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
            <ModeButton mode={mode} onClick={() => handleChangeMode('move')}>
              <img src={MoveMode} alt="move mode" />
              <div>Move Mode</div>
            </ModeButton>
            <ModeButton mode={mode} onClick={() => handleChangeMode('comment')}>
              <img src={CommentMode} alt="comment mode" />
              <div>Comment Mode</div>
            </ModeButton>
            {
              mode === 'move' &&
              <ModeButton onClick={addImage}>
                <img src={AddImage} alt="comment mode" />
                <div>add Image</div>
              </ModeButton>
            }
          
          </div>
        </ToolBar>
      </div>
    </>
  );
};

export default FabricCanvas;