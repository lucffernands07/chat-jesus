const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const voiceBtn = document.getElementById('voice-btn');
const loadingIndicator = document.getElementById('loading');
const sideMenu = document.getElementById('sideMenu');
const voiceToggle = document.getElementById('voiceToggle');
const voiceOptionsContainer = document.getElementById("voiceOptions"); // novo container para vozes

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

// === VOZ DE JESUS ===
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

function getSelectedVoice() {
  const voices = speechSynthesis.getVoices();
  const selectedValue = document.querySelector("input[name='voice']:checked")?.value;
  if (!voices || voices.length === 0) return null;
  return voices[selectedValue] || voices[0];
}

function populateVoiceOptions() {
  const voices = speechSynthesis.getVoices();
  if (!voices || voices.length === 0 || !voiceOptionsContainer) return;

  voiceOptionsContainer.innerHTML = "";
  voices.forEach((voice, i) => {
    const label = document.createElement("label");
    label.style.display = "block";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "voice";
    input.value = i;
    if (i === 0) input.checked = true;

    input.addEventListener("change", saveSettings);

    label.appendChild(input);
    label.appendChild(document.createTextNode(` Voz ${i} - ${voice.name} (${voice.lang})`));

    voiceOptionsContainer.appendChild(label);
  });

  // restaura escolha salva
  const savedIndex = localStorage.getItem("voiceIndex");
  if (savedIndex && document.querySelector(`input[name='voice'][value='${savedIndex}']`)) {
    document.querySelector(`input[name='voice'][value='${savedIndex}']`).checked = true;
  }
}

function isVoiceEnabled() {
  return localStorage.getItem('voiceEnabled') === 'true';
}

function saveSettings() {
  localStorage.setItem('voiceEnabled', voiceToggle.checked);
  const selected = document.querySelector("input[name='voice']:checked")?.value;
  if (selected) localStorage.setItem("voiceIndex", selected);
}

function loadSettings() {
  const voiceEnabledStorage = localStorage.getItem('voiceEnabled');
  if (voiceEnabledStorage !== null) {
    voiceToggle.checked = voiceEnabledStorage === 'true';
  } else {
    voiceToggle.checked = true;
    localStorage.setItem('voiceEnabled', 'true');
  }
}

// === CHAT ===
chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

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
  } catch (error) {
    loadingIndicator.style.display = 'none';
    console.error('Erro ao enviar mensagem:', error);
    if (!chatBox.lastChild || !chatBox.lastChild.classList.contains('jesus')) {
      appendMessage('jesus', 'Erro ao se conectar com Jesus.');
    }
  }
});

// === MICROFONE ===
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

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    messageInput.value = transcript;
    chatForm.dispatchEvent(new Event('submit'));
  };

  recognition.onerror = event => {
    console.error('Erro no reconhecimento de voz:', event.error);
    appendMessage('jesus', 'Não consegui entender sua voz.');
  };
});

// === MENU ===
voiceToggle.addEventListener('change', saveSettings);

function toggleMenu() {
  sideMenu.classList.toggle('open');
}

window.onload = () => {
  loadSettings();
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = populateVoiceOptions;
    populateVoiceOptions();
  }
};

// === SERVICE WORKER ===
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("Service Worker registrado com sucesso."))
    .catch(err => console.error("Erro ao registrar Service Worker:", err));
}

// === PWA INSTALAÇÃO ===
let deferredPrompt;
const installPopup = document.getElementById('installPopup');
const installOverlay = document.getElementById('installOverlay');
const btnInstall = document.getElementById('btnInstall');
const btnDismiss = document.getElementById('btnDismiss');

window.addEventListener('beforeinstallprompt', (e) => {
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
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  }
});

btnDismiss.addEventListener('click', () => {
  installPopup.style.display = 'none';
  installOverlay.style.display = 'none';
});

// === FECHAR MENU COM X OU CLIQUE FORA ===
const closeMenuBtn = document.getElementById('closeMenuBtn');
if (closeMenuBtn) {
  closeMenuBtn.addEventListener('click', () => {
    sideMenu.classList.remove('open');
  });
}

document.addEventListener('click', (event) => {
  if (sideMenu.classList.contains('open')) {
    if (!sideMenu.contains(event.target) && !event.target.closest('.menu-btn')) {
      sideMenu.classList.remove('open');
    }
  }
});

// === COMPARTILHAR ===
document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    const shareUrl = 'https://chat-jesus.vercel.app/';
    shareBtn.href = `https://wa.me/?text=Vem%20conversar%20com%20Jesus%20neste%20link%20🙏❤️%20%0A${encodeURIComponent(shareUrl)}`;

    shareBtn.addEventListener('click', (e) => {
      if (navigator.share) {
        e.preventDefault();
        navigator.share({
          title: 'Chat com Jesus',
          text: 'Converse com Jesus usando este chat:',
          url: shareUrl
        }).catch(err => console.error('Erro ao compartilhar:', err));
      }
    });
  }
});
