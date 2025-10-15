# Face-API.js Models

这个目录存放face-api.js的模型文件。

## 需要的模型文件

从 https://github.com/justadudewhohacks/face-api.js/tree/master/weights 下载以下文件：

### TinyFaceDetector（必需）
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`

### FaceLandmark68Net（必需）
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`

## 自动下载（推荐）

运行以下命令自动下载模型：

```bash
npm run download-models
```

## 手动下载

1. 访问：https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. 下载上述文件
3. 放到这个目录（public/models/）

## 文件大小

- TinyFaceDetector: ~400KB
- FaceLandmark68Net: ~350KB
- 总计: ~750KB

## 注意事项

- 这些文件不会被提交到Git（已在.gitignore中）
- 首次运行需要下载这些模型
- 模型加载后会缓存，后续使用会更快

