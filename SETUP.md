# 🚀 Manual do Operador - Sistema Comercial Autônomo (Mart Digital)

Este guia contém as instruções passo a passo para operar, pausar e manter o **Sistema Comercial Autônomo de Prospecção no Instagram da Mart Digital** (*Victor de Barros Martisn*).

---

## 1. Configuração de Chave de API da OpenAI

1. Acesse o painel da OpenAI em [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Crie um projeto dedicado para a Mart Digital com permissões *Restricted*.
3. Defina um **Hard Limit Mensal** de consumo em **Settings → Limits** (Recomendado: **$50.00 USD**).
4. Copie a chave gerada e cole no seu arquivo `.env`:

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MODEL_FAST=gpt-4o-mini
OPENAI_MONTHLY_BUDGET_USD=50.00
```

---

## 2. Inicialização do Google Chrome com Perfil Dedicado (CDP)

O envio da **1ª DM de abertura** é realizado via Playwright conectando-se à porta de depuração remota (**CDP 9222**) do Chrome real.

### ⚠️ AVISO DE SEGURANÇA CRÍTICO:
> A porta de depuração dá controle total sobre a sessão logada do Chrome. Mantenha o listener em **127.0.0.1** e NUNCA exponha para `0.0.0.0` nem execute em computadores compartilhados.

### Comando para iniciar o Chrome no Windows:
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="c:\Prospect - Buscando Milhão\.chrome-profile"
```

### Comando para iniciar no macOS:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.chrome-profile"
```

### Comando para iniciar no Linux:
```bash
google-chrome --remote-debugging-port=9222 --user-data-dir="$HOME/.chrome-profile"
```

> **IMPORTANTE:** Após abrir o navegador pela primeira vez, acesse [instagram.com](https://www.instagram.com) e faça login manualmente com a conta oficial da empresa (**@victormartins.io**). O sistema reutilizará essa sessão logada automaticamente sem pedir senhas.

---

## 3. Como Executar a Aplicação Localmente

Para iniciar o painel CRM e o sistema comercial em desenvolvimento:

```bash
npm run dev
```

Acesse no seu navegador: **[http://localhost:3000](http://localhost:3000)**

---

## 4. Limites Operacionais e Ritmo Humano

O sistema segue a mesma disciplina de um SDR humano para proteger a saúde da conta:

- **DMs por dia:** 30 (configurável em `MAX_DMS_PER_DAY`).
- **Intervalo entre mensagens:** 90 a 240 segundos aleatórios.
- **Janela de Funcionamento:** 09:00 às 20:00 (Fuso `America/Sao_Paulo`).

---

## 5. Pausa de Emergência e Proteções de Orçamento

- **Botão de Pausa Geral:** Disponível no topo do Dashboard em `http://localhost:3000`. Em caso de qualquer anomalia no Instagram, clique em **Pausar Sistema**.
- **Corte por Orçamento:** Ao atingir o limite mensal de `$50.00 USD` em chamadas à OpenAI, o worker pausa os envios automáticos e avisa o operador no painel.

---

## 6. Procedimento de Backup e Restauração do Banco SQLite

O banco de dados privado do sistema fica salvo em `data/buscandomilhao.sqlite`.

### Fazer Backup Manual:
```bash
cp data/buscandomilhao.sqlite data/backups/backup_$(date +%Y%m%d_%H%M%S).sqlite
```

### Restaurar Backup:
```bash
cp data/backups/meu_backup.sqlite data/buscandomilhao.sqlite
```
