import React, { useRef, useEffect, useState, ChangeEvent } from 'react';
import { fabric } from 'fabric';
import './FabricCanvas.css';
import Dialog from './dialog/Dialog';
import Comment from './comment/Comment';
import CommentMode from './icon/icon_comment_mode.svg';
import MoveMode from './icon/icon_move_mode.svg';
import AddImage from './icon/icon_add_image.svg';

import { CommentPanel, DialogConfig, UserInfo } from './interface';
import { CommentImage, CustomImage } from './class';
import { Point } from 'fabric/fabric-impl';
import { ToolBar } from './FarbricCanvas.style';
import { Tooltip } from 'react-tooltip'


const DefaultUserInfo: UserInfo = {
  name: "Yihsuan Hung"
}

const commentOffsetX = 12;

const FabricCanvas: React.FC = () => {


  const [dialog, setDialog] = useState<DialogConfig>({ show: false});
  const [mode, setMode] = useState<string>('move');
  const [image, setImage] = useState<CustomImage | null>(null);
  const [disabled,setDisabled] = useState<boolean>(true);
  const [userInfo,setUserInfo] = useState<UserInfo | null>(null);

  const [isCommentCreated, setCommentCreated] = useState<boolean>(false);
  const [isComplete, setCompleted] = useState<boolean>(false);
  const [currentSelect, setCurrentSelect] = useState<CustomImage | CommentImage | null>(null);
  const [init,setInit] =  useState<boolean>(false);
  const [isInsideObject,setInsideObject] =  useState<boolean>(false);


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  const dialogRef = useRef<DialogConfig>(dialog);
  const currentSelectRef = useRef<CustomImage | CommentImage | null>(currentSelect);
  const insideObjectRef = useRef<boolean>(isInsideObject);
  const modeRef = useRef<string>(mode);


  const [counter, setCounter] = useState(1);

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
      console.log('insideObjectRef',isInsideObject);

      setInsideObject(isInsideObject); // Update the state value
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
    fabric.Image.fromURL('/img/icon_comment_create.svg', function(cmImg:CommentImage) {
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
          setCompleted(true);
          setCommentCreated(true);

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
  

      cmImg.on('deselected', (event) => {
        cmImg.opacity = 1;
        cmImg.isFirstSelected = false;

        if(cmImg.cacheKey === "") removeObject(cmImg);
  
        setDialog({
          ...dialog,
          show: false
        });

        resetComment();
      });


      cmImg.on('moving',(event)=>{

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
    cmImg.setSrc('/img/icon_comment.svg', ()=> canvas.renderAll());
    
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
  const handleDeleteDialog = () =>{
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

    fabric.Image.fromURL('/img/cat.png', function(oImg:CustomImage) {
      oImg.left = 100;
      oImg.top = 100;
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

    console.log(imgs);

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

    const initFabric = () =>{
      const canvas = new fabric.Canvas(canvasRef.current);
      canvasInstance.current = canvas;
  
      // Add your Fabric.js code here
      canvas.width = 1400;
      canvas.height = 800;
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
      console.log('init'); //ERROR: it will execute twice.

      initFabric();

      getUserInfo();

      document.addEventListener('keydown',handleKeyDown);

      // Add event listener to track if the mousedown event is inside an object
      setInit(true);

      return(()=>{
        document.removeEventListener('keydown',handleKeyDown);
        sessionStorage.clear();
        disposeFabric();
      })
    }
  }, []);


  const {show ,cacheKey, comments , top , left,} = dialog;
  
  return (
    <>
      <div id="canvas-container">
        <canvas ref={canvasRef} />
        {
          show 
          && 
          <Dialog onResolve = {handleDeleteDialog}
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
        <ToolBar mode={mode}>
          <button onClick={() => handleChangeMode('move')}>
            <img src={MoveMode} alt="comment mode" />
            <span>Move mode</span>
          </button>
          <button onClick={() => handleChangeMode('comment')}>
            <img src={CommentMode} alt="comment mode" />
            <span>Comment mode</span>
          </button>
          <button onClick={addImage} disabled={mode === 'comment'}>
            <img src={AddImage} alt="comment mode" />
            <span>add Image</span>
          </button>
          <div>
            <div id="clickable">{userInfo?.name}</div>
            <Tooltip anchorSelect="#clickable" clickable>
              <button onClick={()=> handleChangeUser('Yihsuan Hung')}>Yihsuan Hung</button>
              <button onClick={()=> handleChangeUser('Ava Mitchell')}>Ava Mitchell</button>
              <button onClick={()=> handleChangeUser('Harper Reynolds')}>Harper Reynolds</button>
            </Tooltip>
          </div>
        </ToolBar>
      </div>
    </>
  );
};

export default FabricCanvas;