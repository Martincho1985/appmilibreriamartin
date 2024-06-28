const URL = "https://martincho85.pythonanywhere.com/"

// Obtiene el contenido del inventario 
    function obtenerArticulos() { 
        fetch(URL + 'articulos') // Realiza una solicitud GET al servidor y obtener la lista de productos. 
            .then(response => { 
                // Si es exitosa (response.ok), convierte los datos de la respuesta de formato JSON a un objeto JavaScript. 
                if (response.ok) { return response.json(); } 
            }) 
            // Asigna los datos de los productos obtenidos a la propiedad productos del estado. 
            .then(data => { 
                const articulosTable = document.getElementById('articulos-table').getElementsByTagName('tbody')[0];
                articulosTable.innerHTML = ''; // Limpia la tabla antes de insertar nuevos datos 
                data.forEach(articulo => { 
                    const row = articulosTable.insertRow(); 
                    row.innerHTML = ` 
                    <td align="center">${articulo.codigo}</td>
                    <td>${articulo.articulo}</td>  
                    <td class="padding-descripcion">${articulo.descripcion}</td> 
                    <td align="center">${articulo.cantidad}</td> 
                    <td align="center">${articulo.precio}</td> 
                    <td align="center"><img src="${URL}static/img/${articulo.imagen_url}" alt="Imagen del Artículo de Librería" class="img-articulo"></td>
                    <td align="center">${articulo.fecha_registro}</td> 
                    <td><button onclick="eliminarArticulo('${articulo.codigo}')">Eliminar</button></td> 
                    `; 
                }); 
            }) 
            // Captura y maneja errores, mostrando una alerta en caso de error al obtener los productos. 
            .catch(function (error) { 
                // Utilizamos SweetAlert para mostrar el mensaje de error
                Swal.fire({
                    icon: 'error',
                    title: '¡Error!',
                    text: 'Error al obtener los Artículos de Librería.',
                });
            }) 
        } 
        
        // Se utiliza para eliminar un producto. 
        // Ejemplo de función que necesita una confirmación
        function eliminarArticulo(codigo) {
            // Uso de SweetAlert para mostrar una confirmación
            Swal.fire({
                title: '¿Estás seguro de querer eliminar este artículo?',
                text: "¡No podrás revertir esto!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminarlo!',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Aquí puedes poner el código para eliminar el artículo
                    // Por ejemplo, hacer una solicitud fetch para eliminar el artículo del servidor
                    fetch(URL + 'articulos/' + codigo, {
                        method: 'DELETE'
                    }).then(response => {
                        if (response.ok) {
                            obtenerArticulos()
                            // Mostrar un mensaje de éxito
                            Swal.fire(
                                '¡Eliminado!',
                                'El artículo ha sido removido del inventario.',
                                'success'
                            );
                            // Aquí puedes poner el código para actualizar la tabla, si es necesario
                        } else {
                            throw new Error('Error al eliminar el artículo.');
                        }
                    }).catch(error => {
                        // Mostrar un mensaje de error
                        Swal.fire(
                            'Error!',
                            'Hubo un problema al eliminar el artículo.',
                            'error'
                        );
                    });
                }
            });
        }
            
        // Cuando la página se carga, llama a obtenerProductos para cargar la lista de productos. 
        document.addEventListener('DOMContentLoaded', obtenerArticulos);