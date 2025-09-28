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

let voicesList = [];

// Função para adicionar mensagem na tela
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

// Função para falar
function speakJesus(text) {
  if ('speechSynthesis' in window && isVoiceEnabled()) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.pitch = 1;
    utterance.rate = 1;

    const selectedVoice = getSelectedVoice();
    if (selectedVoice) utterance.voice = selectedVoice;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
}

// Obter voz selecionada
function getSelectedVoice() {
  const selected = [...voiceRadios].find(radio => radio.checked)?.value;
  if (!selected) return null;

  const voices = speechSynthesis.getVoices();
  if (selected === 'male') {
    return (
      voices.find(
        v =>
          v.lang === 'pt-BR' &&
          (v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('ricardo'))
      ) || voices.find(v => v.lang.startsWith('pt')) || voices[0]
    );
  } else {
    return (
      voices.find(
        v =>
          v.lang === 'pt-BR' &&
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('ana') ||
            v.name.toLowerCase().includes('google'))
      ) || voices.find(v => v.lang.startsWith('pt')) || voices[0]
    );
  }
}

// Verifica se a voz está ativada
function isVoiceEnabled() {
  return localStorage.getItem('voiceEnabled') === 'true';
}

// Salvar configurações
function saveSettings() {
  localStorage.setItem('voiceEnabled', voiceToggle.checked);
  const selectedVoice = [...voiceRadios].find(radio => radio.checked)?.value;
  if (selectedVoice) localStorage.setItem('voiceType', selectedVoice);
}

// Carregar configurações
function loadSettings() {
  const voiceEnabledStorage = localStorage.getItem('voiceEnabled');
  voiceToggle.checked = voiceEnabledStorage !== null ? voiceEnabledStorage === 'true' : true;

  const voiceTypeStorage = localStorage.getItem('voiceType');
  if (voiceTypeStorage) {
    [...voiceRadios].forEach(radio => {
      radio.checked = radio.value === voiceTypeStorage;
    });
  } else {
    [...voiceRadios].forEach(radio => {
      radio.checked = radio.value === 'male'; // padrão masculino
    });
  }
}

// Envio da mensagem
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

// Configuração do botão de fala com feedback visual
voiceBtn.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window)) {
    voiceBtn.disabled = true;
    voiceBtn.innerText = '🎙️ Indisponível';
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;

  recognition.start();

  // Muda texto enquanto está gravando
  voiceBtn.innerText = 'Falando...';
  voiceBtn.style.color = 'white';

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
    // Volta ao texto padrão
    voiceBtn.innerText = 'Fale';
    voiceBtn.style.color = '';
  };
});


// Toggle do menu lateral
function toggleMenu() {
  sideMenu.classList.toggle('open');
}

// Fechar menu
closeMenuBtn.addEventListener('click', () => sideMenu.classList.remove('open'));
document.addEventListener('click', e => {
  if (sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && !e.target.closest('.menu-btn')) {
    sideMenu.classList.remove('open');
  }
});

// Atualiza botão compartilhar
const shareUrl = 'https://chat-jesus.vercel.app/';
shareBtn.href = `https://wa.me/?text=Vem%20conversar%20com%20Jesus%20neste%20link%20🙏❤️%20%0A${encodeURIComponent(shareUrl)}`;
shareBtn.addEventListener('click', e => {
  if (navigator.share) {
    e.preventDefault();
    navigator.share({ title: 'Chat com Jesus', text: 'Converse com Jesus usando este chat:', url: shareUrl })
      .catch(err => console.error(err));
  }
});

// Carrega as vozes e configurações
window.onload = () => {
  loadSettings();
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {};
  }
};

// Pop-up de instalação de app
let deferredPrompt;
const installPopup = document.getElementById('installPopup');
const installOverlay = document.getElementById('installOverlay');
const btnInstall = document.getElementById('btnInstall');
const btnDismiss = document.getElementById('btnDismiss');

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installPopup.style.display = 'block';
  installOverlay.style.display = 'block';
});

btnInstall.addEventListener('click', () => {
  installPopup.style.display = 'none';
  installOverlay.style.display = 'none';
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
  }
});

btnDismiss.addEventListener('click', () => {
  installPopup.style.display = 'none';
  installOverlay.style.display = 'none';
});

// ==== NOVO CÓDIGO PARA FECHAR O MENU COM "X" E CLIQUE FORA ====
if (closeMenuBtn) {
  closeMenuBtn.addEventListener('click', () => {
    sideMenu.classList.remove('open');
  });
    }

// ======= Pop-up Salmo/Oração =======
const salmoLink   = document.getElementById('salmoLink');
const salmoPopup  = document.getElementById('salmoPopup');
const salmoOverlay= document.getElementById('salmoOverlay');
const salmoInput  = document.getElementById('salmoInput');
const salmoBuscar = document.getElementById('salmoBuscar');
const salmoFechar = document.getElementById('salmoFechar');

// Abrir pop-up
salmoLink.addEventListener('click', e => {
  e.preventDefault();
  salmoPopup.style.display = 'block';
  salmoOverlay.style.display = 'block';
  salmoInput.focus();
});

// Fechar pop-up
function closeSalmoPopup(){
  salmoPopup.style.display = 'none';
  salmoOverlay.style.display = 'none';
  salmoInput.value = '';
}
salmoFechar.addEventListener('click', closeSalmoPopup);
salmoOverlay.addEventListener('click', closeSalmoPopup);

// Buscar no YouTube
salmoBuscar.addEventListener('click', () => {
  const query = salmoInput.value.trim();
  if (!query) return;

  // Tenta abrir o aplicativo primeiro
  const appUrl = `youtube://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const webUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  // Abre o app, e se não houver app, cai no navegador
  window.location.href = appUrl;

  // fallback para navegador após pequeno delay
  setTimeout(() => {
    window.open(webUrl, '_blank');
  }, 800);

  closeSalmoPopup();
});

// Pop-up Feedback
document.addEventListener("DOMContentLoaded", function () {
  const sugestaoForm = document.getElementById("sugestaoForm");
  const sugestaoOverlay = document.getElementById("sugestaoOverlay");
  const sugestaoPopup   = document.getElementById("sugestaoPopup");
  const sideMenu        = document.getElementById("sideMenu");

  if (sugestaoForm) {
    sugestaoForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(sugestaoForm);

      try {
        // 🔑 Envia para Formspree
        await fetch(sugestaoForm.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        });

        // 🔑 Fecha o menu lateral, se aberto
        sideMenu.classList.remove("open");

        // 🔑 Mostra o pop-up
        sugestaoOverlay.style.display = "block";
        sugestaoPopup.style.display   = "block";

        // 🔑 Reseta formulário
        sugestaoForm.reset();

        // 🔑 Fecha o pop-up depois de 2,5s
        setTimeout(() => {
          sugestaoOverlay.style.display = "none";
          sugestaoPopup.style.display   = "none";
        }, 2500);

      } catch (err) {
        alert("Não foi possível enviar. Tente novamente.");
      }
    });
  }
});
