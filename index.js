const http = require('http');
const fs = require('fs');

const PORT = 3000;
//http://localhost:3000/

const serveStaticFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function(err, data) {
      if(err) reject(err);
      resolve(data);
    });
  });
} 

const sendResponse = (response, content, contentType) => {
  response.writeHead(200, {"Content-Type": contentType});
  response.end(content);
}

const handleRequest = async (request, response) => {
  const url = request.url;
  console.log(request.method);
  
  if(request.method === "GET"){
    let content;
    let contentType;
    switch(url){
      case "/":
      case "/index.html":
        content = await serveStaticFile("www/index.html");
        contentType = "text/html";
        break;
      case "/script.js":
        content = await serveStaticFile("www/script.js");
        contentType = "text/javascript";
        break;
      case "/style.css":
        content = await serveStaticFile("www/style.css");
        contentType = "text/css";
        break;
      //Se añade este case para contemplar solicitud al json
      case "/tasks/get":
        content = await serveStaticFile("tasks.json");
        contentType = "application/json";
        break;
      default: 
        content = "Ruta no v&aacutelida\r\n";
        contentType = "text/html";
      }
     sendResponse(response, content, contentType);
    }
    //Por si se pretende modificar el json
    else if (request.method === 'POST') {
      //Creamos un mensaje (vacío) que rellenamos con el contenido
      let msg = '';
      request.on('data', (chunk) => {
        msg += chunk.toString();
      });
      request.on('end', () => {
        try {
          let data = JSON.parse(msg);
          //Escribimos el json
          fs.writeFile('./tasks.json', JSON.stringify(data), (err) => {
            if (err) {
              //Si hay un error se notifica
              console.error(err);
              response.writeHead(200, {'Content-Type': 'text/plain'});
              response.write('Error al escribir en el JSON');
            } else {
              response.writeHead(200, {'Content-Type': 'text/plain'});
              response.write('Datos escritos correctamente en el JSON');
            }
            response.end();
          });
        } catch (err) {
          //Imprimimpos el error y notificamos del mismo
          console.error(err);
          response.writeHead(400, {'Content-Type': 'text/plain'});
          response.write('Error al analizar el cuerpo de la solicitud');
          response.end();
        }
      });
    }
   else{
    //En otro caso, no es GET ni POST asi que no lo permitimos
     response.writeHead(405, {"Content-Type": "text/html"});
     response.write(`M&eacutetodo ${request.method} no permitido!\r\n`);
  }
}
const server = http.createServer(handleRequest);
server.listen(PORT);