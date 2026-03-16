'use client';

import { useState } from 'react';
import { Globe, ArrowRight, Loader2, Check, Copy, RefreshCw, Languages, FileText, Link as LinkIcon } from 'lucide-react';
import { LANGUAGES } from '@/lib/models';

type InputMode = 'url' | 'text';

export default function TranslatePage() {
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    setError('');
    setResult(null);

    // Validate input based on mode
    if (inputMode === 'url') {
      if (!url.trim()) {
        setError('Please enter a URL');
        return;
      }
      try {
        new URL(url);
      } catch {
        setError('Please enter a valid URL');
        return;
      }
    } else {
      if (!text.trim()) {
        setError('Please enter text to translate');
        return;
      }
      if (text.trim().length < 3) {
        setError('Please enter at least 3 characters to translate');
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload = inputMode === 'url' 
        ? { url, sourceLanguage, targetLanguage }
        : { text: text.trim(), sourceLanguage, targetLanguage };

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyEmbedCode = () => {
    if (inputMode === 'url') {
      const code = `<script src="${window.location.origin}/widget.js" data-url="${url}" data-lang="${targetLanguage}"></script>`;
      navigator.clipboard.writeText(code);
    }
  };

  const swapLanguages = () => {
    if (inputMode === 'text') {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Translate Your Content
          </h1>
          <p className="text-xl text-gray-600">
            Enter any URL or paste text and get instant, accurate translations powered by AI
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200 mb-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setInputMode('url'); setResult(null); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                inputMode === 'url' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              Translate URL
            </button>
            <button
              onClick={() => { setInputMode('text'); setResult(null); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                inputMode === 'text' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Translate Text
            </button>
          </div>

          <div className="space-y-6">
            {/* URL Input */}
            {inputMode === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-200">
                  <Globe className="w-5 h-5 text-gray-400 ml-2" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Text Input */}
            {inputMode === 'text' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text to Translate
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste or type the text you want to translate..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
                />
                <div className="text-right text-sm text-gray-400 mt-1">
                  {text.length} characters
                </div>
              </div>
            )}

            {/* Language Selection */}
            <div className="grid md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From
                </label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={swapLanguages}
                  disabled={inputMode === 'url'}
                  title={inputMode === 'url' ? "Swap languages (available in text mode)" : "Swap languages"}
                  className={`p-3 rounded-full transition-all ${
                    inputMode === 'text'
                      ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To
                </label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Translate {inputMode === 'url' ? 'Website' : 'Text'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Result Header */}
            <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Translation Complete</h3>
                  <p className="text-sm text-green-700">
                    {result.wordCount || result.characterCount} {result.wordCount ? 'words' : 'characters'} translated
                    {result.qualityScore && ` • ${result.qualityScore}% quality score`}
                  </p>
                </div>
              </div>
              <div className="text-sm text-green-700">
                {result.modelUsed && `Used: ${result.modelUsed}`}
              </div>
            </div>

            {/* Translated Content Preview */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">
                {inputMode === 'url' ? 'Translated Content Preview' : 'Translation Result'}
              </h4>
              <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                  {result.translatedText?.substring(0, 5000)}
                  {result.translatedText?.length > 5000 && '...'}
                </pre>
              </div>
            </div>

            {/* Copy Translation (for text mode) */}
            {inputMode === 'text' && (
              <div className="border-t border-gray-200 p-6">
                <button
                  onClick={() => navigator.clipboard.writeText(result.translatedText)}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy Translation
                </button>
              </div>
            )}

            {/* Embed Code (for URL mode) */}
            {inputMode === 'url' && (
              <div className="border-t border-gray-200 p-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Embed This Translation</h4>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-900 text-gray-100 px-4 py-3 rounded-xl text-sm overflow-x-auto">
                    {`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-url="${url}" data-lang="${targetLanguage}"></script>`}
                  </code>
                  <button
                    onClick={copyEmbedCode}
                    className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    title="Copy embed code"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 p-6 flex gap-4">
              {inputMode === 'url' && (
                <a
                  href={`/embed?url=${encodeURIComponent(url)}&lang=${targetLanguage}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Languages className="w-4 h-4" />
                  Customize Widget
                </a>
              )}
              <button
                onClick={() => { setResult(null); setError(''); }}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Translate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
