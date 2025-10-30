/* ============================
   script-ads.js
   Exibe vídeo recompensado (Rewarded Ad)
   antes de abrir um toggle do app
============================ */

// Substitua pelo caminho da sua unidade de anúncio do Google Ad Manager
const AD_UNIT_PATH = '/1234567/chatjesus_rewarded';

// Inicializa GPT (Google Publisher Tag)
(function() {
  const gptScript = document.createElement('script');
  gptScript.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
  gptScript.async = true;
  document.head.appendChild(gptScript);
})();

window.googletag = window.googletag || { cmd: [] };

// Inicializa o serviço de anúncios
googletag.cmd.push(function() {
  googletag.pubads().enableSingleRequest();
  googletag.enableServices();
});

/* ============================
   Função: abrirToggleComRecompensa
============================ */
function abrirToggleComRecompensa(containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`❌ Container "${containerId}" não encontrado.`);
    return;
  }

  googletag.cmd.push(function() {
    console.log('🎥 Carregando anúncio recompensado...');

    // Define o slot de vídeo recompensado
    const slot = googletag.defineOutOfPageSlot(
      AD_UNIT_PATH,
      googletag.enums.OutOfPageFormat.REWARDED
    );

    if (!slot) {
      alert('Não foi possível carregar o anúncio agora. Tente novamente.');
      return;
    }

    slot.addService(googletag.pubads());

    // Evento: o usuário fechou o vídeo
    googletag.pubads().addEventListener('rewardedSlotClosed', function() {
      console.log('🎉 Anúncio assistido! Liberando o conteúdo...');
      container.classList.add('expanded');
    });

    // Exibe o anúncio
    googletag.display(slot);
  });
}

/* ============================
   Exemplo de integração com botão
============================ */
// Exemplo: você pode criar botões assim no seu HTML:
// <button onclick="abrirToggleComRecompensa('chat-jesus-container')">
//   🎥 Assistir e abrir Chat com Jesus
// </button>
//
// <button onclick="abrirToggleComRecompensa('salmo-container')">
//   🎥 Assistir e abrir Salmo do Dia
// </button>
