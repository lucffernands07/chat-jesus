const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    const hoje = new Date();
    const diaDoAno = Math.floor(
      (hoje - new Date(hoje.getFullYear(), 0, 0)) / 86400000
    );
    const numeroSalmo = (diaDoAno % 150) + 1;

    const url = `https://www.abibliadigital.com.br/api/verses/acf/sl/${numeroSalmo}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.verses) {
      return res.status(500).json({ error: "Falha ao obter salmo" });
    }

    res.status(200).json({
      numero: numeroSalmo,
      texto: data.verses.map(v => v.text).join(" "),
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar salmo" });
  }
};
