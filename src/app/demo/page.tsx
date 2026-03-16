'use client';

import { useState } from 'react';
import { Languages, Loader2, Copy, ArrowRight, RefreshCw, Sparkles, Globe, BookOpen, Zap } from 'lucide-react';
import { LANGUAGES } from '@/lib/models';

const SAMPLE_TEXTS = [
  {
    id: 'greeting',
    label: 'Greeting',
    text: 'Welcome to our website! We are glad to have you here. Feel free to explore our products and services.'
  },
  {
    id: 'product',
    label: 'Product Description',
    text: 'Our premium product is designed with cutting-edge technology to help you achieve your goals faster and more efficiently. Try it today!'
  },
  {
    id: 'support',
    label: 'Support Message',
    text: 'Our customer support team is available 24/7 to assist you with any questions or concerns. We are here to help!'
  }
];

export default function DemoPage() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLanguage,
          targetLanguage
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setTranslatedText(data.translatedText);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleText = (text: string) => {
    setSourceText(text);
    setTranslatedText('');
    setError('');
  };

  const copyTranslation = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    // Also swap text if there's translation
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const getLanguageName = (code: string) => {
    return LANGUAGES.find(l => l.code === code)?.name || code;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-indigo-100 font-medium">Live Demo</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Try Rosetta Bridge
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl">
            Paste any text and get instant, accurate translations powered by AI. 
            No signup required.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 pb-16">
        {/* Translation Interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Source Text */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-gray-700">Source Text</span>
                </div>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste or type your text here..."
                className="w-full h-64 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-400">
                  {sourceText.length} characters • {sourceText.split(/\s+/).filter(w => w).length} words
                </span>
                <button
                  onClick={swapLanguages}
                  className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Swap
                </button>
              </div>
            </div>

            {/* Translated Text */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-500" />
                  <span className="font-semibold text-gray-700">Translation</span>
                </div>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {translatedText ? (
                <>
                  <div className="w-full h-64 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 overflow-y-auto whitespace-pre-wrap">
                    {translatedText}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-400">
                      {translatedText.length} characters • {translatedText.split(/\s+/).filter(w => w).length} words
                    </span>
                    <button
                      onClick={copyTranslation}
                      className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                    >
                      {copied ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-400">
                    Translation will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-6 pb-4">
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Translate Button */}
          <div className="px-6 pb-6">
            <button
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-5 h-5" />
                  Translate to {getLanguageName(targetLanguage)}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sample Texts */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Try with sample text</h2>
          <div className="flex flex-wrap gap-3">
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSampleText(sample.text)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-sm font-medium"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600">
              Get translations in seconds with our AI-powered translation engine. 
              No waiting, no queues.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">15+ Languages</h3>
            <p className="text-gray-600">
              Translate between 15+ languages including Spanish, French, German, 
              Japanese, Chinese, and more.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">High Quality</h3>
            <p className="text-gray-600">
              Our AI selects the best translation model based on content complexity 
              for optimal results.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Want to translate your entire website?
          </h2>
          <p className="text-indigo-100 mb-6">
            Use our URL translation tool to automatically scrape and translate any webpage.
          </p>
          <a
            href="/translate"
            className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            Translate a Website URL
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
