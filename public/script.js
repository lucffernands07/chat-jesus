// == Elementos principais ==
const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const voiceBtn = document.getElementById('voice-btn');
const loadingIndicator = document.getElementById('loading');
const sideMenu = document.getElementById('sideMenu');
const menuBtn = document.querySelector('.menu-btn'); 
const closeMenuBtn = document.getElementById('closeMenuBtn');
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

function getPronomeUsuario() {
  return localStorage.getItem('pronome') || 'filho';
}

function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender === 'user' ? 'user' : 'jesus');

  const pronome = getPronomeUsuario();
  const senderName =
    sender === 'user'
      ? '<strong>Você:</strong>'
      : `<strong style="color:#8B0000">👼🏻:</strong>`;

  if (sender === 'jesus') {
    // Insere pronome no texto
    const textoComPronome = text.replace(/\{pronome\}/g, pronome);

    messageDiv.innerHTML = `
      ${senderName} ${textoComPronome}
      <br>
      <button class="voice-btn">🔊 Ouvir resposta</button>
      <br>
    `;
  } else {
    messageDiv.innerHTML = `${senderName} ${text}`;
  }

  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Botão de voz
  if (sender === 'jesus') {
    const voiceBtn = messageDiv.querySelector('.voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => speakJesus(text));
    }
  }
}

//=== Função resposta de Jesus com voz ===//
function speakJesus(text) {
  if (!('speechSynthesis' in window)) {
    alert("Seu navegador não suporta leitura por voz.");
    return;
  }

  // Cancela qualquer fala anterior
  window.speechSynthesis.cancel();

  // 🔹 Limpa o texto
  const cleanText = text
    .replace(/[*#_]/g, "")           // remove asteriscos e símbolos de markdown
    .replace(/\s+/g, " ")            // remove espaços extras
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')  // remove emojis comuns
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')  // remove emojis de símbolos e pictogramas
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')  // remove emojis de transporte
    .replace(/[\u{2600}-\u{26FF}]/gu, '')    // remove símbolos misc
    .replace(/[\u{2700}-\u{27BF}]/gu, '')    // remove símbolos adicionais
    .trim();

  // 🔹 Reduz pausas após pontos finais
  const adjustedText = cleanText.replace(/\.\s+/g, '.\u200B');
   
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // ✅ Ajustes finos para voz natural
  utterance.lang = "pt-BR";
  utterance.rate = 1.15;     // velocidade ligeiramente acima do normal
  utterance.pitch = 1;       // tom natural
  utterance.volume = 1;      // volume máximo

  // 🧠 Alguns navegadores demoram a carregar vozes
  const voices = speechSynthesis.getVoices();
  const vozPt = voices.find(v => v.lang.startsWith("pt-BR"));
  if (vozPt) utterance.voice = vozPt;

  // ⚙️ Hack para Safari e Chrome: reinicializa vozes se estiverem vazias
  if (!vozPt && voices.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      const vozAtualizada = speechSynthesis.getVoices().find(v => v.lang.startsWith("pt-BR"));
      if (vozAtualizada) {
        utterance.voice = vozAtualizada;
        window.speechSynthesis.speak(utterance);
      }
    };
  }

  // 🚀 Fala o texto
  window.speechSynthesis.speak(utterance);
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
      if (!lastMessage.includes('👼🏻:')) {
        appendMessage('👼🏻', 'Erro ao se conectar com Jesus.');
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

  // Só adiciona o botão se for mensagem da IA
  if (!isUser) {
    const ouvirBtn = document.createElement("button");
    ouvirBtn.className = "ouvir-btn"; 
    ouvirBtn.textContent = "🔊 Ouvir resposta";
    ouvirBtn.style.marginBottom = "6px";
    ouvirBtn.onclick = () => speakJesus(text);
    msg.appendChild(ouvirBtn);
  }

  // Converte formatação básica
  const html = text
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/### (.*?)(<br>|$)/g, "<h4>$1</h4>");

  // Adiciona o texto normalmente
  const divTexto = document.createElement("div");
  divTexto.innerHTML = html;
  msg.appendChild(divTexto);

  // Exibe na tela
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

  // Garante que os salmos sejam carregados antes de usar
  if (typeof carregarSalmos === 'function') {
    carregarSalmos();
  }

  // Registro do Service Worker
  // Define a versão do SW
const SW_VERSION = 'v11';

// Registro do Service Worker com query string
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(`/service-worker.js?${SW_VERSION}`)
    .then(reg => {
      console.log('✅ Service Worker registrado:', reg);

      // Se já houver um SW esperando
      if (reg.waiting) {
        showUpdateNotification(reg.waiting);
      }

      // Se um novo SW estiver sendo instalado
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification(newWorker);
          }
        });
      });
    })
    .catch(err => console.error('❌ Erro ao registrar SW:', err));
}

    // Se um novo SW estiver sendo instalado
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateNotification(newWorker);
        }
      });
    });
  }).catch(err => console.error('❌ Erro ao registrar SW:', err));
}

function showUpdateNotification(worker) {
  if (document.getElementById('update-aviso')) return;

  const aviso = document.createElement('div');
  aviso.id = 'update-aviso';
  aviso.innerHTML = `
    ✨ Nova versão disponível! 
    <button id="update-btn">Atualizar</button>
  `;
  aviso.style = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffeb3b;
    color: #000;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 9999;
    font-weight: bold;
  `;
  document.body.appendChild(aviso);

  document.getElementById('update-btn').addEventListener('click', () => {
    worker.postMessage('SKIP_WAITING');
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
   
   // Função independente para prompt de atualização (opcional)
   function showUpdatePrompt(worker) {
      if (confirm('✨ Nova versão disponível! Deseja atualizar agora?')) {
         worker.postMessage('SKIP_WAITING');
         window.location.reload();
      }
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

//== Tutorial de voz ==//
const tutorialBtn = document.getElementById('tutorialBtn'); // botão do menu lateral
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tutorialPopup = document.getElementById('tutorialPopup');
const tutorialStepEl = document.getElementById('tutorialStep');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const closeTutorialBtn = document.getElementById('closeTutorialBtn');

// Conteúdo das etapas
const tutorialSteps = [
  "✅ Passo 1: Abra as configurações do seu celular e busque 🔍 por <strong>conversão de texto em voz.</strong>",
  "✅ Passo 2: Clique na engrenagem ⚙️ em <strong>mecanismo preferencial</strong>.",
  "✅ Passo 3: Clique em <strong>instalar dados de voz</strong> e selecione o idioma português (Brasil).",
  "✅ Passo 4: Selecione a <strong>voz II</strong> para voz masculina.",
  "✅ Passo 5: Volte para o app, <strong>atualize</strong> 🔃 e teste a voz no chat."
];

let currentStep = 0;

function showStep(stepIndex) {
  tutorialStepEl.innerHTML = tutorialSteps[stepIndex]; // aqui
  prevStepBtn.style.display = stepIndex === 0 ? "none" : "inline-block";
  nextStepBtn.style.display = stepIndex === tutorialSteps.length - 1 ? "none" : "inline-block";
}

function openTutorial() {
  tutorialOverlay.style.display = "block";
  tutorialPopup.style.display = "block";
  currentStep = 0;
  showStep(currentStep);
}

function closeTutorial() {
  tutorialOverlay.style.display = "none";
  tutorialPopup.style.display = "none";
}

// Eventos
tutorialBtn.addEventListener('click', openTutorial);
tutorialOverlay.addEventListener('click', closeTutorial);
closeTutorialBtn.addEventListener('click', closeTutorial);
prevStepBtn.addEventListener('click', () => {
  if (currentStep > 0) currentStep--;
  showStep(currentStep);
});
nextStepBtn.addEventListener('click', () => {
  if (currentStep < tutorialSteps.length - 1) currentStep++;
  showStep(currentStep);
});


//== Configuração para pronome persistente com IndexedDB ==//
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("pronomeOverlay");
  const btnFilho = document.getElementById("btnFilho");
  const btnFilha = document.getElementById("btnFilha");

  const dbRequest = indexedDB.open("chatJesusDB", 1);

  dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("settings")) {
      db.createObjectStore("settings", { keyPath: "name" });
    }
  };

  dbRequest.onsuccess = (event) => {
    const db = event.target.result;

    const getPronome = () => new Promise(resolve => {
      const tx = db.transaction("settings", "readonly");
      const store = tx.objectStore("settings");
      const req = store.get("pronome");
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    });

    const setPronome = (value) => {
      const tx = db.transaction("settings", "readwrite");
      const store = tx.objectStore("settings");
      store.put({ name: "pronome", value });
      localStorage.setItem("pronome", value); // compatibilidade antiga
      overlay.style.display = "none";
    };

    getPronome().then(pronome => {
      if (!pronome) overlay.style.display = "flex";
      else localStorage.setItem("pronome", pronome);
    });

    btnFilho.addEventListener("click", () => setPronome("filho"));
    btnFilha.addEventListener("click", () => setPronome("filha"));
  };
});
