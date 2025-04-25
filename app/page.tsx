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
  const [pro1Model, setPro1Model] = useState<ModelConfigType>({
    id: generateId(),
    name: 'GPT-3.5 (正方1)',
    modelId: 'gpt-3.5-turbo',
    apiEndpoint: 'https://api.openai.com/v1',
    apiKey: '',
  });

  const [con1Model, setCon1Model] = useState<ModelConfigType>({
    id: generateId(),
    name: 'GPT-4 (反方1)',
    modelId: 'gpt-4',
    apiEndpoint: 'https://api.openai.com/v1',
    apiKey: '',
  });
  
  const [pro2Model, setPro2Model] = useState<ModelConfigType>({
    id: generateId(),
    name: 'GPT-3.5 (正方2)',
    modelId: 'gpt-3.5-turbo',
    apiEndpoint: 'https://api.openai.com/v1',
    apiKey: '',
  });

  const [con2Model, setCon2Model] = useState<ModelConfigType>({
    id: generateId(),
    name: 'GPT-4 (反方2)',
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
    currentSide: 'pro1', // 正方1先开始
    mode: 'solo', // 默认为1v1模式
  });

  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  // 加载已保存的模型
  useEffect(() => {
    // 加载当前使用的模型
    const savedPro1Model = localStorage.getItem('pro1Model');
    const savedCon1Model = localStorage.getItem('con1Model');
    const savedPro2Model = localStorage.getItem('pro2Model');
    const savedCon2Model = localStorage.getItem('con2Model');
    const savedDebateMode = localStorage.getItem('debateMode');

    if (savedPro1Model) {
      try {
        const parsed = JSON.parse(savedPro1Model);
        if (!parsed.id) parsed.id = generateId(); // 确保有ID
        setPro1Model(parsed);
      } catch (e) {
        console.error('无法解析保存的正方1模型:', e);
      }
    }
    
    if (savedCon1Model) {
      try {
        const parsed = JSON.parse(savedCon1Model);
        if (!parsed.id) parsed.id = generateId(); // 确保有ID
        setCon1Model(parsed);
      } catch (e) {
        console.error('无法解析保存的反方1模型:', e);
      }
    }
    
    if (savedPro2Model) {
      try {
        const parsed = JSON.parse(savedPro2Model);
        if (!parsed.id) parsed.id = generateId(); // 确保有ID
        setPro2Model(parsed);
      } catch (e) {
        console.error('无法解析保存的正方2模型:', e);
      }
    }
    
    if (savedCon2Model) {
      try {
        const parsed = JSON.parse(savedCon2Model);
        if (!parsed.id) parsed.id = generateId(); // 确保有ID
        setCon2Model(parsed);
      } catch (e) {
        console.error('无法解析保存的反方2模型:', e);
      }
    }
    
    if (savedDebateMode) {
      try {
        setDebate(prev => ({
          ...prev,
          mode: savedDebateMode as 'solo' | 'team'
        }));
      } catch (e) {
        console.error('无法解析保存的辩论模式:', e);
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
    try {
      localStorage.setItem('pro1Model', JSON.stringify(pro1Model));
      localStorage.setItem('con1Model', JSON.stringify(con1Model));
      localStorage.setItem('pro2Model', JSON.stringify(pro2Model));
      localStorage.setItem('con2Model', JSON.stringify(con2Model));
      localStorage.setItem('debateMode', debate.mode);
      
      // 显示成功消息
      setSaveStatusMessage('配置已成功保存！');
      // 3秒后清除消息
      setTimeout(() => {
        setSaveStatusMessage(null);
      }, 3000);
    } catch (err) {
      setError(`保存配置失败: ${err instanceof Error ? err.message : String(err)}`);
      // 3秒后清除错误消息
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
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
  
  // 切换辩论模式
  const toggleDebateMode = () => {
    setDebate(prev => ({
      ...prev,
      mode: prev.mode === 'solo' ? 'team' : 'solo',
      currentSide: 'pro1'  // 重置当前方为正方1
    }));
  };

  // 获取下一个发言方
  const getNextSide = (currentSide: 'pro1' | 'con1' | 'pro2' | 'con2'): 'pro1' | 'con1' | 'pro2' | 'con2' => {
    if (debate.mode === 'solo') {
      return currentSide === 'pro1' ? 'con1' : 'pro1';
    } else {
      // 2v2模式，正反交替：正1->反1->正2->反2->正1...
      switch (currentSide) {
        case 'pro1': return 'con1';
        case 'con1': return 'pro2';
        case 'pro2': return 'con2';
        case 'con2': return 'pro1';
        default: return 'pro1';
      }
    }
  };
  
  // 获取当前发言方对应的模型
  const getCurrentModel = (side: 'pro1' | 'con1' | 'pro2' | 'con2'): ModelConfigType => {
    switch (side) {
      case 'pro1': return pro1Model;
      case 'con1': return con1Model;
      case 'pro2': return pro2Model;
      case 'con2': return con2Model;
      default: return pro1Model;
    }
  };

  // 开始辩论
  const startDebate = async () => {
    if (!debate.topic.trim()) {
      setError('请输入辩论主题');
      return;
    }

    if (debate.mode === 'solo' && (!pro1Model.apiKey || !con1Model.apiKey)) {
      setError('请为两方配置API密钥');
      return;
    }

    if (debate.mode === 'team' && (!pro1Model.apiKey || !con1Model.apiKey || !pro2Model.apiKey || !con2Model.apiKey)) {
      setError('请为所有四个模型配置API密钥');
      return;
    }

    // 重置辩论状态，确保清空所有历史消息
    setError(null);
    setDebate(prev => ({
      ...prev,
      topic: prev.topic, // 保留主题
      messages: [], // 清空消息
      isDebating: true,
      currentSide: 'pro1', // 正方1先开始
    }));

    // 等待状态更新完成后再获取响应
    setTimeout(async () => {
      await getFirstResponse();
    }, 100);
  };

  // 获取第一回合响应（正方1先发言）
  const getFirstResponse = async () => {
    try {
      setIsLoading(true);
      
      // 创建系统提示信息
      const systemPrompt: DebateMessageType = {
        role: 'system',
        content: `辩论主题是: "${debate.topic}"。你是正方辩手，请提供支持这个观点的开场论述。`,
        side: 'pro1'
      };
      
      const sideLabel = debate.mode === 'team' ? '正方1' : '正方';
      
      const response = await getDebateResponse(
        pro1Model,
        [systemPrompt], // 只传递系统提示
        'pro1',
        debate.topic,
        sideLabel
      );

      // 添加模型回应
      const newMessage: DebateMessageType = {
        role: 'assistant',
        content: response,
        side: 'pro1',
      };

      setDebate(prev => ({
        ...prev,
        messages: [newMessage],
        currentSide: getNextSide('pro1'),
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
      
      const currentSide = debate.currentSide;
      const currentModel = getCurrentModel(currentSide);
      
      // 侧边的标签（用于API请求）
      let sideLabel: string;
      switch (currentSide) {
        case 'pro1': sideLabel = debate.mode === 'team' ? '正方1' : '正方'; break;
        case 'con1': sideLabel = debate.mode === 'team' ? '反方1' : '反方'; break;
        case 'pro2': sideLabel = '正方2'; break;
        case 'con2': sideLabel = '反方2'; break;
        default: sideLabel = '正方';
      }
      
      // 是否为正方
      const isPro = currentSide.startsWith('pro');
      
      // 创建一个包含系统提示的消息数组
      const messagesWithPrompt = [
        {
          role: 'system' as const,
          content: `辩论主题是: "${debate.topic}"。
          你是${sideLabel}，请基于之前的发言进行回应。
          ${isPro 
            ? '你必须支持这个观点，提供有说服力的论据和例子。' 
            : '你必须反对这个观点，提供有说服力的论据和例子。'}`,
          side: currentSide
        },
        ...debate.messages
      ];
      
      const response = await getDebateResponse(
        currentModel,
        messagesWithPrompt,
        currentSide,
        debate.topic,
        sideLabel
      );

      // 添加模型回应
      const newMessage: DebateMessageType = {
        role: 'assistant',
        content: response,
        side: currentSide,
      };

      // 切换到下一方
      const nextSide = getNextSide(currentSide);

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
    setDebate(prev => ({
      ...prev,
      messages: [],
      isDebating: false,
    }));
  };

  // 导出辩论记录
  const exportDebate = () => {
    const fileName = `辩论_${debate.topic.substring(0, 20)}_${new Date().toISOString().split('T')[0]}`;
    exportDebateToTxt(debate, fileName);
  };

  // 渲染消息
  const renderMessages = () => {
    return debate.messages.map((message, index) => (
      <DebateMessage 
        key={index} 
        message={message} 
        mode={debate.mode} 
      />
    ));
  };

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-6">
      <div className="flex flex-col max-w-5xl w-full mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">AI辩论对决</h1>
        
        {/* 模式选择 */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => !debate.isDebating && !isLoading && toggleDebateMode()}
              disabled={debate.isDebating || isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                debate.mode === 'solo' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              1v1模式
            </button>
            <button
              type="button"
              onClick={() => !debate.isDebating && !isLoading && toggleDebateMode()}
              disabled={debate.isDebating || isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                debate.mode === 'team' 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              2v2模式
            </button>
          </div>
        </div>
        
        <div className="flex flex-col mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">辩论主题</label>
            <input
              type="text"
              value={debate.topic}
              onChange={(e) => setDebate(prev => ({...prev, topic: e.target.value}))}
              placeholder="例如：人工智能会取代人类吗？"
              disabled={debate.isDebating}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* 模型配置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModelConfig
              model={pro1Model}
              onModelChange={setPro1Model}
              storedModels={storedModels}
              onSaveModel={saveModel}
              onDeleteModel={deleteModel}
              disabled={debate.isDebating}
              title={debate.mode === 'team' ? "正方1模型配置" : "正方模型配置"}
            />
            
            <ModelConfig
              model={con1Model}
              onModelChange={setCon1Model}
              storedModels={storedModels}
              onSaveModel={saveModel}
              onDeleteModel={deleteModel}
              disabled={debate.isDebating}
              title={debate.mode === 'team' ? "反方1模型配置" : "反方模型配置"}
            />
            
            {debate.mode === 'team' && (
              <>
                <ModelConfig
                  model={pro2Model}
                  onModelChange={setPro2Model}
                  storedModels={storedModels}
                  onSaveModel={saveModel}
                  onDeleteModel={deleteModel}
                  disabled={debate.isDebating}
                  title="正方2模型配置"
                />
                
                <ModelConfig
                  model={con2Model}
                  onModelChange={setCon2Model}
                  storedModels={storedModels}
                  onSaveModel={saveModel}
                  onDeleteModel={deleteModel}
                  disabled={debate.isDebating}
                  title="反方2模型配置"
                />
              </>
            )}
          </div>

          <div className="flex space-x-2 justify-center">
            <button
              onClick={saveConfig}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              保存配置
            </button>
            
            {/* 显示保存状态消息 */}
            {saveStatusMessage && (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded animate-pulse">
                {saveStatusMessage}
              </div>
            )}
            
            <button
              onClick={startDebate}
              disabled={debate.isDebating || isLoading || !debate.topic.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              开始辩论
            </button>
            
            {debate.isDebating && (
              <>
                <button
                  onClick={getNextResponse}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-purple-300"
                >
                  {isLoading ? '思考中...' : '下一回合'}
                </button>
                
                <button
                  onClick={stopDebate}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  停止辩论
                </button>
              </>
            )}
            
            {debate.messages.length > 0 && (
              <>
                <button
                  onClick={clearDebate}
                  disabled={isLoading || debate.isDebating}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                >
                  清空
                </button>
                
                <button
                  onClick={exportDebate}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  导出
                </button>
              </>
            )}
          </div>
          
          {error && (
            <div className="text-red-500 text-sm my-2">
              {error}
            </div>
          )}
        </div>

        {/* 辩论消息区域 */}
        <div className="border rounded-lg p-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {debate.messages.length > 0 ? (
            renderMessages()
          ) : (
            <div className="text-center text-gray-500 h-full flex items-center justify-center">
              <p>辩论消息将显示在这里</p>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="loader"></div>
              <p className="ml-2">思考中...</p>
            </div>
          )}
        </div>
        
        {/* 状态指示器 */}
        {debate.isDebating && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              当前正在辩论: <span className="font-bold">{debate.topic}</span> | 
              下一回合: <span className="font-bold">
                {debate.currentSide === 'pro1' ? (debate.mode === 'team' ? '正方1' : '正方') : 
                 debate.currentSide === 'con1' ? (debate.mode === 'team' ? '反方1' : '反方') :
                 debate.currentSide === 'pro2' ? '正方2' : '反方2'}
              </span>
            </p>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .loader {
          border: 3px solid #f3f3f3;
          border-radius: 50%;
          border-top: 3px solid #3498db;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
