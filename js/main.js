/**
 * ==========================================================================
 * PROYECTO: Carpintería en Melamina Topazio
 * ESTUDIANTE: Franco Choque Orellana
 * MATERIA: Sistemas Informáticos (Módulo 2)
 * ARCHIVO: js/main.js
 * DESCRIPCIÓN: Lógica interactiva para cotizador dinámico, menú responsive y
 *              generación de presupuestos en Bolivianos (Bs.) para WhatsApp.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ------------------------------------------------------------------------
   * 0. MODO CLARO / MODO OSCURO (PERSISTENCIA EN LOCALSTORAGE)
   * ------------------------------------------------------------------------ */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const THEME_STORAGE_KEY = 'topazio_theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      // Si el tema activo es dark, mostramos el sol ☀️ para permitir volver a claro.
      // Si es light, mostramos la luna 🌙 para activar el modo oscuro.
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    if (themeToggle) {
      const isDark = theme === 'dark';
      themeToggle.setAttribute(
        'aria-label',
        isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
      );
      themeToggle.title = isDark ? 'Activar modo claro' : 'Activar modo oscuro';
    }
  }

  // Sincronizar icono con el tema ya activo en <html>
  const activeTheme = document.documentElement.getAttribute('data-theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(activeTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const targetTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(targetTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, targetTheme);
      } catch (err) {
        console.warn('No se pudo guardar la preferencia de tema:', err);
      }
    });
  }

  // Sincronizar automáticamente si el usuario cambia el tema del sistema y no hay preferencia manual
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      try {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      } catch (err) {}
    });
  }

  /* ------------------------------------------------------------------------
   * 1. NAVEGACIÓN MÓVIL (Menú Hamburguesa)
   * ------------------------------------------------------------------------ */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      navToggle.classList.toggle('open');
      mainNav.classList.toggle('active');
    });

    // Cerrar menú móvil al hacer click en cualquier enlace
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
   * 2. COTIZADOR INTERACTIVO DE MUEBLES EN MELAMINA (15mm)
   * ------------------------------------------------------------------------ */
  const calculatorForm = document.getElementById('calculatorForm');
  const furnitureType = document.getElementById('furnitureType');
  const clientNameInput = document.getElementById('clientName');
  const sheetCountInput = document.getElementById('sheetCount');
  const melamineFinish = document.getElementById('melamineFinish');
  const dimAlto = document.getElementById('dimAlto') || document.getElementById('dimHeight');
  const dimLargo = document.getElementById('dimLargo');
  const dimAncho = document.getElementById('dimAncho') || document.getElementById('dimWidth');
  const dimProfundidad = document.getElementById('dimProfundidad') || document.getElementById('dimDepth');
  const btnCalculate = document.getElementById('btnCalculate');
  const btnReset = document.getElementById('btnReset');

  // Elementos de salida en el DOM
  const totalPriceEl = document.getElementById('totalPrice');
  const specsSummaryEl = document.getElementById('specsSummary');
  const detailsListEl = document.getElementById('detailsList');
  const btnWhatsAppQuote = document.getElementById('btnWhatsAppQuote');

  // Parámetros técnicos del taller Topazio (Villa Pagador)
  const SHEET_BASE_PRICE_BOB = 290; // Precio base por placa de 1850x2750mm en 15mm
  const PHONE_WHATSAPP = '59167477699';

  const FURNITURE_DATA = {
    escritorio: { name: 'Escritorio Minimalista', baseLabor: 190, defaultSheets: 1 },
    consola: { name: 'Consola TV / Centro Multimedia', baseLabor: 290, defaultSheets: 2 },
    velador: { name: 'Velador / Mesita de Noche', baseLabor: 120, defaultSheets: 1 },
    vitrina: { name: 'Vitrina con Iluminación LED', baseLabor: 320, defaultSheets: 2 },
    librero: { name: 'Librero / Biblioteca Modular', baseLabor: 230, defaultSheets: 2 },
    zapatero: { name: 'Mueble / Estante Zapatero', baseLabor: 180, defaultSheets: 1 },
    juguetero: { name: 'Estante Infantil para Juguetes', baseLabor: 170, defaultSheets: 1 },
    condimentero: { name: 'Mueble Condimentero de Cocina', baseLabor: 130, defaultSheets: 1 },
    repisas: { name: 'Repisas Flotantes / Estantería', baseLabor: 100, defaultSheets: 1 },
    estanteria: { name: 'Estantería / Librero', baseLabor: 230, defaultSheets: 2 },
    personalizado: { name: 'Mueble Especial a Medida', baseLabor: 280, defaultSheets: 1 }
  };

  // Coeficientes por tipo de melamina de 15mm
  const FINISH_DATA = {
    blanco: { name: 'Blanco Estándar', factor: 1.0 },
    maderado: { name: 'Veta Maderada Clásica', factor: 1.15 },
    texturizado: { name: 'Gris Grafito / Texturizado', factor: 1.25 }
  };

  /**
   * Calcula el presupuesto en Bolivianos con base en las entradas del usuario.
   */
  function calculateQuote() {
    if (!furnitureType || !sheetCountInput || !melamineFinish) return;

    const selectedTypeKey = furnitureType.value;
    if (!selectedTypeKey) {
      if (totalPriceEl) totalPriceEl.textContent = 'Bs. 0.00';
      if (specsSummaryEl) specsSummaryEl.textContent = 'Por favor selecciona un tipo de mueble para ver la estimación.';
      return;
    }

    const typeInfo = FURNITURE_DATA[selectedTypeKey] || {
      name: 'Mueble Personalizado',
      baseLabor: 200,
      defaultSheets: 1
    };

    // Validar cantidad de placas de 15mm
    let sheets = parseInt(sheetCountInput.value, 10);
    if (isNaN(sheets) || sheets < 1) {
      sheets = 1;
      sheetCountInput.value = '1';
    }

    // Acabado de la placa
    const finishKey = melamineFinish.value || 'blanco';
    const finishInfo = FINISH_DATA[finishKey] || { name: 'Blanco Estándar', factor: 1.0 };

    // Costo de placas (1850x2750x15mm)
    const costPerSheet = SHEET_BASE_PRICE_BOB * finishInfo.factor;
    const totalSheetsCost = sheets * costPerSheet;

    // Mano de obra, corte optimizado y armado
    const laborCost = typeInfo.baseLabor + (sheets > 1 ? (sheets - 1) * 70 : 0);

    // Adicionales seleccionados
    const extrasCheckboxes = document.querySelectorAll('input[name="extras"]:checked');
    let extrasTotal = 0;
    const selectedExtrasList = [];

    extrasCheckboxes.forEach((checkbox) => {
      const cost = parseFloat(checkbox.getAttribute('data-cost')) || 0;
      extrasTotal += cost;
      const labelText = checkbox.closest('label')?.querySelector('span')?.textContent || checkbox.value;
      selectedExtrasList.push(labelText.trim());
    });

    // Total general en Bolivianos
    const grandTotal = Math.round(totalSheetsCost + laborCost + extrasTotal);

    // Dimensiones referenciales
    const alto = dimAlto ? dimAlto.value : '75';
    const largo = dimLargo ? dimLargo.value : '120';
    const ancho = dimAncho ? dimAncho.value : '60';
    const profundidad = dimProfundidad ? dimProfundidad.value : '50';

    // 1. Actualizar precio en DOM con formato monetario
    if (totalPriceEl) {
      totalPriceEl.textContent = `Bs. ${grandTotal.toLocaleString('es-BO')}.00`;
    }

    // 2. Actualizar resumen de especificaciones
    if (specsSummaryEl) {
      const sheetWord = sheets === 1 ? 'placa' : 'placas';
      specsSummaryEl.textContent = `${typeInfo.name} • ${sheets} ${sheetWord} de melamina 15mm (${finishInfo.name}) • Alto: ${alto}cm | Largo: ${largo}cm | Ancho: ${ancho}cm | Prof: ${profundidad}cm.`;
    }

    // 3. Actualizar lista de desglose en DOM
    if (detailsListEl) {
      detailsListEl.innerHTML = `
        <li><strong>Placas (1850×2750×15mm):</strong> ${sheets} unidad(es) de ${finishInfo.name} (~Bs. ${Math.round(totalSheetsCost)})</li>
        <li><strong>Medidas del proyecto:</strong> Alto: ${alto} cm | Largo: ${largo} cm | Ancho: ${ancho} cm | Profundidad: ${profundidad} cm</li>
        <li><strong>Corte, despiece y ensamble:</strong> Optimización técnica de material (~Bs. ${Math.round(laborCost)})</li>
        <li><strong>Adicionales técnicos:</strong> ${selectedExtrasList.length > 0 ? selectedExtrasList.join(', ') : 'Ninguno seleccionado'} (+Bs. ${extrasTotal})</li>
        <li><strong>Taller de fabricación:</strong> Villa Pagador (Cochabamba)</li>
      `;
    }

    // 4. Actualizar enlace dinámico de WhatsApp
    if (btnWhatsAppQuote) {
      const extrasText = selectedExtrasList.length > 0 ? selectedExtrasList.join('; ') : 'Estándar';
      const nombreCliente = (clientNameInput && clientNameInput.value.trim()) || 'Cliente';
      const msg = [
        `Hola Carpintería Topazio! Mi nombre es ${nombreCliente}.`,
        `Quiero cotizar este proyecto a medida:`,
        `- Proyecto: ${typeInfo.name}`,
        `- Placas de 15mm: ${sheets} placa(s) (1850x2750mm)`,
        `- Acabado: ${finishInfo.name}`,
        `- Medidas: Alto: ${alto}cm | Largo: ${largo}cm | Ancho: ${ancho}cm | Prof: ${profundidad}cm`,
        `- Adicionales: ${extrasText}`,
        `- Total Estimado: Bs. ${grandTotal}.00`,
        `¿Podrían confirmarme la disponibilidad en su taller de Villa Pagador?`
      ].join('\n');

      const encodedMsg = encodeURIComponent(msg);
      btnWhatsAppQuote.href = `https://wa.me/${PHONE_WHATSAPP}?text=${encodedMsg}`;
    }
  }

  // Escuchar cambios en los inputs para cálculo en tiempo real
  if (calculatorForm) {
    calculatorForm.addEventListener('input', calculateQuote);
    calculatorForm.addEventListener('change', calculateQuote);

    // Evitar recarga al pulsar submit o enter
    calculatorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      calculateQuote();
    });
  }

  // Cambio inteligente de cantidad recomendada de placas al cambiar tipo de mueble
  if (furnitureType) {
    furnitureType.addEventListener('change', () => {
      const key = furnitureType.value;
      if (FURNITURE_DATA[key] && sheetCountInput) {
        sheetCountInput.value = String(FURNITURE_DATA[key].defaultSheets);
      }
      calculateQuote();
    });
  }

  // Botón manual de cálculo
  if (btnCalculate) {
    btnCalculate.addEventListener('click', (e) => {
      e.preventDefault();
      calculateQuote();
    });
  }

  // Botón de reseteo
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      setTimeout(() => {
        if (totalPriceEl) totalPriceEl.textContent = 'Bs. 0.00';
        if (specsSummaryEl) specsSummaryEl.textContent = 'Selecciona las opciones del formulario para ver el desglose estimado.';
        if (detailsListEl) {
          detailsListEl.innerHTML = `
            <li>Espesor garantizado: Placas de 15 mm</li>
            <li>Dimensiones de placa base: 1850 × 2750 mm</li>
            <li>Incluye optimización técnica de corte y armado</li>
          `;
        }
        if (btnWhatsAppQuote) {
          btnWhatsAppQuote.href = `https://wa.me/${PHONE_WHATSAPP}?text=Hola%20Topazio,%20quisiera%20solicitar%20un%20presupuesto`;
        }
      }, 50);
    });
  }

  /* ------------------------------------------------------------------------
   * 3. VINCULACIÓN DE BOTONES DEL CATÁLOGO AL COTIZADOR
   * ------------------------------------------------------------------------ */
  const catalogQuoteButtons = document.querySelectorAll('.project-card a[href="#cotizador"]');
  catalogQuoteButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.project-card');
      const title = card ? card.querySelector('.project-title')?.textContent.toLowerCase() : '';

      if (title.includes('escritorio') && furnitureType) {
        furnitureType.value = 'escritorio';
        if (sheetCountInput) sheetCountInput.value = '1';
      } else if ((title.includes('consola') || title.includes('tv')) && furnitureType) {
        furnitureType.value = 'consola';
        if (sheetCountInput) sheetCountInput.value = '2';
      } else if ((title.includes('velador') || title.includes('mesita')) && furnitureType) {
        furnitureType.value = 'velador';
        if (sheetCountInput) sheetCountInput.value = '1';
      } else if (title.includes('vitrina') && furnitureType) {
        furnitureType.value = 'vitrina';
        if (sheetCountInput) sheetCountInput.value = '2';
        const ledCheck = document.getElementById('addIluminacion');
        if (ledCheck) ledCheck.checked = true;
      } else if (title.includes('librero') && furnitureType) {
        furnitureType.value = 'librero';
        if (sheetCountInput) sheetCountInput.value = '2';
      } else if (title.includes('zapatero') && furnitureType) {
        furnitureType.value = 'zapatero';
        if (sheetCountInput) sheetCountInput.value = '1';
      } else if (title.includes('juguete') && furnitureType) {
        furnitureType.value = 'juguetero';
        if (sheetCountInput) sheetCountInput.value = '1';
      } else if (title.includes('condimentero') && furnitureType) {
        furnitureType.value = 'condimentero';
        if (sheetCountInput) sheetCountInput.value = '1';
      } else if ((title.includes('repisa') || title.includes('estantería') || title.includes('estanteria')) && furnitureType) {
        furnitureType.value = 'repisas';
        if (sheetCountInput) sheetCountInput.value = '1';
      }

      calculateQuote();
    });
  });

  /* ------------------------------------------------------------------------
   * 4. FORMULARIO DE CONTACTO RÁPIDO
   * ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contactName')?.value.trim();
      const phone = document.getElementById('contactPhone')?.value.trim();
      const message = document.getElementById('contactMessage')?.value.trim();

      if (!name || !phone || !message) {
        contactStatus.textContent = 'Por favor completa todos los campos requeridos.';
        contactStatus.style.color = '#c62828';
        contactStatus.style.display = 'block';
        return;
      }

      // Generar enlace directo a WhatsApp con los datos del mensaje
      const text = `Hola Carpintería Topazio! Mi nombre es ${name} (Tel: ${phone}). Mensaje: ${message}`;
      const waUrl = `https://wa.me/${PHONE_WHATSAPP}?text=${encodeURIComponent(text)}`;

      contactStatus.textContent = '¡Gracias por comunicarte! Redirigiendo a WhatsApp con tu consulta...';
      contactStatus.style.color = 'var(--color-success)';
      contactStatus.style.display = 'block';

      // Abrir WhatsApp en nueva pestaña
      setTimeout(() => {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 700);

      contactForm.reset();
    });
  }

  // Inicializar cálculo inicial con valores por defecto si hay selección
  calculateQuote();
});
