'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ModelConfig as ModelConfigType, DebateMessage as DebateMessageType, DebateState, StoredModels } from './types';
import ModelConfig from './components/ModelConfig';
import DebateMessage from './components/DebateMessage';
import { getDebateResponse } from './utils/openaiClient';
import { generateId, exportDebateToTxt } from './utils/helpers';

export default function Home() {
  // 默认模型配置
  const [proModel, setProModel] = useState<ModelConfigType>({
    id: generateId(),
    name: 'GPT-3.5 (正方)',
    modelId: 'gpt-3.5-turbo',
    apiEndpoint: 'https://api.openai.com/v1',
    apiKey: '',
  });

  const [conModel, setConModel] = useState<ModelConfigType>({
    id: generateId(),
    name: 'GPT-4 (反方)',
    modelId: 'gpt-4',
    apiEndpoint: 'https://api.openai.com/v1',
    apiKey: '',
  });

  // 存储所有模型
  const [storedModels, setStoredModels] = useState<StoredModels>({});

  // 辩论状态
  const [debate, setDebate] = useState<DebateState>({
    topic: '',
    messages: [],
    isDebating: false,
    currentSide: 'pro', // 正方先开始
  });

  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载已保存的模型
  useEffect(() => {
    // 加载当前使用的模型
    const savedProModel = localStorage.getItem('proModel');
    const savedConModel = localStorage.getItem('conModel');

    if (savedProModel) {
      try {
        const parsed = JSON.parse(savedProModel);
        if (!parsed.id) parsed.id = generateId(); // 确保有ID
        setProModel(parsed);
      } catch (e) {
        console.error('无法解析保存的正方模型:', e);
      }
    }
    
    if (savedConModel) {
      try {
        const parsed = JSON.parse(savedConModel);
        if (!parsed.id) parsed.id = generateId(); // 确保有ID
        setConModel(parsed);
      } catch (e) {
        console.error('无法解析保存的反方模型:', e);
      }
    }

    // 加载所有已保存的模型
    const savedModels = localStorage.getItem('savedModels');
    if (savedModels) {
      try {
        const parsed = JSON.parse(savedModels);
        setStoredModels(parsed);
      } catch (e) {
        console.error('无法解析保存的模型列表:', e);
      }
    }
  }, []);

  // 手动保存当前配置
  const saveConfig = () => {
    localStorage.setItem('proModel', JSON.stringify(proModel));
    localStorage.setItem('conModel', JSON.stringify(conModel));
  };

  // 保存模型到存储中
  const saveModel = (model: ModelConfigType) => {
    // 确保模型有ID
    const modelToSave = { ...model };
    if (!modelToSave.id) {
      modelToSave.id = generateId();
    }

    // 更新存储中的模型
    const updatedModels = { 
      ...storedModels,
      [modelToSave.id]: modelToSave 
    };
    
    setStoredModels(updatedModels);
    localStorage.setItem('savedModels', JSON.stringify(updatedModels));
  };

  // 删除模型
  const deleteModel = (modelId: string) => {
    const updatedModels = { ...storedModels };
    delete updatedModels[modelId];
    
    setStoredModels(updatedModels);
    localStorage.setItem('savedModels', JSON.stringify(updatedModels));
  };

  // 开始辩论
  const startDebate = async () => {
    if (!debate.topic.trim()) {
      setError('请输入辩论主题');
      return;
    }

    if (!proModel.apiKey || !conModel.apiKey) {
      setError('请为两方配置API密钥');
      return;
    }

    // 重置辩论状态，确保清空所有历史消息
    setError(null);
    setDebate({
      topic: debate.topic, // 保留主题
      messages: [], // 清空消息
      isDebating: true,
      currentSide: 'pro', // 正方先开始
    });

    // 等待状态更新完成后再获取响应
    setTimeout(async () => {
      await getFirstResponse();
    }, 100);
  };

  // 获取第一回合响应（正方先发言）
  const getFirstResponse = async () => {
    try {
      setIsLoading(true);
      
      // 创建系统提示信息
      const systemPrompt: DebateMessageType = {
        role: 'system',
        content: `辩论主题是: "${debate.topic}"。你是正方，请提供支持这个观点的开场论述。`,
        side: 'pro'
      };
      
      const response = await getDebateResponse(
        proModel,
        [systemPrompt], // 只传递系统提示
        'pro',
        debate.topic
      );

      // 添加模型回应
      const newMessage: DebateMessageType = {
        role: 'assistant',
        content: response,
        side: 'pro',
      };

      setDebate(prev => ({
        ...prev,
        messages: [newMessage],
        currentSide: 'con', // 切换到反方
      }));
      
      setIsLoading(false);
    } catch (err) {
      setError(`发生错误: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
      setDebate(prev => ({
        ...prev,
        isDebating: false
      }));
    }
  };

  // 获取下一个回应
  const getNextResponse = async () => {
    try {
      setIsLoading(true);
      
      const currentModel = debate.currentSide === 'pro' ? proModel : conModel;
      
      // 创建一个包含系统提示的消息数组
      const messagesWithPrompt = [
        {
          role: 'system' as const,
          content: `辩论主题是: "${debate.topic}"。
          你是${debate.currentSide === 'pro' ? '正方' : '反方'}，请基于之前的发言进行回应。`,
          side: debate.currentSide
        },
        ...debate.messages
      ];
      
      const response = await getDebateResponse(
        currentModel,
        messagesWithPrompt,
        debate.currentSide,
        debate.topic
      );

      // 添加模型回应
      const newMessage: DebateMessageType = {
        role: 'assistant',
        content: response,
        side: debate.currentSide,
      };

      // 切换到下一方
      const nextSide = debate.currentSide === 'pro' ? 'con' : 'pro';

      setDebate(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
        currentSide: nextSide,
      }));
      
      setIsLoading(false);
    } catch (err) {
      setError(`发生错误: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  // 停止辩论
  const stopDebate = () => {
    setDebate(prev => ({
      ...prev,
      isDebating: false,
    }));
  };

  // 清空辩论
  const clearDebate = () => {
    setDebate({
      ...debate,
      messages: [],
      isDebating: false,
    });
  };

  // 导出辩论记录
  const handleExportDebate = () => {
    if (debate.messages.length === 0) {
      setError('没有辩论记录可导出');
      return;
    }
    
    exportDebateToTxt(
      debate.topic,
      debate.messages,
      proModel.name,
      conModel.name
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-blue-500 to-red-500 text-white p-4">
        <h1 className="text-2xl font-bold text-center">AI辩论擂台</h1>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col">
        {/* 模型配置 */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <ModelConfig 
              proModel={proModel}
              conModel={conModel}
              onProModelChange={setProModel}
              onConModelChange={setConModel}
              onSaveConfig={saveConfig}
              storedModels={storedModels}
              onSaveModel={saveModel}
              onDeleteModel={deleteModel}
            />
          </div>
          
          <div className="flex gap-2 ml-4 mt-1">
            <button 
              onClick={handleExportDebate}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm flex items-center"
              disabled={debate.messages.length === 0}
              title={debate.messages.length === 0 ? "没有辩论记录可导出" : "导出辩论记录"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出记录
            </button>
          </div>
        </div>

        {/* 辩论主题输入 */}
        <div className="my-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 w-full">
              <label htmlFor="topic" className="block text-sm font-medium mb-1">
                辩论主题
              </label>
              <input
                id="topic"
                type="text"
                value={debate.topic}
                onChange={(e) => setDebate({...debate, topic: e.target.value})}
                disabled={debate.isDebating}
                className="w-full p-3 border rounded-md"
                placeholder="例如：人工智能将会取代人类工作"
              />
            </div>
            <div className="flex gap-2 self-start md:self-end">
              <button
                onClick={startDebate}
                disabled={debate.isDebating || isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
              >
                开始辩论
              </button>
              {debate.isDebating && (
                <>
                  <button
                    onClick={getNextResponse}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
                  >
                    下一回合
                  </button>
                  <button
                    onClick={stopDebate}
                    disabled={isLoading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
                  >
                    暂停辩论
                  </button>
                </>
              )}
              {debate.messages.length > 0 && (
                <button
                  onClick={clearDebate}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
                >
                  清空辩论
                </button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="mt-2 text-red-500">{error}</div>
          )}
        </div>

        {/* 辩论消息区域 */}
        <div className="flex-1 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
          {/* 辩论信息 */}
          {debate.messages.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded-lg">
              <h2 className="text-lg font-semibold text-black">辩论主题: {debate.topic}</h2>
              <div className="flex justify-between mt-2">
                <div className="text-black">正方: <span className="text-blue-500">{proModel.name}</span></div>
                <div className="text-black">反方: <span className="text-red-500">{conModel.name}</span></div>
              </div>
            </div>
          )}

          {/* 加载指示器 */}
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {/* 消息列表 */}
          <div className="space-y-4">
            {debate.messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p>尚未开始辩论</p>
                <p className="text-sm mt-2">输入辩论主题并设置好API配置后点击"开始辩论"</p>
              </div>
            ) : (
              debate.messages.map((message, index) => (
                <DebateMessage 
                  key={index} 
                  message={message} 
                  modelName={message.side === 'pro' ? proModel.name : conModel.name} 
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
        AI辩论擂台 &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
