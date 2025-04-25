'use client';

import { DebateMessage as DebateMessageType } from '../types';

interface DebateMessageProps {
  message: DebateMessageType;
  modelName: string;
}

export default function DebateMessage({ message, modelName }: DebateMessageProps) {
  // 只显示assistant的消息
  if (message.role !== 'assistant') return null;
  
  const isProSide = message.side === 'pro';
  
  return (
    <div 
      className={`mb-4 p-4 rounded-lg ${
        isProSide 
          ? 'bg-blue-50 border-blue-200 border mr-auto' 
          : 'bg-red-50 border-red-200 border ml-auto'
      } max-w-[80%]`}
    >
      <div className="flex items-center mb-2">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
            isProSide ? 'bg-blue-500' : 'bg-red-500'
          } mr-2`}
        >
          {isProSide ? '正' : '反'}
        </div>
        <div>
          <p className="font-semibold">{modelName} ({isProSide ? '正方' : '反方'})</p>
        </div>
      </div>
      <div className="whitespace-pre-line text-black">
        {message.content}
      </div>
    </div>
  );
} 