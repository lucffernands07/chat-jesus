const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    const hoje = new Date();
    const diaDoAno = Math.floor(
      (hoje - new Date(hoje.getFullYear(), 0, 0)) / 86400000
    );
    const numeroSalmo = (diaDoAno % 150) + 1;

    const url = `https://www.abibliadigital.com.br/api/verses/acf/sl/${numeroSalmo}/1`;
    const response = await fetch(url);
    const data = await response.json();

    // Verifica se o texto existe
    if (!response.ok || !data?.text) {
      console.log("API sem texto válido:", data);
      return res.status(500).json({ error: "Falha ao obter salmo" });
    }

    res.status(200).json({
      numero: numeroSalmo,
      texto: data.text,
    });
  } catch (err) {
    console.error("Erro ao buscar salmo:", err);
    res.status(500).json({ error: "Erro ao buscar salmo" });
  }
};
