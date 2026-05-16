// Initialize Groq API keys in localStorage as fallback
// This ensures keys are available even if .env loading fails

const GROQ_KEYS = {
  GROQ_API_KEY_1: 'your_groq_key_1',
  GROQ_API_KEY_2: 'your_groq_key_2',
  GROQ_API_KEY_3: 'your_groq_key_3',
  GROQ_API_KEY_4: 'your_groq_key_4',
};

console.log('🔧 Initializing Groq API keys in localStorage...');

// Always set keys (overwrite if exists to ensure they're current)
Object.entries(GROQ_KEYS).forEach(([key, value]) => {
  localStorage.setItem(key, value);
  console.log(`✅ Set ${key} in localStorage: ${value.substring(0, 10)}...`);
});

console.log('🔧 Groq API keys initialized in localStorage');

// Verify they were set
console.log('🔍 Verifying localStorage keys:', {
  key1: localStorage.getItem('GROQ_API_KEY_1')?.substring(0, 10) + '...',
  key2: localStorage.getItem('GROQ_API_KEY_2')?.substring(0, 10) + '...',
  key3: localStorage.getItem('GROQ_API_KEY_3')?.substring(0, 10) + '...',
  key4: localStorage.getItem('GROQ_API_KEY_4')?.substring(0, 10) + '...',
});
