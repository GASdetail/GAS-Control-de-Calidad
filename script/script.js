// --- 1. CONFIGURACIÓN DINÁMICA DE PREGUNTAS ---
const CHECKLIST_CONFIG = {
    pintura: [
        {id: "p1", text: "La textura del transparente es la adecuada conforme con la originalidad"},
        {id: "p2", text: "Los bordes, filos y líneas repasadas están libres de excesos"},
        {id: "p3", text: "Las líneas de las piezas repintadas son idénticas a las originales"},
        {id: "p4", text: "Superficies libres de defectos (rayas, opacamiento, manchas)"},
        {id: "p5", text: "Empaques externos libres de residuos de pintura/pulimento"},
        {id: "p6", text: "Si negativo: Revisar contra Recepción por daños preexistentes"},
        {id: "p7", text: "Corrección Total: verificar si servicios incompletos fueron corregidos"}
    ],
    armado: [
        {id: "a1", text: "Interior de piezas reparadas libre de suciedad"},
        {id: "a2", text: "Piezas móviles abren/cierran con suavidad y sin golpes"},
        {id: "a3", text: "Piezas ajustan correctamente (sin desalineaciones)"},
        {id: "a4", text: "Niveles de aceite, frenos y refrigerante adecuados"},
        {id: "a5", text: "Luces y testigos funcionan correctamente"},
        {id: "a6", text: "Molduras, parrillas y empaques limpios y sin daños"},
        {id: "a7", text: "Vidrios sin daños derivados de la reparación"},
        {id: "a8", text: "Exterior libre de suciedad de proceso (cinta, polvo)"}
    ],
    pulido: [
        {id: "pu1", text: "Sin rayas, manchas u opacamiento por pulido"},
        {id: "pu2", text: "Vidrios pulidos (sin manchas ni marcas de agua)"},
        {id: "pu3", text: "Partes negras acondicionadas"},
        {id: "pu4", text: "Manillas de puertas limpias (interior y exterior)"},
        {id: "pu5", text: "Torpedo y escobillas detallados correctamente"},
        {id: "pu6", text: "Bordes del vehículo sin residuos (polish/cera)"},
        {id: "pu7", text: "Superficies externas sin residuos de pulimento"},
        {id: "pu8", text: "Capó, guardabarros y superficies externas limpias"},
        {id: "pu9", text: "Superficies lavadas correctamente tras el proceso"},
        {id: "pu10", text: "Libre de rayas superficiales que debieron eliminarse"},
        {id: "pu11", text: "En caso negativo, corregir antes de la entrega"}
    ],
    tapiceria: [
        {id: "t1", text: "Aspirado de piso y alfombras detallado"},
        {id: "t2", text: "Tapicería aspirada y detallada correctamente"},
        {id: "t3", text: "Rejillas de ventilación limpias y detalladas"},
        {id: "t4", text: "Dash limpio y detallado"},
        {id: "t5", text: "Guarda soles limpios y detallados"},
        {id: "t6", text: "Consola central limpia y detallada"},
        {id: "t7", text: "Guantera y compartimientos limpios"},
        {id: "t8", text: "Cielo (techo) detallado y limpio"},
        {id: "t9", text: "Asientos detallados y limpios"},
        {id: "t10", text: "Empaques externos limpios y detallados"},
        {id: "t11", text: "Empaques internos limpios y detallados"},
        {id: "t12", text: "Empaque del capó limpio y detallado"},
        {id: "t13", text: "Empaque de la cajuela limpio y detallado"},
        {id: "t14", text: "Pantallas y espejos limpios"},
        {id: "t15", text: "Pedales correctamente limpios y detallados"},
        {id: "t16", text: "Cajuela aspirada y limpia"},
        {id: "t17", text: "Habitáculo/cajuela/batea limpio y detallado"}
    ],
    control: [
        {id: "m1", text: "Niveles de líquidos adecuados"},
        {id: "m2", text: "Luces y testigos funcionando"},
        {id: "m3", text: "Vehículo listo para entrega sin reportes pendientes"}
    ]
};

const STORAGE_KEY = "form-calidad-gas";

// --- 💡 OPTIMIZACIÓN: Variables Globales para Caching de Elementos DOM ---
// Se asignarán los objetos del DOM en DOMContentLoaded
let devolucionBlock, corregidoBlock, corregidoError, btnPrint, sysEjecutados;


// --- 2. RENDERIZADO DEL HTML (Inyecta los checkbox) ---
function renderChecklists() {
    document.querySelectorAll('.section[data-config-key]').forEach(section => {
        const key = section.dataset.configKey;
        const items = CHECKLIST_CONFIG[key];
        const container = section.querySelector('.checklist');
        
        if (items && container) {
            container.innerHTML = items.map(item => `
                <div class="check-item">
                    <input type="checkbox" id="${item.id}">
                    <label for="${item.id}">${item.text}</label>
                </div>
            `).join('');
        }
    });
}

// --- 3. LÓGICA DE NEGOCIO ---
function initFlatpickr() {
    // Nota: El formato 'Y-m-d' es necesario internamente para la comparación de fechas
    flatpickr(".flat-date", { 
        dateFormat: "Y-m-d", 
        altInput: true, 
        altFormat: "d/m/Y", 
        onChange: saveForm, 
        onClose: validateDates // Validar al cerrar el picker de fecha
    });
    flatpickr(".flat-time", { 
        enableTime: true, 
        noCalendar: true, 
        dateFormat: "H:i", 
        altInput: true, 
        altFormat: "h:i K", 
        onChange: saveForm,
        onClose: validateDates // Validar al cerrar el picker de hora
    });
}

function checkSection(sectionId) {
    const section = document.getElementById(sectionId);
    if(!section) return;
    const allChecks = Array.from(section.querySelectorAll('input[type="checkbox"]'));
    const contentChecks = allChecks.filter(c => !c.id.includes('admin-ok')); 
    
    const total = contentChecks.length;
    const checked = contentChecks.filter(c => c.checked).length;
    const percent = total === 0 ? 0 : (checked / total) * 100;

    const bar = section.querySelector('.section-progress-fill');
    if(bar) bar.style.width = percent + '%';

    let isComplete = false;
    if(sectionId === 'sec-sistema') {
        const adminOk = document.getElementById('admin-ok');
        isComplete = adminOk && adminOk.checked;
    } else {
        isComplete = (checked === total && total > 0);
    }

    const header = section.querySelector('.section-header');
    const indicator = section.querySelector('.status-indicator');
    if (isComplete) {
        header.classList.add('completed');
        indicator.textContent = "✔ COMPLETADO";
    } else {
        header.classList.remove('completed');
        indicator.textContent = "PENDIENTE";
    }
}

function updateAllSections() {
    ["sec-sistema", "sec-pintura", "sec-armado", "sec-pulido", "sec-tapiceria", "sec-control"].forEach(checkSection);
    handleAdminLogic();
}

// 💡 OPTIMIZADO: Usa las referencias cacheadas (devolucionBlock, corregidoBlock, sysEjecutados)
function handleAdminLogic() {
    const val = sysEjecutados.value; 
    
    if (val === "NO") {
        devolucionBlock.style.display = "block";
        corregidoBlock.style.display = "block";
    } else {
        devolucionBlock.style.display = "none";
        corregidoBlock.style.display = "none";
    }
    validateDates();
}

// 💡 OPTIMIZADO: Usa las referencias cacheadas (corregidoError, btnPrint)
function validateDates() {
    const getD = (id) => document.getElementById(id).value;
    const devDate = getD("devuelto-date") + "T" + (getD("devuelto-time") || "00:00");
    const corDate = getD("corregido-date") + "T" + (getD("corregido-time") || "00:00");
    
    // Usar las referencias cacheadas
    const err = corregidoError;
    const btn = btnPrint;
    
    if (getD("devuelto-date") && getD("corregido-date")) {
        const dateCor = new Date(corDate);
        const dateDev = new Date(devDate);

        // También valida si la fecha es inválida (ej: si se escribe mal)
        if (isNaN(dateCor) || isNaN(dateDev) || dateCor < dateDev) {
            err.classList.add("visible");
            btn.setAttribute("disabled", "true");
            // Marcar inputs visualmente
            document.getElementById("corregido-date").classList.add("input-invalid");
            return false;
        }
    }

    // Si la validación pasa o si faltan datos para comparar
    document.getElementById("corregido-date").classList.remove("input-invalid");
    err.classList.remove("visible");
    btn.removeAttribute("disabled");
    return true;
}

// --- 4. ALMACENAMIENTO (SAVE/LOAD) ---
function saveForm() {
    const data = {};
    document.querySelectorAll("input, select, textarea").forEach(el => {
        if (!el.id) return;
        data[el.id] = el.type === "checkbox" ? el.checked : el.value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    const ind = document.getElementById('save-indicator');
    ind.style.opacity = 1;
    setTimeout(() => ind.style.opacity = 0, 800);
}

function loadForm() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    for (let id in data) {
        const el = document.getElementById(id);
        if (el) {
            if (el.type === "checkbox") el.checked = data[id];
            else if (el._flatpickr) el._flatpickr.setDate(data[id]); 
            else el.value = data[id];
        }
    }
    updateAllSections();
}

function limpiarFormulario() {
    if(!confirm("¿Borrar todo el formulario? Esta acción es irreversible.")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
}

// --- 5. IMPRESIÓN ---
function generarReporte() {
    // Validar campos críticos
    const orderNum = document.getElementById('orderNum').value;
    const plate = document.getElementById('plate').value;
    if(!plate || !orderNum) {
        alert("Faltan campos obligatorios (Placa u Orden).");
        return;
    }
    if(!validateDates()) return alert("Corrija las fechas antes de imprimir.");

    // Poner fecha
    const today = new Date().toLocaleDateString('es-ES');
    document.getElementById('print-date-display').textContent = `Impreso: ${today}`;

    // Preparar visualización impresión
    document.querySelectorAll('.check-item input:checked').forEach(input => {
        input.closest('.check-item').classList.add('is-checked-print');
    });

    // Ocultar secciones vacías
    document.querySelectorAll('.section').forEach(sec => {
        const hasChecks = sec.querySelector('.is-checked-print');
        const hasObs = sec.querySelector('textarea').value.trim() !== "";
        // Sistema siempre visible si tiene datos, otros condicionales
        if(sec.id !== 'sec-sistema' && !hasChecks && !hasObs) {
            sec.classList.add('empty-print');
        }
    });

    window.print();

    // Restaurar tras impresión
    setTimeout(() => {
        document.querySelectorAll('.is-checked-print').forEach(el => el.classList.remove('is-checked-print'));
        document.querySelectorAll('.empty-print').forEach(el => el.classList.remove('empty-print'));
        document.getElementById('print-date-display').textContent = '';
    }, 500);
}

// --- 6. INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    // 💡 PASO DE OPTIMIZACIÓN: Caching de elementos DOM (se asignan a las variables globales)
    devolucionBlock = document.getElementById("devolucion-block");
    corregidoBlock = document.getElementById("corregido-block");
    corregidoError = document.getElementById("corregido-error");
    btnPrint = document.getElementById("btn-print");
    sysEjecutados = document.getElementById("sys-ejecutados");
    
    renderChecklists(); 
    initFlatpickr();    
    loadForm();         
    
    // EVENT DELEGATION (Manejo de cambios en el formulario)
    document.body.addEventListener('change', (e) => {
        if (e.target.matches('input, select, textarea')) {
            saveForm();
            
            // Si es el selector de "Ejecutados"
            if (e.target === sysEjecutados) handleAdminLogic();
            
            // Si es una fecha de admin (del cluster), validar
            if (e.target.closest('.input-cluster')) validateDates();
            
            // Actualizar barra de la sección
            const section = e.target.closest('.section');
            if (section) checkSection(section.id);
        }
    });

    // Manejar eventos de teclado en los campos de fecha/hora para forzar validación al salir
    ["devuelto-date", "devuelto-time", "corregido-date", "corregido-time"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("blur", validateDates);
    });

    // Manejar eventos de mayúsculas (se puede hacer con CSS, pero la lógica actual es válida)
    document.querySelectorAll('.uppercase-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.value = input.value.toUpperCase();
            // Mantener cursor en su posición para evitar saltos
            input.setSelectionRange(start, end); 
        });
    });

    // UX: Resaltar sección activa al enfocarse
    document.querySelectorAll('.section').forEach(sec => {
        sec.addEventListener('focusin', () => sec.classList.add('active-section'));
        sec.addEventListener('focusout', () => sec.classList.remove('active-section'));
    });
});
