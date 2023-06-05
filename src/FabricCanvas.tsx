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


  const [dialog, setDialog] = useState<DialogConfig>({show: false});
  const [isCommentCreated, setCommentCreated] = useState<boolean>(false);
  const [isComplete, setCompleted] = useState<boolean>(false);
  const [currentSelect, setCurrentSelect] = useState<fabric.Object | null>(null);
  const [init,setInit] =  useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  const dialogRef = useRef(dialog);
  const currentSelectRef = useRef(currentSelect);

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

    if (isInsideObject) {
      isInsideObject = false; // Reset the flag
      return; // Ignore the event
    }

    console.log('isCommentCreated',isCommentCreated);
    console.log('isComplete',isComplete);
    console.log('dialog',dialog.show);
    console.log('event',event);

    const canvas = canvasInstance.current as fabric.Canvas;
    const pointer = canvas.getPointer(event.e);

  
    if(isCommentCreated && !isComplete){
      setCommentCreated(false); // Reset the flag

      console.log('remove');
      
      removeObject();
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

    fabric.Image.fromURL('/img/icon_message.svg', function(oImg:fabric.Image) {
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
        console.log('imgInstance mousedown',event);

        if((event.target as fabric.Image).cacheKey){
          //這個待處理
          setDialog({
            show: !dialogRef.current.show,
            value,
            top:((oImg.top || 0) - (oImg.height || 0)), 
            left:(oImg.left || 0) + (oImg.width || 0)
          });
        }
      });

      oImg.on('selected', (event) => {
        console.log(currentSelect,'currentSelect');

        oImg.opacity = 0.5;
        console.log('imgInstance selected',event);

        if((event.target as fabric.Image).cacheKey){
          setCompleted(true);

          console.log(event.target);

          setDialog({
            show: true,
            value,
            top:((oImg.top || 0) - (oImg.height || 0)), 
            left:(oImg.left || 0) + (oImg.width || 0)
          });
        }

        setCurrentSelect(oImg);
      });
  
      oImg.on('deselected', (event) => {
        oImg.opacity = 1;
        console.log('imgInstance deselected',event);
        console.log('isCommentCreated', isCommentCreated,'isComplete',isComplete);

        //待處理

        setDialog({
          show: false,
          value,
          top:((oImg.top || 0) - (oImg.height || 0)), 
          left:(oImg.left || 0) + (oImg.width || 0)
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
    oImg.cacheKey = generateSerialNumber(); //key to get current comment's val;
    setDialog({
      show:true, 
      value,
      top:((oImg.top || 0) - (oImg.height || 0)), 
      left:(oImg.left || 0) + (oImg.width || 0)
    });

    setCompleted(true);
  }

  useEffect(() => {
    dialogRef.current = dialog;
    console.log('update dialogRef', dialogRef.current.show);
  }, [dialog]);


  useEffect(() => {
    currentSelectRef.current = currentSelect;
  }, [currentSelect]);

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

  const {show , value , top , left} = dialog;
  
  return (
    <>
      <div id="canvas-container">
        <canvas ref={canvasRef} />
        {
          dialog.show 
          && 
          <Dialog onClose = {() => setDialog({...dialog , show: false})} 
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