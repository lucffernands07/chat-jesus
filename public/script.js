// == Elementos principais ==
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const voiceBtn = document.getElementById('voice-btn');
const loadingIndicator = document.getElementById('loading');
const sideMenu = document.getElementById('sideMenu');
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
const toggleSalmoBtn = document.getElementById("salmo-toggle");
const salmoContainer = document.getElementById("salmo-container");

// Salmo elementos
const salmoTexto = document.getElementById('salmo-texto');
const salmoOuvirBtn = document.getElementById('salmo-ouvir-btn');

let voicesList = [];

/* ============================
   Funções de voz / preferências
   ============================ */
function falarTexto(texto) {
  if (!('speechSynthesis' in window)) return;

  const vozAtiva = localStorage.getItem('vozAtiva') === 'true';
  const tipoVoz = localStorage.getItem('tipoVoz') || 'male';

  if (!vozAtiva) return;

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'pt-BR';
  utterance.rate = 1;
  utterance.pitch = 1;

  function escolherVoz() {
    const vozes = window.speechSynthesis.getVoices();
    let vozEscolhida;

    if (tipoVoz === 'male') {
      vozEscolhida = vozes.find(v =>
        v.lang === 'pt-BR' && /male|joão|rafael/i.test(v.name.toLowerCase())
      );
    }
    if (!vozEscolhida) {
      vozEscolhida = vozes.find(v => v.lang === 'pt-BR');
    }

    if (vozEscolhida) utterance.voice = vozEscolhida;
    window.speechSynthesis.speak(utterance);
  }

  if (speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = escolherVoz;
  } else {
    escolherVoz();
  }
}

function loadSettings() {
  const voiceToggle = document.getElementById('voiceToggle');
  const radios = document.querySelectorAll('input[name="voiceType"]');

  const vozAtiva = localStorage.getItem('vozAtiva');
  if (vozAtiva !== null) voiceToggle.checked = vozAtiva === 'true';

  const tipoVoz = localStorage.getItem('tipoVoz');
  if (tipoVoz) {
    radios.forEach(r => r.checked = r.value === tipoVoz);
  }

  voiceToggle.addEventListener('change', () => {
    localStorage.setItem('vozAtiva', voiceToggle.checked);
  });
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      localStorage.setItem('tipoVoz', radio.value);
    });
  });
}

/* ============================
   Funções de chat
   ============================ */
function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender === 'user' ? 'user' : 'jesus');
  const senderName = sender === 'user' ? '<strong>Você:</strong>' : '<strong style="color:#8B0000">Jesus:</strong>';
  messageDiv.innerHTML = `${senderName} ${text}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (sender === 'jesus') falarTexto(text);
}

function addBibliaMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = isUser ? "user-message" : "bot-message";
  msg.innerHTML = text.replace(/\n/g, '<br>');
  bibliaChatBox.appendChild(msg);
  bibliaChatBox.scrollTop = bibliaChatBox.scrollHeight;

  if (!isUser) falarTexto(text);
}

function mostrarSalmo(texto) {
  if (!salmoTexto) return;
  salmoTexto.textContent = texto;
}

/* ============================
   Chat 1 — Jesus
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

        // Atualiza o Salmo com base na mensagem do usuário
        const salmo = getSalmoParaUsuario(userMessage);
        mostrarSalmo(salmo);
      } else {
        appendMessage('jesus', 'Desculpe, não recebi uma resposta.');
      }

    } catch (err) {
      console.error('Erro no chat 1:', err);
      loadingIndicator.style.display = 'none';
      appendMessage('jesus', 'Erro ao se conectar com Jesus.');
    }
  });
}

/* ============================
   Chat 2 — Palavra de Sabedoria
   ============================ */
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

if (bibliaForm) {
  bibliaForm.addEventListener('submit', async e => {
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
    mostrarSalmo(salmo);
  });
}

/* ============================
   Reconhecimento de voz
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
      console.error('Erro no reconhecimento de voz:', event.error);
      appendMessage('jesus', 'Não consegui entender sua voz.');
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('listening');
      voiceBtn.innerText = 'Fale';
    };
  });
}

/* ============================
   Botão "Ouvir" do Salmo
   ============================ */
if (salmoOuvirBtn) {
  salmoOuvirBtn.addEventListener('click', () => {
    if (salmoTexto && salmoTexto.textContent) {
      falarTexto(salmoTexto.textContent);
    }
  });
}

/* ============================
   Toggle dos chats
   ============================ */
function toggleChat(container, button) {
  if (!container || !button) return;
  const willOpen = !container.classList.contains('expanded');

  [chatJesusContainer, bibliaChatContainer, toggleSalmoBtn].forEach(c => {
    if (c && c !== container) c.classList.remove('expanded');
  });
  [toggleJesusBtn, toggleBibliaBtn, toggleSalmoBtn].forEach(b => b && b.classList.remove('active'));

  if (willOpen) {
    container.classList.add('expanded');
    button.classList.add('active');
    setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  } else {
    container.classList.remove('expanded');
    button.classList.remove('active');
  }
}

if (toggleJesusBtn) toggleJesusBtn.addEventListener('click', e => { e.stopPropagation(); toggleChat(chatJesusContainer, toggleJesusBtn); });
if (toggleBibliaBtn) toggleBibliaBtn.addEventListener('click', e => { e.stopPropagation(); toggleChat(bibliaChatContainer, toggleBibliaBtn); });
if (toggleSalmoBtn) toggleSalmoBtn.addEventListener('click', e => { e.stopPropagation(); toggleChat(salmoContainer, toggleSalmoBtn); });

/* ============================
   Menu lateral
   ============================ */
function toggleMenu() {
  sideMenu.classList.toggle('open');
}
if (closeMenuBtn) closeMenuBtn.addEventListener('click', e => { e.stopPropagation(); sideMenu.classList.remove('open'); });
document.addEventListener('click', e => {
  if (sideMenu.classList.contains('open')) {
    if (!sideMenu.contains(e.target) && !e.target.closest('.menu-btn')) sideMenu.classList.remove('open');
  }
});
if (sideMenu) sideMenu.addEventListener('click', e => e.stopPropagation());

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
   Share / Install
   ============================ */
if (shareBtn) {
  const shareUrl = 'https://chat-jesus.vercel.app/';
  shareBtn.href = `https://wa.me/?text=Vem%20conversar%20com%20Jesus%20neste%20link%20🙏❤️%20%0A${encodeURIComponent(shareUrl)}`;
  shareBtn.addEventListener('click', e => {
    if (navigator.share) {
      e.preventDefault();
      navigator.share({
        title: 'Chat com Jesus',
        text: 'Converse com Jesus usando este chat:',
        url: shareUrl
      }).catch(err => console.error(err));
    }
  });
}

/* ============================
   Inicialização
   ============================ */
window.onload = () => {
  loadSettings();

  // Registro do Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ Service Worker registrado:', reg))
      .catch(err => console.error('❌ Erro ao registrar SW:', err));
  }
};

/* ============================
   BeforeInstallPrompt (popup de instalação)
   ============================ */
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

if (btnInstall) {
  btnInstall.addEventListener('click', () => {
    if (installPopup && installOverlay) {
      installPopup.style.display = 'none';
      installOverlay.style.display = 'none';
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => deferredPrompt = null);
    }
  });
}

if (btnDismiss) {
  btnDismiss.addEventListener('click', () => {
    if (installPopup && installOverlay) {
      installPopup.style.display = 'none';
      installOverlay.style.display = 'none';
    }
  });
}
