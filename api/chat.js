const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Mensagem do usuário ausente." });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [
          { role: "system", content: "Você é Jesus, acolhedor, amoroso e próximo. Não cite versículos diretamente, há não ser que o usuário pedir." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || "Erro OpenRouter" });

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return res.status(500).json({ error: "Resposta inválida da IA" });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Erro ao se comunicar com a IA" });
  }
};
