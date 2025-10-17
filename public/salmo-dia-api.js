document.addEventListener("DOMContentLoaded", async () => {
  const salmoContainer = document.getElementById("salmo-container");
  const salmoTexto = document.getElementById("salmo-texto");
  const salmoToggle = document.getElementById("salmo-toggle");

  // === Expande ou recolhe o salmo ===
  salmoToggle.addEventListener("click", () => {
    const isHidden = salmoContainer.style.display === "none" || !salmoContainer.style.display;
    salmoContainer.style.display = isHidden ? "block" : "none";
  });

  // === Função que busca o salmo do dia ===
  async function carregarSalmoDoDia() {
    try {
      const hoje = new Date();
      const diaDoAno = Math.floor(
        (hoje - new Date(hoje.getFullYear(), 0, 0)) / 86400000
      );
      const numeroSalmo = (diaDoAno % 150) + 1; // existem 150 salmos

      const resp = await fetch(`https://bible-api.com/psalms+${numeroSalmo}?translation=almeida`);
      const data = await resp.json();

      if (data?.text) {
        salmoTexto.textContent = data.text.trim();
      } else {
        salmoTexto.textContent = "Não foi possível carregar o salmo de hoje 🙏";
      }
    } catch (error) {
      salmoTexto.textContent = "Erro ao buscar o salmo. Tente novamente mais tarde.";
    }
  }

  carregarSalmoDoDia();
});
