// Skill: Cálculo técnico de costo de fraccionamiento de melamina
function calcularPresupuestoMelamina({ altoMm, anchoMm, cantidadPlacasFraccionadas, precioPlacaEntera = 350 }) {
    // 1. Dimensión de la placa estándar: 1850mm x 2750mm (Área: 5.0875 m²)
    const areaPlacaEnteraMm2 = 1850 * 2750; 
    const areaMuebleMm2 = altoMm * anchoMm;

    // 2. Cálculo del costo proporcional exacto según material utilizado
    const fraccionUtilizada = areaMuebleMm2 / areaPlacaEnteraMm2;
    const costoMaterialExacto = fraccionUtilizada * precioPlacaEntera;

    // 3. Tarifa de transporte fija (25 Bs.)
    const costoTransporte = 25;

    // 4. Presupuesto Total (Sin costo de corte, sin tapa tornillos, sin deslizadores)
    const costoTotal = costoMaterialExacto + costoTransporte;

    return {
        fraccionPlaca: fraccionUtilizada.toFixed(2),
        costoMaterial: costoMaterialExacto.toFixed(2),
        fleteTransporte: costoTransporte,
        totalBs: costoTotal.toFixed(2)
    };
}

module.exports = { calcularPresupuestoMelamina };
