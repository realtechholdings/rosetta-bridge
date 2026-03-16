export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  apiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Website {
  id: string;
  userId: string;
  url: string;
  name: string;
  languages: string[];
  defaultLanguage: string;
  isActive: boolean;
  embedConfig: EmbedConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmbedConfig {
  buttonText: string;
  buttonPosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  primaryColor: string;
  showFlags: boolean;
  autoDetect: boolean;
}

export interface Translation {
  id: string;
  websiteId: string;
  url: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  qualityScore?: number;
  needsReview: boolean;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationJob {
  id: string;
  websiteId: string;
  url: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  pagesTotal: number;
  pagesCompleted: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  pricePerWord: number;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', pricePerWord: 0.0001 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', pricePerWord: 0.00012 },
  { code: 'fr', name: 'French', nativeName: 'Français', pricePerWord: 0.00012 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', pricePerWord: 0.00012 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', pricePerWord: 0.00012 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', pricePerWord: 0.00012 },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', pricePerWord: 0.00014 },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', pricePerWord: 0.00014 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', pricePerWord: 0.00015 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', pricePerWord: 0.0002 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', pricePerWord: 0.0002 },
  { code: 'zh', name: 'Chinese', nativeName: '中文', pricePerWord: 0.00018 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', pricePerWord: 0.00018 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', pricePerWord: 0.00016 },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', pricePerWord: 0.00014 },
];

export function getLanguagePrice(source: string, target: string): number {
  const sourceLang = LANGUAGES.find(l => l.code === source);
  const targetLang = LANGUAGES.find(l => l.code === target);
  
  if (!sourceLang || !targetLang) return 0.0001;
  
  // Price is average of both languages
  return (sourceLang.pricePerWord + targetLang.pricePerWord) / 2;
}
