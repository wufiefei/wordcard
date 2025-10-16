# 更新日志 v2.7 - 精确布局实现

## 更新时间
2025年10月15日

## 更新内容

### 1. 🎨 卡片预览弹窗优化

#### 改动
- ✅ 整个卡片（图片+文字）作为一个整体
- ✅ 阴影应用在整个卡片外部
- ✅ 白色背景包裹整个卡片
- ✅ 圆角边框统一

#### 文件
- `src/components/DraggableCardPreview.tsx`

#### 结构
```tsx
<div className="bg-white rounded-xl shadow-lg overflow-hidden">
  {/* 图片区域 */}
  <div className="aspect-square">
    背景图 + 宝宝头像
  </div>
  
  {/* 文字区域 */}
  <div className="p-4 text-center bg-white">
    英文 + 中文
  </div>
</div>
```

### 2. 📐 精确的卡片布局规格

#### 实现方式
- 使用 **毫米（mm）** 作为尺寸单位
- 使用 **点（pt）** 作为字体单位
- 精确匹配设计要求

#### 布局参数表

| 尺寸 | 卡片尺寸 | 每页 | 图片 | 上边距 | 英文 | 图片间距 | 中文 | 文字间距 |
|------|---------|-----|------|-------|------|---------|------|---------|
| 超大卡 | 148×105mm | 2张 | 90×90mm | 12mm | 24pt | 8mm | 16pt | 5mm |
| 大卡 | 100×138mm | 4张 | 70×70mm | 10mm | 20pt | 6mm | 14pt | 4mm |
| 标准卡 | 95×68mm | 6张 | 45×45mm | 7mm | 16pt | 4mm | 11pt | 3mm |
| 中卡 | 95×68mm | 8张 | 36×36mm | 5mm | 14pt | 3mm | 10pt | 2mm |
| 方形卡 | 64×64mm | 9张 | 40×40mm | 8mm | 13pt | 3mm | 9pt | 2mm |
| 迷你卡 | 95×55mm | 10张 | 25×25mm | 3mm | 12pt | 2mm | 8pt | 1.5mm |

#### 代码实现
```typescript
function getCardLayout(sizeId: string) {
  switch (sizeId) {
    case 'extra-large':
      return {
        imageSize: '90mm',      // 图片尺寸
        marginTop: '12mm',       // 距上边距离
        englishSize: '24pt',     // 英文字号
        chineseSize: '16pt',     // 中文字号
        imageGap: '8mm',         // 图片到英文距离
        textGap: '5mm',          // 英文到中文距离
      };
    // ... 其他尺寸
  }
}
```

### 3. ⬛ 排版预览黑色边框

#### 改动
- ✅ 每个卡片添加 `border-2 border-black`
- ✅ 空白卡片使用虚线边框 `border-dashed border-gray-300`
- ✅ 卡片间距调整为 `gap: 2mm`

#### 文件
- `src/components/WordCard.tsx`
- `src/components/Step3SelectSize.tsx`

#### 效果
```
┌─────────┐  ┌─────────┐
│  卡片1  │  │  卡片2  │  ← 黑色实线边框
└─────────┘  └─────────┘

┌ ─ ─ ─ ─ ┐
│  空白   │  ← 灰色虚线边框
└ ─ ─ ─ ─ ┘
```

### 4. 📏 CSS单位说明

#### 为什么使用 mm 和 pt？
- **mm（毫米）**：绝对物理尺寸，适合打印
- **pt（点）**：传统印刷字号单位（1pt = 1/72英寸）
- **优势**：所见即所得，预览效果 = 打印效果

#### 单位转换
```
1mm ≈ 3.78px (at 96dpi)
1pt = 1.33px (at 96dpi)

浏览器中CSS直接支持mm和pt单位
打印时1:1精确映射
```

### 5. 🎯 布局精确实现

#### 卡片结构（CSS）
```tsx
<div 
  className="border-2 border-black"
  style={{ paddingTop: layout.marginTop }}
>
  {/* 图片 - 居中 */}
  <div style={{
    width: layout.imageSize,
    height: layout.imageSize,
  }}>
    背景图 + 头像
  </div>

  {/* 英文 */}
  <div style={{
    marginTop: layout.imageGap,
    fontSize: layout.englishSize,
  }}>
    {word.english}
  </div>

  {/* 中文 */}
  <div style={{
    marginTop: layout.textGap,
    fontSize: layout.chineseSize,
  }}>
    {word.chinese}
  </div>
</div>
```

#### 关键CSS
```css
/* 居中对齐 */
items-center    /* Flex水平居中 */
text-center     /* 文字居中 */

/* 不收缩 */
flex-shrink-0   /* 防止图片/文字被压缩 */

/* 行高 */
line-height: 1.2  /* 紧凑但清晰 */
```

## 📁 文件变更

### 修改文件
1. **src/components/WordCard.tsx**
   - 完全重写
   - 使用精确的mm和pt单位
   - 添加黑色边框
   - 实现6种尺寸的精确布局

2. **src/components/DraggableCardPreview.tsx**
   - 调整卡片容器结构
   - 阴影应用到整体
   - 图片和文字统一在白色背景内

3. **src/components/Step3SelectSize.tsx**
   - 卡片间距调整为gap: 2mm
   - 空白卡片添加虚线边框

## 🎨 视觉效果对比

### 之前
```
┌───────────┐
│ 图片      │ ← 独立阴影
└───────────┘
  英文
  中文
```

### 现在
```
┌───────────────┐
│ ╔═══════════╗ │ ← 整体阴影
│ ║   图片    ║ │
│ ╚═══════════╝ │
│   英文        │
│   中文        │
└───────────────┘
```

## 🖨️ 打印预览

### A4纸张布局（超大卡示例）
```
┌─────────────────────────┐
│  A4: 210mm × 297mm      │
│                         │
│  ┌─────┐  ┌─────┐      │
│  │ 卡1 │  │ 卡2 │      │ ← 1×2布局
│  └─────┘  └─────┘      │
│                         │
│  每张: 148×105mm        │
└─────────────────────────┘
```

### 标准卡布局（2×3）
```
┌─────────────────────────┐
│  ┌───┐ ┌───┐ ┌───┐     │
│  │ 1 │ │ 2 │ │ 3 │     │ ← 第1行
│  └───┘ └───┘ └───┘     │
│  ┌───┐ ┌───┐ ┌───┐     │
│  │ 4 │ │ 5 │ │ 6 │     │ ← 第2行
│  └───┘ └───┘ └───┘     │
│  每张: 95×68mm          │
└─────────────────────────┘
```

## 🧪 测试检查清单

### 卡片预览测试
- [ ] 打开预览弹窗：卡片整体有阴影
- [ ] 图片和文字在同一个白色容器内
- [ ] 边框圆角统一美观

### 布局精确度测试
- [ ] 超大卡：图片90×90mm，字体24pt/16pt
- [ ] 大卡：图片70×70mm，字体20pt/14pt
- [ ] 标准卡：图片45×45mm，字体16pt/11pt
- [ ] 中卡：图片36×36mm，字体14pt/10pt
- [ ] 方形卡：图片40×40mm，字体13pt/9pt
- [ ] 迷你卡：图片25×25mm，字体12pt/8pt

### 边框测试
- [ ] 所有卡片：黑色实线边框（2px）
- [ ] 空白位置：灰色虚线边框
- [ ] 边框清晰可见

### 间距测试
- [ ] 图片距上边：符合marginTop规格
- [ ] 英文距图片：符合imageGap规格
- [ ] 中文距英文：符合textGap规格
- [ ] 卡片间距：2mm

## 💡 设计细节

### 1. 图片居中
```tsx
className="flex flex-col items-center"
```
- 使用Flexbox
- items-center 水平居中
- 图片自动居中对齐

### 2. 文字不溢出
```tsx
className="leading-tight"
style={{ lineHeight: '1.2' }}
```
- 行高1.2
- 紧凑但易读
- 防止文字占用过多空间

### 3. 响应式预览
虽然使用绝对单位（mm/pt），但在不同缩放下：
- 保持比例关系
- zoom控制整体大小
- 打印时1:1精确

### 4. 边框粗细
```tsx
border-2  // 2px边框
```
- 足够清晰
- 不会太粗
- 打印效果好

## 🚀 后续优化建议

### 1. 打印优化
```css
@media print {
  /* 隐藏边框（仅预览用） */
  .card-border { border: none; }
  
  /* 精确页面边距 */
  @page { margin: 5mm; }
}
```

### 2. 导出功能
- 使用相同的布局参数
- 生成高清PDF（300dpi）
- 保持精确尺寸

### 3. 自定义调整
允许用户微调：
- 图片大小（±5mm）
- 字体大小（±2pt）
- 间距（±1mm）

## 总结

✅ **已完成**：
1. 卡片预览整体阴影效果
2. 精确的6种尺寸布局（mm + pt）
3. 黑色边框应用
4. 清理缓存重启

🎯 **效果**：
- 预览效果专业美观
- 布局参数精确到毫米
- 打印时所见即所得
- 边框清晰美观

