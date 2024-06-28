const URL = "https://martincho85.pythonanywhere.com/"

// Variables de estado para controlar la visibilidad y los datos del formulario 
let codigo = ''; 
let articulo = '';
let descripcion = ''; 
let cantidad = ''; 
let precio = ''; 
let proveedor = ''; 
let imagen_url = '';
let fechaRegistro = ''; 
let imagenSeleccionada = null; 
let imagenUrlTemp = null; 
let mostrarDatosArticulo = false; 

document.getElementById('form-obtener-articulo').addEventListener('submit', obtenerArticulo);

document.getElementById('form-guardar-cambios').addEventListener('submit', guardarCambios); 

document.getElementById('nuevaImagen').addEventListener('change', seleccionarImagen);

// Se ejecuta cuando se envía el formulario de consulta. Realiza una solicitud GET a la API y obtiene los datos del producto correspondiente al código ingresado. 
function obtenerArticulo(event) { 
    event.preventDefault(); 
    codigo = document.getElementById('codigo').value; 
    fetch(URL + 'articulos/' + codigo) 
        .then(response => { 
            if (response.ok) {
                return response.json() 
            } else { 
                throw new Error('Error al obtener los datos del Artículo de Librería.') 
            } 
        }) 
        
        .then(data => { 
            articulo = data.articulo;
            descripcion = data.descripcion; 
            cantidad = data.cantidad; 
            precio = data.precio; 
            proveedor = data.proveedor; 
            imagen_url = data.imagen_url;
            fechaRegistro = data.fechaRegistro; 
            mostrarDatosArticulo = true; //Activa la vista del segundo formulario 
            mostrarFormulario(); 
        }) 
        .catch(function (error) { 
            // Utilizamos SweetAlert para mostrar el mensaje de error
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: '¡Lo siento! Código de Artículo de Librería NO encontrado.',
            });
        }) 
    } 
    
// Muestra el formulario con los datos del producto 
function mostrarFormulario() {
    if (mostrarDatosArticulo) { 
        document.getElementById('articuloModificar').value = articulo;
        document.getElementById('descripcionModificar').value = descripcion; 
        document.getElementById('cantidadModificar').value = cantidad; 
        document.getElementById('precioModificar').value = precio;
        document.getElementById('fechaRegistroModificar').value = fechaRegistro; 
        document.getElementById('proveModificar').value = proveedor; 

        const imagenActual = document.getElementById('imagen-actual'); 
        if (imagen_url && !imagenSeleccionada) {
            imagenActual.src = 'https://www.pythonanywhere.com/user/martincho85/files/home/martincho85/mysite/static/img/' + imagen_url;
            imagenActual.style.display = 'block';
        } else {
            imagenActual.style.display = 'none';
        } 
        document.getElementById('datos-articulo').style.display = 'block'; 
    } else { 
        document.getElementById('datos-articulo').style.display = 'none'; 
    } 
} 

// Se activa cuando el usuario selecciona una imagen para cargar. 
function seleccionarImagen(event) { 
    const file = event.target.files[0]; 
    imagenSeleccionada = file; 
    imagenUrlTemp = URL.createObjectURL(file); 

    const imagenVistaPrevia = document.getElementById('imagen-vista-previa');
    imagenVistaPrevia.src = imagenUrlTemp; 
    imagenVistaPrevia.style.display = 'block';
} 

// Se usa para enviar los datos modificados del producto al servidor. 
function guardarCambios(event) { 
    event.preventDefault(); 
    
    const formData = new FormData(); 
    formData.append('codigo', codigo); 
    formData.append('articulo', document.getElementById('articuloModificar').value);
    formData.append('descripcion', document.getElementById('descripcionModificar').value);
    formData.append('cantidad', document.getElementById('cantidadModificar').value);
    formData.append('proveedor', document.getElementById('proveModificar').value);
    formData.append('precio', document.getElementById('precioModificar').value); 
    formData.append('fecha_registro', document.getElementById('fechaRegistroModificar').value);
    
    
    if (imagenSeleccionada) { 
        formData.append('imagen', imagenSeleccionada, imagenSeleccionada.name);
    } 
    
    fetch(URL + 'articulos/' + codigo, { 
        method: 'PUT', 
        body: formData, 
    }) 
        .then(response => { 
            if (response.ok) { 
                return response.json() 
            } else { 
                throw new Error('Error al guardar los cambios del Artículo de Librería.') 
            } 
        }) 
        .then(data => { 
            Swal.fire({
                icon: 'success',
                title: '¡Felicidades!',
                text: 'Artículo de Librería actualizado correctamente.',
            }); 
            limpiarFormulario(); 
        }) 
        .catch(error => { 
            console.error('Error:', error); 
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: 'Error al actualizar el Artículo de Librería.',
            }); 
        }); 
} 
    
function limpiarFormulario() {
    document.getElementById('codigo').value = ''; 
    document.getElementById('articuloModificar').value = ''; 
    document.getElementById('descripcionModificar').value = '';
    document.getElementById('cantidadModificar').value = ''; 
    document.getElementById('precioModificar').value = ''; 
    document.getElementById('proveModificar').value = '';
    document.getElementById('fechaRegistroModificar').value = ''; 
    document.getElementById('nuevaImagen').value = ''; 
    
    const imagenActual = document.getElementById('imagen-actual'); 
    imagenActual.style.display = 'none';
    const imagenVistaPrevia = document.getElementById('imagen-vista-previa');
    imagenVistaPrevia.style.display = 'none'; 
    
    codigo = ''; 
    articulo = ''; 
    descripcion = ''; 
    cantidad = ''; 
    precio = ''; 
    proveedor = '';
    fechaRegistro = ''; 
    imagen_url = ''; 
    imagenSeleccionada = null; 
    imagenUrlTemp = null; 
    mostrarDatosArticulo = false; 
    
    document.getElementById('datos-articulo').style.display = 'none'; 
}