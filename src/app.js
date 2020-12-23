const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');
const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

/* Meddleware Validação Id */
function validadeRepositorieId(request, response, next){
  const { id } = request.params;
  if(!isUuid(id)){
    return response.status(400).json({ error: "Invalid repositorie ID." })
  }
  return next();
}
/* Meddleware Logs */
function logRequests(request, response, next){
  const { method, url } = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

app.use(logRequests);
app.use('/repositories/:id', validadeRepositorieId);

app.get("/repositories", (request, response) => {
  // Rota que lista todos os repositórios;
  return response.json(repositories);
});

/**
   * A rota deve receber title, url e techs dentro do corpo da requisição, 
   * sendo a URL o link para o github desse repositório. Ao cadastrar um novo 
   * projeto, ele deve ser armazenado dentro de um objeto no seguinte formato: 
   * { id: "uuid", title: 'Desafio Node.js', url: 'http://github.com/...', 
   * techs: ["Node.js", "..."], likes: 0 }; 
   * Certifique-se que o ID seja um UUID, 
   * e de sempre iniciar os likes como 0. 
   * */ 
app.post("/repositories", (request, response) => {
   
   const {title, url, techs } = request.body;
   const repository = { id: uuid(), title, url, techs, likes: 0 }
   repositories.push(repository);
   return response.json(repository);
});

/**
   * A rota deve alterar apenas o title, a url e as techs do repositório que 
   * possua o id igual ao id presente nos parâmetros da rota; 
   * */
app.put("/repositories/:id", (request, response) => {    

  const {title, url, techs } = request.body;
  const { id } = request.params;

  const indexRepository = repositories.findIndex(rep => rep.id == id);

  if(indexRepository < 0){
    return response.status(400).json({error: 'Repositorie Not found.'});
  }
  const repository = repositories[indexRepository];
  
  
  repository.url = url;
  repository.title = title;
  repository.techs = techs;

  repositories[indexRepository] = repository;
  return response.json(repository);

});

// A rota deve deletar o repositório com o id presente nos parâmetros da rota;
app.delete("/repositories/:id", (request, response) => {
  
  const { id } = request.params;

  const indexRepository = repositories.findIndex(rep => rep.id == id);

  if(indexRepository < 0){
    return response.status(400).json({error: 'Repositorie Not found.'});
  }
  repositories.splice(indexRepository, 1);
  return response.status(204).send();
});

/** 
   * A rota deve aumentar o número de likes do repositório específico escolhido 
   * através do id presente nos parâmetros * da rota, a cada chamada dessa rota, 
   * o número de likes deve ser aumentado em 1;
   * 
  */
app.post("/repositories/:id/like", (request, response) => {
  
 const { id } = request.params;

 const indexRepository = repositories.findIndex(rep => rep.id == id);

 if(indexRepository < 0){
   return response.status(400).json({error: 'Repositorie Not found.'});
 }
 repositories[indexRepository].likes++;
 return response.json(repositories[indexRepository]);

});

module.exports = app;
