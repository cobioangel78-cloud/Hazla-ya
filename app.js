// ==================================================
// HAZLA YA
// APP.JS
// ==================================================


// ==================================================
// ELEMENTOS HTML
// ==================================================

const newTaskBtn = document.getElementById("newTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const saveTaskBtn = document.getElementById("saveTaskBtn");

const taskName = document.getElementById("taskName");
const taskDescription = document.getElementById("taskDescription");
const taskTime = document.getElementById("taskTime");
const reminderInterval = document.getElementById("reminderInterval");
const requiresEvidence = document.getElementById("requiresEvidence");

const taskList = document.getElementById("taskList");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const currentStreak =
    document.getElementById("currentStreak");

const bestStreak =
    document.getElementById("bestStreak");

const completionRate =
    document.getElementById("completionRate");

const evidenceInput = document.getElementById("evidenceInput");


// ==================================================
// VARIABLES
// ==================================================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let evidenceTaskId = null;


// ==================================================
// ABRIR VENTANA NUEVA TAREA
// ==================================================

newTaskBtn.addEventListener("click", () => {

    pedirPermisoNotificaciones();

    taskModal.classList.add("active");

});


// ==================================================
// CERRAR VENTANA
// ==================================================

closeModal.addEventListener("click", () => {

    taskModal.classList.remove("active");

});


// CERRAR TOCANDO FUERA
// ==================================================

taskModal.addEventListener("click", (e) => {

    if (e.target === taskModal) {

        taskModal.classList.remove("active");

    }

});


// ==================================================
// CREAR TAREA
// ==================================================

saveTaskBtn.addEventListener("click", () => {

    const name = taskName.value.trim();


    if (!name) {

        alert("Escribe qué tarea tienes que hacer 😭");

        return;

    }


    const task = {

        id: Date.now(),

        name: name,

        description: taskDescription.value.trim(),

        time: taskTime.value,

        interval: Number(reminderInterval.value),

        evidence: requiresEvidence.checked,

        completed: false,

        evidenceImage: null,

        createdAt: new Date().toISOString()

    };


    tasks.push(task);


    saveTasks();

    renderTasks();

    clearForm();


    taskModal.classList.remove("active");


    alert("✅ Tarea creada.");

});


// ==================================================
// GUARDAR TAREAS
// ==================================================

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


// ==================================================
// LIMPIAR FORMULARIO
// ==================================================

function clearForm() {

    taskName.value = "";

    taskDescription.value = "";

    taskTime.value = "";

    reminderInterval.value = "15";

    requiresEvidence.checked = true;

}


// ==================================================
// MOSTRAR TAREAS
// ==================================================

function renderTasks() {

    const pending = tasks.filter(
        task => !task.completed
    );

    const completed = tasks.filter(
        task => task.completed
    );


    pendingCount.textContent = pending.length;

    completedCount.textContent = completed.length;
    actualizarEstadisticas();


    // No hay tareas

    if (tasks.length === 0) {

        taskList.innerHTML = `

            <div class="empty">

                <div>📖</div>

                <p>No tienes tareas pendientes</p>

                <small>
                    Agrega una y deja de procrastinar 💀
                </small>

            </div>

        `;

        return;

    }


    taskList.innerHTML = "";


    tasks.forEach(task => {

        const card = document.createElement("div");


        const tareaVencida =
    !task.completed &&
    task.time &&
    horaYaPaso(task.time);

card.className =
    "task" +
    (task.completed ? " completed" : "") +
    (tareaVencida ? " urgent" : "");

        const timeText =
            task.time
            ? `⏰ ${task.time}`
            : "⏰ Sin horario";


        const evidenceText =
            task.evidence
            ? "📸 Evidencia"
            : "✅ Sin evidencia";


        let evidenceButton = "";


        // ==========================================
        // BOTÓN DE EVIDENCIA
        // ==========================================

        if (task.completed && task.evidenceImage) {

            evidenceButton = `

                <button
                    class="save"
                    onclick="viewEvidence(${task.id})"
                >

                    🖼️ Ver evidencia

                </button>

            `;

        }


        card.innerHTML = `

            <h3>
                ${escapeHTML(task.name)}
            </h3>


            <p>

                ${
                    task.description
                    ? escapeHTML(task.description)
                    : "Sin descripción"
                }

            </p>

${
    tareaVencida
    ? `
        <div class="urgent-badge">
            🚨 HAZLA YA
        </div>

      <div class="urgent-time">
    ⏱️ Lleva pendiente desde las ${task.time}
</div>

<div class="late-time" id="late-${task.id}">
    ⏱️ Calculando retraso...
</div>
    `
    : ""
}
            <div class="task-info">

                <span class="badge">
                    ${timeText}
                </span>


                <span class="badge">
                    🔔 Cada ${task.interval} min
                </span>


                <span class="badge">
                    ${evidenceText}
                </span>

            </div>


            <br>


            ${
                task.completed

                ?

                `

                    ${evidenceButton}


                    <button
                        class="save"
                        onclick="deleteTask(${task.id})"
                    >

                        🗑️ Eliminar

                    </button>

                `

                :

                `

                    <button
                        class="save"
                        onclick="completeTask(${task.id})"
                    >

                        ${
                            task.evidence
                            ? "📸 Completar con evidencia"
                            : "✅ Marcar como hecha"
                        }

                    </button>

                `
            }

        `;


        taskList.appendChild(card);

    });

}


// ==================================================
// COMPLETAR TAREA
// ==================================================

function completeTask(id) {

    const task = tasks.find(
        task => task.id === id
    );


    if (!task) {

        alert("No encontré la tarea 😭");

        return;

    }


    // ==========================================
    // SI NECESITA EVIDENCIA
    // ==========================================

    if (task.evidence) {

        evidenceTaskId = id;


        // Limpiar selección anterior

        evidenceInput.value = "";


        // Abrir selector/cámara

        evidenceInput.click();


        return;

    }


    // ==========================================
    // SI NO NECESITA EVIDENCIA
    // ==========================================

    task.completed = true;

task.completedAt =
    new Date().toISOString();


    saveTasks();

    renderTasks();


    // Reiniciar contador de notificaciones

    localStorage.removeItem(
        `notification_${task.id}`
    );


    alert("✅ Tarea completada.");

}


// ==================================================
// RECIBIR EVIDENCIA
// ==================================================

evidenceInput.addEventListener("change", (event) => {

    const file = event.target.files[0];


    if (!file) {

        alert("No se seleccionó ninguna imagen.");

        return;

    }


    const task = tasks.find(
        task => task.id === evidenceTaskId
    );


    if (!task) {

        alert("No encontré la tarea 😭");

        return;

    }


    // ==========================================
    // COMPRIMIR Y GUARDAR FOTO
    // ==========================================

    compressImage(file)

        .then(image => {

            task.evidenceImage = image;

            task.completed = true;

task.completedAt =
    new Date().toISOString();


            saveTasks();

            renderTasks();


            // Reiniciar contador de notificaciones

            localStorage.removeItem(
                `notification_${task.id}`
            );


            evidenceTaskId = null;


            alert(
                "✅ Evidencia guardada. Tarea completada."
            );

        })


        .catch(error => {

            console.error(error);


            alert(
                "❌ No pude guardar la evidencia."
            );

        });

});


// ==================================================
// COMPRIMIR IMAGEN
// ==================================================

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();


        reader.onload = (event) => {

            const img = new Image();


            img.onload = () => {

                const canvas =
                    document.createElement("canvas");


                const maxWidth = 1000;


                let width = img.width;

                let height = img.height;


                // Reducir tamaño

                if (width > maxWidth) {

                    height =
                        height *
                        (maxWidth / width);

                    width = maxWidth;

                }


                canvas.width = width;

                canvas.height = height;


                const ctx =
                    canvas.getContext("2d");


                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );


                const compressed =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.7
                    );


                resolve(compressed);

            };


            img.onerror = () => {

                reject(
                    new Error(
                        "No se pudo cargar la imagen."
                    )
                );

            };


            img.src = event.target.result;

        };


        reader.onerror = () => {

            reject(
                new Error(
                    "No se pudo leer el archivo."
                )
            );

        };


        reader.readAsDataURL(file);

    });

}


// ==================================================
// VER EVIDENCIA
// ==================================================

function viewEvidence(id) {

    const task = tasks.find(
        task => task.id === id
    );


    if (!task || !task.evidenceImage) {

        alert("Esta tarea no tiene evidencia.");

        return;

    }


    // Abrir la imagen

    const newWindow = window.open();


    if (newWindow) {

        newWindow.document.write(`

            <html>

                <head>

                    <title>Evidencia</title>

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1"
                    >

                    <style>

                        body {

                            margin: 0;

                            background: #000;

                            display: flex;

                            align-items: center;

                            justify-content: center;

                            min-height: 100vh;

                        }

                        img {

                            max-width: 100%;

                            max-height: 100vh;

                            object-fit: contain;

                        }

                    </style>

                </head>


                <body>

                    <img
                        src="${task.evidenceImage}"
                    >

                </body>

            </html>

        `);

        newWindow.document.close();

    }

}


// ==================================================
// ELIMINAR TAREA
// ==================================================

function deleteTask(id) {

    tasks = tasks.filter(
        task => task.id !== id
    );


    // También eliminar contador

    localStorage.removeItem(
        `notification_${id}`
    );


    saveTasks();

    renderTasks();

}


// ==================================================
// SEGURIDAD PARA TEXTO
// ==================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent = text;


    return div.innerHTML;

}


// ==================================================
// NOTIFICACIONES
// ==================================================

async function pedirPermisoNotificaciones() {

    if (!("Notification" in window)) {

        alert(
            "Tu navegador no permite notificaciones."
        );

        return;

    }


    // Pedir permiso

    if (Notification.permission === "default") {

        const permiso =
            await Notification.requestPermission();


        if (permiso === "granted") {

            mostrarNotificacionPrueba();

        }

        return;

    }


    // Ya permitido

    if (Notification.permission === "granted") {

        mostrarNotificacionPrueba();

        return;

    }


    // Bloqueado

    alert(
        "Las notificaciones están bloqueadas. Actívalas desde los ajustes del navegador."
    );

}


// ==================================================
// NOTIFICACIÓN DE PRUEBA
// ==================================================

function mostrarNotificacionPrueba() {

    if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {

        return;

    }


    new Notification("📚 Hazla Ya", {

        body:
            "Tienes una tarea pendiente. No te hagas wey 😭",

        icon: "icon.png"

    });

}


// ==================================================
// REVISAR TAREAS
// ==================================================

function revisarTareas() {

    if (!("Notification" in window)) {

        return;

    }


    if (Notification.permission !== "granted") {

        return;

    }


    const ahora = new Date();


    tasks.forEach(task => {

        // Ignorar tareas terminadas

        if (task.completed) {

            return;

        }


        // Ignorar tareas sin hora

        if (!task.time) {

            return;

        }


        const [hora, minutos] =
            task.time.split(":");


        const horaTarea = new Date();


        horaTarea.setHours(
            Number(hora),
            Number(minutos),
            0,
            0
        );


        // Si ya llegó la hora

        if (ahora >= horaTarea) {

            enviarRecordatorio(task);

        }

    });

}


// ==================================================
// ENVIAR RECORDATORIO
// ==================================================

function enviarRecordatorio(task) {

    const ultimaNotificacion =
        localStorage.getItem(
            `notification_${task.id}`
        );


    const ahora = Date.now();


    const intervalo =
        task.interval * 60 * 1000;


    // No mandar demasiado seguido

    if (

        ultimaNotificacion &&

        ahora -
        Number(ultimaNotificacion)
        < intervalo

    ) {

        return;

    }


    new Notification(
        "🚨 TAREA PENDIENTE",
        {

            body:
                `${task.name}\n` +
                `Llevas pendiente esta tarea. Hazla ya 😭`,

            icon: "icon.png"

        }
    );


    localStorage.setItem(

        `notification_${task.id}`,

        ahora.toString()

    );

}

// ==================================================
// SABER SI YA PASÓ LA HORA
// ==================================================

function horaYaPaso(hora) {

    const ahora = new Date();

    const [horas, minutos] = hora.split(":");

    const horaTarea = new Date();

    horaTarea.setHours(
        Number(horas),
        Number(minutos),
        0,
        0
    );

    return ahora >= horaTarea;

}

// ==================================================
// CALCULAR TIEMPO DE RETRASO
// ==================================================

function actualizarRetrasos() {

    tasks.forEach(task => {

        if (task.completed) return;
        if (!task.time) return;

        const elemento =
            document.getElementById(`late-${task.id}`);

        if (!elemento) return;

        const [horas, minutos] =
            task.time.split(":");

        const horaTarea = new Date();

        horaTarea.setHours(
            Number(horas),
            Number(minutos),
            0,
            0
        );

        const ahora = new Date();

        const diferencia =
            ahora.getTime() -
            horaTarea.getTime();

        if (diferencia <= 0) {

            elemento.textContent =
                "⏱️ Aún no está retrasada";

            return;

        }

        const totalMinutos =
            Math.floor(
                diferencia / (1000 * 60)
            );

        const horasTarde =
            Math.floor(totalMinutos / 60);

        const minutosTarde =
            totalMinutos % 60;


        if (horasTarde > 0) {

            elemento.textContent =
                `⏱️ ${horasTarde} h ${minutosTarde} min tarde`;

        } else {

            elemento.textContent =
                `⏱️ ${minutosTarde} min tarde`;

        }

    });

}

// ==================================================
// ESTADÍSTICAS
// ==================================================

function actualizarEstadisticas() {

    const total = tasks.length;

    const completadas =
        tasks.filter(
            task => task.completed
        ).length;


    // ==========================================
    // PORCENTAJE
    // ==========================================

    let porcentaje = 0;

    if (total > 0) {

        porcentaje =
            Math.round(
                (completadas / total) * 100
            );

    }


    completionRate.textContent =
        `${porcentaje}%`;


    // ==========================================
    // DÍAS EN LOS QUE COMPLETÓ TAREAS
    // ==========================================

    const dias = new Set();


    tasks.forEach(task => {

        if (
            task.completed &&
            task.completedAt
        ) {

            const fecha =
                new Date(task.completedAt)
                .toISOString()
                .split("T")[0];

            dias.add(fecha);

        }

    });


    const fechas =
        Array.from(dias)
        .sort();


    // ==========================================
    // CALCULAR RACHA ACTUAL
    // ==========================================

    let rachaActual = 0;

    const hoy = new Date();


    while (true) {

        const fecha =
            new Date(hoy);

        fecha.setDate(
            hoy.getDate() - rachaActual
        );


        const fechaTexto =
            fecha
            .toISOString()
            .split("T")[0];


        if (dias.has(fechaTexto)) {

            rachaActual++;

        } else {

            break;

        }

    }


    // ==========================================
    // MEJOR RACHA
    // ==========================================

    let mejorRacha = 0;

    let racha = 0;


    for (let i = 0; i < fechas.length; i++) {

        if (i === 0) {

            racha = 1;

        } else {

            const anterior =
                new Date(fechas[i - 1]);

            const actual =
                new Date(fechas[i]);


            const diferencia =
                (
                    actual - anterior
                ) /
                (1000 * 60 * 60 * 24);


            if (diferencia === 1) {

                racha++;

            } else {

                racha = 1;

            }

        }


        if (racha > mejorRacha) {

            mejorRacha = racha;

        }

    }


    currentStreak.textContent =
        `${rachaActual} días`;


    bestStreak.textContent =
        `${mejorRacha} días`;

}

// ==================================================
// INICIAR APP
// ==================================================

renderTasks();


// Revisar inmediatamente

revisarTareas();


// Revisar cada minuto mientras la página está abierta

setInterval(() => {

    revisarTareas();

    actualizarRetrasos();

}, 60 * 1000);