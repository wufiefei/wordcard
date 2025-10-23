# 更新日志 v2.6 - 卡片布局优化

## 更新时间
2025年10月15日

## 更新内容

### 1. 🎨 卡片预览弹窗布局调整

#### 改动前
- 文字叠加在图片上方
- 整体是正方形

#### 改动后
- **上方**：正方形图片区域（背景图 + 宝宝头像）
- **下方**：文字信息（英文 + 中文）
- 文字与图片分离，更清晰

#### 文件
- `src/components/DraggableCardPreview.tsx`

#### 代码结构
```tsx
<div className="p-6">
  {/* 正方形图片区域 */}
  <div className="aspect-square">
    {/* 背景图片 */}
    {/* 可拖动的宝宝头像 */}
  </div>

  {/* 文字信息 - 在图片下方 */}
  <div className="mt-4 text-center">
    <div className="text-3xl font-bold">{word.english}</div>
    <div className="text-xl text-gray-600">{word.chinese}</div>
  </div>
</div>
```

### 2. 📐 步骤3显示真实卡片预览

#### 新增功能
- ✅ 步骤3的排版预览现在显示真实的卡片内容
- ✅ 包含用户编辑的所有信息：
  - 选择的背景图片
  - 用户调整的宝宝头像位置
  - 选择的模板风格（卡通/写实）
  - 单词英文和中文

#### 实现方式
- 创建新组件：`WordCard.tsx`
- 接收参数：单词数据、照片、模板、位置等
- 在 `Step3SelectSize` 中渲染真实卡片

#### 数据流
```
步骤2（选择单词）
  ├─ 选择单词库
  ├─ 选择模板
  ├─ 调整头像位置
  └─ 传递到步骤3
       ↓
步骤3（选择尺寸）
  ├─ 获取选中的单词列表
  ├─ 获取用户调整的位置
  ├─ 获取选择的模板
  └─ 渲染真实卡片
```

### 3. 🎯 不同尺寸的卡片布局优化

#### 布局策略
根据不同卡片尺寸，动态调整：
- 图片占比
- 英文字体大小
- 中文字体大小
- 内边距

#### 各尺寸配置

| 尺寸 | 图片占比 | 英文字体 | 中文字体 | 内边距 |
|------|---------|---------|---------|-------|
| 超大卡（150×210mm）| 65% | text-4xl | text-2xl | p-4 |
| 大卡 (100×138mm) | 60% | text-3xl | text-xl | p-3 |
| 标准卡 (95×68mm) | 55% | text-2xl | text-lg | p-2 |
| 小卡 (95×68mm) | 55% | text-2xl | text-lg | p-2 |
| 方形卡 (64×64mm) | 60% | text-xl | text-base | p-2 |
| 迷你卡 (95×55mm) | 50% | text-lg | text-sm | p-1.5 |

#### 布局原则
1. **图片优先**：图片区域占主导地位
2. **文字清晰**：英文字体最大，是重点
3. **适应尺寸**：大卡用大字体，小卡用小字体
4. **保持美观**：图文比例协调

### 4. 📄 新组件：WordCard

#### 功能
统一的卡片渲染组件，用于：
- 步骤3的排版预览
- 未来的PDF导出
- 未来的图片导出

#### Props
```typescript
interface WordCardProps {
  word: Word;                      // 单词数据
  photoPreview: string | null;     // 宝宝照片
  selectedTemplate: CardTemplate;  // 模板风格
  wordPosition?: { x, y };         // 自定义位置
  cardSize: CardSizeType;          // 卡片尺寸
}
```

#### 布局代码
```tsx
<div className={`flex flex-col ${layout.padding}`}>
  {/* 图片区域 - 动态高度 */}
  <div style={{ height: `${layout.imageRatio * 100}%` }}>
    <Image src={imageUrl} />
    <Image src={photoPreview} style={position} />
  </div>

  {/* 文字区域 - 自动填充剩余空间 */}
  <div className="flex-1">
    <div className={layout.englishSize}>{word.english}</div>
    <div className={layout.chineseSize}>{word.chinese}</div>
  </div>
</div>
```

### 5. 🔄 状态管理更新

#### 新增状态
```typescript
const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>('cartoon');
```

#### 状态传递
```
App (page.tsx)
  ├─ selectedTemplate
  ├─ wordPositions
  └─ selectedWords
       ↓
Step2SelectWords
  ├─ 用户选择模板 → onSelectTemplate
  ├─ 用户调整位置 → onUpdateWordPosition
  └─ 传递给 DraggableCardPreview
       ↓
Step3SelectSize
  ├─ 接收所有状态
  └─ 渲染 WordCard × N
```

## 📁 文件变更

### 新增文件
1. **src/components/WordCard.tsx**
   - 统一的卡片渲染组件
   - 支持所有尺寸的自适应布局

### 修改文件
1. **src/components/DraggableCardPreview.tsx**
   - 图片和文字分离布局
   - 文字移到图片下方

2. **src/components/Step3SelectSize.tsx**
   - 完全重写
   - 接收更多props（单词列表、照片、位置等）
   - 使用 WordCard 组件渲染真实预览

3. **src/components/Step2SelectWords.tsx**
   - 添加 `onSelectTemplate` prop
   - 模板选择时通知父组件

4. **src/app/page.tsx**
   - 添加 `selectedTemplate` 状态
   - 传递所有必要状态到步骤3

## 🎨 视觉效果

### 卡片结构（超大卡示例）
```
┌─────────────────────────┐
│                         │ ← 65% 图片区域
│   🎨 背景图片            │
│      👶 宝宝头像         │
│                         │
├─────────────────────────┤
│  Clap your hands        │ ← 35% 文字区域
│      拍拍手              │   （英文大，中文小）
└─────────────────────────┘
```

### 迷你卡示例
```
┌───────────────┐
│               │ ← 50% 图片
│  🎨 👶        │
├───────────────┤
│ Clap          │ ← 50% 文字
│ 拍拍手         │  （字体较小）
└───────────────┘
```

## 🧪 测试检查清单

### 功能测试
- [ ] 步骤2：调整头像位置 → 步骤3能看到调整后的位置
- [ ] 步骤2：切换模板 → 步骤3显示对应模板的背景
- [ ] 步骤3：切换不同尺寸 → 卡片布局自动调整
- [ ] 步骤3：翻页查看 → 所有页面都显示真实卡片

### 布局测试
- [ ] 超大卡：字体足够大，易读
- [ ] 大卡：竖版布局正常
- [ ] 标准卡：图文比例协调
- [ ] 小卡：内容完整，不拥挤
- [ ] 方形卡：正方形布局美观
- [ ] 迷你卡：虽然小但仍然清晰

### 预览弹窗测试
- [ ] 打开预览：图片在上，文字在下
- [ ] 拖动头像：位置调整流畅
- [ ] 保存位置：步骤3能看到更新

## 💡 设计考虑

### 1. 图文比例
- **大卡**：图片占比高（60-65%），适合视觉学习
- **小卡**：图片占比低（50-55%），保证文字可读性

### 2. 字体大小
- **英文**：始终比中文大，因为是学习重点
- **响应式**：根据卡片大小自动缩放
- **清晰度**：即使是迷你卡，文字也要清晰

### 3. 间距调整
- **大卡**：更大的内边距（p-4），舒适
- **小卡**：紧凑的内边距（p-1.5），充分利用空间

### 4. 布局灵活性
- 使用 `flex-1` 让文字区域自动填充
- 使用百分比高度让图片区域精确控制
- 保证所有尺寸都显示完整内容

## 🚀 后续优化建议

### 1. PDF导出
- 使用相同的 `WordCard` 组件
- 确保打印时的精确尺寸

### 2. 图片导出
- 为每张卡片生成高清图片
- 使用 `WordCard` 组件渲染

### 3. 自定义布局
- 允许用户自定义图文比例
- 允许用户自定义字体大小

### 4. 批量调整
- 批量调整所有卡片的头像大小
- 批量应用相同的位置偏移

## 总结

✅ **已完成**：
1. 卡片预览弹窗布局优化（图片上文字下）
2. 步骤3显示真实卡片预览
3. 不同尺寸的智能布局适配
4. 统一的 WordCard 组件

🎯 **效果**：
- 卡片预览更清晰、专业
- 步骤3所见即所得
- 不同尺寸都有最佳显示效果
- 为导出功能打下基础

