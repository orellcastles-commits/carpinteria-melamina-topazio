/**
 * ==========================================================================
 * PROYECTO: Carpintería en Melamina Topazio
 * ESTUDIANTE: Franco Choque Orellana
 * MATERIA: Sistemas Informáticos (Módulo 2)
 * ARCHIVO: agents/googleAppsScript.gs (Código.gs para Google Apps Script)
 * DESCRIPCIÓN: Script para recibir cotizaciones desde la web y registrarlas
 *              automáticamente en Google Sheets como base de datos.
 * ==========================================================================
 */

function doGet(e) {
  try {
    // 1. Acceder a la hoja activa de cálculo
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 2. Si la hoja está vacía, crear los 9 encabezados con formato visual
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha y Hora",
        "Usuario / Cliente",
        "Tipo de Proyecto",
        "Acabado Melamina",
        "Alto (cm)",
        "Largo (cm)",
        "Ancho (cm)",
        "Profundidad (cm)",
        "Precio Estimado (Bs.)"
      ]);

      // Formato estético a los encabezados: Fondo marrón café (#3E2723), texto blanco y negrita
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#3E2723");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // 3. Capturar parámetros enviados por la URL (GET)
    var p = (e && e.parameter) ? e.parameter : {};

    // Zona horaria de Bolivia (America/La_Paz) para fecha y hora exacta
    var fechaActual = Utilities.formatDate(new Date(), "America/La_Paz", "dd/MM/yyyy HH:mm:ss");
    var fecha = p.fecha || fechaActual;
    var usuario = p.usuario || p.cliente || "Cliente Web Topazio";
    var tipoProyecto = p.tipoProyecto || p.mueble || "Mueble a Medida";
    var acabado = p.acabado || "Blanco Estándar";
    var alto = p.alto || "-";
    var largo = p.largo || "-";
    var ancho = p.ancho || "-";
    var profundidad = p.profundidad || "-";
    var precio = p.precio || "0";

    // 4. Agregar la nueva fila con los datos completos
    sheet.appendRow([
      fecha,
      usuario,
      tipoProyecto,
      acabado,
      alto,
      largo,
      ancho,
      profundidad,
      precio
    ]);

    // 5. Retornar respuesta exitosa en JSON
    var respuesta = {
      status: "success",
      mensaje: "Cotización registrada con éxito en Carpintería Topazio",
      datos: {
        fecha: fecha,
        usuario: usuario,
        tipoProyecto: tipoProyecto,
        acabado: acabado,
        alto: alto,
        largo: largo,
        ancho: ancho,
        profundidad: profundidad,
        precio: precio
      }
    };

    return ContentService.createTextOutput(JSON.stringify(respuesta))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Retornar detalle del error en caso de fallo
    var errorRespuesta = {
      status: "error",
      mensaje: error.toString()
    };

    return ContentService.createTextOutput(JSON.stringify(errorRespuesta))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  // Soporte idéntico para peticiones POST si fuera necesario
  return doGet(e);
}
