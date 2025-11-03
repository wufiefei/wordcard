"""
rembg 抠图服务
使用开源的 rembg 库提供抠图API

安装依赖：
pip install rembg[gpu] flask flask-cors pillow
或（CPU版本）：
pip install rembg flask flask-cors pillow

运行：
python app.py
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 允许跨域

@app.route('/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({'status': 'ok', 'service': 'rembg-api'})

@app.route('/remove-background', methods=['POST'])
def remove_background():
    """
    抠图API
    接收图片文件，返回去除背景后的PNG图片
    """
    try:
        # 检查是否有文件上传
        if 'image' not in request.files:
            return jsonify({'error': '没有上传图片'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'error': '文件名为空'}), 400
        
        # 读取图片
        logger.info(f'开始处理图片: {file.filename}')
        input_image = Image.open(file.stream)
        
        # 压缩图片（如果太大）
        max_size = 800
        if max(input_image.size) > max_size:
            ratio = max_size / max(input_image.size)
            new_size = tuple(int(dim * ratio) for dim in input_image.size)
            input_image = input_image.resize(new_size, Image.Resampling.LANCZOS)
            logger.info(f'图片已压缩到: {new_size}')
        
        # 转换为RGB（如果是RGBA）
        if input_image.mode == 'RGBA':
            # 创建白色背景
            bg = Image.new('RGB', input_image.size, (255, 255, 255))
            bg.paste(input_image, mask=input_image.split()[3])
            input_image = bg
        elif input_image.mode != 'RGB':
            input_image = input_image.convert('RGB')
        
        # 执行抠图
        logger.info('开始抠图...')
        output_image = remove(input_image)
        logger.info('抠图完成')
        
        # 智能裁剪空白区域
        output_image = trim_transparent(output_image)
        logger.info('裁剪空白区域完成')
        
        # 转换为字节流
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG', optimize=True)
        img_io.seek(0)
        
        logger.info(f'处理成功，文件大小: {img_io.getbuffer().nbytes / 1024:.2f}KB')
        
        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=False,
            download_name='removed_bg.png'
        )
        
    except Exception as e:
        logger.error(f'处理失败: {str(e)}', exc_info=True)
        return jsonify({'error': '处理失败', 'message': str(e)}), 500

def trim_transparent(image):
    """
    裁剪图片的透明区域，保留内容居中
    """
    try:
        # 获取边界框
        bbox = image.getbbox()
        
        if bbox:
            # 添加5%的边距
            width, height = image.size
            padding = max(5, int((bbox[2] - bbox[0]) * 0.05))
            
            bbox = (
                max(0, bbox[0] - padding),
                max(0, bbox[1] - padding),
                min(width, bbox[2] + padding),
                min(height, bbox[3] + padding)
            )
            
            # 裁剪
            cropped = image.crop(bbox)
            logger.info(f'裁剪: {image.size} → {cropped.size}')
            return cropped
        
        return image
        
    except Exception as e:
        logger.warning(f'裁剪失败，返回原图: {str(e)}')
        return image

if __name__ == '__main__':
    logger.info('启动 rembg 抠图服务...')
    logger.info('访问 http://localhost:5000/health 检查服务状态')
    logger.info('POST /remove-background 进行抠图')
    
    # 开发环境
    app.run(host='0.0.0.0', port=5000, debug=False)
    
    # 生产环境使用 gunicorn:
    # gunicorn -w 4 -b 0.0.0.0:5000 app:app

