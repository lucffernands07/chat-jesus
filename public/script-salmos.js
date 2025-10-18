// ==========================
// Script Salmos
// ==========================

// Elementos do Salmo do Dia
const salmoToggleBtn = document.getElementById('salmo-toggle');
const salmoContainer = document.getElementById('salmo-container');
const salmoTexto = document.getElementById('salmo-texto');

// ===== Função toggle para abrir/fechar o salmo =====
function toggleSalmo() {
  if (!salmoContainer) return;
  const isOpen = salmoContainer.style.display === 'block';
  salmoContainer.style.display = isOpen ? 'none' : 'block';
}

// ===== Função para mostrar o salmo =====
function mostrarSalmoNoContainer(salmo) {
  if (!salmoTexto || !salmoContainer) return;
  // junta título e versículos
  const todosVersiculos = salmo.versiculos.join('\n');
  salmoTexto.textContent = `Salmo ${salmo.numero}\n${todosVersiculos}`;
  salmoContainer.style.display = 'block';
}

// ===== Adiciona evento ao botão =====
if (salmoToggleBtn) {
  salmoToggleBtn.addEventListener('click', () => {
    toggleSalmo();
  });
}

// ===== Botão interno para fechar =====
const btnFecharSalmo = document.createElement('button');
btnFecharSalmo.textContent = 'Fechar';
btnFecharSalmo.style.display = 'block';
btnFecharSalmo.style.marginTop = '10px';
btnFecharSalmo.addEventListener('click', () => {
  if (salmoContainer) salmoContainer.style.display = 'none';
});
if (salmoContainer) salmoContainer.appendChild(btnFecharSalmo);

// ===== Função para buscar salmo do usuário =====
// Exemplo de uso: const salmo = getSalmoParaUsuario(userMessage);
// mostrarSalmoNoContainer(salmo);
function getSalmoParaUsuario(userMessage) {
  // aqui você integra com o seu arquivo salmos.json
  // e retorna o objeto do salmo correspondente
  // ex: { numero: 17, versiculos: ["...", "..."] }
  return { numero: 17, versiculos: ["Ouça, Senhor, a justa causa; atenda ao meu clamor; ouve a minha oração, que não procede de lábios enganosos.",
                                    "Desde a tua presença saem os meus juízos; os teus olhos vêem a verdade.",
                                    "Provas o meu coração de noite, visitas-me de manhã; tens-me examinado, e nada achaste.",
                                    "O meu passo se firmou no caminho; os meus pés não vacilaram.",
                                    "Clamei a ti, ó Deus, porque tu me ouviste; inclina a tua orelha a mim, ouve as minhas palavras."]};
}
