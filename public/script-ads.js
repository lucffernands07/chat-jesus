/* =======================================
   script-ads.js — Vídeo recompensado diário por toggle
======================================= */

// IDs de exemplo para Playwire (quando for aprovado)
const PLAYWIRE_UNIT_IDS = {
  jesus: 'playwire_unit_id_jesus',
  biblia: 'playwire_unit_id_biblia',
  salmo: 'playwire_unit_id_salmo'
};

// Verifica se já assistiu hoje
function jaAssistiuHoje(chave) {
  const dataHoje = new Date().toDateString();
  const ultimaData = localStorage.getItem(`rewarded_${chave}_date`);
  return ultimaData === dataHoje;
}

// Marca como assistido hoje
function marcarComoAssistidoHoje(chave) {
  const dataHoje = new Date().toDateString();
  localStorage.setItem(`rewarded_${chave}_date`, dataHoje);
}

// Função principal para abrir toggle com vídeo recompensado
function abrirToggleComRecompensa(toggleId, chave) {
  const toggle = document.getElementById(toggleId);
  if (!toggle) {
    console.error(`❌ Toggle "${toggleId}" não encontrado.`);
    return;
  }

  // Se já assistiu hoje → abre/fecha normalmente
  if (jaAssistiuHoje(chave)) {
    toggle.classList.toggle('expanded');
    return;
  }

  // Exibe vídeo recompensado simulado
  const overlay = document.createElement('div');
  overlay.className = 'rewarded-overlay';
  overlay.innerHTML = `
    <div class="rewarded-popup">
      <h3>🎥 Assistindo vídeo recompensado de ${chave}...</h3>
      <div class="rewarded-video"></div>
      <p id="rewarded-countdown">5</p>
    </div>
  `;
  document.body.appendChild(overlay);

  // Contagem regressiva de 5s (simula vídeo)
  let tempo = 5;
  const countdown = overlay.querySelector('#rewarded-countdown');
  const timer = setInterval(() => {
    tempo--;
    countdown.textContent = tempo;
    if (tempo <= 0) {
      clearInterval(timer);
      overlay.remove();
      marcarComoAssistidoHoje(chave);   // marca como assistido
      toggle.classList.add('expanded'); // expande o toggle
    }
  }, 1000);
}

/* ==========================================
   CSS do vídeo recompensado
========================================== */
const style = document.createElement('style');
style.textContent = `
.rewarded-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.rewarded-popup {
  background: #1e1e1e;
  color: #fff;
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  max-width: 320px;
  box-shadow: 0 0 20px rgba(255,255,255,0.3);
  font-family: inherit;
}
.rewarded-video {
  background: linear-gradient(135deg, #444, #222);
  width: 280px;
  height: 160px;
  border-radius: 8px;
  margin: 10px auto;
  position: relative;
}
.rewarded-video::before {
  content: "▶";
  position: absolute;
  font-size: 48px;
  color: rgba(255,255,255,0.6);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
}
#rewarded-countdown {
  font-size: 24px;
  font-weight: bold;
  margin-top: 8px;
  color: #fdd835;
}
`;
document.head.appendChild(style);
