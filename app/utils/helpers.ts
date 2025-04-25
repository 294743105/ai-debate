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

/**
 * 导出辩论记录为txt文件
 */
export function exportDebateToTxt(
  topic: string, 
  messages: Array<{ role: string; content: string; side: 'pro' | 'con' }>, 
  proModelName: string, 
  conModelName: string
): void {
  // 跳过非assistant消息
  const debateMessages = messages.filter(msg => msg.role === 'assistant');
  
  // 创建文本内容
  let content = `辩论主题: ${topic}\n`;
  content += `正方: ${proModelName}\n`;
  content += `反方: ${conModelName}\n`;
  content += `\n=================== 辩论开始 ===================\n\n`;
  
  // 遍历消息生成内容
  debateMessages.forEach((message, index) => {
    const side = message.side === 'pro' ? '正方' : '反方';
    const modelName = message.side === 'pro' ? proModelName : conModelName;
    
    content += `[回合 ${Math.floor(index/2) + 1}] ${side} (${modelName}):\n`;
    content += `${message.content}\n\n`;
  });
  
  content += `=================== 辩论结束 ===================\n`;
  
  // 创建文件名
  const date = new Date();
  const filename = `辩论记录_${topic.substring(0, 20)}_${date.getFullYear()}${padZero(date.getMonth()+1)}${padZero(date.getDate())}.txt`;
  
  // 创建下载链接
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
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