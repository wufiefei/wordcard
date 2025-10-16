# 更新日志 v2.7 - 卡片布局精细化优化

## 更新时间
2025-10-16

## 主要更新

### 1. 修复 cardImageUrl 读取错误 ✅

**问题**：在读取多模板格式的 `cardImageUrl` 时出现 "Cannot read ...cartoon" 错误

**修复内容**：
- 在 `WordCard.tsx`、`Step2SelectWords.tsx` 和 `DraggableCardPreview.tsx` 中的 `getCardImageUrl` 函数增加了更健壮的类型检查
- 添加了 `null/undefined` 检查、字符串类型检查和对象类型检查
- 确保在任何情况下都能优雅降级

**修复代码**：
```typescript
function getCardImageUrl(word: Word, template: CardTemplate): string {
  if (!word.cardImageUrl) return '';
  
  if (typeof word.cardImageUrl === 'string') {
    return word.cardImageUrl;
  }
  
  if (typeof word.cardImageUrl === 'object' && word.cardImageUrl !== null) {
    return word.cardImageUrl[template] || word.cardImageUrl['cartoon'] || '';
  }
  
  return '';
}
```

### 2. 更新 TPR-L1 数据格式 ✅

**修改内容**：
- 将 `tpr-l1.json` 中所有单词的 `cardImageUrl` 从单字符串格式转换为多模板格式
- 统一使用 `{ "cartoon": "...", "realistic": "..." }` 结构
- 修复了批量替换过程中出现的中文字符编码问题

**示例**：
```json
{
  "id": "Pick-up-the-ball",
  "english": "Pick up the ball",
  "chinese": "捡起小球",
  "cardImageUrl": {
    "cartoon": "/cards/tpr-l1/cartoon/Pick-up-the-ball.png",
    "realistic": "/cards/tpr-l1/realistic/Pick-up-the-ball.png"
  },
  "facePosition": { "x": 30, "y": 20, "width": 40 }
}
```

### 3. 重写 WordCard 组件布局系统 ✅

**设计原则**：
- **信息层级**：英文（标题，大）→ 中文（说明，小）
- **视觉核心**：正方形图片优先占据视觉核心区域
- **间距逻辑**：
  - 卡片边缘预留「内边距」（避免内容贴边）
  - 图片与文字、英文与中文之间预留「内容间距」
  - 所有间距单位均为 mm
- **字体建议**：
  - 英文用无衬线字体（Arial、思源黑体）
  - 中文用清晰易读字体（微软雅黑、思源黑体）
  - 英文字号比中文大 2-4 号

#### 3.1 超大卡（148×105mm，横版）
- **布局方向**：纵向（图片上，文字下）
- **正方形图片尺寸**：80×80mm
- **内边距**：上下左右各 10mm
- **内容间距**：
  - 图片与文字区：8mm
  - 英文与中文：3mm
- **字体大小**：英文 18pt，中文 14pt

#### 3.2 大卡（100×138mm，竖版）
- **布局方向**：纵向（图片上，文字下）
- **正方形图片尺寸**：70×70mm
- **内边距**：上下 12mm，左右 15mm
- **内容间距**：
  - 图片与文字区：7mm
  - 英文与中文：2.5mm
- **字体大小**：英文 16pt，中文 12pt

#### 3.3 标准卡 / 中卡（95×68mm，横版）
- **布局方向**：横向（图片左，文字右）
- **正方形图片尺寸**：50×50mm
- **内边距**：上下 8mm，左右 10mm
- **内容间距**：
  - 图片与文字区：6mm
  - 英文与中文：2.5mm
- **字体大小**：英文 14pt，中文 10pt

#### 3.4 方形卡（64×64mm）
- **布局方向**：纵向（图片居中，文字下）
- **正方形图片尺寸**：40×40mm
- **内边距**：上下左右各 5mm
- **内容间距**：
  - 图片与文字区：5mm
  - 英文与中文：2mm
- **字体大小**：英文 12pt，中文 9pt

#### 3.5 迷你卡（95×55mm，横版）
- **布局方向**：横向（图片左，文字右）
- **正方形图片尺寸**：40×40mm
- **内边距**：上下 4mm，左右 8mm
- **内容间距**：
  - 图片与文字区：4mm
  - 英文与中文：2mm
- **字体大小**：英文 11pt，中文 8pt
- **注意**：纵向高度仅 55mm，中文建议不超过 2 行

### 4. 布局实现细节

#### 4.1 横向布局（标准卡、小卡、迷你卡）
```typescript
<div className="w-full h-full bg-white flex items-center">
  {/* 图片区域 - 左侧 */}
  <div style={{ width: imageSize, height: imageSize }}>
    {/* 背景图片 + 宝宝头像 */}
  </div>
  
  {/* 文字区域 - 右侧 */}
  <div style={{ marginLeft: imageGap }}>
    <div style={{ fontSize: englishSize }}>英文</div>
    <div style={{ marginTop: textGap, fontSize: chineseSize }}>中文</div>
  </div>
</div>
```

#### 4.2 纵向布局（超大卡、大卡、方形卡）
```typescript
<div className="w-full h-full bg-white flex flex-col items-center">
  {/* 图片区域 - 上方 */}
  <div style={{ width: imageSize, height: imageSize }}>
    {/* 背景图片 + 宝宝头像 */}
  </div>
  
  {/* 文字区域 - 下方 */}
  <div style={{ marginTop: imageGap }}>
    <div style={{ fontSize: englishSize }}>英文</div>
    <div style={{ marginTop: textGap, fontSize: chineseSize }}>中文</div>
  </div>
</div>
```

### 5. 视觉优化

- **卡片边框**：添加 2px 黑色边框，清晰区分卡片边界
- **字体系统**：
  - 英文：`Arial, "Microsoft YaHei", sans-serif`
  - 中文：`"Microsoft YaHei", "PingFang SC", sans-serif`
- **行高**：统一设置为 1.2，确保文字紧凑不拥挤
- **文字对齐**：居中对齐，视觉更统一
- **颜色层次**：
  - 英文：深灰色（#1F2937）+ 加粗
  - 中文：中灰色（#4B5563）+ 中等字重

## 技术细节

### 文件修改清单

1. **src/components/WordCard.tsx** - 完全重写
   - 新增 `getCardLayout()` 函数，根据卡片尺寸返回精确的布局参数
   - 支持横向和纵向两种布局方向
   - 使用 mm 和 pt 作为单位，确保打印精度

2. **src/components/Step2SelectWords.tsx** - 修复
   - 更新 `getCardImageUrl()` 函数，增加类型检查

3. **src/components/DraggableCardPreview.tsx** - 修复
   - 更新 `getCardImageUrl()` 函数，增加类型检查

4. **src/data/libraries/tpr-l1.json** - 数据格式更新
   - 所有 20 个单词的 `cardImageUrl` 转换为多模板格式

## 关键避坑提示

1. **迷你卡注意事项**：
   - 纵向高度仅 55mm，图片 + 文字需严格控制尺寸
   - 建议中文不超过 2 行，避免文字溢出

2. **方形卡注意事项**：
   - 图片居中后，文字区需居下而非居上
   - 避免视觉上"头重脚轻"

3. **出血线衔接**：
   - 内部内容的"内边距"是卡片自身的边距
   - 与外部 A4 的出血线无关
   - 无需额外叠加，按上述参数即可

4. **字体大小平衡**：
   - 横向布局的卡片，文字区较窄，字号适当缩小
   - 纵向布局的卡片，文字区较宽，字号可以适当增大

## 下一步计划

- [ ] 等待用户提供实际卡片背景图片文件
- [ ] 测试不同尺寸卡片的打印效果
- [ ] 根据实际打印结果微调间距和字号
- [ ] 优化移动端卡片预览体验

## 测试建议

1. 选择不同的词库（水果、颜色、TPR等）
2. 切换不同的模板（卡通、写实）
3. 选择不同的卡片尺寸
4. 检查每种尺寸的布局是否符合设计规范
5. 验证图片和文字的间距是否合理
6. 确认字体大小在不同尺寸下的可读性

