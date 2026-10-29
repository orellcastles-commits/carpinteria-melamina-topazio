/**
 * ==========================================================================
 * PROYECTO: Carpintería en Melamina Topazio
 * ESTUDIANTE: Franco Choque Orellana
 * MATERIA: Sistemas Informáticos (Módulo 2)
 * ARCHIVO: agents/agenteCotizador.js
 * DESCRIPCIÓN: Captura los 9 datos requeridos (Fecha, Usuario, Tipo Proyecto,
 *              Alto, Largo, Ancho, Acabado, Profundidad y Precio) y los
 *              sincroniza en la base de datos de Google Sheets.
 * ==========================================================================
 */

// URL exacta de tu Google Apps Script desplegado como Web App
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTWqfjcntjg1mA869o4rvSlQTrUvqntB36X9t-A0jYT8SoUIR0UtbTahOJUagq2Yuz/exec";

/**
 * Envía los 9 parámetros a Google Sheets vía fetch (GET en modo no-cors).
 */
function guardarCotizacionEnBD(datos) {
  // Construcción de parámetros con codificación segura
  const params = new URLSearchParams({
    fecha: datos.fecha,
    usuario: datos.usuario,
    cliente: datos.usuario, // Retrocompatibilidad
    tipoProyecto: datos.tipoProyecto,
    mueble: datos.tipoProyecto, // Retrocompatibilidad
    acabado: datos.acabado,
    alto: datos.alto,
    largo: datos.largo,
    ancho: datos.ancho,
    profundidad: datos.profundidad,
    precio: datos.precio
  });

  const urlCompleta = `${SCRIPT_URL}?${params.toString()}`;

  // Mostrar mensaje de envío en la interfaz
  const syncStatus = document.getElementById("dbSyncStatus");
  if (syncStatus) {
    syncStatus.style.display = "inline-flex";
    syncStatus.textContent = "⏳ Registrando en Google Sheets...";
  }

  fetch(urlCompleta, {
    method: "GET",
    mode: "no-cors"
  })
  .then(() => {
    console.log("¡Cotización enviada a Google Sheets exitosamente!", datos);
    if (syncStatus) {
      syncStatus.textContent = "✅ Cotización exitosa";
      setTimeout(() => {
        if (syncStatus) syncStatus.style.display = "none";
      }, 5000);
    }
  })
  .catch((error) => {
    console.error("Error al registrar en Google Sheets:", error);
    if (syncStatus) {
      syncStatus.textContent = "⚠️ No se pudo conectar con Sheets.";
    }
  });
}

/**
 * Extrae todos los datos del formulario interactivo y dispara el registro.
 */
function recolectarYGuardarCotizacion() {
  // 1. Fecha y Hora local (formato Bolivia)
  const ahora = new Date();
  const fechaStr = ahora.toLocaleString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  // 2. Nombre del Usuario / Cliente
  const inputCliente = document.getElementById("clientName") ||
                       document.getElementById("cliente") ||
                       document.getElementById("contactName");
  const usuario = (inputCliente && inputCliente.value.trim()) ? inputCliente.value.trim() : "Cliente Web Topazio";

  // 3. Tipo de Proyecto
  const selectMueble = document.getElementById("furnitureType") || document.getElementById("mueble");
  let tipoProyecto = "Mueble a Medida";
  if (selectMueble && selectMueble.selectedIndex >= 0 && selectMueble.options[selectMueble.selectedIndex]) {
    tipoProyecto = selectMueble.options[selectMueble.selectedIndex].text.trim();
  }

  // 4. Acabado de la Melamina
  const selectAcabado = document.getElementById("melamineFinish");
  let acabado = "Blanco Estándar";
  if (selectAcabado && selectAcabado.selectedIndex >= 0 && selectAcabado.options[selectAcabado.selectedIndex]) {
    acabado = selectAcabado.options[selectAcabado.selectedIndex].text.trim();
  }

  // 5. Alto (cm)
  const inputAlto = document.getElementById("dimAlto") || document.getElementById("dimHeight");
  const alto = (inputAlto && inputAlto.value) ? inputAlto.value : "75";

  // 6. Largo (cm)
  const inputLargo = document.getElementById("dimLargo");
  const largo = (inputLargo && inputLargo.value) ? inputLargo.value : "120";

  // 7. Ancho (cm)
  const inputAncho = document.getElementById("dimAncho") || document.getElementById("dimWidth");
  const ancho = (inputAncho && inputAncho.value) ? inputAncho.value : "60";

  // 8. Profundidad (cm)
  const inputProfundidad = document.getElementById("dimProfundidad") || document.getElementById("dimDepth");
  const profundidad = (inputProfundidad && inputProfundidad.value) ? inputProfundidad.value : "50";

  // 9. Precio Total (Bs.)
  const elemPrecio = document.getElementById("totalPrice") || document.getElementById("precioTotal");
  let precio = "0";
  if (elemPrecio) {
    precio = elemPrecio.innerText.replace("Bs.", "").replace(/\.00$/, "").trim();
  }

  const datosCotizacion = {
    fecha: fechaStr,
    usuario: usuario,
    tipoProyecto: tipoProyecto,
    acabado: acabado,
    alto: alto,
    largo: largo,
    ancho: ancho,
    profundidad: profundidad,
    precio: precio
  };

  guardarCotizacionEnBD(datosCotizacion);
}

document.addEventListener("DOMContentLoaded", () => {
  // Escuchar clic en el botón de calcular presupuesto
  const btnCalculate = document.getElementById("btnCalculate");
  if (btnCalculate) {
    btnCalculate.addEventListener("click", () => {
      // Breve retardo para que main.js termine de calcular el precio total en el DOM
      setTimeout(recolectarYGuardarCotizacion, 100);
    });
  }

  // También escuchar cuando se hace clic en "Enviar Cotización por WhatsApp"
  const btnWhatsAppQuote = document.getElementById("btnWhatsAppQuote");
  if (btnWhatsAppQuote) {
    btnWhatsAppQuote.addEventListener("click", () => {
      recolectarYGuardarCotizacion();
    });
  }
});
