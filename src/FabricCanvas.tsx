import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import './FabricCanvas.css';
import Dialog from './dialog/Dialog';


interface DialogConfig{
  show: boolean,
  value?: string;
  top?: number,
  left?: number
}


const FabricCanvas: React.FC = () => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);

  const [dialog, setDialog] = useState<DialogConfig>({show: false});
  const [isCommentCreated, setCommentCreated] = useState<boolean>(false);
  const [isComplete, setCompleted] = useState<boolean>(false);
  const [currentSelect, setCurrentSelect] = useState<fabric.Object | null>(null);

  let isInsideObject = false;

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
      // Check if the click was inside an object
      isInsideObject = target !== null && target !== undefined;
    }
  }

  const handleMousedown = (event:fabric.IEvent): void => {
    console.log('isCommentCreated',isCommentCreated);
    console.log('isComplete',isComplete);
    console.log('dialog',dialog.show);

    const canvas = canvasInstance.current as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);

    if (isInsideObject) {
      isInsideObject = false; // Reset the flag
      return; // Ignore the event
    }

    if(isCommentCreated && !isComplete){
      setCommentCreated(false); // Reset the flag
      removeObject();
      return; // Ignore the event
    }
    
    if(dialog.show) { 
      setCompleted(false);
      setDialog({show: false }); 
      return; // Ignore the event
    }
    // Create a new comment object
    createComment(canvas,pointer);
  }


  const createComment = (canvas:fabric.Canvas, pointer: any) => {

    fabric.Image.fromURL('/img/icon_message.svg', function(oImg:fabric.Image) {
      oImg.hasControls = false;
      oImg.hasBorders = false;
      oImg.originY = 'bottom';
      oImg.left = pointer.x;
      oImg.top = pointer.y;
      oImg.cacheKey = generateSerialNumber(); //key to get current comment's val;
      
      canvas.add(oImg);

      createInput(oImg);
      setCommentCreated(true);
      setCurrentSelect(oImg);

      oImg.on('selected', (event) => {
        oImg.opacity = 0.5;
        console.log('imgInstance selected',event);
        // const value = sessionStorage.getItem((oImg.cacheKey || ''));
        // if(value){
        //   setDialog({
        //     show:true, 
        //     value: value,
        //     top:((oImg.top || 0) - (oImg.height || 0)), 
        //     left:(oImg.left || 0) + (oImg.width || 0)
        //   });
        // }
        setCurrentSelect(oImg);
      });
  
      oImg.on('deselected', (event) => {
        oImg.opacity = 1;
        console.log('imgInstance deselected',event.e);
      });

    });
  }

  const removeObject = () => {
    if(!currentSelect) return;
    console.log('currentSelect',currentSelect);
    const input =  document.getElementById('comment_input') as HTMLElement;
    const canvas = canvasInstance.current as fabric.Canvas;

    input.remove();
    canvas.remove(currentSelect);
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
      const val = (event.target as HTMLInputElement).value;
      if(event.code === 'Enter' && val !== ''){
        console.log('enter');
        console.log('val', val);
        // sessionStorage.setItem((oImg.cacheKey || ''),val);
        console.log('currentSelect',currentSelect);
        inputElement.remove();
        createCommentThread(oImg,val);
      }
    });
  }

  const createCommentThread = (oImg:fabric.Image,value: any) =>{
    setDialog({
      show:true, 
      value,
      top:((oImg.top || 0) - (oImg.height || 0)), 
      left:(oImg.left || 0) + (oImg.width || 0)
    });

    setCompleted(true);
  }

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
    
  },[isCommentCreated,isComplete,currentSelect])


  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current);
      canvasInstance.current = canvas;
      
      // Add your Fabric.js code here
      canvas.width = 800;
      canvas.height = 600;
      
      // Add event listener to track if the mousedown event is inside an object
      canvas.on('mouse:down:before', handleBeforeMousedown);

      canvas.on('mouse:down', handleMousedown);


      return () => {
        // Clean up resources, if necessary
        canvas.dispose();
      };
    }
  }, []);

  const {show , value , top , left} = dialog;
  
  return (
    <>
      <div id="canvas-container">
        <canvas ref={canvasRef} />
        {
          dialog.show 
          && 
          <Dialog onClose = {() => setDialog({show: false})} 
                  top = {top} 
                  left = {left}
                  value = {value}
          />
        }
      </div>
    </>
  );
};

export default FabricCanvas;