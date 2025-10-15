# 🚧 开发计划

## 当前状态（Phase 1 - 已完成 ✅）

### 前端界面搭建
- [x] 项目初始化和配置
- [x] 类型系统定义
- [x] 单词库数据结构
- [x] 照片上传组件
- [x] 单词库选择器
- [x] 卡片尺寸选择器
- [x] 单词卡片列表
- [x] 单词卡片预览
- [x] 导出面板（UI占位）
- [x] 响应式布局
- [x] UI美化（可爱、小清新风格）

### 示例数据
- [x] 动物单词库（20个单词）
- [x] 水果单词库（20个单词）
- [x] 颜色单词库（11个单词）

## 下一阶段（Phase 2）

### 1. 图像处理功能 🖼️

#### 1.1 人脸检测和抠图
**优先级：高**

**技术方案**：
- 方案A：使用 `@mediapipe/tasks-vision` (Google MediaPipe)
  - 优点：免费、离线、精确度高
  - 缺点：包体积较大
  
- 方案B：使用 `remove.bg` API
  - 优点：效果最好、云端处理
  - 缺点：需要付费、依赖网络

- 方案C：使用 `canvas` + `face-api.js`
  - 优点：轻量级、免费
  - 缺点：需要自己实现抠图逻辑

**推荐方案**：方案A（MediaPipe）

**实现步骤**：
```typescript
// 1. 安装依赖
npm install @mediapipe/tasks-vision

// 2. 创建人脸检测工具类
// src/utils/faceDetection.ts
export class FaceDetector {
  async detectFace(imageFile: File): Promise<FaceBox> {
    // 使用 MediaPipe Face Detection
  }
  
  async extractFace(imageFile: File, faceBox: FaceBox): Promise<Blob> {
    // 提取并裁剪人脸区域
  }
  
  async removeBackground(imageFile: File): Promise<Blob> {
    // 移除背景（可选）
  }
}
```

**相关文件**：
- `src/utils/faceDetection.ts` - 人脸检测逻辑
- `src/utils/imageProcessor.ts` - 图像处理工具
- `src/components/PhotoUpload.tsx` - 集成检测功能

#### 1.2 图像编辑功能
**优先级：中**

**功能**：
- 调整人脸位置（拖拽）
- 调整人脸大小（缩放）
- 旋转人脸
- 预览实时效果

**技术方案**：
- 使用 `Konva.js` 或 `Fabric.js` 实现可视化编辑
- 使用 CSS `transform` 实现简单调整

**实现步骤**：
```typescript
// 创建图像编辑器组件
// src/components/ImageEditor.tsx
export default function ImageEditor({
  imageUrl,
  onPositionChange,
  onSizeChange,
}) {
  // 实现拖拽、缩放功能
}
```

### 2. 卡片生成功能 🎨

#### 2.1 Canvas 卡片渲染
**优先级：高**

**功能**：
- 加载背景图片
- 绘制宝宝头像（圆形裁剪）
- 绘制单词文本（自然拼读颜色）
- 绘制中文翻译
- 应用阴影和边框效果

**实现步骤**：
```typescript
// src/utils/cardGenerator.ts
export class CardGenerator {
  async generateCard(
    word: Word,
    babyPhotoUrl: string,
    cardSize: CardSizeType
  ): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 1. 设置画布尺寸
    // 2. 绘制背景
    // 3. 绘制宝宝头像
    // 4. 绘制文字
    
    return canvas;
  }
}
```

#### 2.2 批量卡片布局
**优先级：高**

**功能**：
- 根据选择的尺寸排列卡片
- A4纸尺寸布局
- 添加裁切线
- 添加出血区域

**实现步骤**：
```typescript
// src/utils/layoutGenerator.ts
export class LayoutGenerator {
  async generateLayout(
    cards: HTMLCanvasElement[],
    cardSize: CardSizeType
  ): Promise<HTMLCanvasElement[]> {
    // 返回多页A4画布
  }
}
```

### 3. PDF 导出功能 📄

**优先级：高**

**技术方案**：
- 使用 `jsPDF` + `canvas` 生成PDF
- 或使用 `pdf-lib` 更精细控制

**实现步骤**：
```typescript
// src/utils/pdfExporter.ts
import { jsPDF } from 'jspdf';

export class PDFExporter {
  async exportToPDF(
    layouts: HTMLCanvasElement[],
    filename: string
  ): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // 添加每一页
    layouts.forEach((canvas, index) => {
      if (index > 0) pdf.addPage();
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    });
    
    pdf.save(filename);
  }
}
```

**相关依赖**：
```bash
npm install jspdf
```

### 4. 图片导出功能 🖼️

**优先级：中**

**功能**：
- 导出单张卡片为图片
- 批量打包下载
- 支持PNG、JPG格式

**技术方案**：
- 使用 `canvas.toBlob()` 生成图片
- 使用 `JSZip` 打包多张图片
- 使用 `file-saver` 触发下载

**实现步骤**：
```typescript
// src/utils/imageExporter.ts
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export class ImageExporter {
  async exportImages(
    cards: HTMLCanvasElement[],
    format: 'png' | 'jpeg'
  ): Promise<void> {
    const zip = new JSZip();
    
    for (let i = 0; i < cards.length; i++) {
      const blob = await new Promise<Blob>((resolve) => {
        cards[i].toBlob(resolve as BlobCallback, `image/${format}`);
      });
      zip.file(`card-${i + 1}.${format}`, blob);
    }
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'wordcards.zip');
  }
}
```

**相关依赖**：
```bash
npm install jszip file-saver
npm install --save-dev @types/file-saver
```

### 5. 预览功能 👀

**优先级：中**

**功能**：
- 显示A4纸张排版效果
- 支持缩放查看
- 支持翻页
- 显示裁切线

**实现步骤**：
```typescript
// src/components/LayoutPreview.tsx
export default function LayoutPreview({
  layouts,
  onClose,
}) {
  return (
    <Modal>
      <PageNavigator />
      <ZoomControls />
      <LayoutCanvas />
    </Modal>
  );
}
```

## Phase 3 - 功能增强

### 1. 更多单词库 📚
- [ ] 数字单词库（1-20）
- [ ] 字母单词库（A-Z）
- [ ] 身体部位单词库
- [ ] 家庭关系单词库
- [ ] 日常用品单词库
- [ ] 交通工具单词库

### 2. 自定义单词库 ✏️
- [ ] 创建自定义单词
- [ ] 上传自定义背景图
- [ ] 设置自定义颜色标注
- [ ] 导入/导出单词库

### 3. 进阶功能 🎯
- [ ] 音频发音（TTS或预录）
- [ ] 单词游戏模式
- [ ] 学习进度追踪
- [ ] 打印历史记录
- [ ] 多语言支持（英、中、西、法等）

### 4. 用户系统 👤
- [ ] 用户注册/登录
- [ ] 保存照片和设置
- [ ] 历史记录
- [ ] 收藏夹功能

## 技术债务 🔧

### 性能优化
- [ ] 图片懒加载
- [ ] Canvas 渲染优化
- [ ] 大文件处理优化
- [ ] 内存管理优化

### 代码质量
- [ ] 单元测试（Jest + Testing Library）
- [ ] E2E测试（Playwright）
- [ ] 代码规范（ESLint + Prettier）
- [ ] 类型完整性检查

### 用户体验
- [ ] 加载动画
- [ ] 错误处理和提示
- [ ] 操作引导（Tour）
- [ ] 无障碍支持（a11y）

## 部署计划 🚀

### 1. 静态部署
- **Vercel**（推荐）：一键部署，自动CI/CD
- **Netlify**：同样优秀的静态托管
- **GitHub Pages**：免费但需要手动配置

### 2. 服务器部署
如需后端功能（用户系统、图片存储）：
- **Node.js Server** + **PostgreSQL**
- **云存储**：阿里云OSS / AWS S3
- **CDN加速**：CloudFlare

### 3. 域名和SSL
- 购买域名（如：`babycards.com`）
- 配置SSL证书（Let's Encrypt免费）

## 开发时间估算 ⏱️

| 功能模块 | 预估时间 | 难度 |
|---------|---------|------|
| 人脸检测抠图 | 3-5天 | ⭐⭐⭐⭐ |
| 图像编辑 | 2-3天 | ⭐⭐⭐ |
| Canvas渲染 | 3-4天 | ⭐⭐⭐⭐ |
| PDF导出 | 2-3天 | ⭐⭐⭐ |
| 图片导出 | 1-2天 | ⭐⭐ |
| 排版预览 | 2-3天 | ⭐⭐⭐ |
| **Phase 2 总计** | **13-20天** | - |

## 技术选型参考 🛠️

### 推荐技术栈
```json
{
  "图像处理": "@mediapipe/tasks-vision",
  "Canvas操作": "原生Canvas API + Konva.js",
  "PDF生成": "jspdf",
  "图片导出": "jszip + file-saver",
  "状态管理": "React Hooks (useState, useReducer)",
  "样式": "Tailwind CSS",
  "类型安全": "TypeScript"
}
```

### 可选增强
- **图像编辑**：`fabric.js` 或 `konva.js`
- **拖拽排序**：`react-dnd` 或 `dnd-kit`
- **文件处理**：`sharp`（服务端）
- **动画**：`framer-motion`

## 注意事项 ⚠️

### 隐私和安全
- 照片处理应在客户端完成
- 不上传用户照片到服务器
- 遵守GDPR和数据保护法规

### 浏览器兼容性
- 现代浏览器（Chrome, Firefox, Safari, Edge）
- 移动端Safari特别注意
- Canvas和File API兼容性

### 性能考虑
- 大图片压缩处理
- Canvas渲染性能优化
- 避免内存泄漏
- 合理使用Web Workers

---

📅 更新日期：2025-10-15  
📝 文档版本：v1.0

