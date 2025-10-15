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

let voicesList = [];

/* ============================
   Funções de chat / voz (mantive sua lógica)
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

function speakJesus(text) {
  if ('speechSynthesis' in window && isVoiceEnabled()) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.pitch = 1;
    utterance.rate = 1;

    const selected = [...voiceRadios].find(r => r.checked)?.value;
    const voices = speechSynthesis.getVoices();
    let found = null;
    if (selected === 'male') {
      found = voices.find(v => v.lang.startsWith('pt') && /ricardo|male/i.test(v.name)) || voices.find(v => v.lang.startsWith('pt'));
    } else {
      found = voices.find(v => v.lang.startsWith('pt') && /ana|female|google/i.test(v.name)) || voices.find(v => v.lang.startsWith('pt'));
    }
    if (found) utterance.voice = found;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
}

function isVoiceEnabled() {
  return localStorage.getItem('voiceEnabled') === 'true';
}

function saveSettings() {
  if (voiceToggle) localStorage.setItem('voiceEnabled', voiceToggle.checked);
  const selectedVoice = [...voiceRadios].find(radio => radio.checked)?.value;
  if (selectedVoice) localStorage.setItem('voiceType', selectedVoice);
}

function loadSettings() {
  const voiceEnabledStorage = localStorage.getItem('voiceEnabled');
  if (voiceToggle) voiceToggle.checked = voiceEnabledStorage !== null ? voiceEnabledStorage === 'true' : true;

  const voiceTypeStorage = localStorage.getItem('voiceType');
  if (voiceTypeStorage) {
    [...voiceRadios].forEach(radio => radio.checked = radio.value === voiceTypeStorage);
  } else {
    [...voiceRadios].forEach(radio => radio.checked = radio.value === 'male');
    localStorage.setItem('voiceType', 'male');
  }
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
      const data = await response.json();
      loadingIndicator.style.display = 'none';
      if (data && data.reply) {
        appendMessage('jesus', data.reply);
        speakJesus(data.reply);
      } else {
        appendMessage('jesus', 'Desculpe, não recebi uma resposta.');
      }
    } catch (err) {
      loadingIndicator.style.display = 'none';
      console.error('Erro:', err);
      appendMessage('jesus', 'Erro ao se conectar com Jesus.');
    }
  });
}

/* ============================
   Chat 2 — Palavra de Sabedoria (usa a mesma API)
   ============================ */

function addBibliaMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = isUser ? "user-message" : "bot-message";
  msg.textContent = text;
  bibliaChatBox.appendChild(msg);
  bibliaChatBox.scrollTop = bibliaChatBox.scrollHeight;
}

async function enviarBibliaMensagem(mensagemUsuario) {
  const mensagemFinal = `A dificuldade relatada pelo usuário é: ${mensagemUsuario}. Traga um versículo que ensine como lidar com isso.`;
  try {
    const resposta = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: mensagemFinal }),
    });
    const data = await resposta.json();
    if (data.reply) {
      addBibliaMessage(data.reply);
    } else {
      addBibliaMessage("Não consegui encontrar uma palavra agora, mas confie no Senhor.");
    }
  } catch (err) {
    addBibliaMessage("Erro ao buscar a resposta. Tente novamente mais tarde.");
  }
}

// trata submit do formulário do chat bíblia (preserva acessibilidade teclado)
if (bibliaForm) {
  bibliaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = bibliaInput.value.trim();
    if (!texto) return;
    addBibliaMessage(texto, true);
    bibliaInput.value = "";
    const loading = document.createElement("div");
    loading.className = "bot-message";
    loading.textContent = "Buscando na Palavra...";
    bibliaChatBox.appendChild(loading);
    await enviarBibliaMensagem(texto);
    loading.remove();
  });
}

/* ============================
   Voz / reconhecimento (botão "Fale")
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

    // feedback visual
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
}

/* ============================
   Toggle dos chats (expansão)
   ============================ */

// Garante que containers comecem escondidos por CSS — caso não estejam, aplica
if (chatJesusContainer) chatJesusContainer.classList.remove('expanded');
if (bibliaChatContainer) bibliaChatContainer.classList.remove('expanded');

// função genérica de toggle que alterna classe 'expanded'
function toggleChat(container, button) {
  if (!container || !button) return;
  const willOpen = !container.classList.contains('expanded');

  // fecha ambos antes de abrir (comportamento agrupado, se desejar)
  [chatJesusContainer, bibliaChatContainer].forEach(c => {
    if (c && c !== container) c.classList.remove('expanded');
  });
  [toggleJesusBtn, toggleBibliaBtn].forEach(b => b && b.classList.remove('active'));

  if (willOpen) {
    container.classList.add('expanded');
    button.classList.add('active');
    // rolar para o container aberto (bom em mobile)
    setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  } else {
    container.classList.remove('expanded');
    button.classList.remove('active');
  }
}

// proteções para não fechar o menu quando clicar nos toggles
if (toggleJesusBtn) {
  toggleJesusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleChat(chatJesusContainer, toggleJesusBtn);
  });
}
if (toggleBibliaBtn) {
  toggleBibliaBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleChat(bibliaChatContainer, toggleBibliaBtn);
  });
}

/* ============================
   Menu lateral: abrir/fechar e clique fora
   ============================ */

function toggleMenu() {
  sideMenu.classList.toggle('open');
}

// fechar menu com botão X
if (closeMenuBtn) closeMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); sideMenu.classList.remove('open'); });

// clique fora para fechar menu — só dispara se o menu estiver aberto
document.addEventListener('click', (e) => {
  // se o menu está aberto e o target não está dentro do menu nem é o botão do menu
  if (sideMenu.classList.contains('open')) {
    if (!sideMenu.contains(e.target) && !e.target.closest('.menu-btn')) {
      sideMenu.classList.remove('open');
    }
  }
});

// impede que cliques dentro do menu fechem por acidente
if (sideMenu) sideMenu.addEventListener('click', (e) => e.stopPropagation());

/* ============================
   Salmo popup / YouTube (mantive sua lógica com fallback)
   ============================ */

const salmoLink   = document.getElementById('salmoLink');
const salmoPopup  = document.getElementById('salmoPopup');
const salmoOverlay= document.getElementById('salmoOverlay');
const salmoInput  = document.getElementById('salmoInput');
const salmoBuscar = document.getElementById('salmoBuscar');
const salmoFechar = document.getElementById('salmoFechar');

if (salmoLink) {
  salmoLink.addEventListener('click', e => {
    e.preventDefault();
    salmoPopup.style.display = 'block';
    salmoOverlay.style.display = 'block';
    salmoInput && salmoInput.focus();
  });
}
function closeSalmoPopup(){
  if (salmoPopup) salmoPopup.style.display = 'none';
  if (salmoOverlay) salmoOverlay.style.display = 'none';
  if (salmoInput) salmoInput.value = '';
}
if (salmoFechar) salmoFechar.addEventListener('click', closeSalmoPopup);
if (salmoOverlay) salmoOverlay.addEventListener('click', closeSalmoPopup);

if (salmoBuscar) {
  salmoBuscar.addEventListener('click', () => {
    const query = salmoInput.value.trim();
    if (!query) return;
    const appUrl = `youtube://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const webUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.location.href = appUrl;
    setTimeout(() => window.open(webUrl, '_blank'), 800);
    closeSalmoPopup();
  });
}

/* ============================
   Share / install / outras inicializações
   ============================ */

if (shareBtn) {
  const shareUrl = 'https://chat-jesus.vercel.app/';
  shareBtn.href = `https://wa.me/?text=Vem%20conversar%20com%20Jesus%20neste%20link%20🙏❤️%20%0A${encodeURIComponent(shareUrl)}`;
  shareBtn.addEventListener('click', (e) => {
    if (navigator.share) {
      e.preventDefault();
      navigator.share({ title: 'Chat com Jesus', text: 'Converse com Jesus usando este chat:', url: shareUrl })
        .catch(err => console.error(err));
    }
  });
}

window.onload = () => {
  loadSettings();
  if ('speechSynthesis' in window) {
    // força recarregar vozes quando estiverem prontas
    speechSynthesis.onvoiceschanged = () => { voicesList = speechSynthesis.getVoices(); };
    voicesList = speechSynthesis.getVoices();
  }
};

// beforeinstallprompt (preserva seu popup)
let deferredPrompt;
const installPopup = document.getElementById('installPopup');
const installOverlay = document.getElementById('installOverlay');
const btnInstall = document.getElementById('btnInstall');
const btnDismiss = document.getElementById('btnDismiss');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if (installPopup && installOverlay) {
    installPopup.style.display = 'block';
    installOverlay.style.display = 'block';
  }
});
if (btnInstall) btnInstall.addEventListener('click', () => {
  if (installPopup && installOverlay) { installPopup.style.display = 'none'; installOverlay.style.display = 'none'; }
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => deferredPrompt = null);
  }
});
if (btnDismiss) btnDismiss.addEventListener('click', () => {
  if (installPopup && installOverlay) { installPopup.style.display = 'none'; installOverlay.style.display = 'none'; }
});

/* ============================
   Suporte para fechamento final (garantia)
   ============================ */
if (closeMenuBtn) {
  closeMenuBtn.addEventListener('click', () => sideMenu.classList.remove('open'));
                      }
