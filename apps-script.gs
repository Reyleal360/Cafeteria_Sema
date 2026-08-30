/**
 * BACKEND DE CAFETERÍA SEMA (GOOGLE APPS SCRIPT) - VERSIÓN INTELIGENTE
 * 
 * Esta versión se adapta AUTOMÁTICAMENTE a la hoja de respuestas que genera Google Forms
 * (no importa si la pestaña se llama "Respuestas de formulario 1", "Form_Responses" o "Pedidos",
 * ni si los encabezados son "Marca temporal", "Nombre del estudiante", "Correo Electronico", etc.).
 */

function doGet(e) {
  var action = e ? e.parameter.action : null;
  
  if (action === 'productos') {
    return ContentService.createTextOutput(JSON.stringify(leerProductos())).setMimeType(ContentService.MimeType.JSON);
  } else {
    // Por defecto devuelve pedidos
    return ContentService.createTextOutput(JSON.stringify(leerPedidos())).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    
    if (body.action === 'updateEstado') {
      var resultado = actualizarEstado(body.id, body.nuevoEstado);
      return ContentService.createTextOutput(JSON.stringify({ success: resultado })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (body.action === 'nuevoPedido') {
      var resultado = crearPedido(body);
      return ContentService.createTextOutput(JSON.stringify(resultado)).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: "Acción no reconocida" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene automáticamente la hoja donde Google Forms guarda las respuestas
 */
function obtenerHojaPedidos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Pedidos") || 
              ss.getSheetByName("Respuestas de formulario 1") || 
              ss.getSheetByName("Form_Responses") || 
              ss.getSheets()[0];
  return sheet;
}

/**
 * Busca el índice de una columna por varios nombres posibles
 */
function findHeaderIndex(headers, possibleNames) {
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i]).toLowerCase().trim();
    for (var j = 0; j < possibleNames.length; j++) {
      var target = possibleNames[j].toLowerCase();
      if (h === target || h.indexOf(target) !== -1) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Lee y mapea los pedidos de la hoja de Google Forms
 */
function leerPedidos() {
  var sheet = obtenerHojaPedidos();
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var rawHeaders = data[0];

  var idxMarcaTemporal = findHeaderIndex(rawHeaders, ['id', 'marca temporal', 'timestamp', 'fecha']);
  var idxEstudiante = findHeaderIndex(rawHeaders, ['estudiante', 'nombre del estudiante', 'nombre']);
  var idxGrado = findHeaderIndex(rawHeaders, ['grado', 'curso']);
  var idxProducto = findHeaderIndex(rawHeaders, ['producto', 'productos']);
  var idxCantidad = findHeaderIndex(rawHeaders, ['cantidad']);
  var idxCorreo = findHeaderIndex(rawHeaders, ['correo', 'correo electronico', 'email', 'correo electrónico']);
  var idxEstado = findHeaderIndex(rawHeaders, ['estado']);

  // Si no existe la columna de estado, la creamos en la hoja
  if (idxEstado === -1) {
    sheet.getRange(1, rawHeaders.length + 1).setValue("estado");
    idxEstado = rawHeaders.length;
    rawHeaders.push("estado");
  }

  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    
    // Ignorar filas completamente vacías
    var hasContent = row.some(function(cell) { return cell !== "" && cell !== null; });
    if (!hasContent) continue;

    var timestampVal = idxMarcaTemporal !== -1 ? row[idxMarcaTemporal] : "";
    var idRow = timestampVal ? (new Date(timestampVal).getTime() || (i + 1)) : (i + 1);
    var estadoVal = (idxEstado !== -1 && row[idxEstado]) ? String(row[idxEstado]).trim() : "pendiente";

    result.push({
      id: idRow,
      fecha: timestampVal ? String(timestampVal) : new Date().toLocaleString(),
      estudiante: idxEstudiante !== -1 && row[idxEstudiante] ? String(row[idxEstudiante]) : "Estudiante",
      grado: idxGrado !== -1 && row[idxGrado] ? String(row[idxGrado]) : "N/A",
      producto: idxProducto !== -1 && row[idxProducto] ? String(row[idxProducto]) : "Pedido",
      cantidad: idxCantidad !== -1 && row[idxCantidad] ? row[idxCantidad] : 1,
      correo: idxCorreo !== -1 && row[idxCorreo] ? String(row[idxCorreo]) : "",
      estado: estadoVal || "pendiente"
    });
  }

  return result;
}

function leerProductos() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Productos");
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
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

/**
 * Actualiza el estado de un pedido en la hoja y envía correo si está "listo"
 */
function actualizarEstado(id, nuevoEstado) {
  var sheet = obtenerHojaPedidos();
  if (!sheet) return false;

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return false;

  var rawHeaders = data[0];

  var idxMarcaTemporal = findHeaderIndex(rawHeaders, ['id', 'marca temporal', 'timestamp', 'fecha']);
  var idxEstudiante = findHeaderIndex(rawHeaders, ['estudiante', 'nombre del estudiante', 'nombre']);
  var idxProducto = findHeaderIndex(rawHeaders, ['producto', 'productos']);
  var idxCorreo = findHeaderIndex(rawHeaders, ['correo', 'correo electronico', 'email', 'correo electrónico']);
  var idxEstado = findHeaderIndex(rawHeaders, ['estado']);

  if (idxEstado === -1) {
    sheet.getRange(1, rawHeaders.length + 1).setValue("estado");
    idxEstado = rawHeaders.length;
  }

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var timestampVal = idxMarcaTemporal !== -1 ? row[idxMarcaTemporal] : "";
    var rowId = timestampVal ? (new Date(timestampVal).getTime() || (i + 1)) : (i + 1);

    if (String(rowId) === String(id) || String(i + 1) === String(id)) {
      // Actualiza la celda correspondiente al estado
      sheet.getRange(i + 1, idxEstado + 1).setValue(nuevoEstado);

      // Si el nuevo estado es "listo", enviar correo
      if (nuevoEstado.toLowerCase() === 'listo' || nuevoEstado.toLowerCase() === 'lista') {
        var correoDestino = idxCorreo !== -1 ? row[idxCorreo] : "";
        var nomEstudiante = idxEstudiante !== -1 ? row[idxEstudiante] : "Estudiante";
        var nomProducto = idxProducto !== -1 ? row[idxProducto] : "Pedido";

        if (correoDestino && String(correoDestino).indexOf('@') !== -1) {
          enviarCorreoNotificacion(correoDestino, nomEstudiante, nomProducto);
        }
      }
      return true;
    }
  }
  return false;
}

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
    // Si falla la notificación por correo, ignorar para no romper el script
  }
}

function crearPedido(body) {
  var sheet = obtenerHojaPedidos();
  var nuevoId = new Date().getTime();
  var fecha = new Date().toLocaleString();
  
  sheet.appendRow([
    fecha,
    body.estudiante,
    body.grado || "N/A",
    body.producto,
    body.cantidad || 1,
    body.correo || "",
    "pendiente"
  ]);
  
  return { success: true, id: nuevoId };
}

