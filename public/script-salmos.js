/* ============================
   script-salmos.js
   Lógica de busca e exibição de salmos
   ============================ */

let salmos = []; // array que vai receber o conteúdo de salmos.json

// Carrega todos os salmos do arquivo JSON
async function carregarSalmos() {
  try {
    const res = await fetch('salmos.json');
    salmos = await res.json();
  } catch (err) {
    console.error('Erro ao carregar salmos:', err);
  }
}

// Busca um salmo com base em uma palavra-chave do usuário
function buscarSalmoPorPalavra(chave) {
  if (!salmos.length || !chave) return null;
  const regex = new RegExp(chave, 'i'); // busca case-insensitive
  const encontrados = salmos.filter(s => s.versiculos.some(v => regex.test(v)));
  if (!encontrados.length) return null;
  // Escolhe aleatório entre os encontrados
  return encontrados[Math.floor(Math.random() * encontrados.length)];
}

// Pega o Salmo do dia (baseado na data)
function pegarSalmoDoDia() {
  if (!salmos.length) return null;
  const hoje = new Date();
  const diaDoAno = Math.floor((hoje - new Date(hoje.getFullYear(),0,0)) / 1000 / 60 / 60 / 24);
  const index = diaDoAno % salmos.length;
  return salmos[index];
}

// Função principal para retornar salmo baseado na entrada do usuário
function getSalmoParaUsuario(textoUsuario) {
  let salmo = buscarSalmoPorPalavra(textoUsuario);
  if (!salmo) {
    salmo = pegarSalmoDoDia();
  }
  return salmo;
}

// Atualiza o container do Salmo na UI
function mostrarSalmoNoContainer(salmo) {
  const container = document.getElementById('salmo-container');
  const textoEl = document.getElementById('salmo-texto');
  if (!container || !textoEl || !salmo) return;

  textoEl.innerHTML = `<strong>Salmo ${salmo.numero} ${salmo.titulo}</strong><br>${salmo.versiculos.join('<br>')}`;
  container.style.display = 'block';
}

// Inicializa
carregarSalmos();
