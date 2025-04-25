'use client';

import { useState } from 'react';
import { ModelConfig as ModelConfigType, StoredModels } from '../types';

interface ModelConfigProps {
  model: ModelConfigType;
  onModelChange: (model: ModelConfigType) => void;
  storedModels: StoredModels;
  onSaveModel: (model: ModelConfigType) => void;
  onDeleteModel: (modelId: string) => void;
  disabled?: boolean;
  title: string;
}

export default function ModelConfig({
  model,
  onModelChange,
  storedModels,
  onSaveModel,
  onDeleteModel,
  disabled = false,
  title
}: ModelConfigProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  const handleSaveModel = () => {
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

  const handleSelectModel = (modelId: string) => {
    const selectedModel = storedModels[modelId];
    if (selectedModel) {
      onModelChange(selectedModel);
      setShowModelSelect(false);
    }
  };

  return (
    <div className="border p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">{title}: {model.name}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowModelSelect(!showModelSelect)}
            disabled={disabled}
            className={`text-blue-500 text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {showModelSelect ? '隐藏选择' : '选择模型'}
          </button>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            disabled={disabled}
            className={`text-blue-500 text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {showConfig ? '隐藏配置' : '显示配置'}
          </button>
        </div>
      </div>
      
      {showModelSelect && (
        <div className="mb-4 p-2 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2 text-sm">选择已保存的模型</h4>
          {Object.keys(storedModels).length > 0 ? (
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {Object.entries(storedModels).map(([id, savedModel]) => (
                <div key={id} className="flex justify-between items-center p-2 border rounded-md bg-white">
                  <div>
                    <span className="font-medium">{savedModel.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({savedModel.modelId})</span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleSelectModel(id)}
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
      
      {showConfig && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">模型名称（显示用）</label>
            <input
              type="text"
              value={model.name}
              onChange={(e) => onModelChange({...model, name: e.target.value})}
              disabled={disabled}
              className={`w-full p-2 border rounded-md ${disabled ? 'bg-gray-100' : ''}`}
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">模型ID</label>
            <input
              type="text"
              value={model.modelId}
              onChange={(e) => onModelChange({...model, modelId: e.target.value})}
              disabled={disabled}
              className={`w-full p-2 border rounded-md ${disabled ? 'bg-gray-100' : ''}`}
              placeholder="例如: gpt-3.5-turbo"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">API端点</label>
            <input
              type="text"
              value={model.apiEndpoint}
              onChange={(e) => onModelChange({...model, apiEndpoint: e.target.value})}
              disabled={disabled}
              className={`w-full p-2 border rounded-md ${disabled ? 'bg-gray-100' : ''}`}
              placeholder="例如: https://api.openai.com/v1"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">API密钥</label>
            <input
              type="password"
              value={model.apiKey}
              onChange={(e) => onModelChange({...model, apiKey: e.target.value})}
              disabled={disabled}
              className={`w-full p-2 border rounded-md ${disabled ? 'bg-gray-100' : ''}`}
              placeholder="您的API密钥"
            />
          </div>

          <div className="pt-2 border-t mt-4">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                disabled={disabled}
                className={`flex-1 p-2 border rounded-md ${disabled ? 'bg-gray-100' : ''}`}
                placeholder="保存为新模型的名称 (可选)"
              />
              <button
                onClick={handleSaveModel}
                disabled={disabled}
                className={`bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                保存
              </button>
            </div>
            {saveStatus && (
              <div className="mt-2 text-green-600 text-sm">{saveStatus}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 