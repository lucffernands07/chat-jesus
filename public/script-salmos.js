// ============================
// script-salmos.js
// ============================

let salmos = []; // array com todos os salmos
const salmoContainer = document.getElementById("salmo-container");
const salmoTexto = document.getElementById("salmo-texto");
const salmoToggleBtn = document.getElementById("salmo-toggle");

// ============================
// Carrega os salmos do JSON
// ============================
async function carregarSalmos() {
  try {
    const res = await fetch("/salmos.json");
    salmos = await res.json();
  } catch (err) {
    console.error("Erro ao carregar salmos:", err);
    salmoTexto.textContent = "Não foi possível carregar os salmos.";
  }
}

// ============================
// Função para obter um salmo aleatório
// ============================
function getSalmoAleatorio() {
  if (!salmos.length) return null;
  const idx = Math.floor(Math.random() * salmos.length);
  return salmos[idx];
}

// ============================
// Função para buscar um salmo pelo número
// ============================
function getSalmoPorNumero(numero) {
  return salmos.find(s => s.numero === numero) || null;
}

// ============================
// Função para buscar um salmo com base em palavras-chave
// ============================
function getSalmoParaUsuario(mensagemUsuario) {
  if (!mensagemUsuario || !salmos.length) return getSalmoAleatorio();
  const termos = mensagemUsuario.toLowerCase().split(/\s+/);

  const filtrados = salmos.filter(s => 
    s.versiculos.some(v => termos.some(t => v.toLowerCase().includes(t)))
  );

  if (filtrados.length) {
    const idx = Math.floor(Math.random() * filtrados.length);
    return filtrados[idx];
  }

  // fallback aleatório
  return getSalmoAleatorio();
}

// ============================
// Função para mostrar salmo no container
// ============================
function mostrarSalmoNoContainer(salmo) {
  if (!salmo || !salmo.versiculos) return;
  let conteudo = `Salmo ${salmo.numero}`;
  if (salmo.titulo) conteudo += ` — ${salmo.titulo}`;
  conteudo += "\n\n";
  conteudo += salmo.versiculos.join("\n");
  salmoTexto.textContent = conteudo;
}

// ============================
// Toggle do container Salmo do Dia
// ============================
if (salmoToggleBtn && salmoContainer) {
  salmoToggleBtn.addEventListener("click", () => {
    const isVisible = salmoContainer.style.display === "block";
    if (isVisible) {
      salmoContainer.style.display = "none";
    } else {
      // pega salmo aleatório se quiser
      const salmo = getSalmoAleatorio();
      mostrarSalmoNoContainer(salmo);
      salmoContainer.style.display = "block";
      salmoContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

// ============================
// Inicialização
// ============================
window.addEventListener("DOMContentLoaded", () => {
  carregarSalmos();
});
