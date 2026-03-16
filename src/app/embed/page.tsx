'use client';

import { useState, useEffect } from 'react';
import { Globe, Code, Copy, Check, Palette, Monitor, Smartphone, Tablet } from 'lucide-react';

interface EmbedConfig {
  buttonText: string;
  buttonPosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  primaryColor: string;
  secondaryColor: string;
  showFlags: boolean;
  autoDetect: boolean;
  borderRadius: number;
  fontFamily: string;
}

export default function EmbedPage() {
  const [config, setConfig] = useState<EmbedConfig>({
    buttonText: 'Translate',
    buttonPosition: 'bottom-right',
    primaryColor: '#4F46E5',
    secondaryColor: '#FFFFFF',
    showFlags: true,
    autoDetect: true,
    borderRadius: 8,
    fontFamily: 'system-ui',
  });
  
  const [previewUrl, setPreviewUrl] = useState('https://example.com');
  const [activeTab, setActiveTab] = useState<'button' | 'sdk'>('button');
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const updateConfig = (key: keyof EmbedConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateEmbedCode = () => {
    if (activeTab === 'button') {
      return `<!-- Rosetta Translation Widget -->
<div id="rosetta-widget" 
     data-url="${previewUrl}"
     data-position="${config.buttonPosition}"
     data-color="${config.primaryColor}"
     data-text="${config.buttonText}"
     data-flags="${config.showFlags}"
     data-auto-detect="${config.autoDetect}">
</div>
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"></script>`;
    } else {
      return `<!-- Rosetta SDK -->
<script>
  Rosetta.init({
    url: "${previewUrl}",
    primaryColor: "${config.primaryColor}",
    secondaryColor: "${config.secondaryColor}",
    position: "${config.buttonPosition}",
    autoDetect: ${config.autoDetect},
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
    onTranslationComplete: (data) => {
      console.log('Translation complete:', data);
    }
  });
</script>`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Customize Your Widget
          </h1>
          <p className="text-xl text-gray-600">
            Design a translation button that matches your brand
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Website URL */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Website URL
              </h3>
              <input
                type="text"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Button Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                Button Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={config.buttonText}
                    onChange={(e) => updateConfig('buttonText', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['bottom-left', 'bottom-right', 'top-left', 'top-right'].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => updateConfig('buttonPosition', pos)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          config.buttonPosition === pos
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Radius
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={config.borderRadius}
                      onChange={(e) => updateConfig('borderRadius', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-500">{config.borderRadius}px</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showFlags}
                      onChange={(e) => updateConfig('showFlags', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Show language flags</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoDetect}
                      onChange={(e) => updateConfig('autoDetect', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Auto-detect browser language</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Code Output */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('button')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'button'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Button
                  </button>
                  <button
                    onClick={() => setActiveTab('sdk')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'sdk'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    SDK
                  </button>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <div className="p-4 bg-gray-900 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono">
                  {generateEmbedCode()}
                </pre>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Live Preview</h3>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-white shadow' : ''}`}
                  >
                    <Monitor className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-white shadow' : ''}`}
                  >
                    <Tablet className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-white shadow' : ''}`}
                  >
                    <Smartphone className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Preview Device Frame */}
              <div className="p-8 bg-gray-100 flex justify-center">
                <div
                  className={`bg-white rounded-lg shadow-xl overflow-hidden transition-all ${
                    previewMode === 'mobile' ? 'w-[320px]' :
                    previewMode === 'tablet' ? 'w-[480px]' :
                    'w-full max-w-[640px]'
                  }`}
                >
                  {/* Fake Browser Header */}
                  <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="ml-4 flex-1 bg-gray-700 rounded text-xs text-gray-400 px-3 py-1">
                      {previewUrl}
                    </div>
                  </div>
                  
                  {/* Fake Website Content */}
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-5/6" />
                    <div className="h-4 bg-gray-100 rounded w-4/5" />
                    
                    {/* Translation Widget Preview */}
                    <div
                      className="absolute"
                      style={positionStyles[config.buttonPosition]}
                    >
                      <button
                        style={{
                          backgroundColor: config.primaryColor,
                          borderRadius: config.borderRadius,
                        }}
                        className="px-4 py-2 text-white text-sm font-medium shadow-lg flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4" />
                        {config.buttonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
