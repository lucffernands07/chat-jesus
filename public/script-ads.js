/* ==========================================
   script-ads.js (modo simulação Playwire)
   Exibe um vídeo recompensado simulado
   e expande o toggle ao final.
   ========================================== */

// 👉 quando o Playwire estiver ativo, substitua esta variável
const PLAYWIRE_AD_UNIT_ID = 'SEU_AD_UNIT_ID_AQUI'; // ex: '12345/chatjesus_rewarded'

// === Função principal ===
function abrirToggleComRecompensa(containerId) {
  const container = document.getElementById(containerId);
  const toggleButton = document.querySelector(`[onclick*="${containerId}"]`);

  if (!container) {
    console.error(`❌ Container "${containerId}" não encontrado.`);
    return;
  }

  // Evita abrir vários ao mesmo tempo
  document.querySelectorAll('.chat-container.expanded').forEach(el => {
    if (el !== container) el.classList.remove('expanded');
  });

  // Simulação de vídeo recompensado
  const overlay = document.createElement('div');
  overlay.className = 'video-overlay';
  overlay.innerHTML = `
    <div class="video-popup">
      <h3>🎥 Assistindo vídeo recompensado...</h3>
      <div class="fake-video"></div>
      <p id="countdown">5</p>
    </div>
  `;
  document.body.appendChild(overlay);

  let timeLeft = 5;
  const countdown = overlay.querySelector('#countdown');
  const timer = setInterval(() => {
    timeLeft--;
    countdown.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      overlay.remove();

      // Expande o container
      container.classList.add('expanded');
      if (toggleButton) toggleButton.classList.add('expanded');
    }
  }, 1000);
}

/* ==========================================
   Estilos injetados para simulação
   ========================================== */
const style = document.createElement('style');
style.textContent = `
.video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.video-popup {
  background: #1e1e1e;
  color: #fff;
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  max-width: 320px;
  box-shadow: 0 0 20px rgba(255,255,255,0.2);
}
.fake-video {
  background: linear-gradient(135deg, #444, #222);
  width: 280px;
  height: 160px;
  border-radius: 8px;
  margin: 10px auto;
  position: relative;
  overflow: hidden;
}
.fake-video::before {
  content: "▶";
  position: absolute;
  font-size: 48px;
  color: rgba(255,255,255,0.6);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
#countdown {
  font-size: 24px;
  font-weight: bold;
  margin-top: 8px;
  color: #fdd835;
}
`;
document.head.appendChild(style);
