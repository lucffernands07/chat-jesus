const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const voiceBtn = document.getElementById('voice-btn');
const loadingIndicator = document.getElementById('loading');
const sideMenu = document.getElementById('sideMenu');
const voiceToggle = document.getElementById('voiceToggle');
const voiceOptionsContainer = document.getElementById('voiceOptions');
const shareBtn = document.getElementById('shareBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');

let voicesList = [];

function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender === 'user' ? 'user' : 'jesus');
  const senderName = sender === 'user' ? '<strong>Você:</strong>' : '<strong style="color:#8B0000">Jesus:</strong>';
  messageDiv.innerHTML = `${senderName} ${text}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function speakJesus(text) {
  if ('speechSynthesis' in window && voiceToggle.checked) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.pitch = 1;
    utterance.rate = 1;

    const selectedVoiceIndex = parseInt(localStorage.getItem('selectedVoiceIndex') || "0", 10);
    if (voicesList[selectedVoiceIndex]) {
      utterance.voice = voicesList[selectedVoiceIndex];
    }

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
}

function populateVoiceOptions() {
  voicesList = speechSynthesis.getVoices().filter(v => v.lang.startsWith('pt'));
  voiceOptionsContainer.innerHTML = '';
  voicesList.forEach((voice, idx) => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="voiceType" value="${idx}"> Voz ${idx} - ${voice.name}`;
    voiceOptionsContainer.appendChild(label);
  });

  // Seleciona voz padrão (0)
  const storedIndex = localStorage.getItem('selectedVoiceIndex');
  if (storedIndex !== null) {
    voiceOptionsContainer.querySelector(`input[value="${storedIndex}"]`).checked = true;
  } else {
    voiceOptionsContainer.querySelector(`input[value="0"]`).checked = true;
    localStorage.setItem('selectedVoiceIndex', "0");
  }

  // Adiciona listener
  voiceOptionsContainer.querySelectorAll('input[name="voiceType"]').forEach(radio => {
    radio.addEventListener('change', () => {
      localStorage.setItem('selectedVoiceIndex', radio.value);
    });
  });
}

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
  } catch (err) {
    loadingIndicator.style.display = 'none';
    console.error('Erro:', err);
    appendMessage('jesus', 'Erro ao se conectar com Jesus.');
  }
});

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

  recognition.onerror = () => appendMessage('jesus', 'Não consegui entender sua voz.');
});

function toggleMenu() {
  sideMenu.classList.toggle('open');
}

closeMenuBtn.addEventListener('click', () => sideMenu.classList.remove('open'));
document.addEventListener('click', (e) => {
  if (sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && !e.target.closest('.menu-btn')) {
    sideMenu.classList.remove('open');
  }
});

// Atualiza botão Compartilhe
const shareUrl = 'https://chat-jesus.vercel.app/';
shareBtn.href = `https://wa.me/?text=Vem%20conversar%20com%20Jesus%20neste%20link%20🙏❤️%20%0A${encodeURIComponent(shareUrl)}`;
shareBtn.addEventListener('click', (e) => {
  if (navigator.share) {
    e.preventDefault();
    navigator.share({ title: 'Chat com Jesus', text: 'Converse com Jesus usando este chat:', url: shareUrl })
      .catch(err => console.error(err));
  }
});

window.onload = () => {
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = populateVoiceOptions;
    populateVoiceOptions();
  }
};
