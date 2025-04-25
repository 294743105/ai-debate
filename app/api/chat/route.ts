import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, model, messages, temperature, max_tokens } = body;

    if (!endpoint || !apiKey || !model || !messages) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 构建请求参数
    const requestBody = {
      model,
      messages,
      temperature: temperature || 0.7,
      max_tokens: max_tokens || 800,
    };

    // 发送请求到实际的API端点
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: `API请求失败: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API代理错误:', error);
    return NextResponse.json(
      { error: `服务器错误: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 