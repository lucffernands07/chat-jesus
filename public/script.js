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

// ✅ Função para carregar vozes de forma confiável
function getVoices() {
  return new Promise(resolve => {
    let voices = speechSynthesis.getVoices();
    if (voices.length) resolve(voices);
    else {
      speechSynthesis.onvoiceschanged = () => resolve(speechSynthesis.getVoices());
    }
  });
}

// Fala de Jesus
async function speakJesus(text) {
  if (!('speechSynthesis' in window) || !isVoiceEnabled()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.pitch = 1;
  utterance.rate = 1;

  const selected = [...voiceRadios].find(r => r.checked)?.value || 'female';
  const voices = await getVoices();

  let voice;
  if (selected === 'male') {
    voice = voices.find(v => v.lang.startsWith('pt') && /male|homem/i.test(v.name)) 
          || voices.find(v => v.lang.startsWith('pt'));
  } else {
    voice = voices.find(v => v.lang.startsWith('pt') && /female|mulher/i.test(v.name)) 
