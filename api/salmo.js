const fetch = require("node-fetch");

// Sorteia um salmo fixo por dia (1–150)
function obterSalmoDoDia() {
  const data = new Date();
  const dia = data.getDate();
  const mes = data.getMonth() + 1;
  const seed = (dia + mes * 31) % 150 || 1;
  return seed;
}

module.exports = async (req, res) => {
  try {
    const numero = obterSalmoDoDia();
    const url = `https://www.abibliadigital.com.br/api/verses/acf/sl/${numero}`;
    console.log("Buscando Salmo", numero, "URL:", url);

    const resposta = await fetch(url);
    const data = await resposta.json();

    if (!data || !data.text || data.error) {
      console.error("API sem texto válido:", data);
      return res.status(500).json({ error: "Falha ao obter salmo" });
    }

    const texto = data.text
      .map((v) => `${v.number}. ${v.text}`)
      .join(" ");

    res.json({
      numero,
      texto,
    });
  } catch (err) {
    console.error("Erro geral:", err);
    res.status(500).json({ error: "Erro ao buscar salmo" });
  }
};
