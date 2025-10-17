document.addEventListener("DOMContentLoaded", async () => {
  const salmoToggle = document.getElementById("salmo-toggle");
  const salmoContainer = document.getElementById("salmo-container");
  const salmoTexto = document.getElementById("salmo-texto");

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

      const url = `/api/salmo`;
      console.log("📖 Buscando Salmo", numeroSalmo, "URL:", url);

      const resp = await fetch(url);
      const data = await resp.json();

      if (resp.ok && data.verses) {
        const texto = data.verses.map(v => v.text).join(" ");
        salmoTexto.textContent = texto.trim();
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
