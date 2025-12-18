// --- 1. ESTADO DEL CARRITO ---
let carrito = JSON.parse(localStorage.getItem("casaMoraga_carrito")) || [];
let total = 0;

// --- 2. INICIALIZACIÓN MAESTRA ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("Casa Moraga: Sistema cargado.");
    
    // Inicializar visualmente el carrito al cargar
    actualizarCarritoUI();

    // CONECTAR EL BUSCADOR
    const buscadorInput = document.getElementById('buscador');
    if (buscadorInput) {
        buscadorInput.addEventListener('input', (e) => {
            const termino = e.target.value.toLowerCase().trim();
            ejecutarBusqueda(termino);
        });
    }
});

// --- 3. FUNCIÓN DE BÚSQUEDA INTELIGENTE ---
// --- 3. FUNCIÓN DE BÚSQUEDA INTELIGENTE ---
function ejecutarBusqueda(termino) {
    const productos = document.querySelectorAll('.producto');
    const seccionProductos = document.getElementById('productos');
    let encontrados = 0;

    // 1. Scroll automático al escribir (DESACTIVADO: Por eso el //)
    // Se comenta para evitar que la pantalla salte y te deje escribir tranquilo
    /* if (termino.length > 1 && seccionProductos) {
        seccionProductos.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    */

    // 2. Palabras que vamos a omitir
    const palabrasGenericas = ["queso", "quesos", "de", "con", "la", "el", "un", "una", "del"];
    
    // 3. Limpiar el término y filtrar palabras vacías
    const palabrasClave = termino.toLowerCase().split(" ").filter(palabra => 
        !palabrasGenericas.includes(palabra) && palabra.length > 0
    );

    // 4. LÓGICA DE FILTRADO (Lo que faltaba para que busque de verdad)
    productos.forEach(producto => {
        // Obtenemos el texto del producto (título y descripción)
        const textoProducto = producto.textContent.toLowerCase();
        
        // Si no hay palabras clave (buscador vacío), mostramos todo
        if (palabrasClave.length === 0) {
            producto.style.display = 'block';
            encontrados++;
            return;
        }

        // Comprobamos si el producto contiene alguna de las palabras clave
        const coincide = palabrasClave.some(palabra => textoProducto.includes(palabra));

        if (coincide) {
            producto.style.display = 'block';
            encontrados++;
        } else {
            producto.style.display = 'none';
        }
    });

    // 5. MENSAJE DE RESULTADOS NO ENCONTRADOS
    let mensajeNoResultados = document.getElementById('sin-resultados');
    if (encontrados === 0 && termino !== "") {
        if (!mensajeNoResultados) {
            mensajeNoResultados = document.createElement('div');
            mensajeNoResultados.id = 'sin-resultados';
            mensajeNoResultados.innerHTML = `<p style="text-align:center; padding:40px; width:100%; color:#5a4a42;">
                No encontramos productos que coincidan con "${termino}"</p>`;
            if (seccionProductos) seccionProductos.appendChild(mensajeNoResultados);
        }
    } else if (mensajeNoResultados) {
        mensajeNoResultados.remove();
    }
}

    productos.forEach(producto => {
        const titulo = producto.querySelector('h3')?.innerText.toLowerCase() || "";
        const descripcion = producto.querySelector('.especificacion')?.innerText.toLowerCase() || "";
        const textoCombinado = titulo + " " + descripcion;

        // LÓGICA INTELIGENTE:
        // A. Si el buscador está vacío, mostrar todo.
        // B. Si el usuario escribió "queso" (que filtramos y dejó la lista vacía), mostrar todo.
        // C. Si hay palabras específicas (como "azul"), filtrar por ellas.
        
        if (termino === "" || (palabrasClave.length === 0 && termino.includes("queso"))) {
            producto.style.display = "block";
            encontrados++;
        } else {
            const coincide = palabrasClave.some(p => textoCombinado.includes(p));
            if (coincide) {
                producto.style.display = "block";
                encontrados++;
            } else {
                producto.style.display = "none";
            }
        }
    });

    gestionarMensajeNoResultados(encontrados, termino);
}

// --- 4. CARRITO Y SIDEBAR ---
function agregarAlCarrito(nombre, precio) {
    const productoExistente = carrito.find(p => p.nombre === nombre);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ nombre, precio: parseFloat(precio), cantidad: 1 });
    }
    actualizarCarritoUI();
    
    // Abrir automáticamente al agregar
    const sidebar = document.getElementById('carrito-lateral');
    if (sidebar && !sidebar.classList.contains('abierto')) toggleCarrito();
}

function actualizarCarritoUI() {
    const listaSidebar = document.getElementById("lista-carrito-sidebar");
    const totalSidebar = document.getElementById("total-sidebar");
    const contadorFlotante = document.getElementById("cart-count");

    if (!listaSidebar) return;

    listaSidebar.innerHTML = "";
    total = 0;

    carrito.forEach((producto, index) => {
        total += producto.precio * producto.cantidad;
        const item = document.createElement("div");
        item.className = "item-carrito-lateral";
        item.innerHTML = `
            <div class="item-info">
                <strong>${producto.nombre}</strong>
                <span>$${(producto.precio * producto.cantidad).toLocaleString('es-CL')}</span>
            </div>
            <div class="cantidad-controles">
                <button onclick="cambiarCantidad(${index}, -1)">−</button>
                <span>${producto.cantidad}</span>
                <button onclick="cambiarCantidad(${index}, 1)">+</button>
            </div>
        `;
        listaSidebar.appendChild(item);
    });

    if (totalSidebar) totalSidebar.textContent = `$${total.toLocaleString('es-CL')}`;
    if (contadorFlotante) contadorFlotante.textContent = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    
    localStorage.setItem("casaMoraga_carrito", JSON.stringify(carrito));
}

function cambiarCantidad(index, cambio) {
    if (!carrito[index]) return;
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    actualizarCarritoUI();
}

function toggleCarrito() {
    document.getElementById('carrito-lateral')?.classList.toggle('abierto');
    document.getElementById('overlay')?.classList.toggle('activo');
}

// --- 5. FILTROS Y MENSAJES ---
function filtrar(categoria) {
    const productos = document.querySelectorAll('.producto');
    productos.forEach(prod => {
        const cat = prod.getAttribute('data-categoria');
        prod.style.display = (categoria === 'todos' || cat === categoria) ? 'block' : 'none';
    });
}

function gestionarMensajeNoResultados(cantidad, termino) {
    const contenedor = document.querySelector('.productos');
    let mensaje = document.getElementById('sin-resultados');
    
    if (cantidad === 0 && termino !== "") {
        if (!mensaje) {
            mensaje = document.createElement('div');
            mensaje.id = "sin-resultados";
            mensaje.style.gridColumn = "1 / -1";
            mensaje.style.textAlign = "center";
            mensaje.style.padding = "40px";
            mensaje.innerHTML = `<p style="color:#8b5e3c; font-style:italic;">No encontramos resultados exactos para "${termino}". <br> <small>Pruebe con palabras simples como "Azul" o "Brie".</small></p>`;
            contenedor.appendChild(mensaje);
        }
    } else if (mensaje) {
        mensaje.remove();
    }
}
function finalizarCompra() {
    if (carrito.length === 0) {
        alert("Tu selección está vacía.");
        return;
    }
    // Guardamos el carrito y el total para usarlos en la página de pago
    localStorage.setItem("casaMoraga_total", total);
    // Redirigir a la página de datos de envío y pago
    window.location.href = "checkout.html";
}