import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import './FabricCanvas.css';
import Dialog from './dialog/Dialog';
import { DialogConfig } from './interface';
import { CustomImage } from './class';


const FabricCanvas: React.FC = () => {


  const [dialog, setDialog] = useState<DialogConfig>({show: false});
  const [isCommentCreated, setCommentCreated] = useState<boolean>(false);
  const [isComplete, setCompleted] = useState<boolean>(false);
  const [currentSelect, setCurrentSelect] = useState<fabric.Object | null>(null);
  const [init,setInit] =  useState<boolean>(false);
  const [isInsideObject,setInsideObject] =  useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  const dialogRef = useRef<DialogConfig>(dialog);
  const currentSelectRef = useRef<fabric.Object | null>(currentSelect);
  const insideObjectRef = useRef<boolean>(isInsideObject);


  const [counter, setCounter] = useState(1);

  const generateSerialNumber = (): string => {
    const serialNumber = `SN-${counter}`;
    setCounter(prevCounter => prevCounter + 1);
    return(serialNumber);
  };

  const handleBeforeMousedown = (event:fabric.IEvent):void => {

    const canvas = canvasInstance.current as fabric.Canvas;
    if (canvas) {
      const target = canvas.findTarget(event.e, false);
      console.log('target',target);

      // Check if the click was inside an object
      const isInsideObject = target !== null && target !== undefined;
      console.log('insideObjectRef',isInsideObject);

      setInsideObject(isInsideObject); // Update the state value
      insideObjectRef.current = isInsideObject;
    }
  }

  const handleMousedown = (event:fabric.IEvent): void => {
    if (insideObjectRef.current) {
      setInsideObject(false); // Reset the flag
      return; // Ignore the event
    }

    const canvas = canvasInstance.current as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);

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
    createComment(canvas,pointer);
  }


  const createComment = (canvas:fabric.Canvas, pointer: any) => {

    fabric.Image.fromURL('/img/icon_message.svg', function(oImg:CustomImage) {
      oImg.hasControls = false;
      oImg.hasBorders = false;
      oImg.originY = 'bottom';
      oImg.left = pointer.x;
      oImg.top = pointer.y;
      oImg.cacheKey = "";
      canvas.add(oImg);
      canvas.setActiveObject(oImg);

      createInput(oImg);
      setCommentCreated(true);
      setCurrentSelect(oImg);


      oImg.on('mousedown', (event) => {
        console.log('mousedown',oImg);
        if(oImg.isFirstSelected) {
          //reset value
          oImg.isFirstSelected = false;
          return;
        }

        const target = event.target as fabric.Image;
        if(target.cacheKey){

          setDialog({
            show: !dialogRef.current.show,
            value,
            top:((oImg.top || 0) - (oImg.height || 0)), 
            left:(oImg.left || 0) + (oImg.width || 0),
            cacheKey: target.cacheKey
          });
        }
      });


      oImg.on('selected', (event) => {
        oImg.opacity = 0.5;
        oImg.isFirstSelected = true;
        console.log('imgInstance selected',event);
        const target = event.target as fabric.Image;

        if(target.cacheKey){
          setCompleted(true);
          setCommentCreated(true);
          const value  = sessionStorage.getItem(target.cacheKey) || "";
          console.log('session',value);

          setDialog({
            show: true,
            value: value,
            top:((oImg.top || 0) - (oImg.height || 0)), 
            left:(oImg.left || 0) + (oImg.width || 0),
            cacheKey: target.cacheKey
          });

          console.log('dialog value',dialogRef.current);

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
          show: false,
          value: ""
        });

      });


      oImg.on('moving',()=>{
        const input =  document.getElementById('comment_input') as HTMLElement;
        if(!input || isComplete) return;
        input.style.left = `${(oImg.left || 0) + (oImg.width || 0)}px`;
        input.style.top = `${((oImg.top || 0) - (oImg.height || 0))}px`;
      })

    });
  }

  const removeObject = (obj: fabric.Object | fabric.Image | null) => {
    if(!obj) return;
    const input =  document.getElementById('comment_input') as HTMLElement;
    const canvas = canvasInstance.current as fabric.Canvas;
    if(input) input.remove();
    if(canvas)  canvas.remove(obj);
  }

  const createInput = (oImg:fabric.Image) => {
    const inputElement = document.createElement('input');
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
      const val = (event.target as HTMLInputElement).value ;
      if(event.code === 'Enter' && val !== ''){
        inputElement.remove();
        createCommentThread(oImg,val);
      }
    });
  }

  const createCommentThread = (oImg:fabric.Image,value: any) =>{
    oImg.cacheKey = generateSerialNumber(); //key to get current comment's val;

    const val = JSON.stringify([{value}]);

    sessionStorage.setItem(oImg.cacheKey, val);

    setDialog({
      show:true, 
      value,
      top:((oImg.top || 0) - (oImg.height || 0)), 
      left:(oImg.left || 0) + (oImg.width || 0),
      cacheKey: oImg.cacheKey
    });
    setCompleted(true);
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
      canvas.width = 800;
      canvas.height = 600;
      
      // Add event listener to track if the mousedown event is inside an object
      setInit(true);

      return () => {
        // Clean up resources, if necessary
        canvas.dispose();
      };
    }
  }, []);

  const {show ,cacheKey, value , top , left,} = dialog;
  
  return (
    <>
      <div id="canvas-container">
        <canvas ref={canvasRef} />
        {
          show 
          && 
          <Dialog onClose = {() => setDialog({...dialog , show: false})} 
                  top = {top} 
                  left = {left}
                  value = {value}
                  cacheKey={cacheKey}
          />
        }
      </div>
    </>
  );
};

export default FabricCanvas;