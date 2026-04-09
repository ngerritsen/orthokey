export const TEXTS = [
  `async function fetchUser(userId) {
  const base_url = "https://api.example.com";
  const res = await fetch(\`\${base_url}/users/\${userId}\`);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const data = await res.json();
  return {
    id: data['user_id'],
    name: data.full_name,
    score: data.scores[0],
  };
}`,

  `function processItems(items, maxCount = 10) {
  return items
    .filter(item => item.is_active && item.score > 0)
    .slice(0, maxCount)
    .map((item, index) => ({
      rank: index + 1,
      label: \`\${item.first_name} \${item.last_name}\`,
      value: item.data['score_total'],
    }));
}

const result = processItems(rawData, 5);
console.log(\`Found \${result.length} items.\`);`,

  `function debounce(fn, delay_ms) {
  let timer_id = null;
  return function (...args) {
    clearTimeout(timer_id);
    timer_id = setTimeout(() => fn.apply(this, args), delay_ms);
  };
}

const handleSearch = debounce(async (event) => {
  const query = event.target.value.trim();
  const url = \`/api/search?q=\${query}&limit=20\`;
  const { items } = await fetch(url).then(r => r.json());
  console.log('results:', items[0]);
}, 300);`,

  `class EventEmitter {
  constructor() {
    this._listeners = {};
  }

  on(event_name, callback) {
    if (!this._listeners[event_name]) {
      this._listeners[event_name] = [];
    }
    this._listeners[event_name].push(callback);
    return this;
  }

  emit(event_name, ...args) {
    const handlers = this._listeners[event_name] || [];
    handlers.forEach(fn => fn(...args));
  }
}`,

  `const DEFAULTS = {
  theme: 'dark',
  font_size: 14,
  show_hints: true,
};

function loadSettings() {
  const raw = localStorage.getItem('app_settings');
  const saved = raw ? JSON.parse(raw) : {};
  return { ...DEFAULTS, ...saved };
}

function saveSettings(settings) {
  localStorage.setItem('app_settings', JSON.stringify(settings));
}`,
]
