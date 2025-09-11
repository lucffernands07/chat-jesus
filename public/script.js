const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const voiceBtn = document.getElementById('voice-btn');
const loadingIndicator = document.getElementById('loading');
const sideMenu = document.getElementById('sideMenu');
const voiceToggle = document.getElementById('voiceToggle');
const voiceOptionsContainer = document.getElementById('voiceOptions');

let voicesList = [];

// === Funções de chat ===
function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender === 'user' ? 'user' : 'jesus');

  const senderName = sender === 'user' ? '<strong>Você:</strong>' : '<strong style="color:#8B0000">Jesus:</strong>';
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

    const selectedVoice = getSelectedVoice();
    if (selectedVoice) utterance.voice = selectedVoice;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
}

function getSelectedVoice() {
  const selectedRadio = document.querySelector('input[name="voiceType"]:checked');
  const selectedIndex = selectedRadio ? parseInt(selectedRadio.value) : 0;
  return voicesList[selectedIndex] || voicesList[0];
}

function isVoiceEnabled() {
  return localStorage.getItem('voiceEnabled') === 'true';
}

// === Salvar e carregar configurações ===
function saveSettings() {
  localStorage.setItem('voiceEnabled', voiceToggle.checked);
  const selectedRadio = document.querySelector('input[name="voiceType"]:checked');
  if (selectedRadio) localStorage.setItem('voiceType', selectedRadio.value);
}

function loadSettings() {
  // Ativar voz por padrão
  const voiceEnabledStorage = localStorage.getItem('voiceEnabled');
  voiceToggle.checked = voiceEnabledStorage !== null ? voiceEnabledStorage === 'true' : true;
  if (!voiceEnabledStorage) localStorage.setItem('voiceEnabled', 'true');

  // Selecionar voz por padrão (0 = masculina)
  const savedVoice = localStorage.getItem('voiceType');
  const radios = document.querySelectorAll('input[name="voiceType"]');
  radios.forEach(radio => {
    radio.checked = radio.value === (savedVoice || '0');
  });
  if (!savedVoice) localStorage.setItem('voiceType', '0');
}

// === Preencher vozes dinâmicas ===
function populateVoices() {
  voicesList = speechSynthesis.getVoices().filter(v => v.lang.startsWith('pt'));
  voiceOptionsContainer.innerHTML = '';

  voicesList.forEach((voice, index) => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="voiceType" value="${index}" /> Voz ${index} - ${voice.name}`;
    voiceOptionsContainer.appendChild(label);
  });

  loadSettings();
}

// === Chat e envio de mensagens ===
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
    appendMessage('jesus', 'Erro ao se conectar com Jesus.');
  }
});

// === Voz por microfone ===
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

// === Eventos menu lateral ===
voiceToggle.addEventListener('change', saveSettings);
document.addEventListener('click', (event) => {
  if (sideMenu.classList.contains('open')) {
    if (!sideMenu.contains(event.target) && !event.target.closest('.menu-btn')) {
      sideMenu.classList.remove('open');
    }
  }
});
document.getElementById('closeMenuBtn').addEventListener('click', () => {
  sideMenu.classList.remove('open');
});

// === Compartilhar ===
document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('shareBtn');
  const shareUrl = 'https://chat-jesus.vercel.app/';
  shareBtn.href = `https://wa.me/?text=Vem%20conversar%20com%20Jesus%20neste%20link%20🙏❤️%20%0A${encodeURIComponent(shareUrl)}`;
  shareBtn.addEventListener('click', e => {
    if (navigator.share) {
      e.preventDefault();
      navigator.share({ title: 'Chat com Jesus', text: 'Converse com Jesus usando este chat:', url: shareUrl })
        .catch(err => console.error('Erro ao compartilhar:', err));
    }
  });
});

// === Inicialização ===
window.onload = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = populateVoices;
    populateVoices();
  }
};
