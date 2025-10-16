# 更新日志 v2.9 - Bug修复和优化

## 更新时间
2025-10-16

## 主要修复

### 1. ✅ TPR词库和默认图片支持

**问题**：
- TPR词库图片缺失导致导出PDF失败
- 错误：`Cannot read properties of undefined (reading 'realistic')`

**解决方案**：
1. 创建了占位符图片：
   - `/cards/placeholder-cartoon.svg` - 卡通风格占位符
   - `/cards/placeholder-realistic.svg` - 写实风格占位符

2. 更新了`exportUtils.ts`中的`drawBackgroundImage`函数：
```typescript
// 安全地获取图片URL
if (!word.cardImageUrl) {
  imageUrl = '/cards/placeholder-cartoon.svg';
} else if (typeof word.cardImageUrl === 'string') {
  imageUrl = word.cardImageUrl;
} else if (typeof word.cardImageUrl === 'object' && word.cardImageUrl !== null) {
  imageUrl = word.cardImageUrl[selectedTemplate] || word.cardImageUrl['cartoon'] || '/cards/placeholder-cartoon.svg';
} else {
  imageUrl = '/cards/placeholder-cartoon.svg';
}
```

3. 所有缺失的图片现在都会显示占位符，不会导致导出失败

### 2. ✅ 导出样式修复

**问题**：
- 导出的PDF/图片样式与预览不一致
- 图片被压缩和裁剪
- 缺少边框

**解决方案**：
1. **添加边框**：在`renderCardToCanvas`函数中添加2px黑色边框
```typescript
// 绘制边框（2px黑色边框）
ctx.strokeStyle = 'black';
ctx.lineWidth = 6; // 在300DPI下，6px相当于网页上的2px
ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
```

2. **修复内边距计算**：使用`paddingPx`参数确保内边距正确
3. **保持布局一致**：横向和纵向布局的padding计算与WordCard组件保持一致

### 3. 🔧 图片编辑器优化（待完成）

**需要修复的问题**：
1. 裁剪后还原功能不正确 - 需要保存裁剪前的原图
2. 笔刷光标大小需要与实际笔刷大小一致

**计划方案**：
```typescript
// ImageEditor.tsx
// 1. 保存原始图片和裁剪历史
const [originalFullImage, setOriginalFullImage] = useState<HTMLImageElement | null>(null);
const [cropHistory, setCropHistory] = useState<ImageData[]>([]);

// 2. 裁剪时同时更新原图引用
const handleCropEnd = useCallback(() => {
  // ...裁剪逻辑
  // 同时更新originalImage为裁剪后的图
  setOriginalImage(croppedImage);
}, []);

// 3. 重置时恢复到最初的完整原图
const reset = useCallback(() => {
  if (originalFullImage && canvasRef.current) {
    const ctx = canvasRef.current.getContext('2d')!;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(originalFullImage, 0, 0);
    setOriginalImage(originalFullImage); // 重置引用
    saveHistory();
  }
}, [originalFullImage, saveHistory]);
```

### 4. 🔧 卡片预览弹窗优化（待完成）

**需要优化的问题**：
1. 弹窗尺寸偏大
2. 缩放功能不够流畅
3. 缩放时需要跟随鼠标移动
4. 防止头像超出卡片边界

**计划方案**：
```typescript
// DraggableCardPreview.tsx
// 1. 缩小弹窗尺寸
<div className="bg-white rounded-2xl max-w-xl w-full"> // 从max-w-2xl改为max-w-xl

// 2. 改进缩放逻辑 - 基于鼠标位置
const handleResizeMove = useCallback((e: React.MouseEvent) => {
  if (!isResizing || !resizeStartRef.current || !cardRef.current) return;
  
  const card = cardRef.current;
  const rect = card.getBoundingClientRect();
  
  // 计算鼠标相对于头像中心的距离
  const centerX = rect.left + (rect.width * position.x) / 100;
  const centerY = rect.top + (rect.height * position.y) / 100;
  const distanceFromCenter = Math.sqrt(
    Math.pow(e.clientX - centerX, 2) + 
    Math.pow(e.clientY - centerY, 2)
  );
  
  // 基于距离计算新宽度
  const newWidth = Math.max(10, Math.min(80, (distanceFromCenter / rect.width) * 200));
  setAvatarWidth(newWidth);
}, [isResizing, position]);

// 3. 限制头像边界
const clampedX = Math.max(avatarWidth / 2, Math.min(100 - avatarWidth / 2, x));
const clampedY = Math.max(avatarWidth / 2, Math.min(100 - avatarWidth / 2, y));
```

### 5. 🔧 保留图片编辑状态（待完成）

**需求**：
- 从其他页面返回时保留编辑结果
- 不需要重新抠图

**计划方案**：
```typescript
// page.tsx
const [editedPhotoPreview, setEditedPhotoPreview] = useState<string | null>(null);

// Step1PhotoUpload.tsx
// 传递编辑后的图片
<Step1PhotoUpload
  photoPreview={photoPreview}
  editedPreview={editedPhotoPreview}
  onPhotoUpload={handlePhotoUpload}
  onEditComplete={(editedUrl) => setEditedPhotoPreview(editedUrl)}
  onNext={() => setCurrentStep(2)}
/>

// 在组件中保持编辑状态
useEffect(() => {
  if (editedPreview) {
    setProcessedImageUrl(editedPreview);
    setShowEditor(false);
  }
}, [editedPreview]);
```

## 文件修改清单

### 已完成
1. **public/cards/placeholder-cartoon.svg** - 新建，卡通风格占位符
2. **public/cards/placeholder-realistic.svg** - 新建，写实风格占位符  
3. **src/utils/exportUtils.ts** - 更新
   - 修复图片URL安全获取
   - 添加边框渲染
   - 优化内边距计算
4. **scripts/update-placeholders.js** - 新建，批量更新词库工具

### 待完成
1. **src/components/ImageEditor.tsx** - 需要修复
   - 裁剪后还原功能
   - 笔刷光标大小显示

2. **src/components/DraggableCardPreview.tsx** - 需要优化
   - 缩小弹窗尺寸
   - 改进缩放体验
   - 边界限制

3. **src/components/Step1PhotoUpload.tsx** - 需要更新
   - 保留编辑状态
   - 避免重复抠图

4. **src/app/page.tsx** - 需要更新
   - 添加编辑状态管理

## 测试建议

1. **导出功能测试**：
   - ✅ 测试TPR词库导出（使用占位符）
   - ✅ 测试其他词库导出
   - ✅ 验证PDF边框显示
   - ✅ 验证样式一致性

2. **图片编辑测试**（待修复后）：
   - 裁剪后使用还原功能
   - 观察笔刷光标大小
   - 重置功能测试

3. **卡片预览测试**（待优化后）：
   - 缩放流畅度
   - 边界限制
   - 弹窗大小

4. **状态保留测试**（待实现后）：
   - 编辑图片后切换到下一步
   - 返回到上传页面
   - 验证编辑结果保留

## 已知问题

1. ❌ 图片编辑器裁剪后还原功能异常
2. ❌ 笔刷光标大小显示不准确
3. ❌ 卡片预览缩放体验需要改进
4. ❌ 返回上传页面时编辑结果丢失
5. ✅ 词库图片缺失导致导出失败 - 已修复

## 下一步计划

1. 完成图片编辑器的裁剪/还原功能修复
2. 优化卡片预览的缩放交互
3. 实现图片编辑状态保留
4. 添加更多单词卡背景图片
5. 性能优化和用户体验提升

## 注意事项

1. **占位符图片**：TPR和其他缺少背景图的词库会使用SVG占位符
2. **导出质量**：保持300 DPI确保打印质量
3. **边框渲染**：导出时包含2px黑色边框，与预览一致
4. **兼容性**：所有cardImageUrl字段都支持字符串和对象两种格式

