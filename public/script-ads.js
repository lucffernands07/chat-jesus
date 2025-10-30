/* ===========================================================
   script-ads.js
   Exibe vídeo recompensado (Rewarded Ad) do Playwire
   antes de abrir um toggle (chat, salmo, etc.)
   =========================================================== */

// === CONFIGURAÇÃO ===
// Substitua pelo seu ID do Playwire (fornecido no painel)
const PLAYWIRE_AD_UNIT_ID = 'SEU_AD_UNIT_ID_AQUI';

// Carrega o script da Playwire (se ainda não estiver carregado)
(function () {
  if (!document.getElementById('playwire-lib')) {
    const pwScript = document.createElement('script');
    pwScript.id = 'playwire-lib';
    pwScript.src = 'https://cdn.playwire.com/bolt/js/zeus/zeus.min.js';
    pwScript.async = true;
    document.head.appendChild(pwScript);
  }
})();

/* ===========================================================
   Função auxiliar: Mostrar vídeo recompensado Playwire
=========================================================== */
function mostrarVideoRecompensado(callbackSucesso, callbackErro) {
  if (typeof PW !== 'undefined' && PW.Rewarded) {
    console.log('🎬 Exibindo vídeo recompensado Playwire...');
    const rewarded = new PW.Rewarded({
      adUnit: PLAYWIRE_AD_UNIT_ID,
      container: document.createElement('div'),
      onComplete: () => {
        console.log('🎉 Vídeo assistido até o fim!');
        callbackSucesso && callbackSucesso();
      },
      onError: (err) => {
        console.warn('⚠️ Erro ao carregar vídeo:', err);
        callbackErro && callbackErro();
      }
    });

    document.body.appendChild(rewarded.container);
    rewarded.show();
  } else {
    console.warn('⚠️ Playwire não disponível — abrindo conteúdo direto.');
    callbackErro && callbackErro();
  }
}

/* ===========================================================
   Intercepta cliques nos botões .chat-toggle
   e exibe o vídeo antes de deixar o script.js expandir
=========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.chat-toggle').forEach(btn => {
    btn.addEventListener('click', event => {
      // Impede o script principal de expandir imediatamente
      event.stopImmediatePropagation();
      event.preventDefault();

      const targetId = btn.dataset.target;
      const container = document.getElementById(targetId);

      console.log('🎥 Iniciando anúncio recompensado para:', targetId);

      // Cria um contêiner visual temporário para o vídeo
      const adOverlay = document.createElement('div');
      adOverlay.id = 'playwire-rewarded-overlay';
      adOverlay.style.position = 'fixed';
      adOverlay.style.top = '0';
      adOverlay.style.left = '0';
      adOverlay.style.width = '100%';
      adOverlay.style.height = '100%';
      adOverlay.style.background = 'rgba(0, 0, 0, 0.8)';
      adOverlay.style.display = 'flex';
      adOverlay.style.justifyContent = 'center';
      adOverlay.style.alignItems = 'center';
      adOverlay.style.zIndex = '9999';
      adOverlay.innerHTML = '<div id="playwire-ad-slot" style="width: 90%; max-width: 600px; height: 400px; background: #000; border-radius: 12px; overflow: hidden;"></div>';
      document.body.appendChild(adOverlay);

      // Mostra o vídeo
      mostrarVideoRecompensado(
        () => {
          // ✅ Sucesso: remove o overlay e libera o toggle
          adOverlay.remove();
          console.log('🎉 Liberando o chat após vídeo.');
          btn.click(); // chama o clique de novo → o script.js cuida da expansão
        },
        () => {
          // ⚠️ Falha: remove o overlay e libera mesmo assim
          adOverlay.remove();
          console.warn('⚠️ Sem vídeo, abrindo chat direto.');
          btn.click();
        }
      );
    }, true); // captura antes do script.js
  });
});
