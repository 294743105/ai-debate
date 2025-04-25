import OpenAI from 'openai';
import { ModelConfig, DebateMessage } from '../types';

export async function getDebateResponse(
  modelConfig: ModelConfig,
  messages: DebateMessage[],
  side: 'pro1' | 'con1' | 'pro2' | 'con2',
  topic: string,
  sideLabel?: string
): Promise<string> {
  try {
    // 使用OpenAI SDK的方式（但可能有CORS问题）
    if (modelConfig.apiEndpoint.includes('openai.com')) {
      const openai = new OpenAI({
        apiKey: modelConfig.apiKey,
        baseURL: modelConfig.apiEndpoint,
        dangerouslyAllowBrowser: true, // 允许在浏览器环境中使用
      });

      const isPro = side.startsWith('pro');
      const displaySide = sideLabel || (isPro ? '正方' : '反方');

      // 将消息格式转换为OpenAI API格式
      const formattedMessages = [
        {
          role: 'system' as const,
          content: `你是一场辩论中的${displaySide}。
          辩论主题是: "${topic}"。
          ${isPro 
            ? '你应该支持这个观点，提供有说服力的论据和例子。' 
            : '你应该反对这个观点，提供有说服力的论据和例子。'}
          保持你的回应简洁、有逻辑性，并直接针对前一个发言进行反驳。
          每次回应限制在300字以内。`
        },
        ...messages
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
      ];

      const response = await openai.chat.completions.create({
        model: modelConfig.modelId,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800,
      });

      return response.choices[0]?.message?.content || '无法生成回应，请检查API配置。';
    } 
    // 使用我们的API代理（解决CORS问题）
    else {
      const isPro = side.startsWith('pro');
      const displaySide = sideLabel || (isPro ? '正方' : '反方');
      
      // 将消息格式转换为API格式
      const formattedMessages = [
        {
          role: 'system',
          content: `你是一场辩论中的${displaySide}。
          辩论主题是: "${topic}"。
          ${isPro 
            ? '你应该支持这个观点，提供有说服力的论据和例子。' 
            : '你应该反对这个观点，提供有说服力的论据和例子。'}
          保持你的回应简洁、有逻辑性，并直接针对前一个发言进行反驳。
          每次回应限制在300字以内。`
        },
        ...messages
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
      ];

      // 通过我们的API代理发送请求
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: `${modelConfig.apiEndpoint}/chat/completions`,
          apiKey: modelConfig.apiKey,
          model: modelConfig.modelId,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API请求失败: ${errorData.error || response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '无法生成回应，请检查API配置。';
    }
  } catch (error) {
    console.error('OpenAI API错误:', error);
    return `API调用出错: ${error instanceof Error ? error.message : String(error)}`;
  }
} 