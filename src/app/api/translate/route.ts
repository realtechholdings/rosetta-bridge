import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite, ScrapedContent } from '@/lib/scraper';
import { translateAndSave, translateText } from '@/lib/translation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, text, sourceLanguage, targetLanguage } = body;

    // Handle text translation (direct paste)
    if (text !== undefined) {
      if (!text.trim()) {
        return NextResponse.json(
          { error: 'Text is required' },
          { status: 400 }
        );
      }

      if (!targetLanguage) {
        return NextResponse.json(
          { error: 'Target language is required' },
          { status: 400 }
        );
      }

      try {
        const result = await translateText(
          text.trim(),
          sourceLanguage || 'en',
          targetLanguage
        );

        return NextResponse.json({
          success: true,
          sourceLanguage: sourceLanguage || 'en',
          targetLanguage,
          characterCount: text.trim().length,
          wordCount: text.trim().split(/\s+/).length,
          translatedText: result.translatedText,
          qualityScore: Math.round(result.qualityScore * 100),
          modelUsed: result.modelUsed,
          cached: false,
        });
      } catch (err: any) {
        console.error('Text translation error:', err);
        return NextResponse.json(
          { error: err.message || 'Text translation failed' },
          { status: 500 }
        );
      }
    }

    // Handle URL translation (existing functionality)
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Scrape the website content
    const scrapedContent: ScrapedContent = await scrapeWebsite(url);

    // Generate a simple website ID from the URL
    const websiteId = Buffer.from(url).toString('base64').slice(0, 20);

    // Translate each translatable element
    const translations: { selector: string; original: string; translated: string }[] = [];
    
    for (const element of scrapedContent.translatableElements) {
      try {
        const result = await translateAndSave(
          websiteId,
          url,
          sourceLanguage || scrapedContent.language,
          targetLanguage,
          element.originalText
        );

        translations.push({
          selector: element.selector,
          original: element.originalText,
          translated: result.translatedText,
        });
      } catch (err) {
        console.error(`Failed to translate element:`, err);
        // Continue with other elements
      }
    }

    // Combine translated text for preview
    const translatedText = translations.map(t => t.translated).join('\n\n');

    return NextResponse.json({
      success: true,
      url,
      sourceLanguage: sourceLanguage || scrapedContent.language,
      targetLanguage,
      wordCount: scrapedContent.wordCount,
      elementsTranslated: translations.length,
      translatedText,
      qualityScore: 85,
      modelUsed: 'best-fit',
      cached: false,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const text = searchParams.get('text');
  const targetLanguage = searchParams.get('lang') || 'es';
  const sourceLanguage = searchParams.get('source') || 'en';

  // Handle text translation via GET
  if (text) {
    try {
      const result = await translateText(
        decodeURIComponent(text),
        sourceLanguage,
        targetLanguage
      );

      return NextResponse.json({
        success: true,
        sourceLanguage,
        targetLanguage,
        characterCount: text.length,
        wordCount: text.split(/\s+/).length,
        translatedText: result.translatedText,
        qualityScore: Math.round(result.qualityScore * 100),
        modelUsed: result.modelUsed,
      });
    } catch (error: any) {
      console.error('Text translation error:', error);
      return NextResponse.json(
        { error: error.message || 'Text translation failed' },
        { status: 500 }
      );
    }
  }

  // Handle URL translation (existing functionality)
  if (!url) {
    return NextResponse.json(
      { error: 'URL or text is required' },
      { status: 400 }
    );
  }

  try {
    // Scrape and translate
    const scrapedContent = await scrapeWebsite(url);
    const websiteId = Buffer.from(url).toString('base64').slice(0, 20);

    const translations: { selector: string; original: string; translated: string }[] = [];
    
    for (const element of scrapedContent.translatableElements.slice(0, 50)) {
      try {
        const result = await translateAndSave(
          websiteId,
          url,
          scrapedContent.language,
          targetLanguage,
          element.originalText
        );

        translations.push({
          selector: element.selector,
          original: element.originalText,
          translated: result.translatedText,
        });
      } catch (err) {
        console.error(`Failed to translate element:`, err);
      }
    }

    const translatedText = translations.map(t => t.translated).join('\n\n');

    return NextResponse.json({
      success: true,
      url,
      targetLanguage,
      wordCount: scrapedContent.wordCount,
      elementsTranslated: translations.length,
      translatedText,
      qualityScore: 85,
      modelUsed: 'best-fit',
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
