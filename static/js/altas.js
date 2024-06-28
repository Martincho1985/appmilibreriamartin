const URL = "https://martincho85.pythonanywhere.com/"

document.getElementById('formulario').addEventListener('submit', function (event) { 
    event.preventDefault(); // Evitamos que se envie el form 
    
    var formData = new FormData(this);

    // Realizamos la solicitud POST al servidor 
    fetch(URL + 'articulos', {
        method: 'POST', 
        body: formData // Aquí enviamos formData. Dado que formData puede contener archivos, no se utiliza JSON. 
    }) 
    //Después de realizar la solicitud POST, se utiliza el método then() para manejar la respuesta del servidor. 
    .then(function (response) { 
        if (response.ok) { 
            //Si la respuesta es exitosa, convierte los datos de la respuesta a formato JSON. 
            return response.json(); 
        } else { 
            // Si hubo un error, lanzar explícitamente una excepción 
            // para ser "catcheada" más adelante 
            throw new Error('Error al agregar el Artículo de Librería.'); 
        } 
    }) 
    //Respuesta OK, muestra una alerta informando que el producto se agregó correctamente y limpia los campos del formulario para que puedan ser utilizados para un nuevo producto. 
    .then(function (data) { 
        // Utilizamos SweetAlert para mostrar el mensaje de éxito
        Swal.fire({
            icon: 'success',
            title: '¡Felicidades!',
            text: 'Artículo de Librería agregado correctamente.',
        });
    }) 
    
    // En caso de error, mostramos una alerta con un mensaje de error. 
    .catch(function (error) { 
        // Utilizamos SweetAlert para mostrar el mensaje de error
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Error al agregar el Artículo de Librería.',
        });
    }) 
    
    // Limpiar el formulario en ambos casos (éxito o error) 
    .finally(function () { 
        document.getElementById('articulo').value = "";
        document.getElementById('descripcion').value = "";  
        document.getElementById('cantidad').value = ""; 
        document.getElementById('precio').value = ""; 
        document.getElementById('imagenArticulo').value = ""; 
        document.getElementById('fecha_registro').value = ""; 
        document.getElementById('proveedorArticulo').value = ""; 
    }); 

    
});


