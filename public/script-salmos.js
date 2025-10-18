/* ============================
   Script Salmos
   ============================ */

// Container do salmo do dia
const salmoToggle = document.getElementById('salmo-toggle');
const salmoContainer = document.getElementById('salmo-container');
const salmoTexto = document.getElementById('salmo-texto');

// Array com todos os salmos (exemplo resumido, substituir pelo JSON completo)
const salmos = [
  {
    numero: 1,
    titulo: "",
    versiculos: [
      "Bem-aventurado o homem que não anda segundo o conselho dos ímpios.",
      "Antes tem o seu prazer na lei do Senhor, e nela medita de dia e de noite."
    ]
  },
  {
    numero: 2,
    titulo: "",
    versiculos: [
      "Por que se amotinam as nações?",
      "Os reis da terra se levantam, e os príncipes consultam unidos contra o Senhor e contra o seu ungido."
    ]
  }
  // ... adicionar todos os 150 salmos
];

/* ============================
   Função auxiliar para buscar salmo por palavra-chave
   ============================ */
function buscarSalmoPorPalavra(texto) {
  const palavras = texto.toLowerCase().match(/\b\w+\b/g) || [];
  const encontrados = [];

  salmos.forEach(salmo => {
    const todosVersiculos = salmo.versiculos.join(' ').toLowerCase();
    if (palavras.some(p => todosVersiculos.includes(p))) {
      encontrados.push(salmo);
    }
  });

  if (encontrados.length > 0) {
    // Retorna aleatoriamente um dos salmos encontrados
    return encontrados[Math.floor(Math.random() * encontrados.length)];
  }
  return null;
}

/* ============================
   Função para obter o salmo do dia (baseado na data)
   ============================ */
function getSalmoDoDia() {
  const hoje = new Date();
  const diaAno = Math.floor(
    (hoje - new Date(hoje.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  ); // número do dia no ano
  const index = diaAno % salmos.length; // garante que fique dentro do array
  return salmos[index];
}

/* ============================
   Função principal para obter o salmo
   ============================ */
function getSalmoParaUsuario(mensagemUsuario) {
  // Tenta buscar por palavra-chave
  const encontrado = buscarSalmoPorPalavra(mensagemUsuario);
  if (encontrado) return encontrado;
  // Se não encontrou, retorna o salmo do dia
  return getSalmoDoDia();
}

/* ============================
   Mostrar salmo no container
   ============================ */
function mostrarSalmoNoContainer(salmo) {
  if (!salmo) return;
  let texto = `<strong>Salmo ${salmo.numero}</strong><br><br>`;
  texto += salmo.versiculos.join('<br>');
  salmoTexto.innerHTML = texto;
  salmoContainer.style.display = 'block';
}

/* ============================
   Toggle do Salmo
   ============================ */
if (salmoToggle) {
  salmoToggle.addEventListener('click', () => {
    if (!salmoContainer) return;
    if (salmoContainer.style.display === 'block') {
      salmoContainer.style.display = 'none';
    } else {
      salmoContainer.style.display = 'block';
      // Aqui pode ser chamada a função com a mensagem do chat 1 ou 2
      // Exemplo: mostrarSalmoNoContainer(getSalmoParaUsuario('Senhor estou aflito'));
    }
  });
}
