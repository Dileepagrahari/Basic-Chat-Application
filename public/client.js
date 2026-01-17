const output = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('msg');
const nameInput = document.getElementById('name');

function addMessage(text, meta = '') {
  const d = document.createElement('div');
  d.innerHTML = text + (meta ? ` <span class="meta">${meta}</span>` : '');
  output.appendChild(d);
  output.scrollTop = output.scrollHeight;
}

const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);

ws.addEventListener('open', () => addMessage('Connected to server.', 'system'));
ws.addEventListener('close', () => addMessage('Disconnected from server.', 'system'));
ws.addEventListener('message', (ev) => {
  let data;
  try { data = JSON.parse(ev.data); } catch (e) { data = { type: 'message', msg: ev.data }; }
  if (data.type === 'info') {
    addMessage(data.msg, 'info');
  } else if (data.type === 'message') {
    const t = new Date(data.ts || Date.now()).toLocaleTimeString();
    addMessage(`<strong>${escapeHtml(data.name || 'Anonymous')}</strong>: ${escapeHtml(data.msg)}`, t);
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!input.value) return;
  const payload = { type: 'message', name: nameInput.value || 'Guest', msg: input.value };
  ws.send(JSON.stringify(payload));
  input.value = '';
  input.focus();
});

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}