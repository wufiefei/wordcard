# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

宝宝单词闪卡生成器 - 一个基于 Next.js 的个性化英语学习闪卡制作工具。用户上传宝宝照片，经过AI抠图后，可以生成包含宝宝头像的单词学习卡片，支持多种尺寸和PDF/图片导出。

## 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器 (http://localhost:3000)

# 构建与生产
npm run build            # 构建生产版本
npm start                # 运行生产服务器

# 代码检查
npm run lint             # 运行 ESLint
```

## 核心架构

### 应用流程（三步向导）

1. **Step 1 - 照片上传** ([Step1PhotoUpload.tsx](src/components/Step1PhotoUpload.tsx))
   - 用户上传宝宝照片
   - 使用 `@imgly/background-removal` 进行AI智能抠图
   - 提供图片编辑器 ([ImageEditor.tsx](src/components/ImageEditor.tsx))：擦除、还原、旋转、撤销/重做
   - 状态：`photoPreview`, `processedImageUrl`, `showEditor`

2. **Step 2 - 选择单词** ([Step2SelectWords.tsx](src/components/Step2SelectWords.tsx))
   - 选择单词库（水果、颜色、车辆、数字、TPR等）
   - 选择要生成的单词（单选/全选）
   - 选择卡片模板（卡通/写实风格）
   - 可以为每个单词调整头像位置和大小
   - 状态：`selectedLibraryId`, `selectedWords`, `selectedTemplate`, `wordPositions`, `wordSizes`

3. **Step 3 - 选择尺寸并导出** ([Step3SelectSize.tsx](src/components/Step3SelectSize.tsx))
   - 选择卡片尺寸（超大卡、大卡、标准卡等）
   - 预览A4排版效果
   - 导出为PDF或图片压缩包

### 数据结构

**核心类型定义** ([src/types/wordcard.ts](src/types/wordcard.ts)):
- `Word`: 单词信息，包含英文、中文、自然拼读标注、卡片背景图、人脸位置
- `PhoneticSegment`: 自然拼读音节，每个字母/音节对应一种颜色类别
- `WordLibrary`: 单词库，包含多个单词
- `CardSizeType`: 卡片尺寸配置（每页数量、裁切尺寸、像素等）
- `CardTemplate`: 卡片模板类型（'cartoon' | 'realistic'）

**自然拼读颜色系统**:
- 短元音 → 红色
- 长元音 → 蓝色
- 辅音 → 黑色
- 双辅音/三辅音 → 橙色
- 不发音字母 → 灰色
- R控制元音 → 紫色
- 双元音 → 粉色

### 关键模块

**背景移除** ([src/utils/backgroundRemoval.ts](src/utils/backgroundRemoval.ts)):
- 使用 `@imgly/background-removal` 库
- 浏览器端执行，支持进度回调
- 输出PNG格式，质量0.8

**导出工具** ([src/utils/exportUtils.ts](src/utils/exportUtils.ts)):
- `renderCardToCanvas()`: 将单词卡渲染到Canvas（300 DPI）
- `exportToPDF()`: 使用 jsPDF 导出PDF，按A4纸排版
- `exportToImages()`: 使用 JSZip 导出单张PNG图片压缩包
- 支持横向和纵向两种卡片布局
- 卡片包含：背景图、宝宝头像、英文单词、中文翻译

**单词库数据** ([src/data/libraries/](src/data/libraries/)):
- 每个单词库为独立JSON文件
- 包含：水果、颜色、车辆、数字、TPR-L0、TPR-L1
- 每个单词必须包含：id, english, chinese, phoneticSegments, cardImageUrl, facePosition

### 状态管理

主页面 ([src/app/page.tsx](src/app/page.tsx)) 使用 React useState 管理所有状态：
- `currentStep`: 当前步骤 (1/2/3)
- `photoPreview`: 原始照片预览URL
- `processedImageUrl`: 抠图后的图片URL
- `selectedLibraryId`: 选中的单词库ID
- `selectedWords`: 选中的单词ID集合 (Set<string>)
- `selectedCardSize`: 选中的卡片尺寸ID
- `selectedTemplate`: 选中的卡片模板
- `wordPositions`: 每个单词的头像位置 {wordId: {x, y}}
- `wordSizes`: 每个单词的头像大小 {wordId: width}

## 技术栈特点

- **Next.js 15** (App Router) - 服务端渲染
- **TypeScript** - 类型安全
- **Tailwind CSS 4** - 样式系统
- **@imgly/background-removal** - AI抠图（浏览器端，WebAssembly）
- **jsPDF** - PDF生成（客户端）
- **JSZip** - 图片打包（客户端）

## 开发注意事项

### 图片处理
- 背景移除库仅在客户端运行，需要动态导入以避免SSR问题
- 浏览器需要支持 WebAssembly
- 抠图过程较耗时，需提供进度反馈

### 导出功能
- Canvas渲染使用300 DPI确保打印质量
- PDF按卡片尺寸配置自动排版（cols × rows）
- 卡片尺寸包含"出血"（bleed）用于打印裁切
- 图片加载需要处理跨域（crossOrigin='anonymous'）

### 单词库扩展
添加新单词库时：
1. 在 `src/data/libraries/` 创建JSON文件
2. 在 `index.ts` 中导入并加入 `wordLibraries` 数组
3. 确保背景图放在 `public/cards/` 下
4. 每个单词需要包含完整的 `phoneticSegments` 和 `facePosition`

### 卡片布局
- 不同尺寸卡片使用不同布局（横向/纵向）
- 布局配置在 `exportUtils.ts` 的 `getCardLayout()` 中
- 包含：图片比例、内边距、间距、字号等参数

## 项目状态

当前版本：v2.2.0

已完成：
- ✅ AI智能抠图
- ✅ 图片编辑器（擦除/还原/旋转/撤销/重做）
- ✅ 三步向导界面
- ✅ 6个单词库（120+单词）
- ✅ 自然拼读颜色标注
- ✅ 5种卡片尺寸
- ✅ PDF和图片导出
- ✅ 响应式设计

未来计划：
- 更多单词库
- 自定义单词库
- 单词发音功能
