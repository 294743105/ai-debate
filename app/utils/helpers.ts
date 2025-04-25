/**
 * 生成简单的UUID
 * 这个实现不如标准库的uuid包严谨，但在我们的应用场景中已经足够
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

import { DebateState } from '../types';

/**
 * 导出辩论记录为txt文件
 */
export function exportDebateToTxt(debate: DebateState, fileName?: string): void {
  // 跳过非assistant消息
  const debateMessages = debate.messages.filter(msg => msg.role === 'assistant');
  
  // 创建文本内容
  let content = `辩论主题: ${debate.topic}\n`;
  
  if (debate.mode === 'solo') {
    content += `正方: 模型1\n`;
    content += `反方: 模型2\n`;
  } else {
    content += `正方1: 模型1\n`;
    content += `反方1: 模型2\n`;
    content += `正方2: 模型3\n`;
    content += `反方2: 模型4\n`;
  }
  
  content += `\n=================== 辩论开始 ===================\n\n`;
  
  // 遍历消息生成内容
  debateMessages.forEach((message, index) => {
    let side: string;
    
    switch(message.side) {
      case 'pro1': 
        side = debate.mode === 'team' ? '正方1' : '正方';
        break;
      case 'con1': 
        side = debate.mode === 'team' ? '反方1' : '反方';
        break;
      case 'pro2': 
        side = '正方2';
        break;
      case 'con2': 
        side = '反方2';
        break;
      default:
        side = '未知';
    }
    
    content += `[回合 ${Math.floor(index/2) + 1}] ${side}:\n`;
    content += `${message.content}\n\n`;
  });
  
  content += `=================== 辩论结束 ===================\n`;
  
  // 创建文件名
  const date = new Date();
  const defaultFileName = `辩论记录_${debate.topic.substring(0, 20)}_${date.getFullYear()}${padZero(date.getMonth()+1)}${padZero(date.getDate())}.txt`;
  
  // 创建下载链接
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || defaultFileName;
  
  // 触发下载
  document.body.appendChild(link);
  link.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * 辅助函数：补零
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
} 