// === 📖 Salmo do Dia (versão local) ===

// Função para carregar o salmo do dia
async function carregarSalmoDoDia() {
  try {
    const response = await fetch("salmos.json"); // arquivo local
    const salmos = await response.json();

    // Calcula o número do salmo com base no dia do ano (1 a 365 → 1 a 150)
    const hoje = new Date();
    const diaDoAno = Math.floor(
      (hoje - new Date(hoje.getFullYear(), 0, 0)) / 86400000
    );
    const salmoNumero = ((diaDoAno - 1) % 150) + 1; // repete após 150
    const textoSalmo = salmos[salmoNumero.toString()] || "Salmo não encontrado.";

    // Exibe o salmo
    document.getElementById("salmo-texto").textContent =
      `📖 Salmo ${salmoNumero}: ${textoSalmo}`;

    console.log(`✅ Salmo do dia carregado: ${salmoNumero}`);
  } catch (error) {
    console.error("❌ Erro ao carregar salmo:", error);
    document.getElementById("salmo-texto").textContent =
      "Não foi possível carregar o Salmo de hoje 🙏";
  }
}

// === Expansão da caixa ===
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("salmo-toggle");
  const container = document.getElementById("salmo-container");

  toggle.addEventListener("click", async () => {
    const isVisible = container.style.display === "block";
    container.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
      await carregarSalmoDoDia();
    }
  });
});
