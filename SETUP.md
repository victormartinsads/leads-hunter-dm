# 🚀 Manual de Configuração & Operação — Buscando 1 Milhão

Sistema comercial autônomo de prospecção no Instagram integrado com **Google Gemini** e **Dashboard Visual em Next.js**.

---

## 🔑 1. Obter a Chave do Google Gemini

1. Acesse o **[Google AI Studio](https://aistudio.google.com/app/apikey)** e faça login com sua conta Google.
2. Clique em **Create API key** (Criar chave de API).
3. Selecione seu projeto ou crie um novo projeto.
4. Copie a chave gerada (formato `AIzaSy...`).
5. Abra o arquivo `.env` na raiz do projeto e cole sua chave:
   ```env
   GEMINI_API_KEY=AIzaSySuaChaveAqui
   GEMINI_MODEL=gemini-2.5-flash
   GEMINI_MODEL_FAST=gemini-2.5-flash
   GEMINI_MONTHLY_BUDGET_USD=50.00
   ```

---

## 🌐 2. Iniciar o Chrome com Perfil Dedicado (Primeiro Contato)

A primeira DM para perfis que nunca interagiram com você sai pelo seu **Chrome Real**, usando a sessão que você logou uma única vez. Isso garante 100% de segurança contra bloqueios e não expõe suas senhas.

### Windows (PowerShell)
Execute no PowerShell:
```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="$PWD\.chrome-profile"
```

> **Dica:** Na janela do Chrome que abrir, entre em `instagram.com` e faça login na sua conta do Instagram. A sessão fica salva permanentemente na pasta `.chrome-profile` da sua máquina.

### macOS
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$PWD/.chrome-profile"
```

### Linux
```bash
google-chrome --remote-debugging-port=9222 --user-data-dir="$PWD/.chrome-profile"
```

---

## 💻 3. Como Rodar a Aplicação

Para iniciar o servidor local com a interface web e todas as rotas ativas:

```bash
npm run dev
```

Abra no seu navegador:
👉 **`http://localhost:3000`**

---

## 🛡️ 4. Gestão de Claims (Regra de Ouro)

O sistema possui duas listas centrais em `/claims`:

- **`VERIFIED_CLAIMS`** (Verde): Afirmações 100% comprovadas. **Apenas estas** a IA Gemini tem permissão de citar ou usar ao falar com os leads.
- **`UNVERIFIED_CLAIMS`** (Amarelo/Vermelho): Afirmações bloqueadas. Ficam proibidas para a IA até que você anexe uma evidência/prova e clique em **"Comprovar e Ativar na IA"**.

---

## 📊 5. Funcionalidades do Painel

1. **Visão Geral (`/`)**:
   - KPIs de prospecção em tempo real (Total Abordados, Taxas de Resposta, Leads no WhatsApp, Clientes Ativos).
   - Consumo de tokens e custos estimados do Gemini (USD e R$).
   - Botão de **Pausar / Retomar** imediato (Kill Switch).
   - Disparo manual de próxima DM.

2. **Leads Abordados (`/leads`)**:
   - Visualização alternável entre **Tabela** e **Kanban**.
   - Filtro por Funil (Clientes vs Afiliados) e busca por @handle.
   - Detalhe de cada lead (`/leads/[id]`) com chat em tempo real, timeline de mensagens e botão de geração de resposta com Gemini.

3. **Simulador Gemini (`/simulator`)**:
   - Simule perfis fictícios do Instagram e veja ao vivo como o Gemini gera a primeira DM e classifica intenções.

4. **Configurações (`/settings`)**:
   - Altere dados da empresa, links de WhatsApp/Afiliados, pitch e limites diários de DMs.
