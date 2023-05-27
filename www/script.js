let taskList = [];
let inter = [];
let tiempoPresionado = 0;
let intervalId;

const loadTasks = async () => {
  const response = await fetch("http://localhost:3000/tasks/get");
  const text = await response.json();
  taskList = text;
  // Llamamos a la función para mostrar la lista
  mostrarLista();
  
}

const add = () => {
    //Se añaden tareas mediante esta función
    //Especificamos los valores nuevos
    
    idNuevo = taskList.length +1;
    titleNuevo = document.getElementById("task-name").value;
    if(titleNuevo.length<1){
      //No queremos que se añadan tareas en blanco si se pulsa sin añadir nada
      return;
    }
    //Agregamos a la tasklist la que estaba escrita
    taskList.push({id: idNuevo, title: titleNuevo, done: false});
    //Eliminamos el contenido del input
    let inputElement = document.getElementById('task-name');
    inputElement.value = '';
    actualizarJson();
    mostrarLista();
        
}

const remove = (boton) => {
  //Cuando se ejecute esta función se elimina la tarea y desaparece de pantalla
  let idBoton = boton.getAttribute('id');
  taskList.splice(idBoton-1,1);
  //Es necesario recolocar todos los id
  for(i=0;i<taskList.length;++i){
    taskList[i].id = i+1;
  }
  actualizarJson();
  mostrarLista();
}

const toggleDone = (id) => {
  //Con esta función se puede cambiar "done" de una tarea
  //Salta al pulsar dos segundos o más sobre un boton

  //Cambiamos el atributo en la lista
  taskList[id-1].done = !taskList[id-1].done;
  //Llamamos a la función que cambia el contenido del JSON
  actualizarJson();
  //Mostramos la lista actualizada
  mostrarLista();
}


async function mostrarLista(){
  //Función responsable de tener actualizada la lista en pantalla
  $("#progress-bar-container").hide();
  borrarClase("tareas-lista");
  for(i=0; i<taskList.length; ++i){
    crearBoton(taskList[i].title ,taskList[i].id);
  }
  //Se asocia a cada botón que hay en pantalla el toggleDone y el remove
  asociarRemove();
  asociarToggleDone();
  //Coloreamos de verdo o rojo para ver si está completada o no
  colorearTareas();
}

function colorearTareas() {
  //'Recoloreamos' las tareas
  for (let j = 0; j < taskList.length; j++) {
    let id = taskList[j].id;
    let btn = document.getElementById(id);
    btn.style.backgroundColor = taskList[j].done ? "lightgreen" : "salmon";
  }
}

function crearBoton(nombre, id) {
  // Creamos el botón
  let boton = document.createElement("button");
  boton.textContent = nombre;
  boton.setAttribute("class", "tareas-lista");
  boton.setAttribute("id", id);

  // Agregamos el hijo
  let padre = document.getElementById('json-container');
  padre.appendChild(boton);
}

function borrarClase(clase) {
  //Función pensada para borrar todos los elementos de la clase "clase"
  const elementos = document.querySelectorAll(`.${clase}`);
  elementos.forEach(elemento => elemento.remove());
}
function asociarRemove(){
  //Con esta función establecemos los eventos que estan relacionados con borrar
  let start;
  let end;
  botonesTask = document.getElementsByClassName("tareas-lista");
  //A cada botón le asociamos su evento
  for (let i = 0; i < botonesTask.length; i++) {
    botonesTask[i].addEventListener('touchstart', function(event) {
      // Guardamos la posición inicial del dedo
      start = event.touches[0].pageX;
    });

    botonesTask[i].addEventListener('touchmove', function(event) {
        // Guardamos la posición actual del dedo
        end = event.touches[0].pageX;

        // Calculamos la cantidad de desplazamiento (donde está - donde estaba)
        const desplazamiento = end - start;

        // Actualizamos la posición del botón (pero solo a derecha, a la izquierda no quiero que se mueva)
        if(desplazamiento >0){
          botonesTask[i].style.transform = `translateX(${desplazamiento}px)`;
        }
      });

    botonesTask[i].addEventListener('touchend', function(event) {
        // Comparamos la posición inicial y final del dedo para determinar si hubo un desplazamiento horizontal
        if (start && end && (end - start) > 90) {
          // Si la diferencia de posición es mayor a 90 px, se considera que hubo un desplazamiento horizontal
          remove(botonesTask[i]);
        } else {
          // Si no hubo desplazamiento suficiente se restauran los valores de posición
          botonesTask[i].style.transform = `translateX(0px)`;
        }
        // Reseteamos las variables
        start = null;
        end = null;
    });
  }
}

function empezarContador() {
  //Esta función inicia un contador y gestiona su interacción 
  tiempoPresionado = 0; 
  //Sacamos una barra que iremos llenando conforme pasen los 2 segundos
  barra = document.getElementById("progress-bar");
  //La mostramos
  $("#progress-bar-container").show();
  //El intervalo viene cada 100 milisegundos, suma 100 hasta llegar a 2000 y va incrementando la barra
  intervalId = setInterval(() => {
    tiempoPresionado += 100;
    barra.style.width = min((tiempoPresionado/20),100)+"%"
  }, 100);
}

function min(a,b){
  return (a < b) ? a : b;
}

function detenerContador(event, id) {
  //Esta función detiene el contador, resetea el progreso de la barra y llama a toggleDone si fue suficiente
  clearInterval(intervalId);
  barra = document.getElementById("progress-bar");
  barra.style.width = "0%";
  $("#progress-bar-container").hide();
  if (tiempoPresionado >= 2000) {
    //Como se indica en el enunciado, la función se ejecuta cuando se pulsa 2 segundos o más
    toggleDone(id);
  }
  tiempoPresionado = 0; 
}

function asociarToggleDone(){
  //Esta función asocia las funciones empezarContador y detenerContador a cada boton

  botonesTask = document.getElementsByClassName("tareas-lista");
  for (let i = 0; i < botonesTask.length; i++) {
    
    botonesTask[i].addEventListener('touchstart', empezarContador);
    botonesTask[i].addEventListener('touchend', function(event) {
      try{
        detenerContador(event, botonesTask[i].id);
      }
      catch{
        //No es necesario hacer nada, el boton fue eliminado, simplemente se controla el error de consola
      }
    });
  }
}

function actualizarJson(){
  //Se envia un POST para escribir en el JSON
  fetch('http://localhost:3000/tasks/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskList)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error al enviar la solicitud POST');
    }
    return response.text();
  })
  .then(data => {
    // Todo funciona correctamente
    console.log(data); 
  })
  .catch(error => {
    console.error('Error al enviar la solicitud POST', error);
  });

}

const addButton = document.querySelector("#fab-add");
addButton.addEventListener("touchend", add);

loadTasks();
