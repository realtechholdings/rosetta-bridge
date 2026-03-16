import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  url: string;
  title: string;
  metaDescription: string;
  textContent: string;
  translatableElements: TranslatableElement[];
  language: string;
  wordCount: number;
}

export interface TranslatableElement {
  selector: string;
  tag: string;
  originalText: string;
  wordCount: number;
}

// Extract translatable content from a webpage
export async function scrapeWebsite(url: string): Promise<ScrapedContent> {
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    // Remove script, style, nav, footer, header elements
    $('script, style, nav, footer, header, aside, noscript, iframe').remove();
    
    // Get meta information
    const title = $('title').text() || $('h1').first().text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    
    // Detect language (simple heuristic)
    const lang = $('html').attr('lang') || 'en';
    
    // Extract all translatable elements
    const translatableElements: TranslatableElement[] = [];
    
    // Text content from common elements
    const selectors = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'li', 'td', 'th', 'span', 'div',
      'a', 'button', 'label', 'strong', 'em',
      'article', 'section', 'main', 'aside'
    ];
    
    let totalWordCount = 0;
    
    $(selectors.join(',')).each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
      const element = el as unknown as { tagName: string; attribs?: Record<string, string> };
      
      // Only include elements with meaningful content
      if (wordCount >= 3 && !text.includes('{') && !text.includes('{{')) {
        // Build unique selector path
        const selector = buildSelector($, el);
        
        translatableElements.push({
          selector,
          tag: element.tagName.toLowerCase(),
          originalText: text,
          wordCount,
        });
        
        totalWordCount += wordCount;
      }
    });
    
    // Get full text content
    const textContent = $('body').text().trim();
    
    return {
      url,
      title,
      metaDescription,
      textContent,
      translatableElements,
      language: lang.split('-')[0],
      wordCount: totalWordCount,
    };
  } catch (error: any) {
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
}

// Build a unique CSS selector for an element
function buildSelector($: cheerio.CheerioAPI, el: any): string {
  const element = el;
  let selector = element.tagName?.toLowerCase() || 'div';
  
  // Add ID if present
  if (element.attribs?.id) {
    return `#${element.attribs.id}`;
  }
  
  // Add classes
  if (element.attribs?.class) {
    const classes = element.attribs.class.split(/\s+/).filter((c: string) => c.length > 0).slice(0, 2);
    if (classes.length > 0) {
      selector += '.' + classes.join('.');
    }
  }
  
  return selector;
}

// Apply translations to HTML
export function applyTranslations(
  html: string,
  translations: Map<string, string>,
  selectors: string[]
): string {
  const $ = cheerio.load(html);
  
  selectors.forEach((selector, index) => {
    const translation = translations.get(selector);
    if (translation) {
      $(selector).text(translation);
    }
  });
  
  return $.html();
}

// Get all URLs from a website (for crawling)
export async function getWebsiteUrls(baseUrl: string, maxUrls: number = 50): Promise<string[]> {
  const urls = new Set<string>();
  const base = new URL(baseUrl);
  
  try {
    const response = await axios.get(baseUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const $ = cheerio.load(response.data);
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      
      try {
        const url = new URL(href, baseUrl);
        // Only get URLs from same domain
        if (url.hostname === base.hostname && !urls.has(url.href)) {
          urls.add(url.href);
        }
      } catch {
        // Invalid URL, skip
      }
      
      if (urls.size >= maxUrls) return false;
    });
  } catch (error) {
    console.error('Error getting website URLs:', error);
  }
  
  return Array.from(urls).slice(0, maxUrls);
}
