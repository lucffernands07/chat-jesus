/* ============================
   script-ads.js
   Vídeo recompensado Playwire
============================ */

// Adicione o script da sua conta Playwire no HTML ou dinamicamente
// Exemplo: <script src="https://cdn.playwire.com/seu-id.js" async></script>

// Função para abrir toggle com recompensa
function abrirToggleComRecompensa(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return console.error(`Container "${containerId}" não encontrado.`);

  console.log('🎥 Carregando vídeo recompensado Playwire...');

  // Cria container temporário para o vídeo
  const adContainer = document.createElement('div');
  adContainer.id = 'playwire-rewarded-ad';
  adContainer.style.width = '100%';
  adContainer.style.height = '400px';
  container.prepend(adContainer);

  // Função Playwire para Rewarded Video
  // Substitua 'SEU_AD_UNIT_ID' pelo ID real fornecido pelo Playwire
  if (typeof PW !== 'undefined' && PW.Rewarded) {
    const rewarded = new PW.Rewarded({
      adUnit: 'SEU_AD_UNIT_ID', // ID da unidade de anúncio Playwire
      container: adContainer,
      onComplete: () => {
        console.log('🎉 Recompensa liberada!');
        adContainer.remove();              // remove vídeo
        container.classList.add('expanded'); // expande o container
        // também marca o botão
        const toggleBtn = document.querySelector(`[data-target="${containerId}"]`);
        if (toggleBtn) toggleBtn.classList.add('expanded');
      },
      onError: () => {
        console.warn('❌ Erro ao carregar vídeo. Abrindo chat mesmo assim.');
        adContainer.remove();
        container.classList.add('expanded');
      }
    });

    rewarded.show();
  } else {
    console.warn('⚠️ Playwire não carregado. Abrindo chat sem vídeo.');
    container.classList.add('expanded');
  }
}

// Adiciona listener em todos os toggles
document.querySelectorAll('.chat-toggle').forEach(btn => {
  btn.addEventListener('click', () => abrirToggleComRecompensa(btn.dataset.target));
});
