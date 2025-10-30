/* =======================================
   script-ads.js — Controle de vídeo recompensado diário
   Compatível com Playwire e PWA
======================================= */

// Substitua pelo ID/Player do Playwire quando for aprovado
const PLAYWIRE_UNIT_IDS = {
  jesus: 'playwire_unit_id_jesus',
  biblia: 'playwire_unit_id_biblia',
  salmo: 'playwire_unit_id_salmo'
};

// Função auxiliar: verifica se já assistiu hoje
function jaAssistiuHoje(chave) {
  const dataHoje = new Date().toDateString();
  const ultimaData = localStorage.getItem(`rewarded_${chave}_date`);
  return ultimaData === dataHoje;
}

// Função auxiliar: salva que assistiu hoje
function marcarComoAssistidoHoje(chave) {
  const dataHoje = new Date().toDateString();
  localStorage.setItem(`rewarded_${chave}_date`, dataHoje);
}

/* ===========================================================
   Função principal: abrir toggle com vídeo recompensado diário
=========================================================== */
function abrirToggleComRecompensa(toggleId, chave) {
  const toggle = document.getElementById(toggleId);
  if (!toggle) {
    console.error(`❌ Toggle "${toggleId}" não encontrado.`);
    return;
  }

  // Se já assistiu hoje, abre direto
  if (jaAssistiuHoje(chave)) {
    console.log(`🎬 Já assistiu o vídeo de ${chave} hoje. Liberando...`);
    toggle.classList.toggle('expanded');
    return;
  }

  // Caso ainda não tenha assistido hoje → exibir vídeo
  console.log(`🎥 Exibindo vídeo recompensado para ${chave}...`);

  // Aqui entra o player do Playwire quando você for aprovado
  // Por enquanto usamos simulação de carregamento:
  const videoSimulado = document.createElement('div');
  videoSimulado.className = 'video-rewarded-overlay';
  videoSimulado.innerHTML = `
    <div class="video-box">
      <p>🎞️ Assistindo ao vídeo recompensado de ${chave}...</p>
      <p>(simulação de 5 segundos)</p>
    </div>
  `;
  document.body.appendChild(videoSimulado);

  // Simula o tempo do vídeo (5s)
  setTimeout(() => {
    videoSimulado.remove();
    marcarComoAssistidoHoje(chave);
    console.log(`✅ Vídeo recompensado de ${chave} concluído!`);
    toggle.classList.add('expanded');
  }, 5000);
}

/* ===========================================================
   CSS temporário do player simulado
=========================================================== */
const style = document.createElement('style');
style.textContent = `
.video-rewarded-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: Arial, sans-serif;
  z-index: 9999;
}
.video-box {
  background: #222;
  padding: 20px 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 10px #000;
}
`;
document.head.appendChild(style);
