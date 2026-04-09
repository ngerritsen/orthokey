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
}

const cache = {};
async function getCachedUser(userId) {
  if (cache[userId]) return cache[userId];
  const user = await fetchUser(userId);
  cache[userId] = user;
  return user;
}`,

  `const STATUS_CODES = {
  success: 200,
  not_found: 404,
  server_error: 500,
};

function processItems(items, max_count = 10) {
  const filtered = items
    .filter(item => item.is_active && item.score > 0)
    .slice(0, max_count);

  return filtered.map((item, index) => ({
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

const input_el = document.querySelector('#search_input');
const handleSearch = debounce(async (event) => {
  const query = event.target.value.trim();
  if (query.length < 2) return;
  const url = \`/api/search?q=\${query}&limit=20\`;
  const res = await fetch(url);
  const { items, total_count } = await res.json();
  console.log(\`Got \${total_count} results.\`, items[0]);
}, 300);

input_el.addEventListener('input', handleSearch);`,

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
}

const bus = new EventEmitter();
bus.on('user_login', ({ userId, role }) => {
  console.log(\`User \${userId} logged in as "\${role}".\`);
});
bus.emit('user_login', { userId: 42, role: 'admin' });`,

  `const DEFAULTS = {
  theme: 'dark',
  font_size: 14,
  tab_width: 2,
  show_hints: true,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem('app_settings');
    const saved = raw ? JSON.parse(raw) : {};
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings) {
  const keys = Object.keys(settings);
  keys.forEach(key => {
    if (settings[key] !== DEFAULTS[key]) {
      console.log(\`Changed: \${key} = \${settings[key]}\`);
    }
  });
  localStorage.setItem('app_settings', JSON.stringify(settings));
}`,
]
