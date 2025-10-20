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
   Funções de chat / voz
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

// 🧠 ====== VALIDADOR DE VOZ (speechSynthesis) ======
window.addEventListener('load', () => {

  // 🔹 Função auxiliar para mostrar mensagem no console
  function showMessage(msg, type = 'log') {
    if (type === 'error') console.error(msg);
    else if (type === 'warn') console.warn(msg);
    else console.log(msg);
  }

  try {
    // 🔸 Verifica se a API speechSynthesis existe no navegador
    if (!('speechSynthesis' in window)) {
      showMessage('❌ speechSynthesis não detectado', 'error');
    } else {
      // 🔸 Se existir, obtém a lista de vozes disponíveis
      const voices = speechSynthesis.getVoices();
      showMessage('✅ speechSynthesis detectado.');
      showMessage(`Vozes carregadas: ${voices.length}`);

      if (voices.length === 0) {
        showMessage('⚠️ speechSynthesis detectado, mas sem vozes ainda', 'warn');
      } else {
        // 🔹 Lista nomes das vozes disponíveis
        voices.forEach(v => showMessage(`- ${v.name} (${v.lang})`));
      }
    }
  } catch (e) {
    // 🔸 Captura possíveis falhas inesperadas
    showMessage(`⚠️ Falha ao validar speechSynthesis: ${e}`, 'warn');
  }
});

// 🧩 ====== FIM DO VALIDADOR ======

function isVoiceEnabled() {
  return localStorage.getItem('voiceEnabled') === 'true';
}

function speakJesus(text) {
  if (!isVoiceEnabled()) return;

  // Se speechSynthesis não existe → fallback
  if (!('speechSynthesis' in window)) {
    console.warn('⚠️ speechSynthesis não disponível neste PWA. Usando fallback.');
    appendMessage('jesus', '🗣️ [voz indisponível neste PWA]');
    return;
  }

  // Função interna para falar
  function doSpeak() {
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

  // ⚡ Se vozes ainda não carregaram, aguarda o evento voiceschanged
  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      doSpeak();
      speechSynthesis.onvoiceschanged = null; // evita múltiplas chamadas
    };
  } else {
    doSpeak();
  }
}

/* ============================
   Chat 2 — Palavra de Sabedoria
   ============================ */

function addBibliaMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = isUser ? "user-message" : "bot-message";

  // converte quebras de linha em <br> e aplica formatação Markdown simples
  const html = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **negrito**
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *itálico*
    .replace(/### (.*?)(<br>|$)/g, '<h4>$1</h4>'); // títulos estilo ###

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
    if (data.reply) {
      addBibliaMessage(data.reply);
    } else {
      addBibliaMessage("Não consegui encontrar uma palavra agora, mas confie no Senhor.");
    }
  } catch (err) {
    addBibliaMessage("Erro ao buscar a resposta. Tente novamente mais tarde.");
  }
}

// trata submit do formulário do chat bíblia
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

    // ✅ Atualiza o salmo com base na mensagem do chat 2
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
   Menu lateral
   ============================ */

function toggleMenu() {
  sideMenu.classList.toggle('open');
}

if (closeMenuBtn) closeMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); sideMenu.classList.remove('open'); });

document.addEventListener('click', (e) => {
  if (sideMenu.classList.contains('open')) {
    if (!sideMenu.contains(e.target) && !e.target.closest('.menu-btn')) {
      sideMenu.classList.remove('open');
    }
  }
});

if (sideMenu) sideMenu.addEventListener('click', (e) => e.stopPropagation());

/* ============================
   Salmo popup / YouTube
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
   Share / install
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

window.onload = () => {
  loadSettings();
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => { voicesList = speechSynthesis.getVoices(); };
    voicesList = speechSynthesis.getVoices();
  }

  // ✅ Garante que os salmos sejam carregados antes de usar
  if (typeof carregarSalmos === 'function') {
    carregarSalmos();
  }
   
   // Registro do Service Worker
   if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
         navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('✅ Service Worker registrado:', reg))
            .catch(err => console.error('❌ Erro ao registrar SW:', err));
      });
   }
};

// beforeinstallprompt (popup)
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
     
