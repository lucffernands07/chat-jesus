/* ============================
   Script Salmos
   ============================ */

let salmosData = [];

// Carrega o JSON dos salmos
async function carregarSalmos() {
  try {
    const res = await fetch('salmos.json');
    if (!res.ok) throw new Error('Não foi possível carregar o arquivo salmos.json');
    salmosData = await res.json();
  } catch (err) {
    console.error('Erro ao carregar salmos:', err);
  }
}

// Retorna um salmo aleatório baseado em palavra-chave
function buscarSalmoPorPalavra(palavra) {
  if (!salmosData.length) return null;
  const encontrados = salmosData.filter(salmo =>
    salmo.versiculos.some(v => v.toLowerCase().includes(palavra.toLowerCase()))
  );
  if (encontrados.length === 0) return null;
  const aleatorio = encontrados[Math.floor(Math.random() * encontrados.length)];
  return aleatorio;
}

// Retorna o salmo do dia baseado na data
function salmoDoDia() {
  if (!salmosData.length) return null;
  const dia = new Date().getDate(); // 1-31
  // pega salmo baseado no dia (circular)
  const index = (dia - 1) % salmosData.length;
  return salmosData[index];
}

// Mostra o salmo no container
function mostrarSalmo(salmo) {
  const container = document.getElementById('salmo-container');
  const texto = document.getElementById('salmo-texto');
  if (!container || !texto) return;

  if (!salmo) {
    texto.textContent = 'Não foi possível carregar o Salmo de hoje 🙏';
  } else {
    texto.innerHTML = `<strong>Salmo ${salmo.numero}</strong><br>${salmo.versiculos.join('<br>')}`;
  }

  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================
// Event listener do botão Salmo
// ============================

const salmoToggleBtn = document.getElementById('salmo-toggle');
if (salmoToggleBtn) {
  salmoToggleBtn.addEventListener('click', async () => {
    if (!salmosData.length) await carregarSalmos();
    const salmo = salmoDoDia();
    mostrarSalmo(salmo);
  });
}

// ============================
// Função para integrar ao chat 1 ou 2
// ============================

// busca salmo aleatório por palavra-chave do usuário ou fallback para salmo do dia
function getSalmoParaUsuario(mensagemUsuario) {
  if (!salmosData.length) return null;
  const palavras = mensagemUsuario
    .toLowerCase()
    .match(/\b\w+\b/g) || [];
  for (let palavra of palavras) {
    const salmo = buscarSalmoPorPalavra(palavra);
    if (salmo) return salmo;
  }
  return salmoDoDia(); // fallback
}

// Exemplo de uso com chat:
// const salmoUsuario = getSalmoParaUsuario("Senhor estou aflito");
// mostrarSalmo(salmoUsuario);

// ============================
// Inicialização
// ============================
window.addEventListener('DOMContentLoaded', carregarSalmos);
