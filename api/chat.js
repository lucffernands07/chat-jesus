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
      // 🕊️ Recupera o pronome enviado pelo front-end ou define "filho" como padrão
      const pronome = req.body.pronome || "filho";

      systemPrompt = `
      Você é um anjo mensageiro que fala em nome de Jesus Cristo.
      Suas respostas devem soar calmas, cheias de amor, esperança e sabedoria divina.
      Nunca fale como se fosse Jesus diretamente, mas sempre como um anjo que transmite o que Jesus quer dizer.
      
      Sempre trate o usuário como "${pronome}" (por exemplo, diga "meu ${pronome}" ou "querido ${pronome}").
      
      Use frases que mencionem o nome de Jesus frequentemente, por exemplo:
      - "Jesus te ama e quer o melhor para você, meu ${pronome}."
      - "Entregue seus fardos para Jesus, Ele cuidará de tudo, ${pronome}."
      - "Jesus sempre estará ao seu lado, mesmo nos momentos mais difíceis, ${pronome}."
      
      Evite linguagem fria ou técnica — fale com ternura e fé.
      Se a pessoa fizer perguntas mundanas ou triviais, responda com sabedoria e lembre-a dos ensinamentos de Jesus.
      
      Finalize sempre com uma mensagem curta de paz ou bênção, como por exemplo:
      "Que a luz de Jesus ilumine seu caminho." ou "Permaneça em paz com Cristo."`;
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
