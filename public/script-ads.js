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

/* ==============================================
Função para abrir toggle após vídeo recompensado
================================================= */
function abrirToggleComRecompensa(toggleId) {
  const toggle = document.getElementById(toggleId);
  if (!toggle) return console.error('Toggle não encontrado:', toggleId);

  const containerId = toggle.dataset.target;
  const container = document.getElementById(containerId);
  if (!container) return console.error('Container não encontrado:', containerId);

  console.log('🎥 Carregando anúncio recompensado...');

  // Aqui você insere o código do Playwire/AdinPlay/etc.
  // Exemplo genérico com iframe para teste:
  const adContainer = document.createElement('div');
  adContainer.style.width = '100%';
  adContainer.style.height = '400px';
  adContainer.innerHTML = `<iframe src="https://seu-fornecedor-de-ads.com/rewarded-video" style="width:100%;height:100%;border:none;" allow="autoplay"></iframe>`;
  container.prepend(adContainer);

  // Simula evento de recompensa (10s) - substitua pelo callback real da rede
  setTimeout(() => {
    adContainer.remove(); // remove o vídeo
    container.classList.add('expanded'); // marca container como expandido
    toggle.classList.add('expanded'); // muda visual do botão
    console.log('🎉 Recompensa liberada!');
  }, 10000);
}

// Adiciona listener ao botão do toggle
document.getElementById('toggle-jesus').addEventListener('click', () => {
  abrirToggleComRecompensa('toggle-jesus');
});


    // Exibe o anúncio
    googletag.display(slot);
  });
}

