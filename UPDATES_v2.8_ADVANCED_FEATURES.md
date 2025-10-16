# 更新日志 v2.8 - 高级功能完善

## 更新时间
2025-10-16

## 主要更新

### 1. 重新选择照片时显示进度条 ✅

**功能说明**：
- 用户重新上传照片时，系统会显示"智能抠图中..."的进度条
- 进度条从0%到100%实时显示处理进度
- 处理完成后自动消失

**实现细节**：
- 已有的`Step1PhotoUpload`组件中的`handleFileChange`和`processFile`函数已经正确处理了进度显示
- 无论是首次上传还是重新上传，都会触发进度条显示

### 2. 擦除功能显示圆形笔刷光标 ✅

**功能说明**：
- 在图片编辑器中使用擦除或还原工具时，鼠标光标变为圆形笔刷
- 笔刷大小会随着调节滑块实时变化
- 擦除模式显示红色笔刷，还原模式显示蓝色笔刷

**实现细节**：
```typescript
// ImageEditor.tsx
useEffect(() => {
  if (!canvasRef.current || !cursorPos || (currentTool !== 'erase' && currentTool !== 'restore')) return;
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const displayBrushSize = brushSize / scaleX;

  // 动态生成SVG光标
  canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${displayBrushSize * 2}" height="${displayBrushSize * 2}" viewBox="0 0 ${displayBrushSize * 2} ${displayBrushSize * 2}"><circle cx="${displayBrushSize}" cy="${displayBrushSize}" r="${displayBrushSize - 1}" fill="none" stroke="${currentTool === 'erase' ? 'red' : 'blue'}" stroke-width="2"/></svg>') ${displayBrushSize} ${displayBrushSize}, crosshair`;
}, [cursorPos, brushSize, currentTool]);
```

### 3. 添加照片裁剪功能 ✅

**功能说明**：
- 在图片编辑器中新增"✂️ 裁剪"工具
- 用户可以通过鼠标拖动选择裁剪区域
- 实时显示绿色虚线裁剪框
- 松开鼠标后自动裁剪并更新画布

**实现细节**：
- 新增裁剪相关状态：`isCropping`, `cropStart`, `cropEnd`
- `handleCropStart`: 开始选择裁剪区域
- `handleCropMove`: 实时更新裁剪框
- `handleCropEnd`: 执行裁剪并更新画布

**裁剪流程**：
```typescript
// 1. 获取裁剪区域的图像数据
const imageData = ctx.getImageData(x, y, width, height);

// 2. 调整画布大小
canvas.width = width;
canvas.height = height;

// 3. 绘制裁剪后的图像
ctx.putImageData(imageData, 0, 0);

// 4. 保存历史记录
saveHistory();
```

### 4. 卡片预览拖动和缩放头像功能 ✅

**功能说明**：
- 按住头像可以拖动位置
- 点击头像显示四个蓝色圆点（缩放控制点）
- 按住任意一个圆点不放，可以拖动来缩放头像大小
- 缩放和拖动实时预览效果
- 点击"保存位置"按钮保存更改

**实现细节**：

#### 4.1 拖动功能
```typescript
const handleMouseDown = (e: React.MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('resize-corner')) return;
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(true);
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!cardRef.current) return;

  const card = cardRef.current;
  const rect = card.getBoundingClientRect();

  if (isDragging) {
    // 计算相对位置（百分比）
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // 限制在卡片范围内
    const clampedX = Math.max(avatarWidth / 2, Math.min(100 - avatarWidth / 2, x));
    const clampedY = Math.max(avatarWidth / 2, Math.min(100 - avatarWidth / 2, y));

    setPosition({ x: clampedX, y: clampedY });
  }
};
```

#### 4.2 缩放功能
```typescript
// 四个缩放角
{showCorners && (
  <>
    {/* 左上角 */}
    <div
      className="resize-corner absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-lg z-10"
      onMouseDown={handleResizeStart}
    />
    {/* 其他三个角... */}
  </>
)}

// 缩放处理
const handleResizeStart = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setIsResizing(true);
  resizeStartRef.current = {
    x: e.clientX,
    y: e.clientY,
    initialWidth: avatarWidth,
  };
};

// 在handleMouseMove中处理缩放
else if (isResizing && resizeStartRef.current) {
  const deltaX = e.clientX - resizeStartRef.current.x;
  const scaleFactor = 1 + (deltaX / rect.width);
  const newWidth = Math.max(10, Math.min(80, resizeStartRef.current.initialWidth * scaleFactor));
  
  setAvatarWidth(newWidth);
  if (onSizeChange) {
    onSizeChange(newWidth);
  }
}
```

#### 4.3 状态管理
- 在`page.tsx`中新增`wordSizes`状态管理头像宽度
- 在`Step2SelectWords`中传递`wordSizes`和`onUpdateWordSize`
- 在`DraggableCardPreview`中接收`currentWidth`和`onSizeChange`

### 5. 导出为PDF功能 ✅

**功能说明**：
- 点击"导出为PDF"按钮，将选中的所有单词卡导出为一个PDF文件
- 支持A4纸尺寸，自动分页
- 按照用户选择的卡片尺寸进行排版
- 包含用户编辑的头像位置和大小
- 高清晰度（300 DPI）

**依赖库**：
```json
{
  "dependencies": {
    "jspdf": "^2.5.2"
  }
}
```

**实现流程**：
1. 创建`exportUtils.ts`工具文件
2. 实现`renderCardToCanvas`函数，将每个单词卡渲染到Canvas
3. 实现`exportToPDF`函数，将所有Canvas转换为PDF
4. 在`page.tsx`中调用导出函数

**核心代码**：
```typescript
// src/utils/exportUtils.ts
export async function exportToPDF(
  words: Word[],
  photoUrl: string | null,
  wordPositions: Record<string, { x: number; y: number }>,
  wordSizes: Record<string, number>,
  selectedTemplate: CardTemplate,
  cardSize: CardSizeType
) {
  await loadLibraries();
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cardsPerPage = cardSize.cardsPerSheet;
  const totalPages = Math.ceil(words.length / cardsPerPage);

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      pdf.addPage();
    }

    // 渲染每个卡片
    const pageWords = words.slice(page * cardsPerPage, (page + 1) * cardsPerPage);
    
    for (let i = 0; i < pageWords.length; i++) {
      const word = pageWords[i];
      const canvas = await renderCardToCanvas(word, photoUrl, ...);
      
      // 计算位置并添加到PDF
      const col = i % cardSize.cols;
      const row = Math.floor(i / cardSize.cols);
      const x = col * cardWidthMM;
      const y = row * cardHeightMM;
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', x, y, cardWidthMM, cardHeightMM);
    }
  }

  pdf.save('单词卡片.pdf');
}
```

**Canvas渲染细节**：
- 支持横向和纵向两种布局
- 根据卡片尺寸动态调整元素大小和位置
- 绘制背景图、宝宝头像、英文和中文文字
- 使用300 DPI确保打印质量

### 6. 导出多张图片为压缩包功能 ✅

**功能说明**：
- 点击"导出多张图片"按钮，将选中的所有单词卡导出为PNG图片
- 所有图片打包为ZIP压缩包
- 每张图片独立，方便电子设备展示
- 文件命名格式：`001_Word-name.png`

**依赖库**：
```json
{
  "dependencies": {
    "jszip": "^3.10.1"
  }
}
```

**实现流程**：
```typescript
// src/utils/exportUtils.ts
export async function exportToImages(
  words: Word[],
  photoUrl: string | null,
  wordPositions: Record<string, { x: number; y: number }>,
  wordSizes: Record<string, number>,
  selectedTemplate: CardTemplate,
  cardSize: CardSizeType
) {
  await loadLibraries();
  
  const zip = new JSZip();

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const canvas = await renderCardToCanvas(word, photoUrl, ...);

    // 转为Blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });

    // 添加到压缩包
    const filename = `${String(i + 1).padStart(3, '0')}_${word.english.replace(/\s+/g, '-')}.png`;
    zip.file(filename, blob);
  }

  // 生成并下载压缩包
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = '单词卡片.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

## 技术细节

### 文件修改清单

1. **src/components/ImageEditor.tsx** - 完全重写
   - 新增圆形笔刷光标
   - 新增裁剪功能
   - 优化历史记录管理

2. **src/components/DraggableCardPreview.tsx** - 完全重写
   - 新增头像缩放功能
   - 新增四角缩放控制点
   - 优化拖动体验

3. **src/utils/exportUtils.ts** - 新文件
   - 实现PDF导出功能
   - 实现图片压缩包导出功能
   - 实现高质量Canvas渲染

4. **src/app/page.tsx** - 更新
   - 新增`wordSizes`状态
   - 新增`handleUpdateWordSize`函数
   - 实现`handleExportPDF`和`handleExportImages`

5. **src/components/Step2SelectWords.tsx** - 更新
   - 新增`wordSizes`和`onUpdateWordSize`接口
   - 传递缩放相关props到DraggableCardPreview

6. **package.json** - 更新
   - 新增`jspdf`依赖
   - 新增`jszip`依赖

## 用户体验优化

### 1. 图片编辑器
- **工具栏**：擦除、还原、裁剪、旋转四大工具
- **笔刷大小调节**：5-100像素可调
- **历史记录**：支持撤销/重做/重置
- **视觉反馈**：圆形笔刷光标实时反映工具状态

### 2. 卡片预览
- **直观操作**：按住拖动，点击显示缩放点
- **实时预览**：拖动和缩放立即生效
- **范围限制**：自动限制在卡片范围内
- **提示信息**：明确的操作说明

### 3. 导出功能
- **一键导出**：简单点击即可完成
- **格式选择**：PDF适合打印，图片适合电子展示
- **高质量**：300 DPI确保打印效果
- **智能命名**：文件名包含编号和单词

## 性能优化

1. **动态加载库**：jsPDF和JSZip仅在需要时加载
2. **Canvas复用**：合理管理Canvas资源
3. **异步处理**：避免阻塞UI线程
4. **错误处理**：完善的错误捕获和用户提示

## 已知限制

1. **背景图加载**：如果卡片背景图未上传，将显示渐变背景
2. **浏览器兼容性**：某些旧版浏览器可能不支持Canvas高级功能
3. **内存占用**：导出大量卡片时可能占用较多内存

## 下一步计划

- [ ] 优化移动端触摸操作体验
- [ ] 添加更多卡片模板
- [ ] 支持批量调整头像位置和大小
- [ ] 添加预设的头像位置方案
- [ ] 优化PDF导出速度

## 测试建议

1. **图片编辑**：
   - 测试擦除功能，观察圆形笔刷
   - 测试裁剪功能，确保裁剪准确
   - 测试旋转功能
   - 测试撤销/重做

2. **卡片预览**：
   - 测试拖动头像位置
   - 测试点击显示缩放点
   - 测试拖动角落缩放大小
   - 验证保存功能

3. **导出功能**：
   - 导出PDF，检查分页和排版
   - 导出图片压缩包，检查文件命名
   - 验证导出内容与预览一致
   - 打印测试PDF，检查实际效果

4. **边界情况**：
   - 未上传照片时导出
   - 未选择单词时导出
   - 选择大量单词导出
   - 不同卡片尺寸导出

