const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    const hoje = new Date();
    const diaDoAno = Math.floor(
      (hoje - new Date(hoje.getFullYear(), 0, 0)) / 86400000
    );

    // 150 salmos — ciclo diário
    const numeroSalmo = (diaDoAno % 150) + 1;

    const url = `https://bible-api.com/psalms%20${numeroSalmo}?translation=almeida`;
    console.log("📖 Buscando Salmo", numeroSalmo, "URL:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (!data.text) {
      console.log("⚠️ API sem texto válido:", data);
      return res.status(500).json({ error: "Falha ao obter salmo" });
    }

    // Formata o texto — quebra linhas e título
    const textoFormatado = data.text
      .replace(/\s{2,}/g, " ")
      .replace(/\n/g, "\n")
      .trim();

    res.status(200).json({
      numero: numeroSalmo,
      texto: textoFormatado,
    });
  } catch (err) {
    console.error("❌ Erro ao buscar salmo:", err);
    res.status(500).json({ error: "Erro ao buscar salmo" });
  }
};
