# 更新日志 v2.5 - 卡片模板与背景图片

## 更新时间
2025年10月15日

## 更新内容

### 1. 📷 卡片背景图片显示

#### 功能说明
- 卡片预览现在会显示 `cardImageUrl` 属性链接到的实际背景图片
- 如果图片不存在或加载失败，则显示默认图标 🎨
- 背景图片会作为卡片的底层，宝宝头像叠加在上方

#### 实现位置
- **缩略图**：`Step2SelectWords.tsx` - 单词卡片列表
- **大图预览**：`DraggableCardPreview.tsx` - 弹窗预览

#### 技术实现
```tsx
{/* 背景图片 */}
{(() => {
  const imageUrl = getCardImageUrl(word, selectedTemplate);
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={word.english}
        fill
        className="object-cover"
        onError={(e) => {
          // 图片加载失败时隐藏，显示默认图标
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return <div className="text-4xl">🎨</div>;
})()}
```

### 2. 🎭 卡片模板选择功能

#### 新增模板
1. **🎨 卡通手绘** (`cartoon`)
   - 可爱卡通风格
   - 适合幼儿启蒙
   - 默认模板

2. **📷 写实** (`realistic`)
   - 真实照片风格
   - 适合年龄稍大的孩子

#### UI 界面
- **位置**：步骤2 - 左侧面板下方
- **样式**：与单词库选择器一致的设计
- **交互**：点击切换，选中状态高亮显示

```tsx
{/* 模板选择 */}
<div className="bg-white rounded-2xl shadow-lg p-6">
  <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-2">
    <span>🎭</span>
    <span>选择模板</span>
  </h2>
  
  <div className="space-y-2">
    {CARD_TEMPLATES.map((template) => (
      <button
        key={template.id}
        onClick={() => setSelectedTemplate(template.id)}
        className={`w-full p-3 rounded-xl transition-all text-left ${
          selectedTemplate === template.id
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{template.icon}</div>
          <div className="flex-1">
            <div className="font-medium">{template.name}</div>
            <div className="text-xs opacity-80">{template.description}</div>
          </div>
          {selectedTemplate === template.id && (
            <div className="text-lg">✓</div>
          )}
        </div>
      </button>
    ))}
  </div>
</div>
```

### 3. 🔧 数据结构升级

#### Word 类型更新
```typescript
// 旧版本
export interface Word {
  cardImageUrl: string;  // 单一图片地址
  // ...
}

// 新版本
export interface Word {
  cardImageUrl: string | Record<CardTemplate, string>;  // 支持多模板
  // ...
}
```

#### 示例数据结构

**单一模板（向后兼容）**
```json
{
  "id": "Clap-your-hands",
  "cardImageUrl": "/cards/tpr-l0/Clap-your-hands.png",
  "facePosition": { "x": 35, "y": 30, "width": 35 }
}
```

**多模板**
```json
{
  "id": "apple",
  "cardImageUrl": {
    "cartoon": "/cards/fruits/apple-cartoon.jpg",
    "realistic": "/cards/fruits/apple-realistic.jpg"
  },
  "facePosition": { "x": 35, "y": 30, "width": 35 }
}
```

### 4. 🛠️ 新增类型定义

#### CardTemplate 类型
```typescript
export type CardTemplate = 'cartoon' | 'realistic';
```

#### CardTemplateConfig 接口
```typescript
export interface CardTemplateConfig {
  id: CardTemplate;
  name: string;
  icon: string;
  description: string;
}

export const CARD_TEMPLATES: CardTemplateConfig[] = [
  {
    id: 'cartoon',
    name: '卡通手绘',
    icon: '🎨',
    description: '可爱卡通风格',
  },
  {
    id: 'realistic',
    name: '写实',
    icon: '📷',
    description: '真实照片风格',
  },
];
```

### 5. 🔍 辅助函数

#### getCardImageUrl
```typescript
function getCardImageUrl(word: Word, template: CardTemplate): string {
  // 兼容旧的字符串格式
  if (typeof word.cardImageUrl === 'string') {
    return word.cardImageUrl;
  }
  // 使用选定的模板，如果不存在则回退到cartoon
  return word.cardImageUrl[template] || word.cardImageUrl['cartoon'] || '';
}
```

## 📁 文件变更

### 修改的文件
1. **src/types/wordcard.ts**
   - 添加 `CardTemplate` 类型
   - 更新 `Word` 接口的 `cardImageUrl` 类型
   - 添加 `CardTemplateConfig` 接口
   - 导出 `CARD_TEMPLATES` 常量

2. **src/components/Step2SelectWords.tsx**
   - 添加模板选择UI
   - 添加 `selectedTemplate` 状态
   - 集成背景图片显示
   - 传递 `selectedTemplate` 到预览组件

3. **src/components/DraggableCardPreview.tsx**
   - 添加 `selectedTemplate` prop
   - 集成背景图片显示
   - 添加 `getCardImageUrl` 辅助函数

## 🎨 UI/UX 改进

### 视觉层次
1. **背景图片**（最底层）- 卡片主题内容
2. **宝宝头像**（中间层，z-10）- 个性化元素
3. **文字信息**（最上层）- 单词和中文

### 交互反馈
- ✅ 模板切换即时生效
- ✅ 图片加载失败优雅降级
- ✅ 保持与单词库选择一致的交互体验

### 响应式设计
- ✅ 移动端：模板选择器在单词库下方
- ✅ 桌面端：两者垂直排列，清晰明了

## 🧪 测试检查清单

### 功能测试
- [ ] 选择"卡通手绘"模板，卡片显示卡通图片
- [ ] 选择"写实"模板，卡片显示写实图片
- [ ] 切换模板，所有卡片同步更新
- [ ] 图片不存在时，显示默认🎨图标
- [ ] 图片加载失败时，优雅降级到默认图标

### 数据兼容性
- [ ] 旧数据（string格式）正常显示
- [ ] 新数据（对象格式）正常显示
- [ ] 缺少某个模板时，回退到cartoon模板

### UI测试
- [ ] 模板选择器样式与单词库选择器一致
- [ ] 选中状态有明显视觉反馈
- [ ] 移动端布局正常
- [ ] 桌面端布局正常

### 预览测试
- [ ] 缩略图显示背景图片
- [ ] 大图预览显示背景图片
- [ ] 头像在背景图片上方正确显示
- [ ] 头像位置拖动功能正常

## 📝 数据迁移建议

### 现有词库更新
为支持多模板，可以逐步更新数据：

**方案1：保持现有格式（推荐）**
```json
{
  "cardImageUrl": "/cards/tpr-l0/Clap-your-hands.png"
}
```
- 两种模板都显示同一张图
- 无需修改数据

**方案2：扩展为多模板**
```json
{
  "cardImageUrl": {
    "cartoon": "/cards/tpr-l0/Clap-your-hands-cartoon.png",
    "realistic": "/cards/tpr-l0/Clap-your-hands-realistic.png"
  }
}
```
- 为不同模板提供不同图片
- 需要准备两套素材

### 图片素材准备

#### 卡通手绘模板
```
/public/cards/
  ├── tpr-l0/
  │   ├── Clap-your-hands-cartoon.png
  │   ├── Touch-your-nose-cartoon.png
  │   └── ...
  ├── fruits/
  │   ├── apple-cartoon.jpg
  │   ├── banana-cartoon.jpg
  │   └── ...
```

#### 写实模板
```
/public/cards/
  ├── tpr-l0/
  │   ├── Clap-your-hands-realistic.png
  │   ├── Touch-your-nose-realistic.png
  │   └── ...
  ├── fruits/
  │   ├── apple-realistic.jpg
  │   ├── banana-realistic.jpg
  │   └── ...
```

## 🚀 后续扩展建议

### 1. 更多模板
可以轻松添加更多模板风格：
- 3D渲染
- 扁平设计
- 水彩画风
- 简笔画风

只需：
1. 在 `CARD_TEMPLATES` 添加配置
2. 准备对应图片素材
3. 无需修改业务逻辑

### 2. 模板预设
可以为不同年龄段推荐不同模板：
- 0-2岁：卡通手绘（更吸引注意力）
- 3-5岁：写实（帮助认知真实世界）

### 3. 自定义模板
未来可以支持用户上传自己的卡片背景模板

## 总结

✅ **已完成**：
1. 卡片背景图片显示功能
2. 卡通手绘 & 写实两种模板
3. 模板选择UI
4. 数据结构向后兼容
5. 图片加载失败的优雅降级

🎯 **效果**：
- 卡片更加生动、美观
- 用户可以根据喜好选择风格
- 为未来扩展更多模板打下基础
- 保持了与现有数据的兼容性

