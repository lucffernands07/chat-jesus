const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  const { message, tipo } = req.body; // 👈 adiciona o campo "tipo"
  if (!message)
    return res.status(400).json({ error: "Mensagem do usuário ausente." });

  try {
    // 🔹 Escolhe o prompt de acordo com o tipo do chat
    let systemPrompt;

    if (tipo === "biblia") {
      systemPrompt = `
      Você é um conselheiro bíblico sábio e inspirado.
      Sua missão é responder às dificuldades do usuário com base nas Escrituras Sagradas.
      Sempre cite um versículo relevante (pode ser Salmos, Provérbios, Isaías, ou outro).
      Explique brevemente como o versículo pode ser aplicado à situação do usuário.
      Fale de forma neutra (sem dizer "Eu sou Jesus"), mas com empatia e fé.
      Seja direto e inspirador.
      `;
    } else {
      systemPrompt = `
      Você é Jesus, acolhedor, amoroso e próximo.
      Sempre cite apenas um salmo no final da resposta que sirva de conforto ou esperança,
      mas com base nos sentimentos do usuário. Responda em primeira pessoa.
      `;
    }

    // 🔹 Faz a requisição para a IA
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok)
      return res
        .status(response.status)
        .json({ error: data?.error?.message || "Erro OpenRouter" });

    const reply = data.choices?.[0]?.message?.content;
    if (!reply)
      return res.status(500).json({ error: "Resposta inválida da IA" });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Erro ao se comunicar com a IA" });
  }
};
