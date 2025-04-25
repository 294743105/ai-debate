'use client';

import { DebateMessage as DebateMessageType } from '../types';

interface DebateMessageProps {
  message: DebateMessageType;
  mode: 'solo' | 'team';
}

export default function DebateMessage({ message, mode }: DebateMessageProps) {
  // 只显示assistant的消息
  if (message.role !== 'assistant') return null;
  
  // 确定侧边和显示名称
  const isPro = message.side.startsWith('pro');
  
  let displaySide: string;
  let displayNumber: string = '';
  
  if (mode === 'team') {
    switch(message.side) {
      case 'pro1': 
        displaySide = '正方1';
        displayNumber = '1';
        break;
      case 'con1': 
        displaySide = '反方1';
        displayNumber = '1';
        break;
      case 'pro2': 
        displaySide = '正方2';
        displayNumber = '2';
        break;
      case 'con2': 
        displaySide = '反方2';
        displayNumber = '2';
        break;
      default:
        displaySide = '未知';
    }
  } else {
    displaySide = isPro ? '正方' : '反方';
  }
  
  return (
    <div 
      className={`mb-4 p-4 rounded-lg ${
        isPro 
          ? 'bg-blue-50 border-blue-200 border mr-auto' 
          : 'bg-red-50 border-red-200 border ml-auto'
      } max-w-[80%]`}
    >
      <div className="flex items-center mb-2">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
            isPro ? 'bg-blue-500' : 'bg-red-500'
          } mr-2`}
        >
          {isPro ? `正${displayNumber}` : `反${displayNumber}`}
        </div>
        <div>
          <p className="font-semibold">{displaySide}</p>
        </div>
      </div>
      <div className="whitespace-pre-line text-black">
        {message.content}
      </div>
    </div>
  );
} 