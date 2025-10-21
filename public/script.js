// == Elementos principais ==
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const voiceBtn = document.getElementById('voice-btn');
const loadingIndicator = document.getElementById('loading');
const sideMenu = document.getElementById('sideMenu');
const menuBtn = document.querySelector('.menu-btn'); 
const closeMenuBtn = document.getElementById('closeMenuBtn');
//const voiceToggle = document.getElementById('voiceToggle');
//const voiceRadios = document.querySelectorAll('input[name="voiceType"]');
const shareBtn = document.getElementById('shareBtn');
const synth = window.speechSynthesis;

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

  if (sender === 'jesus') {
    messageDiv.innerHTML = `
      ${senderName} ${text}
      <br>
      <button class="voice-btn">🔊 Ouvir resposta</button>
    `;
  } else {
    messageDiv.innerHTML = `${senderName} ${text}`;
  }

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (sender === 'jesus') {
    const voiceBtn = messageDiv.querySelector('.voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => speakJesus(text));
    }
  }
}

//=== Função resposta de Jesus com voz ===//
function speakJesus(texto) {
  if (!texto) return;
  // Se Jesus já estiver falando, interrompe antes de iniciar de novo
  if (synth.speaking) synth.cancel();
  let voices = synth.getVoices();
  // Se o navegador ainda não carregou as vozes, espera e tenta novamente
  if (voices.length === 0) {
    synth.onvoiceschanged = () => speakJesus(texto);
    return;
  }
 
  const msg = new SpeechSynthesisUtterance(texto);
  msg.voice = voices.find(v => v.lang === "pt-BR") || voices[0];
  msg.lang = "pt-BR";
  msg.rate = 1;
  msg.pitch = 1;

  synth.speak(msg);
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

      // ✅ Verifica se houve resposta
      if (data && data.reply) {
        appendMessage('jesus', data.reply);

        // Atualiza o salmo
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

       // === Adiciona botão "Ouvir" na resposta da Palavra de Sabedoria ===
       const chatBoxSabedoria = document.getElementById('biblia-chat-box');
       // Cria o botão
       const ouvirBtnSabedoria = document.createElement('button');
       ouvirBtnSabedoria.textContent = '🔊 Ouvir resposta';
       ouvirBtnSabedoria.className = 'ouvir-btn';
       // Adiciona evento de clique
       ouvirBtnSabedoria.addEventListener('click', () => {
          speakJesus(data.reply); // Usa a mesma função de fala do chat de Jesus
       });
       // Insere o botão antes da última resposta
       const ultimaMensagem = chatBoxSabedoria.lastElementChild;
       if (ultimaMensagem) {
          chatBoxSabedoria.insertBefore(ouvirBtnSabedoria, ultimaMensagem);
       }
   
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
   Reconhecimento de Voz (Botão Fale)
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

// Espera o DOM estar carregado
window.addEventListener('DOMContentLoaded', () => {
  if (!sideMenu) return; // sai se não existir

  // Toggle menu ao clicar no botão
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      sideMenu.classList.toggle('open');
    });
  }

  // Fecha menu ao clicar no X
  if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sideMenu.classList.remove('open');
    });
  }

  // Fecha menu ao clicar fora dele
  document.addEventListener('click', (e) => {
    if (sideMenu.classList.contains('open') &&
        !sideMenu.contains(e.target) &&
        !e.target.closest('.menu-btn')) {
      sideMenu.classList.remove('open');
    }
  });

  // Evita que clique dentro do menu feche ele
  sideMenu.addEventListener('click', (e) => e.stopPropagation());
});


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

window.onload = () => {
  // loadSettings(); --->> validar se está sendo usado.
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
     
