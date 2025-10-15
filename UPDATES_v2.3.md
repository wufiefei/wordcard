# 更新日志 v2.3

## 更新时间
2025年10月15日

## 更新内容

### 1. ✨ 进度条文案优化
- **位置**：Step1PhotoUpload.tsx
- **改动**：将"准备中..."改为"智能抠图中..."
- **效果**：用户体验更直观，明确知道正在进行AI抠图处理

### 2. 📸 照片要求提示
- **位置**：Step1PhotoUpload.tsx
- **改动**：在上传区域顶部增加提示框
- **内容**：
  ```
  💡 照片要求：请上传宝宝正面清晰照（露出完整五官，无遮挡），
  背景简洁，光线充足，避免模糊、过暗或过亮
  ```
- **效果**：帮助用户了解上传照片的最佳要求，提高抠图成功率

### 3. 🎯 单词卡片显示优化
- **位置**：
  - Step2SelectWords.tsx
  - DraggableCardPreview.tsx
- **改动**：
  - 去除自然拼读相关的彩色音标显示
  - 直接使用 `word.english` 字段展示完整英文（支持短语）
  - 例如："Clap your hands"、"Touch your nose"等多词短语完整显示
- **效果**：
  - 界面更简洁
  - 支持3个单词及以上的短语
  - 避免音标分段显示的复杂性

### 4. 🖼️ 头像显示和位置保存功能
- **位置**：
  - src/app/page.tsx
  - Step2SelectWords.tsx
  - DraggableCardPreview.tsx

#### 4.1 头像改为原始尺寸（非圆形）
- **改动前**：头像强制显示为圆形
- **改动后**：
  - 保持用户上传照片的原始宽高比
  - 使用 `aspectRatio: '1'` 保持方形容器
  - 根据 `word.facePosition.width` 动态设置大小
  - 使用 `object-cover` 填充，自然裁切

#### 4.2 位置保存功能
- **状态管理**：
  ```typescript
  const [wordPositions, setWordPositions] = useState<Record<string, { x: number; y: number }>>({});
  ```
- **功能流程**：
  1. 用户点击卡片缩略图 → 打开大图预览
  2. 在预览弹窗中拖动头像调整位置
  3. 点击"保存位置"按钮 → 调用 `onUpdateWordPosition(wordId, x, y)`
  4. 新位置保存到 `wordPositions` 状态
  5. 关闭弹窗后，缩略图和下次预览都使用新位置

- **位置优先级**：
  ```typescript
  const position = wordPositions[word.id] || { 
    x: word.facePosition.x, 
    y: word.facePosition.y 
  };
  ```
  - 优先使用用户调整后的位置
  - 没有调整时使用配置文件默认位置

- **应用范围**：
  - ✅ 单词卡片缩略图
  - ✅ 大图预览弹窗
  - ✅ 后续所有预览和生成
  - ✅ 跨步骤保持位置

### 5. 🎨 UI细节调整
- **头像容器样式**：
  - 去除 `rounded-full`（圆形）
  - 保留边框和阴影效果
  - 支持拖动时的视觉反馈（蓝色光环）

## 技术细节

### 数据流
```
用户拖动
  ↓
DraggableCardPreview (position state)
  ↓
点击"保存位置"
  ↓
onPositionChange(x, y)
  ↓
Step2SelectWords → onUpdateWordPosition(wordId, x, y)
  ↓
App (page.tsx) → setWordPositions
  ↓
wordPositions state 更新
  ↓
传回 Step2SelectWords
  ↓
所有预览使用新位置
```

### 组件接口变化

#### Step2SelectWords
```typescript
// 新增 props
wordPositions: Record<string, { x: number; y: number }>;
onUpdateWordPosition: (wordId: string, x: number, y: number) => void;
```

#### DraggableCardPreview
```typescript
// 新增 props
currentPosition?: { x: number; y: number };

// 初始化逻辑
const [position, setPosition] = useState({
  x: currentPosition?.x ?? word.facePosition.x,
  y: currentPosition?.y ?? word.facePosition.y,
});
```

## 测试建议

### 1. 照片上传
- [ ] 查看蓝色提示框显示正确
- [ ] 进度条显示"智能抠图中..."而非"准备中..."

### 2. 单词显示
- [ ] 单词卡显示完整英文（如"Clap your hands"）
- [ ] 不再有彩色音标分段

### 3. 头像尺寸
- [ ] 上传不同比例的照片（横图、竖图、正方形）
- [ ] 检查卡片预览中头像保持原始比例
- [ ] 头像不是强制圆形

### 4. 位置保存
- [ ] 选择一张卡片，点击预览
- [ ] 拖动头像到新位置
- [ ] 点击"保存位置"
- [ ] 关闭弹窗，重新点击卡片
- [ ] 确认头像在新位置（而非默认位置）
- [ ] 检查缩略图也使用新位置

### 5. 跨步骤测试
- [ ] 在步骤2调整位置
- [ ] 进入步骤3查看预览
- [ ] 返回步骤2，位置应保持

## 兼容性
- ✅ 移动端响应式
- ✅ 触摸屏拖动
- ✅ 桌面端鼠标拖动
- ✅ 保持原有功能不受影响

## 后续建议
1. 考虑添加"重置位置"按钮
2. 位置数据可持久化到 localStorage
3. 导出PDF时使用用户调整的位置
4. 批量调整多个卡片位置的工具

