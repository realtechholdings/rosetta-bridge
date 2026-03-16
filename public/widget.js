// Rosetta Translation Widget
// Add this script to your website to enable instant translations

(function() {
  'use strict';

  // Default configuration
  const defaultConfig = {
    position: 'bottom-right',
    primaryColor: '#4F46E5',
    buttonText: 'Translate',
    showFlags: true,
    autoDetect: true,
    languages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'pt', name: 'Português', flag: '🇵🇹' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
    ]
  };

  // Parse configuration from data attributes
  function getConfig() {
    const widgetEl = document.getElementById('rosetta-widget');
    if (!widgetEl) return defaultConfig;

    return {
      position: widgetEl.getAttribute('data-position') || defaultConfig.position,
      primaryColor: widgetEl.getAttribute('data-color') || defaultConfig.primaryColor,
      buttonText: widgetEl.getAttribute('data-text') || defaultConfig.buttonText,
      showFlags: widgetEl.getAttribute('data-flags') !== 'false',
      autoDetect: widgetEl.getAttribute('data-auto-detect') !== 'false',
      url: widgetEl.getAttribute('data-url') || window.location.href,
    };
  }

  // Detect browser language
  function detectLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    const langCode = lang.split('-')[0];
    return defaultConfig.languages.find(l => l.code === langCode)?.code || 'en';
  }

  // Create and inject the widget
  function createWidget() {
    const config = getConfig();
    const currentLang = config.autoDetect ? detectLanguage() : 'en';

    // Create main button
    const button = document.createElement('button');
    button.id = 'rosetta-main-btn';
    button.innerHTML = config.showFlags 
      ? `<span class="rosetta-flag">${defaultConfig.languages.find(l => l.code === currentLang)?.flag || '🌐'}</span>`
      : '';
    button.innerHTML += `<span class="rosetta-text">${config.buttonText}</span>`;
    
    // Apply styles
    button.style.cssText = `
      position: fixed;
      ${config.position.includes('bottom') ? 'bottom: 20px' : 'top: 20px'};
      ${config.position.includes('left') ? 'left: 20px' : 'right: 20px'};
      background-color: ${config.primaryColor};
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
    `;

    // Add hover effects
    button.onmouseenter = () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
    };
    button.onmouseleave = () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    };

    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.id = 'rosetta-dropdown';
    dropdown.style.cssText = `
      position: fixed;
      ${config.position.includes('bottom') ? 'bottom: 70px' : 'top: 70px'};
      ${config.position.includes('left') ? 'left: 20px' : 'right: 20px'};
      background: white;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      padding: 8px;
      min-width: 180px;
      z-index: 999999;
      display: none;
      flex-direction: column;
      gap: 4px;
    `;

    // Add language options
    defaultConfig.languages.forEach(lang => {
      const option = document.createElement('button');
      option.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border: none;
        background: transparent;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        text-align: left;
        width: 100%;
        transition: background 0.2s;
      `;
      option.innerHTML = config.showFlags 
        ? `<span>${lang.flag}</span><span>${lang.name}</span>`
        : lang.name;
      
      option.onmouseenter = () => option.style.background = '#f3f4f6';
      option.onmouseleave = () => option.style.background = 'transparent';
      
      option.onclick = () => translateTo(lang.code);
      dropdown.appendChild(option);
    });

    // Toggle dropdown
    button.onclick = () => {
      const isVisible = dropdown.style.display === 'flex';
      dropdown.style.display = isVisible ? 'none' : 'flex';
    };

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!button.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    // Append to body
    document.body.appendChild(button);
    document.body.appendChild(dropdown);

    // Store config for use in translation
    window.Rosetta = {
      config,
      translateTo,
      refresh: () => translateTo(currentLang)
    };
  }

  // Translate the page
  async function translateTo(targetLang) {
    const config = window.Rosetta?.config || getConfig();
    const url = config.url || window.location.href;
    
    // Show loading state
    const button = document.getElementById('rosetta-main-btn');
    if (button) {
      const originalText = button.querySelector('.rosetta-text')?.textContent;
      button.querySelector('.rosetta-text')!.textContent = '...';
      
      try {
        // Call translation API
        const apiUrl = new URL('/api/translate', window.location.origin);
        apiUrl.searchParams.set('url', url);
        apiUrl.searchParams.set('lang', targetLang);
        
        const response = await fetch(apiUrl.toString());
        const data = await response.json();
        
        if (data.success) {
          // Update button to show current language
          const lang = defaultConfig.languages.find(l => l.code === targetLang);
          if (button.querySelector('.rosetta-flag')) {
            button.querySelector('.rosetta-flag')!.textContent = lang?.flag || '🌐';
          }
          button.querySelector('.rosetta-text')!.textContent = originalText || 'Translate';
          
          // Dispatch event for custom handling
          window.dispatchEvent(new CustomEvent('rosetta-translation-complete', { 
            detail: data 
          }));
          
          console.log('Rosetta: Translation complete', data);
        }
      } catch (error) {
        console.error('Rosetta: Translation failed', error);
        button.querySelector('.rosetta-text')!.textContent = originalText || 'Translate';
      }
    }
    
    // Hide dropdown
    const dropdown = document.getElementById('rosetta-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
