#--------------------------------------------------------------------
# Instalar con pip install Flask
from flask import Flask, request, jsonify

# Instalar con pip install flask-cors
from flask_cors import CORS

# Instalar con pip install mysql-connector-python
import mysql.connector

# Si es necesario, pip install Werkzeug
from werkzeug.utils import secure_filename

# No es necesario instalar, es parte del sistema standard de Python
import os
import time
#--------------------------------------------------------------------

app = Flask(__name__)
CORS(app)  # Esto habilitará CORS para todas las rutas

#--------------------------------------------------------------------

class Catalogo:
    #----------------------------------------------------------------
    # Constructor de la clase
    def __init__(self, host, user, password, database):
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password
        )
        self.cursor = self.conn.cursor()
        
        # Intentamos seleccionar la base de datos
        try:
            self.cursor.execute(f"USE {database}")
        except mysql.connector.Error as err:
            # Si la base de datos no existe, la creamos
            if err.errno == mysql.connector.errorcode.ER_BAD_DB_ERROR:
                self.cursor.execute(f"CREATE DATABASE {database}")
                self.conn.database = database
            else:
                raise err
        # Una vez que la base de datos está establecida, creamos la tabla si no existe
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS articulos (
            codigo INT AUTO_INCREMENT PRIMARY KEY,
            articulo VARCHAR (100) NOT NULL,
            descripcion VARCHAR(255) NOT NULL,
            cantidad INT NOT NULL,
            precio DECIMAL(10, 2) NOT NULL,
            imagen_url VARCHAR(255),
            fecha_registro DATE NOT NULL,
            proveedor INT(4))''')
        self.conn.commit()
        
        # Cerrar el cursor inicial y abrir uno nuevo con el parámetro dictionary=True
        self.cursor.close()
        self.cursor = self.conn.cursor(dictionary=True)

#----------------------------------------------------------------
    def agregar_articulo(self, articulo, descripcion, cantidad, precio, imagen, fecha_registro, proveedor):
        sql = "INSERT INTO articulos (articulo, descripcion, cantidad, precio, imagen_url, fecha_registro, proveedor) VALUES (%s, %s, %s, %s, %s,%s, %s)" 
        valores = (articulo, descripcion, cantidad, precio, imagen, fecha_registro, proveedor) 
        self.cursor.execute(sql, valores) 
        self.conn.commit() 
        return self.cursor.lastrowid
    
    def modificar_articulo(self, codigo, nuevo_articulo, nueva_descripcion, nueva_cantidad, nuevo_precio, nueva_imagen, nueva_fecha_registro, nuevo_proveedor): 
        sql = "UPDATE articulos SET articulo = %s, descripcion = %s, cantidad = %s, precio = %s, imagen_url = %s, fecha_registro = %s,  proveedor = %s WHERE codigo = %s" 
        valores = (nuevo_articulo, nueva_descripcion, nueva_cantidad, nuevo_precio, nueva_imagen, nueva_fecha_registro, nuevo_proveedor, codigo) 
        self.cursor.execute(sql, valores) 
        self.conn.commit() 
        return self.cursor.rowcount > 0
    
    def listar_articulos(self):
        self.cursor.execute("SELECT codigo, articulo, descripcion, cantidad, CONCAT('$', precio) AS precio, imagen_url, DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro, proveedor FROM articulos") #FORMATEO DE FECHA PARA Q SE MUESTRE SOLAMENTE DIA / MES / AÑO + CONCATENACION DEL SIGNO $$$
        articulos = self.cursor.fetchall()
        return articulos
    
    def consultar_articulo(self, codigo):
        # Consultamos un articulo a partir de su código
        self.cursor.execute(f"SELECT * FROM articulos WHERE codigo = {codigo}")
        return self.cursor.fetchone()

    def eliminar_articulo(self, codigo): 
        # Eliminamos un articulo de la tabla a partir de su código 
        self.cursor.execute(f"DELETE FROM articulos WHERE codigo = {codigo}") 
        self.conn.commit() 
        return self.cursor.rowcount > 0
    
#--------------------------------------------------------------------
# Cuerpo del programa
#--------------------------------------------------------------------
# Crear una instancia de la clase Catalogo
catalogo = Catalogo(host='martincho85.mysql.pythonanywhere-services.com', user='martincho85', password='31386297Mrlz', database='martincho85$milibreria')

#Carpeta para guardar las imagenes. 
RUTA_DESTINO = '/home/martincho85/mysite/static/img/' 

#-------------------------------------------------------------------- 
# Listar todos los articulos de libreria #-------------------------------------------------------------------- 
#La ruta Flask /articulos con el método HTTP GET está diseñada para proporcionar los detalles de todos los articulos almacenados en la base de datos. 
#El método devuelve una lista con todos los articulos en formato JSON.
@app.route("/articulos", methods=["GET"])
def listar_articulos():
    articulos = catalogo.listar_articulos()
    return jsonify(articulos)

#-------------------------------------------------------------------- 
# Mostrar un sólo articulo según su código #--------------------------------------------------------------------
# La ruta Flask /articulos/<int:codigo> con el método HTTP GET está diseñada para proporcionar los detalles de un articulo específico basado en su código. 
# El método busca en la base de datos el articulo con el código especificado y devuelve un JSON con los detalles del articulo si lo encuentra, o None si no lo encuentra.
@app.route("/articulos/<int:codigo>", methods=["GET"])
def mostrar_articulo(codigo):
    articulo = catalogo.consultar_articulo(codigo)
    if articulo:
        return jsonify(articulo), 201
    else:
        return "Artículo de Librería no encontrado", 404

#-------------------------------------------------------------------- 
# Agregar un articulo de libreria 
#--------------------------------------------------------------------
@app.route("/articulos", methods=["POST"])
#La ruta Flask `/articulos` con el método HTTP POST está diseñada para permitir la adición de un nuevo articulo a la base de datos. 
#La función agregar_articulo se asocia con esta URL y es llamada cuando se hace una solicitud POST a /articulos. 
def agregar_articulo():
    #Recojo los datos del form 
    articulo = request.form['articulo']
    descripcion = request.form['descripcion']  
    cantidad = request.form['cantidad'] 
    precio = request.form['precio'] 
    imagen = request.files['imagen'] 
    fecha_registro = request.form['fecha_registro']
    proveedor = request.form['proveedor'] 
    nombre_imagen="" 
    
    # Genero el nombre de la imagen 
    nombre_imagen = secure_filename(imagen.filename) #Chequea el nombre del archivo de la imagen, asegurándose de que sea seguro para guardar en el sistema de archivos
    nombre_base, extension = os.path.splitext(nombre_imagen) #Separa el nombre del archivo de su extensión. 
    nombre_imagen = f"{nombre_base}_{int(time.time())}{extension}" #Genera un nuevo nombre para la imagen usando un timestamp, para evitar sobreescrituras y conflictos de nombres. 
    
    nuevo_codigo = catalogo.agregar_articulo(articulo, descripcion, cantidad, precio, nombre_imagen, fecha_registro, proveedor)
    if nuevo_codigo: 
        imagen.save(os.path.join(RUTA_DESTINO, nombre_imagen))
        #Si el articulo se agrega con éxito, se devuelve una respuesta JSON con un mensaje de éxito y un código de estado HTTP 201 (Creado).    
        return jsonify({"mensaje": "Artículo de Librería agregado correctamente.", "codigo": nuevo_codigo, "imagen": nombre_imagen}), 201 
    else: #Si el articulo no se puede agregar, se devuelve una respuesta JSON con un mensaje de error y un código de estado HTTP 500 (Internal Server Error). 
        return jsonify({"mensaje": "Error al agregar el Artículo de Librería."}), 500
     
#-------------------------------------------------------------------- 
# Modificar un articulo de libreria según su código #--------------------------------------------------------------------
@app.route("/articulos/<int:codigo>", methods=["PUT"]) 
#La ruta Flask /articulos/<int:codigo> con el método HTTP PUT está diseñada para actualizar la información de un articulo existente en la base de datos, identificado por su código. 
# #La función modificar_articulo se asocia con esta URL y es invocada cuando se realiza una solicitud PUT a /articulos/ seguido de un número (el código del articulo). 
def modificar_articulo(codigo): 
    #Se recuperan los nuevos datos del formulario 
    nuevo_articulo = request.form.get("articulo") 
    nueva_descripcion = request.form.get("descripcion") 
    nueva_cantidad = request.form.get("cantidad") 
    nuevo_precio = request.form.get("precio")
    nueva_fecha_registro = request.form.get("fecha_registro")
    nuevo_proveedor = request.form.get("proveedor") 
    
    # Verifica si se proporcionó una nueva imagen 
    if 'imagen' in request.files: 
        imagen = request.files['imagen'] 
        # Procesamiento de la imagen 
        nombre_imagen = secure_filename(imagen.filename) #Chequea el nombre del archivo de la imagen, asegurándose de que sea seguro para guardar en el sistema de archivos
        nombre_base, extension = os.path.splitext(nombre_imagen) #Separa el nombre del archivo de su extensión. 
        nombre_imagen = f"{nombre_base}_{int(time.time())}{extension}" #Genera un nuevo nombre para la imagen usando un timestamp, para evitar sobreescrituras y conflictos de nombres. 
        
        # Guardar la imagen en el servidor 
        imagen.save(os.path.join(RUTA_DESTINO, nombre_imagen))
        
        # Busco el articulo guardado 
        articulo = catalogo.consultar_articulo(codigo) 
        if articulo: # Si existe el articulo... 
            imagen_vieja = articulo["imagen_url"] 
            # Armo la ruta a la imagen 
            ruta_imagen = os.path.join(RUTA_DESTINO, imagen_vieja) 
            
            # Y si existe la borro. 
            if os.path.exists(ruta_imagen): 
                os.remove(ruta_imagen) 
    else: 
        # Si no se proporciona una nueva imagen, simplemente usa la imagen existente del articulo 
        articulo = catalogo.consultar_articulo(codigo) 
        if articulo: 
            nombre_imagen = articulo["imagen_url"]
            
            
    # Se llama al método modificar_articulo pasando el codigo del articulo y los nuevos datos. 
    if catalogo.modificar_articulo(codigo, nuevo_articulo, nueva_descripcion, nueva_cantidad, nuevo_precio, nombre_imagen, nueva_fecha_registro, nuevo_proveedor): 
        
        #Si la actualización es exitosa, se devuelve una respuesta JSON con un mensaje de éxito y un código de estado HTTP 200 (OK). 
        return jsonify({"mensaje": "Artículo de Librería modificado"}), 200 
    else:
        #Si el articulo no se encuentra (por ejemplo, si no hay ningún articulo con el código dado), se devuelve un mensaje de error con un código de estado HTTP 404 (No Encontrado). 
        return jsonify({"mensaje": "Artículo de Librería no encontrado"}), 403 

#-------------------------------------------------------------------- 
# Eliminar un articulo de libreria según su código #--------------------------------------------------------------------
@app.route("/articulos/<int:codigo>", methods=["DELETE"]) 
#La ruta Flask /articulos/<int:codigo> con el método HTTP DELETE está diseñada para eliminar un articulo específico de la base de datos, utilizando su código como identificador. 
#La función eliminar_articulo se asocia con esta URL y es llamada cuando se realiza una solicitud DELETE a /articulos/ seguido de un número (el código del articulo). 
def eliminar_articulo(codigo): 
    # Busco el articulo en la base de datos 
    articulo = catalogo.consultar_articulo(codigo) 
    if articulo: # Si el articulo existe, verifica si hay una imagen asociada en el servidor. 
        imagen_vieja = articulo["imagen_url"] 
        # Armo la ruta a la imagen 
        ruta_imagen = os.path.join(RUTA_DESTINO, imagen_vieja) 
        
        # Y si existe, la elimina del sistema de archivos. 
        if os.path.exists(ruta_imagen): 
            os.remove(ruta_imagen) 
            
        # Luego, elimina el articulo del catálogo 
        if catalogo.eliminar_articulo(codigo):
            #Si el articulo se elimina correctamente, se devuelve una respuesta JSON con un mensaje de éxito y un código de estado HTTP 200 (OK). 
            return jsonify({"mensaje": "Artículo de Librería eliminado"}), 200 
        else: 
            #Si ocurre un error durante la eliminación (por ejemplo, si el articulo no se puede eliminar de la base de datos por alguna razón), se devuelve un mensaje de error con un código de estado HTTP 500 (Error Interno del Servidor). 
            return jsonify({"mensaje": "Error al eliminar el Artículo de Librería"}), 500 
    else: 
        #Si el articulo no se encuentra (por ejemplo, si no existe un articulo con el codigo proporcionado), se devuelve un mensaje de error con un código de estado HTTP 404 (No Encontrado). 
        return jsonify({"mensaje": "Artículo de Librería no encontrado"}), 404
    
#-------------------------------------------------------------------- 
if __name__ == "__main__":
    app.run(debug=True)
