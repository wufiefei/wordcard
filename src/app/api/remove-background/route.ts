import { NextRequest, NextResponse } from 'next/server';

/**
 * 后端抠图API
 * POST /api/remove-background
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '没有上传图片' },
        { status: 400 }
      );
    }

    // 检查文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '图片太大，请上传5MB以内的图片' },
        { status: 400 }
      );
    }

    // 转换为Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 调用Python rembg服务
    const rembgUrl = process.env.REMBG_API_URL || 'http://localhost:5000/remove-background';
    
    const rembgFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    rembgFormData.append('image', blob, file.name);

    const response = await fetch(rembgUrl, {
      method: 'POST',
      body: rembgFormData,
      // 设置超时时间
      signal: AbortSignal.timeout(30000), // 30秒超时
    });

    if (!response.ok) {
      throw new Error(`抠图服务返回错误: ${response.status}`);
    }

    // 返回处理后的图片
    const resultBuffer = await response.arrayBuffer();
    
    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': resultBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('抠图API错误:', error);
    
    return NextResponse.json(
      { 
        error: '抠图失败',
        message: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 配置最大请求大小
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

