# 🔧 V2.2 故障排除指南

## ❌ 常见问题与解决方案

### 问题1: 页面空白，404错误

**症状**：
```
GET /_next/static/chunks/fallback/webpack.js 404
GET /_next/static/chunks/fallback/main.js 404
```

**原因**：
- Next.js构建缓存损坏
- 依赖变更后未清理缓存

**解决方案**：
```bash
# 1. 停止开发服务器 (Ctrl+C)

# 2. 清理缓存
Remove-Item -Recurse -Force .next

# 3. 重新安装依赖
npm install

# 4. 重新启动
npm run dev
```

---

### 问题2: MediaPipe相关错误

**症状**：
```
Error: ENOENT: no such file or directory
@mediapipe/selfie_segmentation/selfie_segmentation.js
```

**原因**：
- 已移除MediaPipe依赖但缓存仍引用

**解决方案**：
```bash
# 1. 确认package.json中已移除MediaPipe
# 应该只有 @imgly/background-removal

# 2. 清理并重装
npm install
rm -rf .next
npm run dev
```

---

### 问题3: Cannot find module './611.js'

**症状**：
```
Error: Cannot find module './611.js'
routes-manifest.json not found
```

**原因**：
- Webpack缓存问题
- 构建产物不完整

**解决方案**：
```bash
# 完全清理并重建
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

---

### 问题4: 抠图功能不工作

**症状**：
- 上传照片后一直转圈
- 控制台报错

**可能原因**：
1. 首次使用需要下载模型
2. 网络连接问题
3. 浏览器兼容性

**解决方案**：
```javascript
// 检查控制台错误
F12 -> Console

// 常见错误：
// 1. CORS错误 - CDN加载失败
// 2. WebAssembly错误 - 浏览器不支持
// 3. 内存错误 - 图片太大

// 解决方法：
// - 使用现代浏览器（Chrome/Edge 90+）
// - 压缩图片到3MB以下
// - 等待模型下载完成（首次5-10秒）
```

---

### 问题5: 编辑器打不开

**症状**：
- 点击"编辑图片"无反应
- 或编辑器一闪而过

**检查项**：
```javascript
// 1. 是否有抠图结果
console.log(processedImageUrl); // 应该不是null

// 2. 检查ImageEditor组件是否加载
// F12 -> Elements -> 搜索 "ImageEditor"

// 3. 检查状态
console.log(showEditor); // 点击后应该是true
```

**解决方案**：
- 确保照片已成功抠图
- 检查浏览器控制台错误
- 刷新页面重试

---

### 问题6: 笔刷工具不工作

**症状**：
- 鼠标拖动无效果
- 擦除/还原不起作用

**检查项**：
```javascript
// 1. Canvas是否正确初始化
const canvas = document.querySelector('canvas');
console.log(canvas.width, canvas.height); // 应该有值

// 2. 工具是否选中
console.log(currentTool); // 'erase' 或 'restore'

// 3. 是否在绘制
console.log(isDrawing); // 鼠标按下时应该是true
```

**解决方案**：
- 确保选择了擦除或还原工具
- 鼠标按住并拖动
- 检查笔刷大小（不要太小）

---

### 问题7: 撤销/重做失效

**症状**：
- 点击撤销/重做按钮无反应
- 按钮显示为禁用状态

**原因分析**：
```javascript
// 检查历史记录
console.log(history.length); // 应该 > 0
console.log(historyIndex); // 应该 >= 0
```

**解决方案**：
- 确保进行过编辑操作
- 重置后历史会清空
- 撤销到头后"撤销"按钮会禁用

---

### 问题8: 保存后图片质量下降

**症状**：
- 保存的图片模糊
- 分辨率降低

**原因**：
- Canvas尺寸设置不当
- 图片压缩过度

**解决方案**：
```javascript
// 检查Canvas尺寸
console.log(canvas.width, canvas.height);
// 应该等于原图尺寸

// 修改保存质量（如需要）
canvas.toBlob((blob) => {
  // ...
}, 'image/png', 1.0); // 质量参数：0.0-1.0
```

---

### 问题9: 移动端体验差

**症状**：
- 按钮点不到
- 编辑器太小
- 操作不灵敏

**优化建议**：
```css
/* 增大触控区域 */
button {
  min-height: 44px;
  min-width: 44px;
}

/* 禁用缩放（编辑器内） */
touch-action: none;

/* 优化滚动 */
-webkit-overflow-scrolling: touch;
```

**当前实现**：
- 编辑器自适应屏幕
- 缩放控制在底部
- 工具栏在顶部固定

---

### 问题10: 性能问题

**症状**：
- 处理慢
- 页面卡顿
- 内存占用高

**优化方案**：

1. **压缩图片**
```javascript
// 限制图片大小
const MAX_SIZE = 3 * 1024 * 1024; // 3MB
if (file.size > MAX_SIZE) {
  alert('图片过大，请压缩后上传');
}
```

2. **使用现代浏览器**
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

3. **清理内存**
```javascript
// 及时释放URL对象
URL.revokeObjectURL(url);

// 限制历史记录数量
const MAX_HISTORY = 50;
```

---

## 🛠️ 调试工具

### Chrome DevTools

**打开方式**：F12 或 右键 -> 检查

**有用的面板**：

1. **Console** - 查看错误日志
```javascript
// 常用命令
console.log(photoPreview);
console.log(processedImageUrl);
console.log(showEditor);
```

2. **Network** - 查看网络请求
```
查找：
- /_next/static/... (资源加载)
- CDN请求 (模型下载)
- Blob URL (图片数据)
```

3. **Application** - 查看存储
```
检查：
- Local Storage
- Session Storage
- Cache Storage
```

4. **Performance** - 性能分析
```
录制性能：
1. 点击录制按钮
2. 执行操作
3. 停止录制
4. 查看火焰图
```

---

## 📝 快速修复命令

### Windows PowerShell
```powershell
# 完全清理重启
taskkill /F /IM node.exe
Remove-Item -Recurse -Force .next
npm install
npm run dev
```

### macOS/Linux
```bash
# 完全清理重启
pkill -f node
rm -rf .next
npm install
npm run dev
```

---

## 🔍 日志分析

### 正常日志
```
✓ Ready in 10.4s
✓ Compiled successfully
GET / 200 in 100ms
```

### 异常日志
```
❌ Error: Cannot find module
❌ ENOENT: no such file or directory
⚠ Warning: React Hook...
```

---

## 📞 获取帮助

### 信息收集
```
1. 操作系统和版本
2. 浏览器和版本
3. Node.js版本 (node -v)
4. npm版本 (npm -v)
5. 错误截图
6. 控制台日志
7. 复现步骤
```

### 检查清单
- [ ] 已清理.next目录
- [ ] 已重新安装依赖
- [ ] 已重启开发服务器
- [ ] 已刷新浏览器
- [ ] 已检查控制台错误
- [ ] 已尝试不同图片
- [ ] 已尝试不同浏览器

---

## ✅ 预防措施

### 开发习惯
```bash
# 1. 每次修改依赖后清理缓存
npm install
rm -rf .next

# 2. 定期清理
npm run build  # 测试构建
rm -rf .next   # 清理缓存

# 3. 版本控制
git status     # 检查变更
git diff       # 查看差异
```

### 测试流程
```
1. 上传照片 ✓
2. 等待抠图 ✓
3. 查看预览 ✓
4. 打开编辑器 ✓
5. 使用擦除 ✓
6. 使用还原 ✓
7. 旋转图片 ✓
8. 撤销操作 ✓
9. 保存导出 ✓
10. 继续流程 ✓
```

---

**💡 大部分问题通过清理缓存和重启都能解决！**

