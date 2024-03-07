import express, { Request, Response } from "express";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";

import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";

// Tipagem da task
type Task = {
  uuid: string;
  title: string;
  description: string;
  completed: boolean;
  updatedAt: string;
};

dotenv.config();

// Variaveis do .env, caso queira alterar o usuário e senha e a porta do servidor, altere no arquivo .env
const { PORT, LOGIN, PASSWORD, TOKEN } = process.env;

const { v4: uuidv4 } = require("uuid");
const app = express();
const port = PORT || 3000;

// Configuração do banco de dados JSON
const tasksDB = new JsonDB(new Config("tasksDB", true, false, "/"));

// Middleware para analisar o corpo das requisições
app.use(bodyParser.json());

// Habilita o CORS
app.use(cors());

// Middleware de autenticação (apenas um exemplo simples)
const authenticate = (req: Request, res: Response, next: () => void) => {
  const token = req.headers.authorization;

  if (token === `Bearer ${TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: "Autenticação falhou" });
  }
};

// Rota bem simples de autenticação somente para simulação (Futuramente integrar com JSON WEB TOKEN e salvar o usuario no banco de dados)
app.post("/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Verifica se as credenciais são válidas
  if (username === LOGIN && password === PASSWORD) {
    // Gera um token (substitua isso por JWT em um ambiente de produção)
    const token = TOKEN;
    res.status(200).json({ token });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

// Adiciona uma nova tarefa
app.post("/tasks", authenticate, async (req: Request, res: Response) => {
  const { title, description, completed } = req.body;

  try {
    const nowDt = new Date().toLocaleTimeString("pt-br", {
      timeZone: "America/Sao_Paulo",
    });
    const newTask: Task = {
      uuid: uuidv4(),
      title,
      description,
      completed,
      updatedAt: nowDt,
    };
    await tasksDB.push("/tasks[]", newTask);
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao adicionar a tarefa" });
  }
});

// Lista todas as tarefas e filtra por paginacão ou pesquisa
app.get("/tasks", authenticate, async (req: Request, res: Response) => {
  try {
    // Parâmetros de consulta
    const { page = 1, limit = 10, search } = req.query;

    // Obtém todas as tarefas
    let tasks: Task[] = await tasksDB.getData("/tasks");

    // Filtra por título, se fornecido
    if (search) {
      tasks = tasks.filter((task: Task) =>
        task.title.toLowerCase().includes(search.toString().toLowerCase())
      );
    }

    // Aplica paginação
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = Number(page) * Number(limit);
    const paginatedTasks = tasks.slice(startIndex, endIndex);

    res.status(200).json({
      totalTasks: tasks.length,
      pagination: {
        currentPage: parseInt(page.toString()),
        totalPages: Math.ceil(tasks.length / Number(limit)),
      },
      tasks: paginatedTasks,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Erro ao recuperar tarefas" });
  }
});

// Atualiza uma tarefa pelo ID
app.put("/tasks/:id", authenticate, async (req: Request, res: Response) => {
  const taskId = req.params.id;
  const { title, description, completed } = req.body;

  try {
    const nowDt = new Date().toLocaleTimeString("pt-br", {
      timeZone: "America/Sao_Paulo",
    });
    const tasks: Task[] = await tasksDB.getData("/tasks");
    const index = tasks.findIndex((task: Task) => task.uuid === taskId);
    const task = tasks[index];
    if (task) {
      task.title = title;
      task.description = description;
      task.completed = completed;
      task.updatedAt = nowDt;
      await tasksDB.push(`/tasks[${index}]`, task, true);
      res.status(204).json({ success: true, task });
    }
    res.status(404).json({ error: "Tarefa não encontrada" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar a tarefa" });
  }
});

// Deleta uma tarefa pelo ID
app.delete("/tasks/:id", authenticate, async (req: Request, res: Response) => {
  const taskId = req.params.id;

  try {
    const tasks: Task[] = await tasksDB.getData("/tasks");
    const index = tasks.findIndex((task: Task) => task.uuid === taskId);
    tasksDB.delete(`/tasks[${index}]`);
    res.status(204).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar a tarefa" });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
