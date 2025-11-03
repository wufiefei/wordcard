# 🚀 rembg 后端抠图服务部署指南

## 📋 方案概览

使用开源的 **rembg** 替代前端抠图，优势：
- ✅ 手机访问流畅，不卡顿
- ✅ 速度快（GPU服务器：0.5-2秒）
- ✅ 成本低（自建服务器约¥30-50/月）
- ✅ 无并发限制
- ✅ 图片隐私可控

## 🔧 本地开发

### 1. 启动后端服务

```bash
cd backend

# 安装Python依赖
pip install -r requirements.txt

# 启动服务
python app.py

# 服务运行在 http://localhost:5000
```

### 2. 测试服务

```bash
# 健康检查
curl http://localhost:5000/health

# 测试抠图
curl -X POST \
  -F "image=@test.jpg" \
  http://localhost:5000/remove-background \
  -o output.png
```

### 3. 启动前端

```bash
# 在项目根目录
npm run dev

# 前端会自动调用 http://localhost:5000 的后端服务
```

## 🌐 生产部署

### 方案A：部署到云服务器（推荐）

#### 1. 购买服务器

**推荐配置**：
- CPU：2核以上
- 内存：4GB以上
- 系统：Ubuntu 22.04
- 带宽：5Mbps以上

**服务商**：
- 阿里云：轻量应用服务器 ¥40/月
- 腾讯云：轻量应用服务器 ¥45/月
- 华为云：云服务器 ¥38/月

#### 2. 服务器配置

```bash
# SSH连接服务器
ssh root@your-server-ip

# 安装Python
apt update
apt install python3 python3-pip -y

# 上传代码（在本地执行）
scp -r backend root@your-server-ip:/opt/

# 安装依赖
cd /opt/backend
pip3 install -r requirements.txt

# 使用gunicorn启动（生产环境）
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app

# 后台运行
nohup gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app > /var/log/rembg.log 2>&1 &
```

#### 3. 配置Nginx反向代理

```bash
# 安装Nginx
apt install nginx -y

# 创建配置文件
nano /etc/nginx/sites-available/rembg
```

配置内容：
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名
    
    client_max_body_size 10M;
    
    location /api/remove-background {
        proxy_pass http://127.0.0.1:5000/remove-background;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```

启用配置：
```bash
ln -s /etc/nginx/sites-available/rembg /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 4. 配置systemd自动启动

```bash
# 创建服务文件
nano /etc/systemd/system/rembg.service
```

内容：
```ini
[Unit]
Description=rembg Background Removal API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/backend
ExecStart=/usr/local/bin/gunicorn -w 4 -b 127.0.0.1:5000 --timeout 120 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
systemctl daemon-reload
systemctl start rembg
systemctl enable rembg
systemctl status rembg
```

### 方案B：使用Docker部署

```bash
# 在服务器上
cd /opt/backend

# 构建镜像
docker build -t rembg-api .

# 运行容器
docker run -d \
  --name rembg-api \
  -p 5000:5000 \
  --restart unless-stopped \
  rembg-api

# 查看日志
docker logs -f rembg-api
```

或使用docker-compose：

```yaml
# docker-compose.yml
version: '3.8'
services:
  rembg-api:
    build: .
    ports:
      - "5000:5000"
    restart: unless-stopped
    environment:
      - FLASK_ENV=production
```

```bash
docker-compose up -d
```

### 方案C：免费部署（Railway/Render）

#### Railway.app（推荐）

1. 注册 [Railway.app](https://railway.app)
2. 连接GitHub仓库
3. 选择 `backend` 目录
4. 自动部署
5. 获取域名：`https://xxx.railway.app`

#### Render.com

1. 注册 [Render.com](https://render.com)
2. 创建Web Service
3. 连接GitHub
4. 配置：
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn -w 2 -b 0.0.0.0:$PORT app:app`
5. 免费实例（有休眠期）

## ⚙️ 前端配置

在Next.js项目中配置后端地址：

```typescript
// src/app/api/remove-background/route.ts
const rembgUrl = process.env.REMBG_API_URL || 'http://localhost:5000/remove-background';
```

生产环境设置环境变量：
```bash
# .env.production
REMBG_API_URL=https://your-domain.com/api/remove-background
```

Vercel部署时添加环境变量：
- 登录Vercel Dashboard
- 进入项目设置
- Environment Variables
- 添加 `REMBG_API_URL`

## 🚀 GPU加速（可选）

使用GPU可以提速3-5倍！

### 购买GPU服务器

**服务商**：
- AutoDL：GPU租用平台，¥0.8/小时起
- 腾讯云：GPU服务器，¥200/月起
- AWS/Azure：按需付费

### 安装CUDA

```bash
# Ubuntu 22.04
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/3bf863cc.pub
sudo add-apt-repository "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/ /"
sudo apt update
sudo apt install cuda -y
```

### 安装GPU版rembg

```bash
pip install rembg[gpu]
```

## 📊 性能测试

```bash
# 使用Apache Bench测试
ab -n 100 -c 10 -p test.jpg -T "multipart/form-data" http://your-domain.com/api/remove-background

# 预期结果：
# - CPU：3-8秒/请求
# - GPU：0.5-2秒/请求
```

## 💰 成本对比

| 方案 | 月费用 | 并发 | 速度 |
|------|--------|------|------|
| 自建CPU服务器 | ¥40 | 10+ | 3-8秒 |
| 自建GPU服务器 | ¥200 | 50+ | 0.5-2秒 |
| Railway免费版 | ¥0 | 5 | 3-8秒 |
| remove.bg API | ¥1400+ | ∞ | 1-3秒 |

**推荐**：自建CPU服务器（性价比最高）

## 🔐 安全配置

### 1. 添加API认证

```python
# backend/app.py
API_KEY = os.environ.get('API_KEY', 'your-secret-key')

@app.before_request
def check_auth():
    if request.path == '/health':
        return None
    
    token = request.headers.get('Authorization')
    if token != f'Bearer {API_KEY}':
        return jsonify({'error': 'Unauthorized'}), 401
```

前端配置：
```typescript
fetch('/api/remove-background', {
  headers: {
    'Authorization': 'Bearer your-secret-key'
  },
  ...
})
```

### 2. 限制请求频率

```bash
pip install Flask-Limiter
```

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour"]
)

@app.route('/remove-background', methods=['POST'])
@limiter.limit("10 per minute")
def remove_background():
    ...
```

## 🐛 常见问题

### Q: 服务启动失败？
A: 检查端口是否被占用：`lsof -i:5000`

### Q: 内存不足？
A: 减少worker数量：`gunicorn -w 2`

### Q: 处理太慢？
A: 考虑使用GPU或增加worker数量

### Q: 图片上传失败？
A: 检查Nginx的`client_max_body_size`配置

## 📞 技术支持

- rembg文档：https://github.com/danielgatis/rembg
- Flask文档：https://flask.palletsprojects.com/
- Gunicorn文档：https://docs.gunicorn.org/

## ✅ 验证部署

```bash
# 1. 检查服务状态
curl https://your-domain.com/api/remove-background/health

# 2. 测试抠图
curl -X POST \
  -F "image=@test.jpg" \
  https://your-domain.com/api/remove-background \
  -o output.png

# 3. 验证图片
file output.png  # 应该显示PNG图片
```

部署成功后，手机访问前端应用，体验流畅的抠图功能！🎉

