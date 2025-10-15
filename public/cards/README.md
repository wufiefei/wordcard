# 📁 卡片背景图片说明

## 目录结构

```
cards/
├── animals/        # 动物主题卡片背景
├── fruits/         # 水果主题卡片背景
├── colors/         # 颜色主题卡片背景
└── README.md       # 本说明文件
```

## 图片要求

### 尺寸规格
- **推荐尺寸**：1000×1000 像素（正方形）
- **最小尺寸**：800×800 像素
- **最大尺寸**：2000×2000 像素
- **格式**：JPG 或 PNG
- **文件大小**：< 500KB（优化后）

### 命名规范
文件名应与单词ID一致：
- `cat.jpg` - 猫
- `dog.jpg` - 狗
- `apple.jpg` - 苹果
- `red.jpg` - 红色

### 设计要求

#### 1. 背景风格
- 可爱、卡通风格
- 色彩明亮、饱和度高
- 简洁清晰，避免过多细节

#### 2. 主体物品
- 居中放置，占比40-60%
- 轮廓清晰，易于识别
- 避免过于复杂的背景

#### 3. 留白区域
为了放置宝宝头像，需要预留空间：
- **上部区域**（20-40%）：适合放置人脸
- **中部区域**：主要物品展示
- **下部区域**：单词文字展示

#### 4. 颜色搭配
- 背景色与前景色对比明显
- 避免使用纯白或纯黑背景
- 渐变色、纯色均可

### 示例设计

```
┌─────────────────────┐
│   [宝宝头像区域]      │  ← 上部留白 20-40%
│                     │
│      🐱            │  ← 中部主体物品
│                     │
│       cat          │  ← 下部文字区域
│       猫           │
└─────────────────────┘
```

## 资源获取

### 免费图片资源
1. **Unsplash** - https://unsplash.com/
   - 高质量免费图片
   - 无需署名

2. **Pexels** - https://www.pexels.com/
   - 免费商用图片
   - 种类丰富

3. **Pixabay** - https://pixabay.com/
   - 完全免费
   - 可商用

4. **Freepik** - https://www.freepik.com/
   - 矢量图和插画
   - 部分需付费

### AI图片生成
可使用AI工具生成卡通风格图片：
- **DALL-E 3**
- **Midjourney**
- **Stable Diffusion**

提示词示例：
```
"cute cartoon style [animal/fruit/color], 
simple background, bright colors, 
child-friendly, centered composition, 
square format"
```

## 批量处理

### 图片优化
使用工具批量压缩和调整尺寸：

```bash
# 使用 ImageMagick
mogrify -resize 1000x1000 -quality 85 *.jpg

# 使用 sharp（Node.js）
npm install sharp
node resize-images.js
```

### 格式转换
```bash
# JPG转PNG
mogrify -format png *.jpg

# PNG转JPG
mogrify -format jpg *.png
```

## 当前状态

⚠️ **目前所有图片文件夹为空，这是占位目录**

在实际使用时，需要：
1. 准备符合要求的图片
2. 按命名规范放入对应文件夹
3. 更新配置文件中的图片路径

## 临时解决方案

在没有实际图片的情况下：
- 使用Emoji作为占位符（当前方案）✅
- 使用纯色渐变背景
- 使用SVG占位图

---

💡 **提示**：优质的卡片背景图片能大大提升学习体验！

