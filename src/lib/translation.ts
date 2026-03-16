import axios from 'axios';
import { getDatabase } from './mongodb';
import { Translation, LANGUAGES, getLanguagePrice } from './models';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Model pricing per 1M tokens (input/output)
const MODEL_PRICES = {
  'google/gemini-2.0-flash-001': { input: 0.0, output: 0.0 },
  'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'meta-llama/llama-3.1-8b-instruct': { input: 0.2, output: 0.2 },
};

interface TranslationResult {
  translatedText: string;
  qualityScore: number;
  modelUsed: string;
  confidence: number;
}

interface ModelChoice {
  model: string;
  reason: string;
  estimatedCost: number;
}

// Select best model based on content complexity and target language
function selectBestModel(text: string, targetLanguage: string): ModelChoice {
  const wordCount = text.split(/\s+/).length;
  const isComplex = text.length > 5000 || text.includes('technical') || text.includes('legal');
  const isSimple = wordCount < 50;
  
  const targetLang = LANGUAGES.find(l => l.code === targetLanguage);
  const isNonLatin = ['ja', 'ko', 'zh', 'ar', 'hi', 'ru'].includes(targetLanguage);

  // For short, simple translations - use fast/cheap model
  if (isSimple && !isComplex) {
    return {
      model: 'google/gemini-2.0-flash-001',
      reason: 'Simple content - using fast free model',
      estimatedCost: 0,
    };
  }

  // For complex content or non-Latin languages - use best model
  if (isComplex || isNonLatin) {
    return {
      model: 'anthropic/claude-3.5-sonnet',
      reason: 'Complex content or non-Latin language - using high-quality model',
      estimatedCost: 0.01,
    };
  }

  // Default - use balanced model
  return {
    model: 'openai/gpt-4o-mini',
    reason: 'Balanced content - using cost-effective model',
    estimatedCost: 0.002,
  };
}

export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<TranslationResult> {
  if (!text.trim()) {
    return { translatedText: '', qualityScore: 1, modelUsed: 'none', confidence: 1 };
  }

  const modelChoice = selectBestModel(text, targetLanguage);
  
  const sourceLang = LANGUAGES.find(l => l.code === sourceLanguage);
  const targetLang = LANGUAGES.find(l => l.code === targetLanguage);

  const systemPrompt = `You are a professional translator. Translate the following text from ${sourceLang?.name || sourceLanguage} to ${targetLang?.name || targetLanguage}.

Requirements:
- Maintain the original meaning and tone
- Preserve HTML tags if present
- Keep proper nouns and brand names in original language
- Use natural, fluent language in the target
- For technical terms, provide translation followed by English in parentheses if needed`;

  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: modelChoice.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'Rosetta - Website Translator',
        },
      }
    );

    const translatedText = response.data.choices[0]?.message?.content || '';
    
    // Estimate quality based on model capability
    const qualityScore = modelChoice.model.includes('claude') ? 0.95 : 
                        modelChoice.model.includes('gpt-4') ? 0.9 : 0.8;

    return {
      translatedText,
      qualityScore,
      modelUsed: modelChoice.model,
      confidence: qualityScore,
    };
  } catch (error: any) {
    console.error('Translation error:', error.response?.data || error.message);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

// Check if existing translation needs updating
export async function checkTranslation(
  websiteId: string,
  url: string,
  sourceLanguage: string,
  targetLanguage: string,
  originalText: string
): Promise<{ needsUpdate: boolean; existingTranslation?: string; similarity: number }> {
  const db = await getDatabase();
  const translations = db.collection<Translation>('translations');
  
  const existing = await translations.findOne({
    websiteId,
    url,
    sourceLanguage,
    targetLanguage,
  });

  if (!existing) {
    return { needsUpdate: true, similarity: 0 };
  }

  // Calculate similarity between original texts
  const similarity = calculateSimilarity(originalText, existing.originalText);
  
  // If similarity > 80%, translation is likely still valid
  if (similarity > 0.8) {
    return { 
      needsUpdate: false, 
      existingTranslation: existing.translatedText,
      similarity 
    };
  }

  // Text has changed significantly, need to update translation
  return { needsUpdate: true, existingTranslation: existing.translatedText, similarity };
}

// Simple similarity calculation using Jaccard index
function calculateSimilarity(text1: string, text2: string): number {
  const set1 = new Set(text1.toLowerCase().split(/\s+/));
  const set2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

export async function saveTranslation(
  websiteId: string,
  url: string,
  sourceLanguage: string,
  targetLanguage: string,
  originalText: string,
  translatedText: string,
  qualityScore: number
): Promise<void> {
  const db = await getDatabase();
  const translations = db.collection<Translation>('translations');
  
  const now = new Date();
  
  await translations.updateOne(
    { websiteId, url, sourceLanguage, targetLanguage },
    {
      $set: {
        originalText,
        translatedText,
        qualityScore,
        needsReview: qualityScore < 0.85,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true }
  );
}

export async function translateAndSave(
  websiteId: string,
  url: string,
  sourceLanguage: string,
  targetLanguage: string,
  originalText: string
): Promise<TranslationResult> {
  // First check if we have a recent translation
  const check = await checkTranslation(
    websiteId,
    url,
    sourceLanguage,
    targetLanguage,
    originalText
  );

  if (!check.needsUpdate && check.existingTranslation) {
    return {
      translatedText: check.existingTranslation,
      qualityScore: 0.9,
      modelUsed: 'cached',
      confidence: check.similarity,
    };
  }

  // Translate using best-fit model
  const result = await translateText(originalText, sourceLanguage, targetLanguage);
  
  // Save to database
  await saveTranslation(
    websiteId,
    url,
    sourceLanguage,
    targetLanguage,
    originalText,
    result.translatedText,
    result.qualityScore
  );

  return result;
}

export function calculateTranslationCost(
  wordCount: number,
  sourceLanguage: string,
  targetLanguage: string
): number {
  const pricePerWord = getLanguagePrice(sourceLanguage, targetLanguage);
  return wordCount * pricePerWord;
}
