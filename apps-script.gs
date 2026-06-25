/**
 * BACKEND DE CAFETERÍA SEMA (GOOGLE APPS SCRIPT)
 * 
 * Instrucciones:
 * 1. Crea un Google Sheet.
 * 2. Nombra la primera hoja como "Pedidos" y la segunda como "Productos".
 *    En "Productos", añade encabezados (Fila 1): id | nombre | precio | categoria | imagen
 *    En "Pedidos", añade encabezados (Fila 1): id | fecha | estudiante | correo | grado | producto | cantidad | estado
 * 3. Ve a Extensiones > Apps Script y pega todo este código.
 * 4. Guarda y pulsa "Implementar" > "Nueva Implementación".
 * 5. Selecciona "Aplicación web". Ejecutar como "Yo" y Acceso "Cualquier persona".
 * 6. Copia la URL que te da al final y pégala en App.jsx.
 */

// Nombre de las hojas
const HOJA_PEDIDOS = "Pedidos";
const HOJA_PRODUCTOS = "Productos";

/**
 * Función que maneja las peticiones GET (Cuando el frontend pide datos)
 */
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'productos') {
    return retornarDatosComoJSON(HOJA_PRODUCTOS);
  } else if (action === 'pedidos') {
    return retornarDatosComoJSON(HOJA_PEDIDOS);
  } else {
    // Si no se especifica acción, retorna ambos
    var productos = leerHoja(HOJA_PRODUCTOS);
    var pedidos = leerHoja(HOJA_PEDIDOS);
    
    return ContentService.createTextOutput(JSON.stringify({
      productos: productos,
      pedidos: pedidos
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función que maneja las peticiones POST (Cuando el frontend actualiza un pedido)
 */
function doPost(e) {
  try {
    // Los datos vienen en e.postData.contents
    var body = JSON.parse(e.postData.contents);
    
    if (body.action === 'updateEstado') {
      var resultado = actualizarEstado(body.id, body.nuevoEstado);
      return ContentService.createTextOutput(JSON.stringify({ success: resultado })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (body.action === 'nuevoPedido') {
      // Opcional: Si decides hacer el POST de nuevo pedido desde React en vez de Google Forms
      var resultado = crearPedido(body);
      return ContentService.createTextOutput(JSON.stringify(resultado)).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: "Acción no reconocida" })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Lee todos los datos de una hoja y los convierte en un Array de Objetos JSON
 */
function leerHoja(nombreHoja) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombreHoja);
  if (!sheet) return [];
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Solo encabezados o vacía
  
  var headers = data[0];
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    result.push(obj);
  }
  
  return result;
}

function retornarDatosComoJSON(nombreHoja) {
  var data = leerHoja(nombreHoja);
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Actualiza el estado de un pedido y envía correo si está "listo"
 */
function actualizarEstado(id, nuevoEstado) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_PEDIDOS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var colId = headers.indexOf('id');
  var colEstado = headers.indexOf('estado');
  var colCorreo = headers.indexOf('correo');
  var colEstudiante = headers.indexOf('estudiante');
  var colProducto = headers.indexOf('producto');
  
  if (colId === -1 || colEstado === -1) return false;
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][colId]) === String(id)) {
      // Actualiza la celda de estado (i + 1 porque las celdas empiezan en fila 1)
      sheet.getRange(i + 1, colEstado + 1).setValue(nuevoEstado);
      
      // Si el nuevo estado es "listo", enviar correo
      if (nuevoEstado.toLowerCase() === 'listo' || nuevoEstado.toLowerCase() === 'lista') {
        var correoDestino = data[i][colCorreo];
        if (correoDestino && correoDestino.indexOf('@') !== -1) {
          enviarCorreoNotificacion(
            correoDestino, 
            data[i][colEstudiante], 
            data[i][colProducto]
          );
        }
      }
      
      return true;
    }
  }
  return false;
}

/**
 * Función para enviar correo mediante el servicio nativo de Google (Gmail/MailApp)
 */
function enviarCorreoNotificacion(correo, estudiante, producto) {
  var asunto = "¡Tu pedido está listo! ☕";
  var mensaje = "Hola " + estudiante + ",\n\n" +
                "Tu pedido de " + producto + " ya se encuentra preparado y listo para ser recogido en la cafetería.\n\n" +
                "¡Que lo disfrutes!\n" +
                "Cafetería SEMA";
                
  var htmlMensaje = "<h3>Hola " + estudiante + ",</h3>" +
                    "<p>Tu pedido de <strong>" + producto + "</strong> ya se encuentra preparado y listo para ser recogido en la cafetería.</p>" +
                    "<p>¡Que lo disfrutes!</p>" +
                    "<p><em>Cafetería SEMA</em></p>";
                    
  try {
    MailApp.sendEmail({
      to: correo,
      subject: asunto,
      body: mensaje,
      htmlBody: htmlMensaje
    });
  } catch (e) {
    // Si falla, no hacer nada para no romper el script
  }
}

/**
 * Función adicional (OPCIONAL) si el POST se hiciera por React y no Google Forms
 */
function crearPedido(body) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_PEDIDOS);
  var nuevoId = new Date().getTime();
  var fecha = new Date().toLocaleString();
  
  sheet.appendRow([
    nuevoId,
    fecha,
    body.estudiante,
    body.correo || "Sin correo",
    body.grado || "N/A",
    body.producto,
    body.cantidad || 1,
    "pendiente"
  ]);
  
  return { success: true, id: nuevoId };
}
