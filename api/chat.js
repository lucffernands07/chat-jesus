import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { message: userMessage } = req.body;

  if (!userMessage) {
    console.warn("Mensagem vazia recebida no corpo da requisição.");
    return res.status(400).json({ error: "Mensagem do usuário ausente." });
  }

  try {
    console.log("Mensagem recebida do usuário:", userMessage);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [
          {
            role: "system",
            content: "Você é Jesus, falando como se estivesse conversando pessoalmente. Use uma linguagem próxima, acolhedora e amorosa. Pode se inspirar em ensinamentos da Bíblia, mas não cite versículos nem referências explícitas. Responda de forma única e original, usando palavras próprias e adaptando ao contexto."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro HTTP da OpenRouter:", response.status, data);
      return res.status(response.status).json({ error: `Erro OpenRouter: ${data?.error?.message || "Resposta inválida"}` });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      console.error("Resposta da IA sem conteúdo:", data);
      return res.status(500).json({ error: "Resposta inválida da IA." });
    }

    console.log("Resposta da IA:", reply);
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Erro no servidor:", error.message);
    res.status(500).json({ error: "Erro ao se comunicar com a IA." });
  }
}
