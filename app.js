/* app.js — Lógica completa del sistema */

/* -------------------- LOCAL STORAGE -------------------- */
const DB = {
    get(key) { return JSON.parse(localStorage.getItem(key)) || []; },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

/* ---------------------- CATÁLOGO ------------------------ */
const catalogoInicial = [
    { id: 'p1', nombre: 'Baño completo', precio: 40, tipo: 'servicio', imagen: 'imagenes/peluqueria.jpg' },
    { id: 'p2', nombre: 'Corte estándar', precio: 70, tipo: 'servicio', imagen: 'imagenes/peluqueria.jpg' },
    { id: 'p3', nombre: 'Juguete peluche', precio: 25, tipo: 'producto', imagen: 'imagenes/juguete.jpg' },
    { id: 'p4', nombre: 'Comida 1kg', precio: 55, tipo: 'producto', imagen: 'imagenes/comida.jpg' }
];

if (!localStorage.getItem('catalogo')) {
    DB.set('catalogo', catalogoInicial);
}

/* Estado */
let usuarioConectado = null;
let carrito = DB.get('carrito') || [];

/* ---------------------- LOGIN --------------------------- */
document.getElementById('btnLogin').addEventListener('click', () => {
    const user = loginUser.value.trim();
    const pass = loginPass.value.trim();

    if (user === 'admin' && pass === '1234') {
        iniciarSesion(user);
    } else {
        loginError.style.display = 'block';
        setTimeout(() => loginError.style.display = 'none', 2000);
    }
});

function iniciarSesion(user) {
    usuarioConectado = user;

    loginView.classList.add('oculto');
    appMain.classList.remove('oculto');

    usuarioActual.textContent = "Usuario: " + user;

    mostrarModulo('registro');
    cargarTodo();
}

/* Cerrar sesión */
btnLogout.addEventListener('click', () => {
    appMain.classList.add('oculto');
    loginView.classList.remove('oculto');
});

/* ------------------ NAVEGACIÓN -------------------------- */
document.querySelectorAll('.navBtn').forEach(btn => {
    btn.addEventListener('click', () => mostrarModulo(btn.dataset.module));
});

function mostrarModulo(id) {
    document.querySelectorAll('section.panel').forEach(s => s.classList.add('oculto'));
    document.getElementById(id).classList.remove('oculto');
}

/* ----------------- REGISTRO ----------------------------- */
document.getElementById('guardarDueno').addEventListener('click', () => {
    const nombre = duenoNombre.value.trim();
    const tel = duenoTelefono.value.trim();
    const correo = duenoCorreo.value.trim();

    if (!nombre || !tel || !correo) { alert("Completa todo"); return; }

    let duenos = DB.get('duenos');
    duenos.push({ id: 'd' + Date.now(), nombre, tel, correo });
    DB.set('duenos', duenos);

    duenoNombre.value = ''; duenoTelefono.value = ''; duenoCorreo.value = '';
    renderDuenos();
    llenarSelects();
});

document.getElementById('guardarMascota').addEventListener('click', () => {
    const nombre = mascNombre.value.trim();
    const especie = mascEspecie.value.trim();
    const raza = mascRaza.value.trim();
    const dueno = mascDuenoSelect.value;

    if (!nombre || !especie || !raza || !dueno) { alert("Completa todo"); return; }

    let mascotas = DB.get('mascotas');
    mascotas.push({ id: 'm' + Date.now(), nombre, especie, raza, dueno });
    DB.set('mascotas', mascotas);

    mascNombre.value = ''; mascEspecie.value = ''; mascRaza.value = '';
    renderMascotas();
    llenarSelects();
});

/* Mostrar dueños */
function renderDuenos() {
    let lista = listaDuenos;
    lista.innerHTML = '';
    let duenos = DB.get('duenos');

    if (duenos.length === 0) {
        lista.innerHTML = '<li>No hay dueños</li>';
        return;
    }

    duenos.forEach(d => {
        let li = document.createElement('li');
        li.textContent = `${d.nombre} — ${d.tel} — ${d.correo}`;
        lista.appendChild(li);
    });
}

/* Mostrar mascotas */
function renderMascotas() {
    let lista = listaMascotas;
    lista.innerHTML = '';
    let mascotas = DB.get('mascotas');
    let duenos = DB.get('duenos');

    if (mascotas.length === 0) {
        lista.innerHTML = '<li>No hay mascotas</li>';
        return;
    }

    mascotas.forEach(m => {
        let dueño = duenos.find(d => d.id === m.dueno);
        let li = document.createElement('li');
        li.textContent = `${m.nombre} — ${m.especie} — ${m.raza} — Dueño: ${dueño ? dueño.nombre : "N/A"}`;
        lista.appendChild(li);
    });
}

/* Selects */
function llenarSelects() {
    /* Dueños */
    mascDuenoSelect.innerHTML = '';
    let duenos = DB.get('duenos');
    duenos.forEach(d => {
        let op = document.createElement('option');
        op.value = d.id;
        op.textContent = d.nombre;
        mascDuenoSelect.appendChild(op);
    });

    /* Mascotas para agenda */
    agMascotaSelect.innerHTML = '';
    let mascotas = DB.get('mascotas');
    mascotas.forEach(m => {
        let op = document.createElement('option');
        op.value = m.id;
        op.textContent = m.nombre;
        agMascotaSelect.appendChild(op);
    });

    /* Servicios */
    agServicioSelect.innerHTML = '';
    let cat = DB.get('catalogo').filter(x => x.tipo === 'servicio');
    cat.forEach(s => {
        let op = document.createElement('option');
        op.value = s.id;
        op.textContent = s.nombre + " (Bs. " + s.precio + ")";
        agServicioSelect.appendChild(op);
    });
}

/* ------------------- AGENDA ------------------------------ */
btnAgregarAgenda.addEventListener('click', () => {
    const fecha = agFecha.value;
    const hora = agHora.value;
    const mascota = agMascotaSelect.value;
    const servicio = agServicioSelect.value;

    if (!fecha || !hora || !mascota || !servicio) {
        alert("Completa todo");
        return;
    }

    let agenda = DB.get('agenda');
    agenda.push({
        id: 'a' + Date.now(),
        fecha, hora, mascota, servicio
    });
    DB.set('agenda', agenda);

    agFecha.value = ''; agHora.value = '';
    renderAgenda();
});

/* Mostrar agenda */
function renderAgenda() {
    listaAgenda.innerHTML = '';
    let agenda = DB.get('agenda');
    let mascotas = DB.get('mascotas');
    let catalogo = DB.get('catalogo');

    if (agenda.length === 0) {
        listaAgenda.innerHTML = '<li>No hay turnos</li>';
        return;
    }

    agenda.forEach(a => {
        let m = mascotas.find(x => x.id === a.mascota);
        let s = catalogo.find(x => x.id === a.servicio);

        let li = document.createElement('li');
        li.textContent = `${a.fecha} ${a.hora} — ${m ? m.nombre : "Mascota"} — ${s ? s.nombre : "Servicio"}`;
        listaAgenda.appendChild(li);
    });
}

/* ------------------ CATÁLOGO ------------------------------ */
function renderCatalogo() {
    catalogoItems.innerHTML = '';
    let catalogo = DB.get('catalogo');

    catalogo.forEach(item => {
        let div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
      <img src="${item.imagen}" class="imgItem">
      <div>
        <h4>${item.nombre}</h4>
        <div class="precio">Bs. ${item.precio.toFixed(2)}</div>
      </div>
      <button class="btn small" data-id="${item.id}">Comprar</button>
    `;
        catalogoItems.appendChild(div);
    });

    /* Botones de comprar */
    catalogoItems.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => agregarAlCarrito(btn.dataset.id));
    });
}

/* ------------------ CARRITO ------------------------------ */
function agregarAlCarrito(id) {
    let catalogo = DB.get('catalogo');
    let item = catalogo.find(x => x.id === id);

    let existe = carrito.find(x => x.id === id);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ id: item.id, nombre: item.nombre, precio: item.precio, cantidad: 1 });
    }

    DB.set('carrito', carrito);
    renderCarrito();
}

function renderCarrito() {
    carrito = DB.get('carrito');
    carritoLista.innerHTML = '';

    if (carrito.length === 0) {
        carritoLista.innerHTML = '<li>Carrito vacío</li>';
        subtotal.textContent = "Bs. 0.00";
        total.textContent = "Bs. 0.00";
        return;
    }

    carrito.forEach((c, i) => {
        let li = document.createElement('li');
        li.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${c.nombre}</strong><br>
          Bs. ${c.precio} x ${c.cantidad}
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn small" data-i="${i}" data-a="menos">-</button>
          <button class="btn small" data-i="${i}" data-a="mas">+</button>
          <button class="btn small" data-i="${i}" data-a="del">X</button>
        </div>
      </div>
    `;
        carritoLista.appendChild(li);
    });

    /* Eventos de botones */
    carritoLista.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => {
            let i = b.dataset.i;
            let a = b.dataset.a;

            if (a === 'mas') carrito[i].cantidad++;
            if (a === 'menos') carrito[i].cantidad = Math.max(1, carrito[i].cantidad - 1);
            if (a === 'del') carrito.splice(i, 1);

            DB.set('carrito', carrito);
            renderCarrito();
        });
    });

    /* Totales */
    let sub = carrito.reduce((s, x) => s + x.precio * x.cantidad, 0);
    subtotal.textContent = "Bs. " + sub.toFixed(2);
    total.textContent = "Bs. " + sub.toFixed(2);
}

vaciarCarrito.addEventListener('click', () => {
    carrito = [];
    DB.set('carrito', carrito);
    renderCarrito();
});

/* ------------------ INICIAL ------------------------------ */
function cargarTodo() {
    renderDuenos();
    renderMascotas();
    renderAgenda();
    renderCatalogo();
    renderCarrito();
}
