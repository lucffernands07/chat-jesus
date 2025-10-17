document.addEventListener("DOMContentLoaded", () => {
  const botaoSalmo = document.getElementById("salmo-toggle");
  const caixaSalmo = document.getElementById("salmo-container");
  const textoSalmo = document.getElementById("salmo-texto");

  // Alterna exibição ao clicar
  botaoSalmo.addEventListener("click", async () => {
    if (caixaSalmo.style.display === "none" || caixaSalmo.style.display === "") {
      caixaSalmo.style.display = "block";

      if (!textoSalmo.dataset.loaded) {
        textoSalmo.textContent = "Carregando salmo...";
        try {
          const resposta = await fetch("/api/salmo");
          const data = await resposta.json();

          if (data && data.texto) {
            textoSalmo.textContent = `📖 Salmo ${data.numero}\n\n${data.texto}`;
            textoSalmo.dataset.loaded = "true";
          } else {
            console.error("API sem texto válido:", data);
            textoSalmo.textContent = "Não foi possível carregar o salmo de hoje 🙏";
          }
        } catch (erro) {
          console.error("Erro ao carregar salmo:", erro);
          textoSalmo.textContent = "Erro ao carregar o salmo de hoje 🙏";
        }
      }
    } else {
      caixaSalmo.style.display = "none";
    }
  });
});
