/* ==========================================
   script-ads.js — Simulação de vídeo recompensado
   Mantém cores e estilos originais dos toggles
   ========================================== */

const PLAYWIRE_AD_UNIT_ID = 'SEU_AD_UNIT_ID_AQUI'; // substituir futuramente

function abrirToggleComRecompensa(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`❌ Container "${containerId}" não encontrado.`);
    return;
  }

  // Fecha outros containers (se quiser só um aberto)
  document.querySelectorAll('.chat-container.expanded').forEach(el => {
    if (el !== container) el.classList.remove('expanded');
  });

  // Recolhe se já estiver aberto
  if (container.classList.contains('expanded')) {
    container.classList.remove('expanded');
    return;
  }

  // --- Exibe o pop-up simulado ---
  const overlay = document.createElement('div');
  overlay.className = 'rewarded-overlay';
  overlay.innerHTML = `
    <div class="rewarded-popup">
      <h3>🎥 Assistindo vídeo recompensado...</h3>
      <div class="rewarded-video"></div>
      <p id="rewarded-countdown">5</p>
    </div>
  `;
  document.body.appendChild(overlay);

  // Contagem regressiva
  let timeLeft = 5;
  const countdown = overlay.querySelector('#rewarded-countdown');
  const timer = setInterval(() => {
    timeLeft--;
    countdown.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      overlay.remove();
      container.classList.add('expanded'); // usa seu CSS original
    }
  }, 1000);
}

/* ==========================================
   Estilos do pop-up de vídeo (isolados)
   ========================================== */
const style = document.createElement('style');
style.textContent = `
/* Escurece o fundo do app */
.rewarded-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* Caixa central do "vídeo" */
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

/* Simulação da tela do vídeo */
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

/* Contagem regressiva */
#rewarded-countdown {
  font-size: 24px;
  font-weight: bold;
  margin-top: 8px;
  color: #fdd835;
}

/* 🔒 Isolamento visual — garante que o estilo do pop-up
   não interfira em botões e toggles do app */
.rewarded-overlay * {
  all: unset;
  display: revert;
}
.rewarded-overlay h3,
.rewarded-overlay p {
  all: revert;
  font-family: inherit;
  color: inherit;
}
`;
document.head.appendChild(style);
