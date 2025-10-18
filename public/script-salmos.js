/* ============================
   script-salmos.js
   ============================ */

// Carrega os salmos do arquivo JSON
let salmos = [];
fetch('salmos.json')
  .then(res => res.json())
  .then(data => { salmos = data; })
  .catch(err => console.error('Erro ao carregar salmos:', err));

// Elementos do DOM
const salmoToggleBtn = document.getElementById('salmo-toggle');
const salmoContainer = document.getElementById('salmo-container');
const salmoTexto = document.getElementById('salmo-texto');

// Função para abrir/fechar o container do Salmo
function toggleSalmoContainer() {
  if (!salmoContainer) return;
  salmoContainer.style.display = salmoContainer.style.display === 'block' ? 'none' : 'block';
}

// Evento do botão Salmo do Dia
if (salmoToggleBtn) {
  salmoToggleBtn.addEventListener('click', () => {
    toggleSalmoContainer();
  });
}

// Função para obter o Salmo do dia (baseado na data)
function getSalmoDoDia() {
  if (!salmos || salmos.length === 0) return null;
  const hoje = new Date();
  const diaDoAno = Math.floor(
    (hoje - new Date(hoje.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
  const index = diaDoAno % salmos.length;
  return salmos[index];
}

// Função para buscar salmo por palavra-chave (aleatório entre versículos que contém a palavra)
function getSalmoPorPalavra(texto) {
  if (!salmos || salmos.length === 0) return null;
  const palavras = texto.toLowerCase().match(/\b\w+\b/g) || [];
  const matches = [];

  salmos.forEach(salmo => {
    salmo.versiculos.forEach((vers, idx) => {
      palavras.forEach(p => {
        if (vers.toLowerCase().includes(p)) {
          matches.push({ salmo, versiculo: vers });
        }
      });
    });
  });

  if (matches.length === 0) return null;
  // Escolhe aleatório
  const escolha = matches[Math.floor(Math.random() * matches.length)];
  return escolha;
}

// Mostra o salmo no container
function mostrarSalmoNoContainer(salmoData) {
  if (!salmoData || !salmoContainer || !salmoTexto) return;

  let conteudo = '';
  if (salmoData.numero && salmoData.versiculos) {
    conteudo += `<strong>Salmo ${salmoData.numero}</strong><br><br>`;
    conteudo += salmoData.versiculos.map(v => v).join('<br>');
  } else if (salmoData.versiculo && salmoData.salmo) {
    // Caso venha do getSalmoPorPalavra
    conteudo += `<strong>Salmo ${salmoData.salmo.numero}</strong><br><br>`;
    conteudo += salmoData.versiculo;
  } else {
    conteudo = 'Não foi possível carregar o salmo.';
  }

  salmoTexto.innerHTML = conteudo;
  salmoContainer.style.display = 'block';
}

/* ============================
   Integração com Chat 1 e 2
   ============================ */

// Função geral para buscar salmo para usuário
function getSalmoParaUsuario(mensagemUsuario) {
  let resultado = getSalmoPorPalavra(mensagemUsuario);
  if (resultado) {
    return { salmo: resultado.salmo, versiculo: resultado.versiculo };
  } else {
    return getSalmoDoDia();
  }
}

// Exemplo de uso: Chat 1
if (typeof appendMessage === 'function') {
  const chatForm = document.getElementById('chat-form');
  const messageInput = document.getElementById('message-input');
  if (chatForm) {
    chatForm.addEventListener('submit', e => {
      const texto = messageInput.value.trim();
      if (!texto) return;
      const salmo = getSalmoParaUsuario(texto);
      mostrarSalmoNoContainer(salmo);
    });
  }
}

// Exemplo de uso: Chat 2
if (typeof addBibliaMessage === 'function') {
  const bibliaForm = document.getElementById('biblia-form');
  const bibliaInput = document.getElementById('biblia-input');
  if (bibliaForm) {
    bibliaForm.addEventListener('submit', e => {
      const texto = bibliaInput.value.trim();
      if (!texto) return;
      const salmo = getSalmoParaUsuario(texto);
      mostrarSalmoNoContainer(salmo);
    });
  }
}

/* ============================
   Exportar funções se necessário
   ============================ */
export { getSalmoDoDia, getSalmoParaUsuario, mostrarSalmoNoContainer };
