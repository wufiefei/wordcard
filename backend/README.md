# rembg 抠图服务

开源的图片背景移除API服务，基于 [rembg](https://github.com/danielgatis/rembg)。

## 🚀 快速开始

### 方法1：直接运行（推荐开发）

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 启动服务
python app.py

# 服务将在 http://localhost:5000 启动
```

### 方法2：使用Docker（推荐生产）

```bash
# 构建镜像
docker build -t rembg-api .

# 运行容器
docker run -p 5000:5000 rembg-api

# 或使用docker-compose
docker-compose up -d
```

## 📝 API文档

### 健康检查

```bash
GET http://localhost:5000/health
```

### 抠图接口

```bash
POST http://localhost:5000/remove-background
Content-Type: multipart/form-data

参数：
- image: 图片文件（支持jpg, png, webp等）

返回：
- 去除背景后的PNG图片
```

示例：
```bash
curl -X POST \
  -F "image=@test.jpg" \
  http://localhost:5000/remove-background \
  -o output.png
```

## ⚙️ 配置

### CPU vs GPU

- **CPU版本**（默认）：
  ```bash
  pip install rembg
  ```

- **GPU版本**（速度快3-5倍）：
  ```bash
  pip install rembg[gpu]
  # 需要CUDA环境
  ```

### 性能优化

1. **使用GPU**：速度提升3-5倍
2. **增加workers**：
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```
3. **调整超时**：
   ```bash
   gunicorn -w 2 -b 0.0.0.0:5000 --timeout 120 app:app
   ```

## 📊 性能指标

| 配置 | 处理时间 | 并发能力 |
|------|---------|---------|
| CPU (1 worker) | 3-8秒 | 1 req/s |
| CPU (4 workers) | 3-8秒 | 4 req/s |
| GPU (1 worker) | 0.5-2秒 | 5 req/s |
| GPU (4 workers) | 0.5-2秒 | 20 req/s |

## 🔧 环境变量

在 `.env` 文件中配置：

```bash
# Flask配置
FLASK_ENV=production
FLASK_DEBUG=false

# 服务端口
PORT=5000

# 日志级别
LOG_LEVEL=INFO
```

## 🐳 Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  rembg-api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    restart: unless-stopped
    # GPU支持（可选）
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: 1
    #           capabilities: [gpu]
```

## 🌐 部署

### 部署到云服务器

1. **阿里云/腾讯云**：
   ```bash
   # 上传代码
   scp -r backend root@your-server:/opt/
   
   # SSH连接
   ssh root@your-server
   
   # 安装依赖并启动
   cd /opt/backend
   pip install -r requirements.txt
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **使用Nginx反向代理**：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api/remove-background {
           proxy_pass http://127.0.0.1:5000/remove-background;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           client_max_body_size 10M;
       }
   }
   ```

### 免费部署选项

1. **Railway.app**：支持Docker，免费额度充足
2. **Render.com**：支持Docker，免费实例
3. **Fly.io**：支持GPU（付费），全球CDN

## 💰 成本估算

- **自建服务器**：
  - CPU服务器：¥30-50/月
  - GPU服务器：¥200-500/月

- **Serverless**：
  - 按调用次数计费
  - 约 ¥0.01-0.05/次

- **对比商业API**：
  - remove.bg：$0.20/张
  - rembg自建：几乎免费

## 🔐 安全建议

1. **添加认证**：
   ```python
   @app.before_request
   def check_auth():
       token = request.headers.get('Authorization')
       if token != 'your-secret-token':
           return jsonify({'error': 'Unauthorized'}), 401
   ```

2. **限制请求频率**：
   ```bash
   pip install Flask-Limiter
   ```

3. **文件大小限制**：已在代码中实现（5MB）

## 📚 相关资源

- [rembg GitHub](https://github.com/danielgatis/rembg)
- [Flask文档](https://flask.palletsprojects.com/)
- [Gunicorn文档](https://docs.gunicorn.org/)

