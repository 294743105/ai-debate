'use client';

import { useState } from 'react';
import { ModelConfig as ModelConfigType, StoredModels } from '../types';

interface ModelConfigProps {
  proModel: ModelConfigType;
  conModel: ModelConfigType;
  onProModelChange: (model: ModelConfigType) => void;
  onConModelChange: (model: ModelConfigType) => void;
  onSaveConfig: () => void;
  storedModels: StoredModels;
  onSaveModel: (model: ModelConfigType) => void;
  onDeleteModel: (modelId: string) => void;
}

export default function ModelConfig({
  proModel,
  conModel,
  onProModelChange,
  onConModelChange,
  onSaveConfig,
  storedModels,
  onSaveModel,
  onDeleteModel,
}: ModelConfigProps) {
  const [showProConfig, setShowProConfig] = useState(false);
  const [showConConfig, setShowConConfig] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showProModelSelect, setShowProModelSelect] = useState(false);
  const [showConModelSelect, setShowConModelSelect] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  const handleSave = () => {
    onSaveConfig();
    setSaveStatus('配置已保存！');
    
    // 3秒后清除保存状态消息
    setTimeout(() => {
      setSaveStatus('');
    }, 3000);
  };

  const handleSaveModel = (side: 'pro' | 'con') => {
    const model = side === 'pro' ? proModel : conModel;
    if (newModelName.trim()) {
      const modelToSave = {
        ...model,
        name: newModelName.trim()
      };
      onSaveModel(modelToSave);
      setNewModelName('');
      setSaveStatus(`${newModelName} 已保存为新模型！`);
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    } else {
      onSaveModel(model);
      setSaveStatus(`${model.name} 已保存！`);
      setTimeout(() => {
        setSaveStatus('');
      }, 3000);
    }
  };

  const handleSelectModel = (modelId: string, side: 'pro' | 'con') => {
    const selectedModel = storedModels[modelId];
    if (selectedModel) {
      if (side === 'pro') {
        onProModelChange(selectedModel);
        setShowProModelSelect(false);
      } else {
        onConModelChange(selectedModel);
        setShowConModelSelect(false);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-4">辩论模型配置</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
          >
            保存配置
          </button>
          {saveStatus && (
            <span className="text-green-600 text-sm">{saveStatus}</span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 正方模型配置 */}
        <div className="border p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">正方模型: {proModel.name}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowProModelSelect(!showProModelSelect)}
                className="text-blue-500 text-sm"
              >
                {showProModelSelect ? '隐藏选择' : '选择模型'}
              </button>
              <button 
                onClick={() => setShowProConfig(!showProConfig)}
                className="text-blue-500 text-sm"
              >
                {showProConfig ? '隐藏配置' : '显示配置'}
              </button>
            </div>
          </div>
          
          {showProModelSelect && (
            <div className="mb-4 p-2 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2 text-sm">选择已保存的模型</h4>
              {Object.keys(storedModels).length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {Object.entries(storedModels).map(([id, model]) => (
                    <div key={id} className="flex justify-between items-center p-2 border rounded-md bg-white">
                      <div>
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({model.modelId})</span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleSelectModel(id, 'pro')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
                        >
                          选择
                        </button>
                        <button 
                          onClick={() => onDeleteModel(id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">没有保存的模型</p>
              )}
            </div>
          )}
          
          {showProConfig && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">模型名称（显示用）</label>
                <input
                  type="text"
                  value={proModel.name}
                  onChange={(e) => onProModelChange({...proModel, name: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">模型ID</label>
                <input
                  type="text"
                  value={proModel.modelId}
                  onChange={(e) => onProModelChange({...proModel, modelId: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="例如: gpt-3.5-turbo"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">API端点</label>
                <input
                  type="text"
                  value={proModel.apiEndpoint}
                  onChange={(e) => onProModelChange({...proModel, apiEndpoint: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="例如: https://api.openai.com/v1"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">API密钥</label>
                <input
                  type="password"
                  value={proModel.apiKey}
                  onChange={(e) => onProModelChange({...proModel, apiKey: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="您的API密钥"
                />
              </div>

              <div className="pt-2 border-t mt-4">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="保存为新模型（可选）"
                    className="flex-1 p-2 border rounded-md text-sm"
                  />
                  <button
                    onClick={() => handleSaveModel('pro')}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm"
                  >
                    保存模型
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">不填写名称将以当前名称保存/更新</p>
              </div>
            </div>
          )}
        </div>
        
        {/* 反方模型配置 */}
        <div className="border p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">反方模型: {conModel.name}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowConModelSelect(!showConModelSelect)}
                className="text-blue-500 text-sm"
              >
                {showConModelSelect ? '隐藏选择' : '选择模型'}
              </button>
              <button 
                onClick={() => setShowConConfig(!showConConfig)}
                className="text-blue-500 text-sm"
              >
                {showConConfig ? '隐藏配置' : '显示配置'}
              </button>
            </div>
          </div>
          
          {showConModelSelect && (
            <div className="mb-4 p-2 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2 text-sm">选择已保存的模型</h4>
              {Object.keys(storedModels).length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {Object.entries(storedModels).map(([id, model]) => (
                    <div key={id} className="flex justify-between items-center p-2 border rounded-md bg-white">
                      <div>
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({model.modelId})</span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleSelectModel(id, 'con')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs"
                        >
                          选择
                        </button>
                        <button 
                          onClick={() => onDeleteModel(id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">没有保存的模型</p>
              )}
            </div>
          )}
          
          {showConConfig && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">模型名称（显示用）</label>
                <input
                  type="text"
                  value={conModel.name}
                  onChange={(e) => onConModelChange({...conModel, name: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">模型ID</label>
                <input
                  type="text"
                  value={conModel.modelId}
                  onChange={(e) => onConModelChange({...conModel, modelId: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="例如: gpt-4o"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">API端点</label>
                <input
                  type="text"
                  value={conModel.apiEndpoint}
                  onChange={(e) => onConModelChange({...conModel, apiEndpoint: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="例如: https://api.openai.com/v1"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">API密钥</label>
                <input
                  type="password"
                  value={conModel.apiKey}
                  onChange={(e) => onConModelChange({...conModel, apiKey: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="您的API密钥"
                />
              </div>

              <div className="pt-2 border-t mt-4">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="保存为新模型（可选）"
                    className="flex-1 p-2 border rounded-md text-sm"
                  />
                  <button
                    onClick={() => handleSaveModel('con')}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm"
                  >
                    保存模型
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">不填写名称将以当前名称保存/更新</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 