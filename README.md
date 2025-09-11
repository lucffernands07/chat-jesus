# 🕊️ Chat com Jesus

Este é um aplicativo web onde você pode conversar com uma IA que simula Jesus, respondendo com sabedoria, compaixão e amor incondicional, usando o modelo `deepseek-chat` via OpenRouter.

# ✨ Funcionalidades

- Chat em tempo real com Jesus
- Interface simples e responsiva
- Integração com API gratuita da [OpenRouter](https://openrouter.ai)
- Fácil de clonar e rodar localmente ou no Vercel/Render

---

# 🚀 Deploy

### Vercel

Você pode fazer deploy facilmente no [Vercel](https://vercel.com):

1. Faça login em [Vercel](https://vercel.com)
2. Clique em **"New Project"**
3. Conecte seu repositório do GitHub
4. Configure:

- **Framework Preset:** Node.js
- **Root Directory:** `/` (raiz do projeto)
- **Build & Output Settings:**  
  - Build Command: `node server.js`
  - Output Directory: `public`  

- **Environment Variables:**  
```
OPENROUTER_API_KEY=sua_chave_da_openrouter 
```
5. Clique em **Deploy**  

O Vercel vai gerar uma URL fixa para acessar o seu chat 24/7.

---

## 💻 Rodar localmente

Pré-requisitos:

- Node.js (v14+)
- Conta na OpenRouter com chave de API

Passos:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/chat-jesus.git
cd chat-jesus

# Instale as dependências
npm install

# Crie o arquivo .env
cp .env.example .env
# Edite o arquivo .env com sua chave da OpenRouter

# Inicie o servidor
node server.js

Acesse:
http://localhost:3000
```

---

# 📁 Estrutura do projeto
```
chat-jesus/
├─ 📂 api/
│  └─ 📄 chat.js
├─ 📂 public/
│  ├─ 📄 index.html
│  ├─ 📄 styles.css
│  └─ 📄 script.js
├─ 📄 .env
├─ 📄 vercel.js
└─ 📄 package.json
```

---

# 🧠 Modelo Utilizado

deepseek/deepseek-chat-v3-0324

Hospedado pela OpenRouter
Simula Jesus com instruções no prompt system


---

# 🛡️ Licença

Este projeto é livre para uso pessoal e educacional. Nenhuma garantia é fornecida. Sinta-se à vontade para adaptá-lo.


---

# 🙏 Créditos

Desenvolvido com fé e tecnologia.

[API OpenRouter](https://openrouter.ai)

[Vercel](https://vercel.com)
