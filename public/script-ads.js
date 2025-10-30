/* ==========================================
   script-ads.js — Simulação de vídeo recompensado
   Compatível com layout e classes existentes
   ========================================== */

// Variável para substituição futura quando Playwire estiver ativo
const PLAYWIRE_AD_UNIT_ID = 'SEU_AD_UNIT_ID_AQUI'; // ex: '12345/chatjesus_rewarded'

// === Função principal (sem alterar classes do CSS existente) ===
function abrirToggleComRecompensa(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`❌ Container "${containerId}" não encontrado.`);
    return;
  }

  // Fecha outros containers abertos (opcional)
  document.querySelectorAll('.chat-container.expanded').forEach(el => {
    if (el !== container) el.classList.remove('expanded');
  });

  // Impede reabrir se já estiver aberto
  if (container.classList.contains('expanded')) {
    container.classList.remove('expanded');
    return;
  }

  // --- Exibe "vídeo simulado" ---
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

  // Contagem regressiva (simulação)
  let timeLeft = 5;
  const countdown = overlay.querySelector('#rewarded-countdown');
  const timer = setInterval(() => {
    timeLeft--;
    countdown.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      overlay.remove();
      container.classList.add('expanded'); // usa sua classe original
    }
  }, 1000);
}

/* ==========================================
   Estilos injetados (compatíveis com tema atual)
   ========================================== */
const style = document.createElement('style');
style.textContent = `
.rewarded-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
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
