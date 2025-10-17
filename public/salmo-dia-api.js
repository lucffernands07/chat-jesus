document.addEventListener("DOMContentLoaded", async () => {
  const salmoToggle = document.getElementById("salmo-toggle");
  const salmoContainer = document.getElementById("salmo-container");
  const salmoTexto = document.getElementById("salmo-texto");

  // Função para alternar visibilidade da caixa
  salmoToggle.addEventListener("click", () => {
    salmoContainer.style.display =
      salmoContainer.style.display === "block" ? "none" : "block";
  });

  async function carregarSalmoDoDia() {
    try {
      const hoje = new Date();
      const diaDoAno = Math.floor(
        (hoje - new Date(hoje.getFullYear(), 0, 0)) / 86400000
      );
      const numeroSalmo = (diaDoAno % 150) + 1;

      // ✅ Corrigido: espaço deve ser codificado como %20
      const url = `https://bible-api.com/psalm%20${numeroSalmo}?translation=almeida`;

      console.log("📖 Buscando Salmo", numeroSalmo, "URL:", url);

      const resp = await fetch(url);
      const data = await resp.json();

      if (resp.ok && data.text) {
        salmoTexto.textContent = data.text.trim();
      } else {
        salmoTexto.textContent = "Não foi possível carregar o salmo de hoje 🙏";
        console.warn("API sem texto válido:", data);
      }
    } catch (err) {
      console.error("Erro ao carregar salmo:", err);
      salmoTexto.textContent = "Erro ao carregar o salmo de hoje 🙏";
    }
  }

  carregarSalmoDoDia();
});
