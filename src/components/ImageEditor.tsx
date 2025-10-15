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
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('erase');
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 加载图片
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
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

  // 重置
  const reset = useCallback(() => {
    if (originalImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(originalImage, 0, 0);
      setRotation(0);
      setScale(1);
      saveHistory();
    }
  }, [originalImage, saveHistory]);

  // 旋转
  const handleRotate = useCallback(() => {
    if (!canvasRef.current || !originalImage) return;
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // 交换宽高
    if (newRotation % 180 === 90) {
      canvas.width = originalImage.height;
      canvas.height = originalImage.width;
    } else {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((newRotation * Math.PI) / 180);
    ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);
    ctx.restore();
    
    saveHistory();
  }, [rotation, originalImage, saveHistory]);

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
      // 还原模式 - 从原图复制
      if (originalImage) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(
          originalImage,
          x - brushSize,
          y - brushSize,
          brushSize * 2,
          brushSize * 2,
          x - brushSize,
          y - brushSize,
          brushSize * 2,
          brushSize * 2
        );
      }
    }
    
    ctx.restore();
  }, [isDrawing, currentTool, brushSize, originalImage]);

  // 开始绘制
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'erase' || currentTool === 'restore') {
      setIsDrawing(true);
      draw(e);
    }
  }, [currentTool, draw]);

  // 结束绘制
  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
    }
  }, [isDrawing, saveHistory]);

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

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            取消
          </button>
          <div className="h-6 w-px bg-gray-600" />
          
          {/* 工具选择 */}
          <div className="flex gap-2">
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
              onClick={handleRotate}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              🔄 旋转
            </button>
          </div>

          <div className="h-6 w-px bg-gray-600" />

          {/* 笔刷大小 */}
          {(currentTool === 'erase' || currentTool === 'restore') && (
            <div className="flex items-center gap-3">
              <span className="text-sm">笔刷大小:</span>
              <input
                type="range"
                min="5"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm w-12">{brushSize}px</span>
            </div>
          )}

          <div className="h-6 w-px bg-gray-600" />

          {/* 撤销/重做 */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            ↶ 撤销
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            ↷ 重做
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            🔄 重置
          </button>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium"
        >
          ✓ 完成
        </button>
      </div>

      {/* Canvas区域 */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="relative" style={{ transform: `scale(${scale})` }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="max-w-full max-h-full border-2 border-gray-600 shadow-2xl cursor-crosshair"
            style={{
              backgroundColor: 'transparent',
              backgroundImage: 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 20px 20px',
            }}
          />
          
          {/* 笔刷预览 */}
          {(currentTool === 'erase' || currentTool === 'restore') && (
            <div
              className="pointer-events-none fixed rounded-full border-2"
              style={{
                width: brushSize * 2,
                height: brushSize * 2,
                borderColor: currentTool === 'erase' ? 'red' : 'blue',
                left: -1000, // 通过JS更新位置
                top: -1000,
              }}
            />
          )}
        </div>
      </div>

      {/* 底部缩放控制 */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setScale(Math.max(0.1, scale - 0.1))}
          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          −
        </button>
        <span className="w-16 text-center">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale(Math.min(3, scale + 0.1))}
          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          +
        </button>
        <button
          onClick={() => setScale(1)}
          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          重置缩放
        </button>
      </div>
    </div>
  );
}

