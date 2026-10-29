# Módulo de Skills - Carpintería Topazio

## Skill: `calcularPresupuesto`
- **Descripción:** Calcula el presupuesto exacto de un mueble considerando la fracción utilizada de la placa estándar de 1850mm x 2750mm (15mm).
- **Entrada:** Dimensiones en milímetros (`altoMm`, `anchoMm`).
- **Parámetros:** Suma costo proporcional de material + 25 Bs. de transporte. Excluye cortes y tapacantos.
- **Invocación:**
  ```javascript
  const { calcularPresupuestoMelamina } = require('./calcularPresupuesto');
  calcularPresupuestoMelamina({ altoMm: 1200, anchoMm: 800 });
  