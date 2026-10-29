const { calcularPresupuestoMelamina } = require('../skills/calcularPresupuesto');

// Agente que coordina la recepción, cálculo y guardado de cotizaciones
async function agenteProcesarCotizacion(datosCliente) {
    console.log(`[AGENTE]: Procesando cotización para ${datosCliente.nombre}...`);

    // 1. Invocar la Skill de Cálculo
    const resultadoCalculo = calcularPresupuestoMelamina({
        altoMm: datosCliente.alto,
        anchoMm: datosCliente.ancho
    });

    // 2. Preparar los datos procesados para Google Sheets
    const registroCotizacion = {
        fecha: new Date().toISOString(),
        cliente: datosCliente.nombre,
        mueble: datosCliente.tipoMueble,
        totalEstimadoBs: resultadoCalculo.totalBs,
        fraccionMaterial: resultadoCalculo.fraccionPlaca
    };

    console.log("[AGENTE]: Cotización calculada exitosamente:", registroCotizacion);
    return registroCotizacion;
}

module.exports = { agenteProcesarCotizacion };
