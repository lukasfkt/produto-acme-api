# Product ACME - API

Esta é uma API simples de tarefas desenvolvida em Node.js e TypeScript. Ela utiliza o `express` como servidor web e o `node-json-db` para armazenamento dos dados.

## Como Inicializar

<b>1. Instalação de Dependências:</b>

Certifique-se de ter o Node.js e o npm instalados. Execute o seguinte comando para instalar as dependências:

```
npm install
```

<b>2. Configuração do Ambiente:</b>

Rode o comando abaixo para gerar um novo .env em seu projeto e altere conforme necessário

```
cp .env.example .env
```

<b>3. Execução:</b>

Inicie o servidor com o comando:

```
npm run dev
```

O servidor será iniciado na porta especificada no arquivo .env (por padrão, 3000).

## Funcionamento

<b>1. Autenticação</b>

Para autenticar, envie uma solicitação POST para /login com o corpo contendo as credenciais:

```
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin"}'
```

A resposta incluirá um token que deve ser incluído no cabeçalho Authorization para acessar as demais rotas.

<b>2. Tasks</b>
=> POST `/tasks`:
Adiciona uma nova tarefa. Envie uma solicitação POST para /tasks com o corpo contendo os detalhes da tarefa.

=> GET `/tasks`:
Lista todas as tarefas.

=> PUT `/tasks/:id`:
Atualiza uma tarefa pelo ID. Envie uma solicitação PUT para /tasks/:id com o corpo contendo os detalhes atualizados da tarefa.

=> DELETE `/tasks/:id`:
Deleta uma tarefa pelo ID.

<b>OBS:</b> Lembre-se de incluir o token de autenticação no cabeçalho das solicitações para as rotas protegidas.
