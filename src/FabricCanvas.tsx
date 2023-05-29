import React, { useRef, useEffect } from 'react';
import { fabric } from 'fabric';

const FabricCanvas: React.FC = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = new fabric.Canvas(canvasRef.current);

            // Add your Fabric.js code here
            canvas.width = 800;
            canvas.height = 600;
            
            // Create a rectangle
            const rect = new fabric.Rect({
                left: 100,
                top: 100,
                width: 200,
                height: 100,
                fill: 'blue',
            });
  
      // Add the rectangle to the canvas
      canvas.add(rect);

        return () => {
            // Clean up resources, if necessary
            canvas.dispose();
        };
        }
    }, []);

    return <canvas ref={canvasRef} />;
};

export default FabricCanvas;