// --- 1. ESTADO DEL CARRITO ---
let carrito = JSON.parse(localStorage.getItem("casaMoraga_carrito")) || [];
let total = 0;

document.addEventListener('DOMContentLoaded', () => {
    const inputBuscador = document.getElementById('buscador');
    const botonLupa = document.querySelector('.btn-buscar'); // Usamos la clase que tienes en tu HTML

    // 1. Definimos la función que realiza la lógica de filtrado
    function ejecutarBusqueda(termino) {
        console.log("Buscando:", termino);
        
        // Buscamos todas las tarjetas de productos
        const productos = document.querySelectorAll('.product-card');
        
        productos.forEach(producto => {
            // Obtenemos el texto del nombre (h3) y la descripción (p)
            const nombre = producto.querySelector('h3').textContent.toLowerCase();
            const descripcion = producto.querySelector('p').textContent.toLowerCase();

            // Si el término está en el nombre o en la descripción, se muestra
            if (nombre.includes(termino) || descripcion.includes(termino)) {
                producto.style.display = "block";
            } else {
                producto.style.display = "none";
            }
        });
    }

    // 2. Evento para el clic en la lupa
    if (botonLupa && inputBuscador) {
        botonLupa.addEventListener('click', () => {
            const valor = inputBuscador.value.toLowerCase().trim();
            ejecutarBusqueda(valor);
        });

        // 3. Evento para la tecla Enter (Vital para celulares)
        inputBuscador.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const valor = inputBuscador.value.toLowerCase().trim();
                ejecutarBusqueda(valor);
            }
        });
    }
});

// --- 3. FUNCIÓN DE BÚSQUEDA INTELIGENTE ---
function ejecutarBusqueda(termino) {
    const productos = document.querySelectorAll('.producto');
    const seccionProductos = document.getElementById('productos');
    let encontrados = 0;

    // Palabras genéricas a ignorar
    const palabrasGenericas = ["queso", "quesos", "de", "con", "la", "el", "un", "una", "del"];
    
    // Crear array de palabras clave útiles
    const palabrasClave = termino.split(" ").filter(palabra => 
        !palabrasGenericas.includes(palabra) && palabra.length > 0
    );

    productos.forEach(producto => {
        // Obtenemos título y descripción para una búsqueda más profunda
        const titulo = producto.querySelector('h3')?.innerText.toLowerCase() || "";
        const descripcion = producto.querySelector('.especificacion')?.innerText.toLowerCase() || "";
        const textoCombinado = titulo + " " + descripcion + " " + producto.textContent.toLowerCase();

        // LÓGICA DE VISIBILIDAD
        if (termino === "" || (palabrasClave.length === 0 && termino.includes("queso"))) {
            producto.style.display = "block";
            encontrados++;
        } else {
            // Verifica si alguna palabra clave coincide con el texto del producto
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
            mensaje.innerHTML = `<p style="color:#8b5e3c; font-style:italic;">No encontramos resultados para "${termino}". <br> <small>Pruebe con palabras simples como "Azul" o "Brie".</small></p>`;
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
    localStorage.setItem("casaMoraga_total", total);
    window.location.href = "checkout.html";
}