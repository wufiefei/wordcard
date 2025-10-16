'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedBlob: Blob) => void;
  onClose: () => void;
}

type Tool = 'erase' | 'restore' | 'crop' | 'rotate';

export default function ImageEditor({ imageUrl, onSave, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 保存最初的完整原图（用于重置）
  const [initialImage, setInitialImage] = useState<HTMLImageElement | null>(null);
  // 当前操作的参考图（用于还原笔刷）
  const [currentReferenceImage, setCurrentReferenceImage] = useState<HTMLImageElement | null>(null);
  
  const [currentTool, setCurrentTool] = useState<Tool>('erase');
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // 裁剪相关状态
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);

  // 加载图片
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 保存最初的完整原图
      setInitialImage(img);
      setCurrentReferenceImage(img);
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        // 初始化历史记录
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([imageData]);
        setHistoryIndex(0);
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // 自定义光标样式（基于实际笔刷大小）
  useEffect(() => {
    if (!canvasRef.current || (currentTool !== 'erase' && currentTool !== 'restore')) {
      if (canvasRef.current) {
        canvasRef.current.style.cursor = currentTool === 'crop' ? 'crosshair' : 'default';
      }
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // 计算显示尺寸（屏幕像素）
    const displayBrushSize = brushSize / ((scaleX + scaleY) / 2);
    
    // 创建SVG光标
    const color = currentTool === 'erase' ? 'red' : 'blue';
    const svgSize = Math.ceil(displayBrushSize * 2 + 4); // 加4px边距
    const center = svgSize / 2;
    const radius = displayBrushSize;
    
    const svgCursor = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}"><circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
    
    canvas.style.cursor = `url('${svgCursor}') ${center} ${center}, crosshair`;
  }, [brushSize, currentTool]);

  // 保存历史记录
  const saveHistory = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.putImageData(history[historyIndex - 1], 0, 0);
        setHistoryIndex(historyIndex - 1);
      }
    }
  }, [history, historyIndex]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        ctx.putImageData(history[historyIndex + 1], 0, 0);
        setHistoryIndex(historyIndex + 1);
      }
    }
  }, [history, historyIndex]);

  // 重置到最初的完整原图
  const reset = useCallback(() => {
    if (initialImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;
      
      // 恢复到最初的尺寸
      canvas.width = initialImage.width;
      canvas.height = initialImage.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(initialImage, 0, 0);
      
      // 重置参考图和旋转
      setCurrentReferenceImage(initialImage);
      setRotation(0);
      
      // 保存到历史
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([imageData]);
      setHistoryIndex(0);
    }
  }, [initialImage]);

  // 旋转
  const handleRotate = useCallback(() => {
    if (!canvasRef.current || !currentReferenceImage) return;
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // 获取当前画布内容
    const currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(currentImageData, 0, 0);
    
    // 交换宽高
    if (newRotation % 180 === 90) {
      canvas.width = tempCanvas.height;
      canvas.height = tempCanvas.width;
    } else {
      canvas.width = tempCanvas.width;
      canvas.height = tempCanvas.height;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(tempCanvas, -tempCanvas.width / 2, -tempCanvas.height / 2);
    ctx.restore();
    
    // 更新参考图（用于还原功能）
    const newRefImg = new Image();
    newRefImg.onload = () => {
      setCurrentReferenceImage(newRefImg);
    };
    newRefImg.src = canvas.toDataURL();
    
    saveHistory();
  }, [rotation, currentReferenceImage, saveHistory]);

  // 裁剪功能
  const handleCropStart = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 'crop') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setIsCropping(true);
    setCropStart({ x, y });
    setCropEnd({ x, y });
  }, [currentTool]);

  const handleCropMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || currentTool !== 'crop' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setCropEnd({ x, y });
  }, [isCropping, currentTool]);

  const handleCropEnd = useCallback(() => {
    if (!isCropping || !cropStart || !cropEnd || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // 计算裁剪区域
    const x = Math.min(cropStart.x, cropEnd.x);
    const y = Math.min(cropStart.y, cropEnd.y);
    const width = Math.abs(cropEnd.x - cropStart.x);
    const height = Math.abs(cropEnd.y - cropStart.y);
    
    if (width > 10 && height > 10) {
      // 获取裁剪区域的图像数据
      const imageData = ctx.getImageData(x, y, width, height);
      
      // 调整画布大小
      canvas.width = width;
      canvas.height = height;
      
      // 绘制裁剪后的图像
      ctx.putImageData(imageData, 0, 0);
      
      // 更新参考图（将裁剪后的内容作为新的参考图）
      const newRefImg = new Image();
      newRefImg.onload = () => {
        setCurrentReferenceImage(newRefImg);
      };
      newRefImg.src = canvas.toDataURL();
      
      saveHistory();
    }
    
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
  }, [isCropping, cropStart, cropEnd, saveHistory]);

  // 绘制（擦除/还原）
  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.save();
    
    if (currentTool === 'erase') {
      // 擦除模式
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();
    } else if (currentTool === 'restore') {
      // 还原模式 - 从当前参考图复制
      if (currentReferenceImage) {
        ctx.globalCompositeOperation = 'source-over';
        
        // 计算缩放比例（如果画布尺寸与参考图不同）
        const scaleRefX = currentReferenceImage.width / canvas.width;
        const scaleRefY = currentReferenceImage.height / canvas.height;
        
        ctx.drawImage(
          currentReferenceImage,
          x * scaleRefX - brushSize * scaleRefX,
          y * scaleRefY - brushSize * scaleRefY,
          brushSize * 2 * scaleRefX,
          brushSize * 2 * scaleRefY,
          x - brushSize,
          y - brushSize,
          brushSize * 2,
          brushSize * 2
        );
      }
    }
    
    ctx.restore();
  }, [isDrawing, currentTool, brushSize, currentReferenceImage]);

  // 开始绘制
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'erase' || currentTool === 'restore') {
      setIsDrawing(true);
      draw(e);
    } else if (currentTool === 'crop') {
      handleCropStart(e);
    }
  }, [currentTool, draw, handleCropStart]);

  // 结束绘制
  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
    } else if (isCropping) {
      handleCropEnd();
    }
  }, [isDrawing, isCropping, saveHistory, handleCropEnd]);

  // 鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'erase' || currentTool === 'restore') {
      draw(e);
    } else if (currentTool === 'crop' && isCropping) {
      handleCropMove(e);
    }
  }, [currentTool, draw, isCropping, handleCropMove]);

  // 保存
  const handleSave = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onSave(blob);
        onClose();
      }
    }, 'image/png');
  }, [onSave, onClose]);

  // 绘制裁剪框
  useEffect(() => {
    if (!canvasRef.current || !cropStart || !cropEnd || currentTool !== 'crop') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // 重绘画布
    if (history[historyIndex]) {
      ctx.putImageData(history[historyIndex], 0, 0);
    }
    
    // 绘制裁剪框
    ctx.save();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      cropStart.x,
      cropStart.y,
      cropEnd.x - cropStart.x,
      cropEnd.y - cropStart.y
    );
    ctx.restore();
  }, [cropStart, cropEnd, currentTool, history, historyIndex]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            取消
          </button>
          <div className="h-6 w-px bg-gray-600" />
          
          {/* 工具选择 */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCurrentTool('erase')}
              className={`px-4 py-2 rounded-lg ${
                currentTool === 'erase' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              🖌️ 擦除
            </button>
            <button
              onClick={() => setCurrentTool('restore')}
              className={`px-4 py-2 rounded-lg ${
                currentTool === 'restore' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              ✏️ 还原
            </button>
            <button
              onClick={() => setCurrentTool('crop')}
              className={`px-4 py-2 rounded-lg ${
                currentTool === 'crop' ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              ✂️ 裁剪
            </button>
            <button
              onClick={handleRotate}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              🔄 旋转
            </button>
          </div>

          {/* 笔刷大小（仅擦除和还原时显示） */}
          {(currentTool === 'erase' || currentTool === 'restore') && (
            <>
              <div className="h-6 w-px bg-gray-600" />
              <div className="flex items-center gap-2">
                <span className="text-sm">笔刷大小:</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm w-8">{brushSize}</span>
              </div>
            </>
          )}

          <div className="h-6 w-px bg-gray-600" />
          
          {/* 历史操作 */}
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↶ 撤销
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↷ 重做
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
            >
              🔄 重置
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-500 rounded-lg hover:bg-green-600 font-semibold"
        >
          ✓ 保存
        </button>
      </div>

      {/* 画布区域 */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-auto"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="max-w-full max-h-full bg-gray-800 shadow-2xl"
        />
      </div>

      {/* 底部提示 */}
      <div className="bg-gray-900 text-white p-2 text-center text-sm">
        {currentTool === 'erase' && '🖌️ 擦除模式：按住鼠标左键擦除图片背景'}
        {currentTool === 'restore' && '✏️ 还原模式：按住鼠标左键从参考图还原内容'}
        {currentTool === 'crop' && '✂️ 裁剪模式：按住鼠标左键拖动选择裁剪区域'}
      </div>
    </div>
  );
}
