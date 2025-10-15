# 🔧 故障排查指南

## 常见问题及解决方案

---

## ❌ 构建/运行错误

### 1. "Cannot find module './XXX.js'" 错误

**错误信息**：
```
Error: Cannot find module './586.js'
Runtime Error
```

**原因**：
- Next.js构建缓存损坏
- 依赖关系未正确更新
- 热更新导致的模块引用错误

**解决方案**：

#### 方法1：清理缓存重新构建（推荐）
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next
npm run build
npm run dev

# Mac/Linux
rm -rf .next
npm run build
npm run dev
```

#### 方法2：完全清理（彻底）
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run build
npm run dev

# Mac/Linux
rm -rf .next node_modules
npm install
npm run build
npm run dev
```

#### 方法3：仅重启开发服务器
```bash
# 停止当前运行（Ctrl+C）
npm run dev
```

---

### 2. TypeScript 类型错误

**错误信息**：
```
Type 'X' is not assignable to type 'Y'
```

**解决方案**：
1. 检查 `src/types/wordcard.ts` 中的类型定义
2. 确保所有组件props类型匹配
3. 运行类型检查：
```bash
npx tsc --noEmit
```

---

### 3. 图片加载失败

**错误信息**：
```
Failed to load image
```

**原因**：
- 图片路径不存在
- Next.js Image组件配置问题

**解决方案**：
1. 检查 `public/cards/` 目录结构
2. 确认图片文件存在
3. 图片路径以 `/` 开头（如 `/cards/animals/cat.jpg`）

---

### 4. 样式不生效

**可能原因**：
- Tailwind CSS未正确编译
- 类名冲突

**解决方案**：
1. 检查 `tailwind.config.ts`
2. 确认 `globals.css` 导入了Tailwind
3. 清理缓存重新构建

---

## 📱 移动端问题

### 1. 固定底部按钮被遮挡

**解决方案**：
- 确保主内容区域有 `pb-20 lg:pb-6` 或类似的底部内边距
- 检查 `z-index` 层级（底部按钮应该是 `z-30`）

### 2. 触摸拖动不灵敏

**检查项**：
- `onTouchStart/Move/End` 事件是否正确绑定
- `preventDefault()` 是否调用
- 父元素是否阻止了事件传播

---

## 🖱️ 交互问题

### 1. 拖动功能不工作

**DraggableCardPreview 组件检查**：
```tsx
// 确保事件处理器正确绑定
onMouseDown={handleMouseDown}
onMouseMove={handleMouseMove}  // 在父容器上
onMouseUp={handleMouseUp}      // 在父容器上

// 移动端
onTouchStart={handleTouchStart}
onTouchMove={handleTouchMove}
onTouchEnd={handleTouchEnd}
```

### 2. 缩放功能异常

**Step3SelectSize 组件检查**：
```tsx
// 确认zoom状态
const [zoom, setZoom] = useState(1);

// 检查缩放范围
const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
```

---

## 📦 依赖问题

### 1. 依赖安装失败

```bash
# 清理npm缓存
npm cache clean --force

# 删除package-lock.json重新安装
Remove-Item package-lock.json
npm install
```

### 2. 版本冲突

**检查项**：
- Node.js版本：建议 >= 18.17.0
- npm版本：建议 >= 9.0.0

```bash
node --version
npm --version
```

---

## 🔍 调试技巧

### 1. 查看控制台日志

**浏览器控制台**（F12）：
- 检查错误信息
- 查看网络请求
- 查看组件渲染

### 2. Next.js开发工具

```bash
# 详细错误信息
npm run dev

# 生产构建测试
npm run build
npm start
```

### 3. React DevTools

安装浏览器扩展：
- Chrome/Edge: React Developer Tools
- Firefox: React Developer Tools

---

## 🚨 紧急修复流程

当应用完全无法运行时：

### 步骤1：完全清理
```bash
Remove-Item -Recurse -Force .next, node_modules
```

### 步骤2：重新安装
```bash
npm install
```

### 步骤3：重新构建
```bash
npm run build
```

### 步骤4：启动
```bash
npm run dev
```

### 步骤5：检查浏览器
访问 http://localhost:3000

---

## 📝 日志记录

### 开发环境日志
```bash
npm run dev 2>&1 | Tee-Object -FilePath dev.log
```

### 构建日志
```bash
npm run build 2>&1 | Tee-Object -FilePath build.log
```

---

## 🆘 获取帮助

### 1. 查看文档
- [README.md](README.md) - 项目说明
- [QUICK_START.md](QUICK_START.md) - 快速开始
- [UPDATE_v2.0.md](UPDATE_v2.0.md) - 更新说明

### 2. 检查代码
- 查看相关组件源码
- 对比最近的改动

### 3. 社区支持
- Next.js文档: https://nextjs.org/docs
- React文档: https://react.dev
- Stack Overflow

---

## ✅ 预防措施

### 1. 定期清理
```bash
# 每周执行一次
Remove-Item -Recurse -Force .next
npm run build
```

### 2. 保持依赖更新
```bash
# 检查过期依赖
npm outdated

# 更新依赖（谨慎）
npm update
```

### 3. 代码规范
- 运行 linter: `npm run lint`
- 类型检查: `npx tsc --noEmit`
- 格式化代码

### 4. Git管理
```bash
# 提交前检查
git status
npm run build

# 创建分支进行实验
git checkout -b feature-test
```

---

## 🔧 配置检查清单

### 必要文件
- [x] `package.json` - 依赖配置
- [x] `tsconfig.json` - TypeScript配置
- [x] `next.config.ts` - Next.js配置
- [x] `tailwind.config.ts` - Tailwind配置
- [x] `postcss.config.mjs` - PostCSS配置

### 目录结构
- [x] `src/app/` - 应用页面
- [x] `src/components/` - React组件
- [x] `src/data/` - 数据文件
- [x] `src/types/` - 类型定义
- [x] `public/` - 静态资源

---

## 💡 性能优化建议

### 1. 开发环境
```bash
# 使用turbo模式（如果可用）
npm run dev -- --turbo
```

### 2. 生产构建
```bash
# 分析包大小
npm run build -- --analyze
```

### 3. 缓存策略
- 合理使用Next.js缓存
- 优化图片加载
- 减少重复渲染

---

## 📊 健康检查

运行以下命令确认一切正常：

```bash
# 1. 清理
Remove-Item -Recurse -Force .next

# 2. 类型检查
npx tsc --noEmit

# 3. Lint检查
npm run lint

# 4. 构建
npm run build

# 5. 启动
npm run dev
```

如果所有步骤都通过，说明项目健康！✅

---

**记住**：大多数问题都可以通过清理缓存和重新构建解决！

*最后更新：2025-10-15*

