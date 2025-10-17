/* ============================
   script-salmos.js
   ============================ */

// Supondo que você já tem um arquivo salmos.json com todos os salmos
let todosSalmos = [];

async function carregarSalmos() {
  try {
    const response = await fetch('salmos.json');
    todosSalmos = await response.json();
  } catch (err) {
    console.error('Erro ao carregar salmos:', err);
  }
}

// Chamar ao iniciar o app
carregarSalmos();

/* ============================
   Função para pegar um salmo aleatório ou pelo dia
   ============================ */
function getSalmoDoDia() {
  const hoje = new Date();
  const index = (hoje.getDate() - 1) % todosSalmos.length;
  return todosSalmos[index];
}

// Busca o salmo baseado na mensagem do usuário (Chat 1 ou Chat 2)
function getSalmoParaUsuario(mensagem) {
  if (!mensagem) return getSalmoDoDia();

  const msgLower = mensagem.toLowerCase();
  const salmosFiltrados = todosSalmos.filter(s => 
    s.versiculos.some(v => v.toLowerCase().includes(msgLower))
  );

  if (salmosFiltrados.length > 0) {
    const aleatorio = Math.floor(Math.random() * salmosFiltrados.length);
    return salmosFiltrados[aleatorio];
  }

  return getSalmoDoDia();
}

/* ============================
   Mostrar o salmo na caixa
   ============================ */
function mostrarSalmoNoContainer(salmo) {
  const container = document.getElementById('salmo-container');
  const overlay = document.getElementById('salmoOverlay');

  if (!container || !overlay || !salmo) return;

  // Cria HTML dos versículos
  const versiculosHtml = salmo.versiculos.map(v => `<p>${v}</p>`).join('');

  container.innerHTML = `<h3>Salmo ${salmo.numero}</h3>${versiculosHtml}`;

  // Mostrar container e overlay
  container.style.display = 'block';
  overlay.style.display = 'block';
  container.scrollTop = 0;
}

// Fechar a caixa de salmo
function fecharSalmo() {
  const container = document.getElementById('salmo-container');
  const overlay = document.getElementById('salmoOverlay');
  if (container) container.style.display = 'none';
  if (overlay) overlay.style.display = 'none';
}

// Fechar ao clicar no overlay
const salmoOverlay = document.getElementById('salmoOverlay');
if (salmoOverlay) {
  salmoOverlay.addEventListener('click', fecharSalmo);
}

// Toggle pelo botão "Salmo do Dia"
const salmoToggle = document.getElementById('salmo-toggle');
if (salmoToggle) {
  salmoToggle.addEventListener('click', () => {
    const container = document.getElementById('salmo-container');
    const overlay = document.getElementById('salmoOverlay');
    const isVisible = container.style.display === 'block';
    if (isVisible) {
      fecharSalmo();
    } else {
      const salmo = getSalmoDoDia();
      mostrarSalmoNoContainer(salmo);
    }
  });
}

// Função pública que você pode chamar do script.js
// Exemplo: const salmo = getSalmoParaUsuario(userMessage);
// mostrarSalmoNoContainer(salmo);
