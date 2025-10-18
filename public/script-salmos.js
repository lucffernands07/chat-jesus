/* ============================
   Script Salmos — versão final
   ============================ */

const salmoToggle = document.getElementById('salmo-toggle');
const salmoContainer = document.getElementById('salmo-container');
const salmoTexto = document.getElementById('salmo-texto');

let salmos = [];       // será preenchido via fetch
let salmoAtual = null; // mantém o salmo fixo do dia

/* ============================
   Carregar salmos do JSON
   ============================ */
async function carregarSalmos() {
  try {
    const response = await fetch('salmos.json');
    if (!response.ok) throw new Error('Falha ao carregar salmos.json');
    salmos = await response.json();

    // Define o salmo do dia assim que carregar
    salmoAtual = getSalmoDoDia();
    // Não mostramos automaticamente aqui, só quando o usuário abrir
  } catch (error) {
    console.error('Erro ao carregar salmos:', error);
    if (salmoTexto) salmoTexto.textContent = 'Não foi possível carregar os salmos.';
  }
}

/* ============================
   Buscar salmo por palavra-chave
   ============================ */
function buscarSalmoPorPalavra(texto) {
  if (!salmos || salmos.length === 0) return null;
  const palavras = texto.toLowerCase().match(/\b\w+\b/g) || [];
  const encontrados = [];

  for (const salmo of salmos) {
    const versiculosTexto = salmo.versiculos.join(' ').toLowerCase();
    if (palavras.some(p => versiculosTexto.includes(p))) {
      encontrados.push(salmo);
    }
  }

  if (encontrados.length > 0) {
    const aleatorio = Math.floor(Math.random() * encontrados.length);
    return encontrados[aleatorio];
  }
  return null;
}

/* ============================
   Salmo do dia (fixo, baseado na data)
   ============================ */
function getSalmoDoDia() {
  if (!salmos || salmos.length === 0) return null;
  const hoje = new Date();
  const diaAno = Math.floor((hoje - new Date(hoje.getFullYear(), 0, 0)) / 86400000);
  const index = diaAno % salmos.length;
  return salmos[index];
}

/* ============================
   Obter salmo para mensagem do usuário
   ============================ */
function getSalmoParaUsuario(mensagemUsuario) {
  const encontrado = buscarSalmoPorPalavra(mensagemUsuario);
  if (encontrado) return encontrado;
  return salmoAtual || getSalmoDoDia();
}

/* ============================
   Exibir salmo formatado
   ============================ */
function mostrarSalmoNoContainer(salmo) {
  if (!salmo || !salmoTexto) return;
  let html = `<strong>Salmo ${salmo.numero}</strong><br><br>`;
  html += salmo.versiculos.join('<br><br>');
  salmoTexto.innerHTML = html;
}

/* ============================
   Toggle visibilidade da caixa de salmo
   ============================ */
if (salmoToggle && salmoContainer) {
  // inicia fechado
  salmoContainer.classList.remove('expanded');

  salmoToggle.addEventListener('click', () => {
    const willOpen = !salmoContainer.classList.contains('expanded');

    if (willOpen) {
      salmoContainer.classList.add('expanded');
      // Carrega salmo do dia se ainda não estiver preenchido
      if (!salmoTexto.innerHTML.trim() && salmoAtual) {
        mostrarSalmoNoContainer(salmoAtual);
      }
    } else {
      salmoContainer.classList.remove('expanded');
    }
  });
}

/* ============================
   Inicialização
   ============================ */
document.addEventListener('DOMContentLoaded', carregarSalmos);
