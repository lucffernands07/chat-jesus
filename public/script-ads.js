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

  const isExpanded = container.classList.contains('expanded');
  const toggleBtn = document.querySelector(`[data-target="${containerId}"]`);

  // 🔹 Se já estiver expandido, fecha
  if (isExpanded) {
    container.classList.remove('expanded');
    if (toggleBtn) toggleBtn.classList.remove('expanded');
    return;
  }

  // 🔹 Se ainda não estiver, abre com vídeo (ou direto se Playwire não estiver pronto)
  console.log('🎥 Carregando vídeo recompensado Playwire...');

  const adContainer = document.createElement('div');
  adContainer.id = 'playwire-rewarded-ad';
  adContainer.style.width = '100%';
  adContainer.style.height = '400px';
  container.prepend(adContainer);

  if (typeof PW !== 'undefined' && PW.Rewarded) {
    const rewarded = new PW.Rewarded({
      adUnit: 'SEU_AD_UNIT_ID',
      container: adContainer,
      onComplete: () => {
        console.log('🎉 Recompensa liberada!');
        adContainer.remove();
        container.classList.add('expanded');
        if (toggleBtn) toggleBtn.classList.add('expanded');
      },
      onError: () => {
        console.warn('⚠️ Erro no vídeo. Abrindo chat mesmo assim.');
        adContainer.remove();
        container.classList.add('expanded');
        if (toggleBtn) toggleBtn.classList.add('expanded');
      }
    });

    rewarded.show();
  } else {
    console.warn('⚠️ Playwire não carregado. Abrindo chat sem vídeo.');
    adContainer.remove();
    container.classList.add('expanded');
    if (toggleBtn) toggleBtn.classList.add('expanded');
  }
}


// Adiciona listener em todos os toggles
document.querySelectorAll('.chat-toggle').forEach(btn => {
  btn.addEventListener('click', () => abrirToggleComRecompensa(btn.dataset.target));
});
