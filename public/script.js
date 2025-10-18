// == Elementos principais ==
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const voiceBtn = document.getElementById('voice-btn');
const loadingIndicator = document.getElementById('loading');
const sideMenu = document.getElementById('sideMenu');
const voiceToggle = document.getElementById('voiceToggle');
const voiceRadios = document.querySelectorAll('input[name="voiceType"]');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const shareBtn = document.getElementById('shareBtn');

// Chat 2 elementos
const bibliaInput = document.getElementById("biblia-input");
const bibliaForm = document.getElementById("biblia-form");
const bibliaChatBox = document.getElementById("biblia-chat-box");

// Toggle buttons / containers
const toggleJesusBtn = document.getElementById("toggle-jesus");
const chatJesusContainer = document.getElementById("chat-jesus-container");
const toggleBibliaBtn = document.getElementById("toggle-biblia");
const bibliaChatContainer = document.getElementById("biblia-chat-container");

/* ============================
   Voz / fala de Jesus
============================ */

// Lista de vozes carregadas
let voicesList = [];

// Função confiável para carregar vozes
async function loadVoices() {
  voicesList = await new Promise(resolve => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) resolve(voices);
    else speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
  });
}

// Falar a mensagem de Jesus
async function speakJesus(text) {
  if (!('speechSynthesis' in window) || !isVoiceEnabled()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.pitch = 1;
  utterance.rate = 1;

  // Escolhe voz do usuário
  const selected = [...voiceRadios].find(r => r.checked)?.value || 'female';

  if (!voicesList.length) await loadVoices();

  let voice;
  if (selected === 'male') {
    voice = voicesList.find(v => v.lang.startsWith('pt') && /male|homem/i.test(v.name)) 
          || voicesList.find(v => v.lang.startsWith('pt'));
  } else {
    voice = voicesList.find(v => v.lang.startsWith('pt') && /female|mulher/i.test(v.name)) 
          || voicesList.find(v => v.lang.startsWith('pt'));
  }

  if (voice) utterance.voice = voice;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

// Verifica se voz está ativa
function isVoiceEnabled() {
  return localStorage.getItem('voiceEnabled') === 'true';
}

// Salva configurações
function saveSettings() {
  if (voiceToggle) localStorage.setItem('voiceEnabled', voiceToggle.checked);
  const selectedVoice = [...voiceRadios].find(radio => radio.checked)?.value;
  if (selectedVoice) localStorage.setItem('voiceType', selectedVoice);
}

// Carrega configurações
function loadSettings() {
  const voiceEnabledStorage = localStorage.getItem('voiceEnabled');
  if (voiceToggle)
    voiceToggle.checked = voiceEnabledStorage !== null ? voiceEnabledStorage === 'true' : true;

  const voiceTypeStorage = localStorage.getItem('voiceType');
  if (voiceTypeStorage) {
    [...voiceRadios].forEach(radio => (radio.checked = radio.value === voiceTypeStorage));
  } else {
    [...voiceRadios].forEach(radio => (radio.checked = radio.value === 'male'));
    localStorage.setItem('voiceType', 'male');
  }
}

// Inicializa vozes quando o DOM é carregado
document.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    console.log('✅ speechSynthesis disponível e vozes carregadas');
  } else {
    console.error('❌ speechSynthesis NÃO disponível');
  }
});

/* ============================
   Exibir mensagens no chat
============================ */
function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender === 'user' ? 'user' : 'jesus');
  const senderName =
    sender === 'user'
      ? '<strong>Você:</strong>'
      : '<strong style="color:#8B0000">Jesus:</strong>';
  messageDiv.innerHTML = `${senderName} ${text}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* ============================
   Chat 1 (Jesus) envio
============================ */
if (chatForm) {
  chatForm.addEventListener('submit', async e => {
    e.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) {
      appendMessage('jesus', '⚠️ Por favor, digite uma mensagem primeiro.');
      return;
    }

    appendMessage('user', userMessage);
    messageInput.value = '';
    loadingIndicator.style.display = 'flex';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.warn('⚠️ Erro ao interpretar resposta do servidor:', parseError);
        appendMessage('jesus', 'Desculpe, não entendi a resposta.');
        loadingIndicator.style.display = 'none';
        return;
      }

      loadingIndicator.style.display = 'none';

      if (data && data.reply) {
        appendMessage('jesus', data.reply);
        speakJesus(data.reply);

        // Atualiza o salmo com base na mensagem do chat 1
        const salmo = getSalmoParaUsuario(userMessage);
        mostrarSalmoNoContainer(salmo);
      } else {
        appendMessage('jesus', 'Desculpe, não recebi uma resposta.');
      }

    } catch (err) {
      console.error('❌ Erro na conexão com /api/chat:', err);
      loadingIndicator.style.display = 'none';
      const lastMessage = chatBox.lastElementChild?.textContent || '';
      if (!lastMessage.includes('Jesus:')) {
        appendMessage('jesus', 'Erro ao se conectar com Jesus.');
      }
    }
  });
}

/* ============================
   Chat 2 — Palavra de Sabedoria
============================ */
function addBibliaMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = isUser ? "user-message" : "bot-message";

  const html = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)(<br>|$)/g, '<h4>$1</h4>');

  msg.innerHTML = html;
  bibliaChatBox.appendChild(msg);
  bibliaChatBox.scrollTop = bibliaChatBox.scrollHeight;
}

async function enviarBibliaMensagem(mensagemUsuario) {
  const mensagemFinal = `A dificuldade relatada pelo usuário é: ${mensagemUsuario}. Traga um versículo que ensine como lidar com isso.`;
  try {
    const resposta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: mensagemFinal, tipo: "biblia" }),
    });
    const data = await resposta.json();
    if (data.reply) addBibliaMessage(data.reply);
    else addBibliaMessage("Não consegui encontrar uma palavra agora, mas confie no Senhor.");
  } catch (err) {
    addBibliaMessage("Erro ao buscar a resposta. Tente novamente mais tarde.");
  }
}

if (bibliaForm) {
  bibliaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = bibliaInput.value.trim();
    if (!texto) return;

    addBibliaMessage(texto, true);
    bibliaInput.value = "";

    const loading = document.createElement("div");
    loading.className = "bot-message";
    loading.textContent = "Buscando a Palavra...";
    bibliaChatBox.appendChild(loading);

    await enviarBibliaMensagem(texto);
    loading.remove();

    const salmo = getSalmoParaUsuario(texto);
    mostrarSalmoNoContainer(salmo);
  });
}

/* ============================
   Voz / reconhecimento
============================ */
if (voiceBtn) {
  voiceBtn.addEventListener('click', () => {
    if (!('webkitSpeechRecognition' in window)) {
      voiceBtn.disabled = true;
      voiceBtn.innerText = '🎙️ Indisponível';
      return;
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;

    voiceBtn.classList.add('listening');
    voiceBtn.innerText = 'Falando...';

    recognition.start();

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      messageInput.value = transcript;
      chatForm.dispatchEvent(new Event('submit'));
    };

    recognition.onerror = event => {
      console.error('Erro no reconhecimento de voz:', event && event.error);
      appendMessage('jesus', 'Não consegui entender sua voz.');
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('listening');
      voiceBtn.innerText = 'Fale';
    };
  });

  voiceBtn.addEventListener('dblclick', async () => {
    const lastMessage = Array.from(chatBox.querySelectorAll('.jesus')).pop();
    if (lastMessage) await speakJesus(lastMessage.textContent);
  });
}

/* ============================
   Toggle dos chats (expansão)
============================ */
if (chatJesusContainer) chatJesusContainer.classList.remove('expanded');
if (bibliaChatContainer) bibliaChatContainer.classList.remove('expanded');

function toggleChat(container, button) {
  if (!container || !button) return;
  const willOpen = !container.classList.contains('expanded');

  [chatJesusContainer, bibliaChatContainer].forEach(c => {
    if (c && c !== container) c.classList.remove('expanded');
  });
  [toggleJesusBtn, toggleBibliaBtn].forEach(b => b && b.classList.remove('active'));

  if (willOpen) {
    container.classList.add('expanded');
    button.classList.add('active');
    setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  } else {
    container.classList.remove('expanded');
    button.classList.remove('active');
  }
}

/* ============================
   Inicialização após DOM carregado
============================ */
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  // Inicializa toggles
  if (toggleJesusBtn) toggleJesusBtn.addEventListener('click', e => { e.stopPropagation(); toggleChat(chatJesusContainer, toggleJesusBtn); });
  if (toggleBibliaBtn) toggleBibliaBtn.addEventListener('click', e => { e.stopPropagation(); toggleChat(bibliaChatContainer, toggleBibliaBtn); });

  // Inicializa speechSynthesis
  if ('speechSynthesis' in window) {
    getVoices().then(voices => { voicesList = voices; });
    speechSynthesis.onvoiceschanged = async () => { voicesList = await getVoices(); };
  }

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ Service Worker registrado:', reg))
      .catch(err => console.error('❌ Erro ao registrar SW:', err));
  }

  // Salmos
  if (typeof carregarSalmos === 'function') carregarSalmos();
});
