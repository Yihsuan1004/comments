import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import './FabricCanvas.css';
import Dialog from './dialog/Dialog';


interface Dialog {
  show: boolean
  top?: number,
  left?: number
}

const FabricCanvas: React.FC = () => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInstance = useRef<fabric.Canvas | null>(null);
  const [dialog, setDialog] = useState<Dialog>({show: false});
  const [isCommentCreated, setCommentCreated] = useState<boolean>(false);
  const [isComplete, setCompleted] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let currentSelect!: fabric.Object;

  let isInsideObject = false;

  /** Handle canvas mouse down event */
  function handleMousedown(event:fabric.IEvent):void{

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
    
    console.log('dialog',dialog);

    if(dialog.show) { 
      setDialog({show: false }); 
      return; // Ignore the event
    }
    // Create a new comment object
    createComment(canvas,pointer);
  }

  function handleBeforeMousedown(event:fabric.IEvent):void{
    const canvas = canvasInstance.current as fabric.Canvas;
    if (canvas) {
      const target = canvas.findTarget(event.e, false);
      // Check if the click was inside an object
      isInsideObject = target !== null && target !== undefined;
    }
  }

  function createComment(canvas:fabric.Canvas, pointer: any){
    setCommentCreated(true);

    fabric.Image.fromURL('/img/icon_message.svg', function(oImg:fabric.Image) {
      oImg.hasControls = false;
      oImg.hasBorders = false;
      oImg.originY = 'bottom';
      oImg.left = pointer.x;
      oImg.top = pointer.y;
      currentSelect = oImg;
      canvas.add(oImg);

      createInput(oImg);

      oImg.on('selected', (event) => {
        oImg.opacity = 0.5;
        console.log('imgInstance selected',event.e);
        currentSelect = oImg;
      });
  
      oImg.on('deselected', (event) => {
        oImg.opacity = 1;
        console.log('imgInstance deselected',event.e);
      });
    });
  }

  function removeObject(){
    if(!currentSelect) return;
    console.log('currentSelect',currentSelect);
    const input =  document.getElementById('comment_input') as HTMLElement;
    const canvas = canvasInstance.current as fabric.Canvas;

    input.remove();
    canvas.remove(currentSelect);
  }

  function createInput(oImg:fabric.Image){
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
      if(event.code === 'Enter'){
        console.log('enter');
        console.log('currentSelect',currentSelect);
        inputElement.remove();
        createCommentThread(oImg);
      }
    });
  }

  function createCommentThread(oImg:fabric.Image){
    setDialog({
      show:true, 
      top:((oImg.top || 0) - (oImg.height || 0)), 
      left:(oImg.left || 0) + (oImg.width || 0)
    });

    //存到indexed DB裡面

    setCompleted(true);
  }

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
  }, [dialog.show]);

  
  return (
    <>
      <div id="canvas-container">
        <canvas ref={canvasRef} />
        {dialog.show && <Dialog onClose={() => setDialog({show: false})} top={dialog.top} left={dialog.left} />}
      </div>
    </>
  );
};

export default FabricCanvas;