document.addEventListener("DOMContentLoaded", async () => {
  const salmoContainer = document.getElementById("salmo-container");
  const salmoTexto = document.getElementById("salmo-texto");
  const salmoToggle = document.getElementById("salmo-toggle");

  // === Expande/fecha ao clicar ===
  salmoToggle.addEventListener("click", () => {
    salmoContainer.style.display =
      salmoContainer.style.display === "none" ? "block" : "none";
  });

  // === Função para obter salmo do dia ===
  async function carregarSalmoDoDia() {
    try {
      // Dia do ano (1–365)
      const dia = Math.floor(
        (new Date() - new Date(new Date().getFullYear(), 0, 0)) /
          1000 / 60 / 60 / 24
      );

      // Usa a API gratuita Biblia API
      const resposta = await fetch(`https://bible-api.com/psalms+${(dia % 150) + 1}?translation=almeida`);
      const data = await resposta.json();

      if (data && data.text) {
        salmoTexto.textContent = data.text.trim();
      } else {
        salmoTexto.textContent = "Não foi possível carregar o salmo de hoje 🙏";
      }
    } catch (e) {
      salmoTexto.textContent = "Erro ao buscar o salmo. Tente novamente mais tarde.";
    }
  }

  carregarSalmoDoDia();
});
