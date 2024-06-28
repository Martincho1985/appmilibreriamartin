const URL = "https://martincho85.pythonanywhere.com/"
        // Al subir al servidor, deberá utilizarse la siguiente ruta. USUARIO debe ser reemplazado por el nombre de usuario de Pythonanywhere //const URL = "https://USUARIO.pythonanywhere.com/"
        
        // Realizamos la solicitud GET al servidor para obtener todos los productos. 
        fetch(URL + 'articulos') 
        .then(function (response) { 
            if (response.ok) {
                //Si la respuesta es exitosa (response.ok), convierte el cuerpo de la respuesta de formato JSON a un objeto JavaScript y pasa estos datos a la siguiente promesa then. 
                return response.json(); 
            } else { 
                // Si hubo un error, lanzar explícitamente una excepción para ser "catcheada" más adelante 
                throw new Error('Error al obtener los Articulos de Librería.'); 
                } 
            }) 
            
            //Esta función maneja los datos convertidos del JSON. 
            .then(function (data) {
                let tablaArticulos = document.getElementById('tablaArticulos'); 
                //Selecciona el elemento del DOM donde se mostrarán los productos. 
                
                // Iteramos sobre cada producto y agregamos filas a la tabla 
                for (let articulo of data) {
                    let fila = document.createElement('tr'); //Crea una nueva fila de tabla (<tr>) para cada producto. 
                        fila.innerHTML = '<td align="center">' + articulo.codigo + '</td>' +
                            '<td>' + articulo.articulo + '</td>' +  
                            '<td class="padding-descripcion">' + articulo.descripcion + '</td>' + 
                            '<td align="center">' + articulo.cantidad + '</td>' + 
                            '<td align="center">' + articulo.precio + '</td>' + 
                            // Mostrar miniatura de la imagen 100px x 100px con class="img-articulo" 
                            '<td><img src=https://www.pythonanywhere.com/user/martincho85/files/home/martincho85/mysite/static/img/' + articulo.imagen_url +' alt="Imagen del Artículo de Librería" class="img-articulo"></td>' +
                            '<td align="center">' + articulo.fecha_registro + '</td>' +
                            '<td align="center">' + articulo.proveedor + '</td>'; 
                            
                            //Al subir al servidor, deberá utilizarse la siguiente ruta. USUARIO debe ser reemplazado por el nombre de usuario de Pythonanywhere 
                            
                            //'<td><img src=https://www.pythonanywhere.com/user/martincho85/files/home/USUARIO/mysite/static/img/' + producto.imagen_url +' alt="Imagen del producto" style="width: 100px;"></td>' + '<td align="right">' + producto.proveedor + '</td>';
                            
                            //Una vez que se crea la fila con el contenido del producto, se agrega a la tabla utilizando el método appendChild del elemento tablaProductos. 
                            tablaArticulos.appendChild(fila); 
                        } 
                    }) 
                    
                    //Captura y maneja errores, mostrando una alerta en caso de error al obtener los productos. 
                    .catch(function (error) { 
                        // Utilizamos SweetAlert para mostrar el mensaje de error
                        Swal.fire({
                            icon: 'error',
                            title: '¡Error!',
                            text: 'Error al obtener los Artículos de Librería.',
                        });
                    }) 