import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import './FabricCanvas.css';
import Dialog from './dialog/Dialog';
import { Comment, DialogConfig } from './interface';
import { CustomImage } from './class';
import { Point } from 'fabric/fabric-impl';


const User = {
  name: "Cielo"
}

const FabricCanvas: React.FC = () => {


  const [dialog, setDialog] = useState<DialogConfig>({ show: false});
  const [mode, setMode] = useState<string>('move');
  const [isCommentCreated, setCommentCreated] = useState<boolean>(false);
  const [isComplete, setCompleted] = useState<boolean>(false);
  const [currentSelect, setCurrentSelect] = useState<CustomImage | null>(null);
  const [init,setInit] =  useState<boolean>(false);
  const [isInsideObject,setInsideObject] =  useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  const dialogRef = useRef<DialogConfig>(dialog);
  const currentSelectRef = useRef<CustomImage | null>(currentSelect);
  const insideObjectRef = useRef<boolean>(isInsideObject);
  const modeRef = useRef<string>(mode);


  const [counter, setCounter] = useState(1);

  const generateSerialNumber = (): string => {
    const serialNumber = `SN-${counter}`;
    setCounter(prevCounter => prevCounter + 1);
    return(serialNumber);
  };

  const handleBeforeMousedown = (event:fabric.IEvent):void => {
    if(modeRef.current === 'move') return;

    const canvas = canvasInstance.current as fabric.Canvas;
    if (canvas) {
      const target = canvas.findTarget(event.e, false)  as CustomImage;
      console.log('target',target);

      // Check if the click was inside an object
      const isInsideObject = target !== null && target !== undefined && target.imgType === 'comment';
      console.log('insideObjectRef',isInsideObject);

      setInsideObject(isInsideObject); // Update the state value
      insideObjectRef.current = isInsideObject;
    }
  }

  const handleMousedown = (event:fabric.IEvent): void => {
    console.log('object click',event.target);

    if(modeRef.current === 'move') return;

    if (insideObjectRef.current) {
      setInsideObject(false); // Reset the flag
      return; // Ignore the event
    }

    const canvas = canvasInstance.current as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);
    console.log('pointer',pointer);
    console.log('event',event.target);

    if(isCommentCreated && !isComplete){
      setCommentCreated(false); // Reset the flag
      removeObject(currentSelect);
      return; // Ignore the event
    }
    
    if(isCommentCreated && isComplete) { 
      setCommentCreated(false);
      setCompleted(false);
      return; // Ignore the event
    }

    // Create a new comment object
    createComment(canvas,pointer,event);
  }


  const createComment = (canvas:fabric.Canvas, pointer: any, event:fabric.IEvent) => {

    fabric.Image.fromURL('/img/icon_message.svg', function(oImg:CustomImage) {
      oImg.hasControls = false;
      oImg.hasBorders = false;
      oImg.originY = 'bottom';
      oImg.left = pointer.x;
      oImg.top = pointer.y;
      oImg.cacheKey = "";
      canvas.add(oImg);
      canvas.setActiveObject(oImg);

      createInput(oImg,event);
      setCommentCreated(true);
      setCurrentSelect(oImg);

      oImg.on('mouseup', (event) => {  
        console.log('mouseup',oImg.isFirstSelected);
        console.log('move',oImg.isMoved);

        const target = event.target as CustomImage;
        
        if(oImg.isFirstSelected && !oImg.isMoved) {
          //reset value
          oImg.isFirstSelected = false;
          setDialog({
            show: true,
            comments: dialogRef.current.comments,
            top:((oImg.top || 0) - (oImg.height || 0)), 
            left:(oImg.left || 0) + (oImg.width || 0),
            cacheKey: target.cacheKey
          });
          return;
        }

        
        if(oImg.cacheKey){
          if(oImg.isMoved){
            oImg.isMoved = false;
            setDialog({
              show: dialogRef.current.show,
              comments: dialogRef.current.comments,
              top:((oImg.top || 0) - (oImg.height || 0)), 
              left:(oImg.left || 0) + (oImg.width || 0),
              cacheKey: target.cacheKey
            });
          }

          else{
            console.log('mouseup');
            setDialog({
              show: !dialogRef.current.show,
              comments: dialogRef.current.comments,
              top:((oImg.top || 0) - (oImg.height || 0)), 
              left:(oImg.left || 0) + (oImg.width || 0),
              cacheKey: target.cacheKey
            });
          }
        }
      });


      oImg.on('selected', (event) => {
        oImg.opacity = 0.5;
        oImg.isFirstSelected = true;
        console.log('imgInstance selected',event);
        const target = event.target as CustomImage;

        if(target.cacheKey){
          setCompleted(true);
          setCommentCreated(true);

          const comments  = JSON.parse(sessionStorage.getItem(target.cacheKey) || "[]");

          setDialog({
            show: dialogRef.current.show,
            comments: comments,
            top:((oImg.top || 0) - (oImg.height || 0)), 
            left:(oImg.left || 0) + (oImg.width || 0),
            cacheKey: target.cacheKey
          });
        }
        setCurrentSelect(oImg);
      });
  

      oImg.on('deselected', (event) => {
        oImg.opacity = 1;
        oImg.isFirstSelected = false;
        console.log('imgInstance deselected',event);

        //待處理
        if(oImg.cacheKey === ""){
          removeObject(oImg);
        }
        
        setDialog({
          ...dialog,
          show: false
        });

      });

      oImg.on('moving',()=>{
        
        oImg.isMoved = true;

        console.log('moving');

        const input =  document.getElementById('comment_input') as HTMLElement;
        if(!input || isComplete) return;
        input.style.left = `${(oImg.left || 0) + (oImg.width || 0)}px`;
        input.style.top = `${((oImg.top || 0) - (oImg.height || 0))}px`;
      })

    });
  }

  const removeObject = (obj: fabric.Object | CustomImage | null) => {
    if(!obj) return;
    const input =  document.getElementById('comment_input') as HTMLElement;
    const canvas = canvasInstance.current as fabric.Canvas;
    if(input) input.remove();
    if(canvas)  canvas.remove(obj);
  }

  const createInput = (oImg:CustomImage, event: fabric.IEvent) => {
    const inputElement = document.createElement('input');
    const clickTarget = event.target as CustomImage;

    inputElement.id = 'comment_input';
    inputElement.type = 'text';
    inputElement.style.position = 'absolute';
    inputElement.style.left = `${(oImg.left || 0) + (oImg.width || 0)}px`;
    inputElement.style.top = `${((oImg.top || 0) - (oImg.height || 0))}px`;
    inputElement.classList.add('comment-input');

    const container = document.getElementById('canvas-container');
    if (container) {
      container.appendChild(inputElement);
      inputElement.focus();
    }

    inputElement.addEventListener('keydown',(event)=>{
      const comment : Comment = {
        name: "Cielo",
        value: (event.target as HTMLInputElement).value,
        time: new Date().toLocaleString()
      } ;

      if(event.code === 'Enter' && comment.value !== ''){
        if(clickTarget){
          clickTarget.collections?.push(oImg);
        }
        inputElement.remove();

        createCommentThread(oImg,comment);
      }

      if(event.code === 'Escape' ){
        removeObject(oImg);
      }
    });
  }

  const createCommentThread = (oImg:CustomImage,comment: Comment) =>{
    //key to get current comment's val;
    oImg.cacheKey = generateSerialNumber(); 
    oImg.imgType = 'comment';

    const val = JSON.stringify([comment]);

    sessionStorage.setItem(oImg.cacheKey, val);

    setDialog({
      show:true, 
      comments: [comment],
      top:((oImg.top || 0) - (oImg.height || 0)), 
      left:(oImg.left || 0) + (oImg.width || 0),
      cacheKey: oImg.cacheKey
    });
    setCompleted(true);
  }

  /** handle delete threads */
  const handleDelete = () =>{
    const canvas = canvasInstance.current as fabric.Canvas;
    const activeObj = canvas.getActiveObject() as CustomImage;
    if(activeObj) {
      //delete object from canvas
      removeObject(activeObj);
      //clear session data
      sessionStorage.removeItem(activeObj.cacheKey as string);
    };
  }

  const addImage = () =>{
    const canvas = canvasInstance.current as fabric.Canvas;

    fabric.Image.fromURL('/img/cat.png', function(oImg:CustomImage) {
      oImg.left = 100;
      oImg.top = 100;
      oImg.hasBorders = true;
      oImg.imgType = 'normal';
      oImg.collections = [];
      var invert = fabric.util.invertTransform;
      var multiply = fabric.util.multiplyTransformMatrices;

      const updateComments = () =>{

        if(!oImg.collections ||  oImg.collections.length === 0) return;

        oImg.collections.forEach(obj =>{
          if(!obj.relationship) return;
          var relationship = obj.relationship;
          var newTransform = multiply(
            oImg.calcTransformMatrix(),
            relationship
          );

          var opt = fabric.util.qrDecompose(newTransform);
          obj.set({
            flipX: false,
            flipY: false,
          });

          const position = { x: opt.translateX, y: opt.translateY } as Point;

          obj.setPositionByOrigin(
             position, 
            'center',
            'center'
          )
          obj.set(opt);
          obj.setCoords();
        });

        
      }
    
      let currTransform = oImg.calcTransformMatrix();
      let invertCurrTransform = invert(currTransform);

      oImg.on('selected',()=>{
        if((oImg.collections || []).length > 0){
          console.log('oooo');
          oImg.collections?.forEach(obj =>{
            var desiredTransform = multiply(
              invertCurrTransform,
              obj.calcTransformMatrix()
            );

            obj.relationship = desiredTransform;
          })
        }
      })

      oImg.on('moving',updateComments);

      canvas.add(oImg);
    });
  }

  
  const handleChangeMode = (mode: string) =>{
    setMode(mode);
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

    const imgs = (canvas?.getObjects() as CustomImage[])?.filter(obj => obj.imgType === 'normal') || [];

    console.log(imgs);

    if(imgs.length >0){
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
    
  },[isCommentCreated,isComplete,init])


  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current);
      canvasInstance.current = canvas;
      
      // Add your Fabric.js code here
      canvas.width = 1400;
      canvas.height = 800;
      
      // Add event listener to track if the mousedown event is inside an object
      setInit(true);

      return(()=>{
        canvas.dispose();
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
          <Dialog onDelete = {handleDelete}
                  onClose = {() => setDialog({...dialog , show: false})} 
                  top = {top} 
                  left = {left}
                  comments = {comments}
                  cacheKey={cacheKey}
          />
        }
        <button onClick={() => handleChangeMode('move')}>Move mode</button>
        <button onClick={() => handleChangeMode('comment')}>Comment mode</button>
        <button onClick={addImage}>add Image</button>
      </div>
    </>
  );
};

export default FabricCanvas;