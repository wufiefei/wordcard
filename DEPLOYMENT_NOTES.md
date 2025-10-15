# 🚀 部署注意事项

## ⚠️ 重要提醒

### 模型文件处理

本项目使用 face-api.js，需要额外的模型文件（~750KB）。

#### 开发环境
```bash
# 首次运行前必须下载模型
npm install
npm run download-models
npm run dev
```

#### 生产环境部署

##### Vercel / Netlify / 类似平台

**方法1：包含模型文件（推荐）**
```bash
# 1. 本地下载模型
npm run download-models

# 2. 临时修改 .gitignore，提交模型文件
# 注释掉这两行：
# /public/models/*.json
# /public/models/*-shard*

# 3. 提交代码
git add public/models/*
git commit -m "Add face-api.js models"
git push

# 4. 部署完成后恢复 .gitignore
```

**方法2：构建时下载**

修改 `package.json`：
```json
{
  "scripts": {
    "build": "npm run download-models && next build"
  }
}
```

**方法3：使用CDN**

修改 `src/utils/faceDetection.ts`：
```typescript
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
```

---

## 📦 依赖包说明

### 核心依赖
```json
{
  "face-api.js": "^0.22.2",           // ~800KB (含TensorFlow.js)
  "@imgly/background-removal": "^1.7.0"  // ~2MB (AI模型)
}
```

### 注意事项

1. **face-api.js**
   - 包含 TensorFlow.js
   - 浏览器端运行
   - 需要额外模型文件
   - 构建警告（fs, encoding）正常

2. **@imgly/background-removal**
   - 首次使用会下载WASM模型
   - 处理时间较长（3-10秒）
   - 可选功能，可禁用

---

## 🌐 环境变量

当前项目不需要环境变量。

如果未来需要配置CDN等，可添加：

```env
# .env.local
NEXT_PUBLIC_MODEL_URL=https://your-cdn.com/models
```

---

## 🔧 构建配置

### Next.js配置

当前 `next.config.ts` 无需特殊配置。

如需优化，可添加：

```typescript
// next.config.ts
const nextConfig = {
  // 优化图片处理
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Webpack配置（如需）
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};
```

---

## 📊 性能优化建议

### 1. 模型文件优化

**当前大小**：
- tiny_face_detector: ~400KB
- face_landmark_68: ~350KB
- **总计**: ~750KB

**优化方案**：
- ✅ 使用CDN加速
- ✅ 启用Gzip压缩
- ✅ 浏览器缓存策略

### 2. 代码分割

```typescript
// 懒加载人脸检测模块
const loadFaceDetection = () => import('@/utils/faceDetection');
```

### 3. 图片处理优化

```typescript
// 压缩大图片
const MAX_WIDTH = 1024;
const MAX_HEIGHT = 1024;
```

---

## 🐛 常见部署问题

### 问题1：模型文件404

**现象**：
```
GET /models/tiny_face_detector_model-weights_manifest.json 404
```

**原因**：
- 模型文件未上传
- .gitignore排除了模型文件

**解决**：
```bash
# 确保模型文件存在
ls -la public/models/

# 临时提交模型文件
git add -f public/models/*
git commit -m "Add models"
```

---

### 问题2：构建警告

**现象**：
```
Module not found: Can't resolve 'fs'
Module not found: Can't resolve 'encoding'
```

**原因**：
- face-api.js依赖Node.js模块
- 这些模块在浏览器中不需要

**状态**：
- ✅ 正常警告
- ✅ 不影响运行
- ✅ 可以忽略

**解决**（可选）：
```typescript
// next.config.ts
webpack: (config) => {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    encoding: false,
  };
  return config;
}
```

---

### 问题3：背景移除慢

**现象**：
- 首次使用需要10-20秒
- 下载WASM模型

**解决**：
```typescript
// 1. 预加载（可选）
useEffect(() => {
  import('@imgly/background-removal');
}, []);

// 2. 或添加加载提示
<p>首次使用需要下载AI模型，请稍候...</p>
```

---

### 问题4：内存占用高

**现象**：
- 处理大图片时内存飙升
- 移动端可能崩溃

**解决**：
```typescript
// 限制图片大小
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

if (file.size > MAX_FILE_SIZE) {
  alert('图片过大，请选择小于5MB的图片');
  return;
}
```

---

## 🔒 安全考虑

### 1. 客户端处理

所有图片处理都在浏览器完成：
- ✅ 照片不上传到服务器
- ✅ 保护用户隐私
- ✅ 降低服务器成本

### 2. 模型文件

模型文件是公开的：
- ✅ 可以使用CDN
- ✅ 无需API密钥
- ✅ 无安全风险

---

## 📱 移动端优化

### 1. 性能优化

```typescript
// 移动端使用更快的模型
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
const options = isMobile 
  ? new faceapi.TinyFaceDetectorOptions({ inputSize: 160 })
  : new faceapi.TinyFaceDetectorOptions();
```

### 2. 图片压缩

```typescript
// 移动端自动压缩
if (isMobile && file.size > 2 * 1024 * 1024) {
  file = await compressImage(file);
}
```

---

## ✅ 部署检查清单

### 上线前检查

- [ ] 模型文件已下载
- [ ] 构建成功无错误
- [ ] 测试人脸检测功能
- [ ] 测试背景移除功能
- [ ] 移动端测试
- [ ] 性能测试
- [ ] 浏览器兼容性测试

### 监控指标

- [ ] 首屏加载时间 < 3秒
- [ ] 模型加载时间 < 2秒
- [ ] 人脸检测时间 < 2秒
- [ ] 错误率 < 5%
- [ ] 移动端可用性 > 95%

---

## 📞 故障排查

### 如果部署后不工作

1. **检查控制台**
   ```
   F12 -> Console -> 查看错误
   ```

2. **检查网络**
   ```
   F12 -> Network -> 查看模型加载
   ```

3. **检查文件**
   ```bash
   # 访问直接URL测试
   https://your-domain.com/models/tiny_face_detector_model-weights_manifest.json
   ```

4. **清除缓存**
   ```
   Ctrl+Shift+R (硬刷新)
   ```

---

## 🔄 回滚方案

如果V2.1有问题，可以快速回滚：

```bash
# 1. 回滚代码
git revert HEAD

# 2. 或切换到V2.0
git checkout v2.0

# 3. 重新部署
npm run build
```

---

## 📚 相关文档

- [人脸识别指南](./FACE_DETECTION_GUIDE.md)
- [更新说明](./UPDATE_v2.1_FACE_DETECTION.md)
- [测试清单](./QUICK_TEST_CHECKLIST.md)
- [实现总结](./IMPLEMENTATION_SUMMARY_v2.1.md)

---

**💡 建议：先在Vercel Preview部署测试，确认无误后再合并到生产环境！**

