/* ============================================================
   PROMPTBLUEPRINT v1.1.0 — Lógica principal
   ============================================================ */
const VERSION = '1.1.0';
const TEMA_DEFECTO = { fondo: '#1e1e24', panel: '#2a2b36', panel2: '#353647', borde: '#3f4052', texto: '#e6e6f0', textoS: '#a5a6c4', acento: '#2563eb' };

/* ---------- Estado ---------- */
const elementos = new Map();     // id -> objeto (compartido entre pestañas)
let contadorId = 1;
let contadorSeccion = 0;
let contadorPestania = 0;
let pestañas = [];               // { id, nombre, ancho, alto, fondo, raices:[], zoom }
let pestañaActiva = null;
let paleta = [];
let seleccionId = null;
let modo = 'cuadricula';
let tema = Object.assign({}, TEMA_DEFECTO);

/* ---------- Utilidades ---------- */
function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pestañaActual() {
    return pestañas.find(p => p.id === pestañaActiva) || null;
}
function raices() {
    const tab = pestañaActual();
    return tab ? tab.raices : [];
}
function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('mostrar');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('mostrar'), 2200);
}

/* ============================================================
   TEMA (colores de la interfaz)
   ============================================================ */
function aplicarTema() {
    const r = document.documentElement.style;
    r.setProperty('--fondo', tema.fondo);
    r.setProperty('--panel', tema.panel);
    r.setProperty('--panel2', tema.panel2);
    r.setProperty('--borde', tema.borde);
    r.setProperty('--texto', tema.texto);
    r.setProperty('--texto-suave', tema.textoS);
    r.setProperty('--acento', tema.acento);
}

/* ============================================================
   TRADUCCIONES
   ============================================================ */
function applyTraducciones() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.getElementById('buscar').placeholder = t('buscar');
    document.getElementById('btn-modo').textContent = modo === 'cuadricula' ? t('modoCuadricula') : t('modoLibre');
    const acc = document.getElementById('editor-acciones');
    const claves = ['eSubir', 'eBajar', 'eDesanidar', 'eDuplicar', 'eEliminar'];
    acc.querySelectorAll('.btn').forEach((b, i) => b.textContent = t(claves[i]));
    document.getElementById('btn-panel').title = t('panel');
    document.getElementById('btn-nueva-pestania').title = t('nuevaPestaniaTxt');
    document.documentElement.lang = idioma;
}

function cambiarIdioma(nuevo) {
    if (!I18N[nuevo]) return;
    idioma = nuevo;
    // Actualizar texto de los elementos recién creados no se toca (conservan su texto),
    // pero sí los rótulos de tipos por defecto que aún no se hayan personalizado.
    aplicarIdioma();
}

function aplicarIdioma() {
    applyTraducciones();
    renderPaleta();
    renderPestanas();
    renderFaq();
    if (seleccionId) sincronizarEditor();
    renderAjustes();
    const etq = document.getElementById('etiqueta-tipo');
    if (seleccionId && etq) {
        const el = elementos.get(seleccionId);
        if (el) etq.textContent = tipoLabel(el.tipo);
    }
}

/* ============================================================
   PALETA (secciones jerárquicas)
   ============================================================ */
function crearPaletaDefault() {
    return ORDEN_CATEGORIAS.map(clave => ({
        id: 'sec_' + (++contadorSeccion),
        clave,
        renombrado: false,
        nombre: catNombre(clave),
        tipos: Object.keys(TIPOS).filter(k => TIPOS[k].cat === clave),
        subs: [],
        abierto: true
    }));
}

function nombreSeccion(sec) {
    if (sec.renombrado || !sec.clave) return sec.nombre;
    return catNombre(sec.clave);
}

function renderPaleta() {
    const arbol = document.getElementById('arbol');
    const q = norm(document.getElementById('buscar').value.trim());
    arbol.innerHTML = '';
    if (q) { renderBusqueda(arbol, q); return; }
    paleta.forEach(sec => arbol.appendChild(renderSeccion(sec)));
    if (!paleta.length) arbol.innerHTML = '<div class="resultado-vacio">' + t('creaSeccion') + '</div>';
}

function renderBusqueda(arbol, q) {
    const resultados = [];
    const recorrer = (sec, ruta) => {
        const rutaActual = ruta ? ruta + ' / ' + nombreSeccion(sec) : nombreSeccion(sec);
        if (norm(nombreSeccion(sec)).includes(q)) {
            sec.tipos.forEach(tp => resultados.push({ tipo: tp, ruta: rutaActual }));
        } else {
            sec.tipos.forEach(tp => {
                if (norm(tipoLabel(tp)).includes(q)) resultados.push({ tipo: tp, ruta: rutaActual });
            });
        }
        sec.subs.forEach(s => recorrer(s, rutaActual));
    };
    paleta.forEach(s => recorrer(s, ''));
    if (!resultados.length) {
        arbol.innerHTML = '<div class="resultado-vacio">' + tFmt('sinResultados', { q: q }) + '</div>';
        return;
    }
    const cont = document.createElement('div');
    cont.className = 'seccion';
    const cab = document.createElement('div');
    cab.className = 'seccion-cabecera';
    cab.innerHTML = '<span class="flecha">▾</span><span class="nombre">' + t('resultados') + ' (' + resultados.length + ')</span>';
    cont.appendChild(cab);
    const cuerpo = document.createElement('div');
    cuerpo.className = 'seccion-cuerpo';
    resultados.forEach(r => cuerpo.appendChild(chip(r.tipo, r.ruta)));
    cont.appendChild(cuerpo);
    arbol.appendChild(cont);
}

function chip(tipo, ruta) {
    const tp = TIPOS[tipo];
    const c = document.createElement('div');
    c.className = 'elemento-chip';
    c.draggable = true;
    c.innerHTML = '<span class="emoji">' + (tp.emoji || '🧩') + '</span><span class="etq">' + tipoLabel(tipo) + '</span>' +
        (ruta ? '<span style="font-size:10px;color:var(--texto-suave);">' + esc(ruta) + '</span>' : '');
    c.title = t('arrastraParaAñadir');
    c.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', tipo);
        e.dataTransfer.effectAllowed = 'copy';
    });
    c.addEventListener('click', () => colocarTipo(tipo, null, null));
    return c;
}

function renderSeccion(sec) {
    const cont = document.createElement('div');
    cont.className = 'seccion' + (sec.abierto ? '' : ' seccion-cerrada');
    const cab = document.createElement('div');
    cab.className = 'seccion-cabecera';
    cab.innerHTML =
        '<button class="flecha" title="' + t('aExpandir') + '">▾</button>' +
        '<span class="nombre">' + esc(nombreSeccion(sec)) + '</span>' +
        '<span class="contador">' + sec.tipos.length + '</span>' +
        '<span class="seccion-acciones">' +
            '<button class="mini" title="' + t('aAddElemento') + '" onclick="event.stopPropagation();abrirPopover(this,\'' + sec.id + '\')">＋</button>' +
            '<button class="mini" title="' + t('aAddSub') + '" onclick="event.stopPropagation();nuevaSubseccion(\'' + sec.id + '\')">⤵</button>' +
            '<button class="mini" title="' + t('aRenombrar') + '" onclick="event.stopPropagation();renombrarSeccion(\'' + sec.id + '\')">✎</button>' +
            '<button class="mini" title="' + t('aSubir') + '" onclick="event.stopPropagation();moverSeccion(\'' + sec.id + '\',-1)">▲</button>' +
            '<button class="mini" title="' + t('aBajar') + '" onclick="event.stopPropagation();moverSeccion(\'' + sec.id + '\',1)">▼</button>' +
            '<button class="mini del" title="' + t('aEliminar') + '" onclick="event.stopPropagation();eliminarSeccion(\'' + sec.id + '\')">✕</button>' +
        '</span>';
    const flecha = cab.querySelector('.flecha');
    flecha.addEventListener('click', e => { e.stopPropagation(); sec.abierto = !sec.abierto; renderPaleta(); });
    cab.addEventListener('click', () => { sec.abierto = !sec.abierto; renderPaleta(); });
    cont.appendChild(cab);

    const cuerpo = document.createElement('div');
    cuerpo.className = 'seccion-cuerpo';
    sec.tipos.forEach(tp => cuerpo.appendChild(chip(tp)));
    if (sec.subs.length) {
        const subs = document.createElement('div');
        subs.className = 'subsecciones';
        sec.subs.forEach(s => subs.appendChild(renderSeccion(s)));
        cuerpo.appendChild(subs);
    }
    if (!sec.tipos.length && !sec.subs.length) {
        const p = document.createElement('div');
        p.className = 'resultado-vacio';
        p.textContent = sec.clave ? '' : t('seccionVacia');
        if (!sec.clave) cuerpo.appendChild(p);
    }
    cont.appendChild(cuerpo);
    return cont;
}

/* Gestión de secciones */
function buscarSeccion(id, arr) {
    for (const s of arr) {
        if (s.id === id) return { sec: s, lista: arr };
        const r = buscarSeccion(id, s.subs);
        if (r) return r;
    }
    return null;
}

function nuevaSeccion(esSub) {
    const label = esSub ? t('pNombreSubseccion') : t('pNombreSeccion');
    const nombre = prompt(label);
    if (!nombre) return;
    if (esSub) {
        const raiz = paleta[paleta.length - 1];
        if (!raiz) paleta.push(nuevaSeccionObj(nombre));
        else raiz.subs.push(nuevaSeccionObj(nombre));
    } else {
        paleta.push(nuevaSeccionObj(nombre));
    }
    renderPaleta();
}

function nuevaSeccionObj(nombre) {
    return { id: 'sec_' + (++contadorSeccion), clave: null, renombrado: true, nombre, tipos: [], subs: [], abierto: true };
}

function nuevaSubseccion(id) {
    const nombre = prompt(t('pNombreSubseccion'));
    if (!nombre) return;
    const r = buscarSeccion(id, paleta);
    if (r) { r.sec.subs.push(nuevaSeccionObj(nombre)); renderPaleta(); }
}

function renombrarSeccion(id) {
    const r = buscarSeccion(id, paleta);
    if (!r) return;
    const nombre = prompt(t('pNuevoNombre'), nombreSeccion(r.sec));
    if (nombre) { r.sec.renombrado = true; r.sec.nombre = nombre; renderPaleta(); }
}

function moverSeccion(id, dir) {
    const r = buscarSeccion(id, paleta);
    if (!r) return;
    const lista = r.lista, i = lista.indexOf(r.sec);
    const j = i + dir;
    if (j < 0 || j >= lista.length) return;
    lista.splice(i, 1);
    lista.splice(j, 0, r.sec);
    renderPaleta();
}

function eliminarSeccion(id) {
    const r = buscarSeccion(id, paleta);
    if (!r) return;
    if (!confirm(tFmt('pConfirmarEliminarSeccion', { s: nombreSeccion(r.sec) }))) return;
    r.lista.splice(r.lista.indexOf(r.sec), 1);
    renderPaleta();
}

/* Popover para añadir elementos a una sección */
function abrirPopover(btn, seccionId) {
    const pop = document.getElementById('popover');
    pop.innerHTML = '';
    ORDEN_CATEGORIAS.forEach(cat => {
        const tit = document.createElement('div');
        tit.className = 'cat';
        tit.textContent = catNombre(cat);
        pop.appendChild(tit);
        Object.keys(TIPOS).filter(k => TIPOS[k].cat === cat).forEach(k => {
            const op = document.createElement('div');
            op.className = 'opcion';
            op.innerHTML = '<span>' + (TIPOS[k].emoji || '🧩') + '</span><span>' + tipoLabel(k) + '</span>';
            op.addEventListener('click', () => {
                const r = buscarSeccion(seccionId, paleta);
                if (r && !r.sec.tipos.includes(k)) r.sec.tipos.push(k);
                pop.classList.remove('abierto');
                renderPaleta();
            });
            pop.appendChild(op);
        });
    });
    const rect = btn.getBoundingClientRect();
    pop.style.left = Math.min(rect.left, window.innerWidth - 250) + 'px';
    pop.style.top = (rect.bottom + 4) + 'px';
    pop.classList.add('abierto');
}
document.addEventListener('click', e => {
    const pop = document.getElementById('popover');
    if (pop.classList.contains('abierto') && !pop.contains(e.target) && !e.target.closest('.mini')) {
        pop.classList.remove('abierto');
    }
});

function togglePanel() {
    document.getElementById('panel').classList.toggle('oculto');
}

/* ============================================================
   PESTAÑAS (múltiples lienzos / secciones)
   ============================================================ */
function renderPestanas() {
    const barra = document.getElementById('barra-pestanas');
    const botonNueva = document.getElementById('btn-nueva-pestania');
    barra.querySelectorAll('.pestania').forEach(n => n.remove());
    pestañas.forEach(p => {
        const tab = document.createElement('div');
        tab.className = 'pestania' + (p.id === pestañaActiva ? ' activa' : '');
        tab.innerHTML = '<span class="nom">' + esc(p.nombre) + '</span><button class="cerrar" title="✕">✕</button>';
        tab.addEventListener('click', e => {
            if (e.target.classList.contains('cerrar')) { cerrarPestania(p.id); return; }
            cambiarPestania(p.id);
        });
        tab.addEventListener('dblclick', e => {
            if (e.target.classList.contains('cerrar')) return;
            renombrarPestania(p.id);
        });
        barra.insertBefore(tab, botonNueva);
    });
}

function nuevaPestania(nombre, silencioso) {
    let name = nombre;
    if (name == null) {
        name = prompt(t('pNombrePestania'), t('pNuevaPestania'));
        if (name === null) return null;
    }
    name = name || t('pNuevaPestania');
    const id = 'tab_' + (++contadorPestania);
    pestañas.push({ id, nombre: name, ancho: 1280, alto: 720, fondo: '#ffffff', raices: [], zoom: 1 });
    cambiarPestania(id);
    return id;
}

function cambiarPestania(id) {
    if (!pestañas.find(p => p.id === id)) return;
    pestañaActiva = id;
    seleccionId = null;
    renderPestanas();
    renderLienzo();
    actualizarTopBar();
}

function renombrarPestania(id) {
    const p = pestañas.find(x => x.id === id);
    if (!p) return;
    const nombre = prompt(t('pRenombrarPestania'), p.nombre);
    if (nombre) { p.nombre = nombre; renderPestanas(); }
}

function cerrarPestania(id) {
    const p = pestañas.find(x => x.id === id);
    if (!p) return;
    if (!confirm(tFmt('pConfirmarCerrarPestania', { s: p.nombre }))) return;
    const idx = pestañas.indexOf(p);
    pestañas.splice(idx, 1);
    p.raices.forEach(r => eliminarSubarbol(r));
    if (pestañaActiva === id) {
        if (pestañas.length) {
            const nueva = pestañas[Math.min(idx, pestañas.length - 1)];
            pestañaActiva = nueva.id;
        } else {
            nuevaPestania(t('pestaniaInicio'), true);
        }
    }
    renderPestanas();
    renderLienzo();
    actualizarTopBar();
}

/* ============================================================
   LIENZO (render, zoom, tamaños)
   ============================================================ */
function actualizarTopBar() {
    const tab = pestañaActual();
    if (!tab) return;
    document.getElementById('ent-ancho').value = tab.ancho;
    document.getElementById('ent-alto').value = tab.alto;
    document.getElementById('ent-fondo').value = tab.fondo;
    document.getElementById('zoom-porc').textContent = Math.round(tab.zoom * 100) + '%';
}

function aplicarFondo() {
    const tab = pestañaActual();
    if (!tab) return;
    const lienzo = document.getElementById('lienzo');
    lienzo.style.width = tab.ancho + 'px';
    lienzo.style.height = tab.alto + 'px';
    lienzo.style.background = tab.fondo;
    if (modo === 'cuadricula') {
        const colW = (tab.ancho - (COLUMNAS - 1) * GAP) / COLUMNAS;
        lienzo.classList.add('modo-cuadricula');
        lienzo.style.gridTemplateColumns = 'repeat(' + COLUMNAS + ', ' + colW + 'px)';
        lienzo.style.gridAutoRows = ALTO_FILA + 'px';
        lienzo.style.gridColumnGap = GAP + 'px';
        lienzo.style.gridRowGap = GAP + 'px';
        lienzo.style.backgroundImage =
            'linear-gradient(to right, rgba(37,99,235,.06) 1px, transparent 1px), ' +
            'linear-gradient(to bottom, rgba(37,99,235,.06) 1px, transparent 1px)';
        lienzo.style.backgroundSize = (colW + GAP) + 'px ' + (ALTO_FILA + GAP) + 'px';
    } else {
        lienzo.classList.remove('modo-cuadricula');
        lienzo.style.gridTemplateColumns = '';
        lienzo.style.gridAutoRows = '';
        lienzo.style.backgroundImage = 'none';
    }
    actualizarTopBar();
}

function aplicarZoom() {
    const tab = pestañaActual();
    if (!tab) return;
    const wrap = document.getElementById('zoom-wrap');
    wrap.style.width = (tab.ancho * tab.zoom) + 'px';
    wrap.style.height = (tab.alto * tab.zoom) + 'px';
    wrap.style.transform = 'scale(' + tab.zoom + ')';
    document.getElementById('zoom-porc').textContent = Math.round(tab.zoom * 100) + '%';
}

function zoomPorcentaje(delta) {
    const tab = pestañaActual();
    if (!tab) return;
    tab.zoom = clamp(Math.round((tab.zoom + delta) * 100) / 100, 0.25, 3);
    aplicarZoom();
}

function zoomAjustar() {
    const tab = pestañaActual();
    if (!tab) return;
    const cont = document.getElementById('contenedor-lienzo');
    const zx = (cont.clientWidth - 80) / tab.ancho;
    const zy = (cont.clientHeight - 60) / tab.alto;
    tab.zoom = clamp(Math.min(zx, zy), 0.25, 3);
    aplicarZoom();
}

function renderLienzo() {
    const lienzo = document.getElementById('lienzo');
    lienzo.innerHTML = '';
    lienzo.appendChild(crearMango());
    lienzo.appendChild(crearLabelMango());
    raices().forEach(id => lienzo.appendChild(construirDOM(id)));
    aplicarFondo();
    aplicarZoom();
    ajustarTracksContenedores();
    setSeleccion(seleccionId);
}

function crearMango() {
    const m = document.createElement('div');
    m.id = 'mango-lienzo';
    m.title = 'Resize';
    return m;
}
function crearLabelMango() {
    const tab = pestañaActual();
    const l = document.createElement('div');
    l.className = 'mango-label';
    l.id = 'label-mango';
    l.textContent = (tab ? tab.ancho : 0) + ' × ' + (tab ? tab.alto : 0);
    return l;
}

function ajustarTracksContenedores() {
    if (modo !== 'cuadricula') return;
    document.querySelectorAll('.elemento-web.es-contenedor').forEach(node => {
        const w = node.getBoundingClientRect().width;
        if (w > 20) {
            const cw = (w - (COLUMNAS - 1) * GAP) / COLUMNAS;
            node.style.gridTemplateColumns = 'repeat(' + COLUMNAS + ', ' + cw + 'px)';
        }
    });
}

function construirDOM(id) {
    const el = elementos.get(id);
    const tp = TIPOS[el.tipo];
    const node = document.createElement('div');
    node.className = 'elemento-web';
    node.dataset.id = id;
    aplicarEstilos(node, el, false);

    if (el.hijos.length) node.classList.add('es-contenedor');

    if (tp.hijos) {
        if (!el.hijos.length) {
            const p = document.createElement('div');
            p.className = 'pista';
            p.textContent = t('sueltaAqui');
            node.appendChild(p);
        }
    } else {
        const txt = document.createElement('div');
        txt.className = 'el-texto';
        txt.textContent = el.texto || '';
        node.appendChild(txt);
        if (tp.enlace && el.destino) {
            const badge = document.createElement('div');
            badge.className = 'destino-badge';
            badge.textContent = '→ ' + el.destino;
            node.appendChild(badge);
        }
    }
    el.hijos.forEach(h => node.appendChild(construirDOM(h)));
    return node;
}

function aplicarEstilos(node, el, esLive) {
    const s = el.estilos;
    node.style.color = s.color;
    node.style.background = s.fondo === 'transparent' ? 'transparent' : s.fondo;
    node.style.opacity = (s.opacidad / 100).toFixed(2);
    node.style.border = (s.borde > 0 ? s.borde + 'px solid ' + s.bordeColor : 'none');
    node.style.borderRadius = s.radio + 'px';
    node.style.padding = s.padding + 'px';
    node.style.fontSize = s.fontSize + 'px';
    node.style.fontWeight = s.negrita ? '700' : '400';
    node.style.textAlign = s.align;
    node.style.boxShadow = s.sombra === 'soft' ? '0 4px 12px rgba(0,0,0,.14)' :
                           (s.sombra === 'strong' ? '0 8px 26px rgba(0,0,0,.28)' : 'none');

    if (modo === 'libre') {
        node.style.left = el.x + 'px';
        node.style.top = el.y + 'px';
        node.style.width = el.w + 'px';
        node.style.height = el.h + 'px';
    } else {
        node.style.gridColumn = el.col + ' / span ' + el.spanCol;
        node.style.gridRow = el.fila + ' / span ' + el.spanRow;
        if (el.hijos.length) {
            node.style.display = 'grid';
            node.style.alignContent = 'start';
            const innerW = Math.max(40, (modo === 'libre' ? el.w : 400));
            const cw = (innerW - (COLUMNAS - 1) * GAP) / COLUMNAS;
            node.style.gridTemplateColumns = 'repeat(' + COLUMNAS + ', ' + cw + 'px)';
            node.style.gridAutoRows = ALTO_FILA + 'px';
            node.style.gridColumnGap = GAP + 'px';
            node.style.gridRowGap = GAP + 'px';
        }
    }

    ['anim-fade', 'anim-pulse', 'anim-spin', 'anim-bounce', 'anim-slide', 'anim-carga']
        .forEach(c => node.classList.remove(c));
    if (el.anim !== 'ninguna') node.classList.add('anim-' + el.anim);
}

/* ============================================================
   ELEMENTOS
   ============================================================ */
function nuevoElemento(tipo) {
    const t = TIPOS[tipo];
    const id = 'elem_' + contadorId++;
    elementos.set(id, {
        id, tipo,
        nombre: tipoLabel(tipo),
        texto: tipoTexto(tipo),
        x: 0, y: 0, w: t.w, h: t.h,
        col: 1, fila: 1, spanCol: t.span, spanRow: Math.max(1, Math.round(t.h / ALTO_FILA)),
        padre: null, hijos: [],
        destino: '',
        estilos: {
            color: t.color, fondo: t.bg, bordeColor: t.bordeColor || '#999999',
            borde: t.borde || 0, radio: t.radio || 0, padding: 6,
            fontSize: t.fontSize || 14, negrita: !!t.negrita, align: 'center',
            opacidad: 100, sombra: t.sombra || 'none'
        },
        anim: t.anim || 'ninguna'
    });
    return id;
}

function esContenedor(id) {
    const e = elementos.get(id);
    return e && !!TIPOS[e.tipo].hijos;
}

function celdaLibre(padreId) {
    const lista = padreId ? elementos.get(padreId).hijos : raices();
    const ocup = new Set();
    lista.forEach(id => { const e = elementos.get(id); ocup.add(e.col + ',' + e.fila); });
    for (let f = 1; f < 100; f++) {
        for (let c = 1; c <= COLUMNAS; c++) {
            if (!ocup.has(c + ',' + f)) return { col: c, fila: f };
        }
    }
    return { col: 1, fila: 1 };
}

function coordRel(x, y, ref) {
    const tab = pestañaActual();
    const z = tab ? tab.zoom : 1;
    const r = ref.getBoundingClientRect();
    return { x: (x - r.left) / z, y: (y - r.top) / z };
}

function colocarTipo(tipo, clienteX, clienteY) {
    const tab = pestañaActual();
    if (!tab) return;
    const id = nuevoElemento(tipo);
    const el = elementos.get(id);
    const t = TIPOS[tipo];

    let contenedor = null;
    if (clienteX != null) {
        const bajo = document.elementFromPoint(clienteX, clienteY);
        const nodoObj = bajo ? bajo.closest('.elemento-web') : null;
        if (nodoObj && esContenedor(nodoObj.dataset.id)) contenedor = elementos.get(nodoObj.dataset.id);
    }
    if (contenedor) {
        el.padre = contenedor.id;
        contenedor.hijos.push(id);
    }

    if (modo === 'libre') {
        const areaW = contenedor ? contenedor.w : tab.ancho;
        const areaH = contenedor ? contenedor.h : tab.alto;
        if (clienteX != null) {
            const ref = contenedor
                ? document.querySelector('[data-id="' + contenedor.id + '"]')
                : document.getElementById('lienzo');
            const o = coordRel(clienteX, clienteY, ref);
            el.x = o.x - t.w / 2;
            el.y = o.y - t.h / 2;
        } else {
            el.x = (areaW - t.w) / 2;
            el.y = (areaH - t.h) / 2;
        }
        el.x = Math.max(0, Math.min(el.x, areaW - t.w));
        el.y = Math.max(0, Math.min(el.y, areaH - t.h));
    } else {
        if (clienteX != null) {
            const ref = contenedor
                ? document.querySelector('[data-id="' + contenedor.id + '"]')
                : document.getElementById('lienzo');
            const o = coordRel(clienteX, clienteY, ref);
            const colW = ((contenedor ? contenedor.w : tab.ancho) - (COLUMNAS - 1) * GAP) / COLUMNAS;
            el.col = clamp(Math.round((o.x - GAP / 2) / (colW + GAP)) + 1, 1, COLUMNAS);
            el.fila = Math.max(1, Math.floor(o.y / (ALTO_FILA + GAP)) + 1);
            if (el.col + el.spanCol - 1 > COLUMNAS) el.spanCol = Math.max(1, COLUMNAS - el.col + 1);
        } else {
            const libre = celdaLibre(contenedor ? contenedor.id : null);
            el.col = libre.col; el.fila = libre.fila;
        }
    }

    if (!contenedor) tab.raices.push(id);
    renderLienzo();
    setSeleccion(id);
}

/* ============================================================
   SELECCIÓN, ARRASTRE Y REDIMENSIONADO
   ============================================================ */
function setSeleccion(id) {
    document.querySelectorAll('.elemento-web.seleccionado').forEach(n => {
        n.classList.remove('seleccionado');
        n.querySelectorAll('.handle').forEach(h => h.remove());
    });
    seleccionId = id;
    if (id && elementos.has(id)) {
        const node = document.querySelector('[data-id="' + id + '"]');
        if (node) {
            node.classList.add('seleccionado');
            crearHandles(node);
        }
    }
    sincronizarEditor();
}

function crearHandles(node) {
    const dirs = modo === 'cuadricula' ? ['e', 's', 'se'] : ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    dirs.forEach(d => {
        const h = document.createElement('div');
        h.className = 'handle ' + d;
        h.dataset.dir = d;
        node.appendChild(h);
    });
}

function iniciarEventos() {
    const lienzo = document.getElementById('lienzo');

    // Arrastre de elementos existentes
    lienzo.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        if (e.target.closest('.handle')) return;
        if (e.target.id === 'mango-lienzo') return;
        const node = e.target.closest('.elemento-web');
        if (!node) return;

        const id = node.dataset.id;
        const el = elementos.get(id);
        setSeleccion(id);
        if (!el) return;

        const tab = pestañaActual();
        const cont = el.padre ? elementos.get(el.padre) : null;
        const ref = cont
            ? document.querySelector('[data-id="' + cont.id + '"]')
            : document.getElementById('lienzo');

        const inicioX = e.clientX, inicioY = e.clientY;
        const origX = el.x, origY = el.y;
        const z = tab ? tab.zoom : 1;
        let movido = false;

        function alMover(ev) {
            if (modo === 'libre') {
                const areaW = cont ? cont.w : tab.ancho;
                const areaH = cont ? cont.h : tab.alto;
                el.x = Math.max(0, Math.min(origX + (ev.clientX - inicioX) / z, areaW - el.w));
                el.y = Math.max(0, Math.min(origY + (ev.clientY - inicioY) / z, areaH - el.h));
            } else {
                const o = coordRel(ev.clientX, ev.clientY, ref);
                const colW = ((cont ? cont.w : tab.ancho) - (COLUMNAS - 1) * GAP) / COLUMNAS;
                const col = clamp(Math.round((o.x - GAP / 2) / (colW + GAP)) + 1, 1, COLUMNAS);
                const fila = Math.max(1, Math.floor(o.y / (ALTO_FILA + GAP)) + 1);
                if (el.col !== col || el.fila !== fila) {
                    el.col = col; el.fila = fila;
                    aplicarEstilos(document.querySelector('[data-id="' + id + '"]'), el, true);
                }
            }
            movido = true;
        }
        function alSoltar() {
            document.removeEventListener('mousemove', alMover);
            document.removeEventListener('mouseup', alSoltar);
            if (modo === 'libre' && movido) {
                aplicarEstilos(document.querySelector('[data-id="' + id + '"]'), el, true);
            }
        }
        document.addEventListener('mousemove', alMover);
        document.addEventListener('mouseup', alSoltar);
    });

    // Redimensionar con mangos
    lienzo.addEventListener('mousedown', e => {
        const h = e.target.closest('.handle');
        if (!h) return;
        e.preventDefault();
        e.stopPropagation();
        const node = h.closest('.elemento-web');
        const id = node.dataset.id;
        const el = elementos.get(id);
        const dir = h.dataset.dir;
        const tab = pestañaActual();
        const inicioX = e.clientX, inicioY = e.clientY;
        const oX = el.x, oY = el.y, oW = el.w, oH = el.h;
        const oCol = el.col, oSC = el.spanCol, oSR = el.spanRow;
        const z = tab ? tab.zoom : 1;

        function alMover(ev) {
            const dx = (ev.clientX - inicioX) / z;
            const dy = (ev.clientY - inicioY) / z;
            if (modo === 'libre') {
                if (dir.includes('e')) el.w = Math.max(20, oW + dx);
                if (dir.includes('s')) el.h = Math.max(20, oH + dy);
                if (dir.includes('w')) { el.w = Math.max(20, oW - dx); el.x = oX + (oW - el.w); }
                if (dir.includes('n')) { el.h = Math.max(20, oH - dy); el.y = oY + (oH - el.h); }
                aplicarEstilos(document.querySelector('[data-id="' + id + '"]'), el, true);
            } else {
                const cont = el.padre ? elementos.get(el.padre) : null;
                const ref = cont
                    ? document.querySelector('[data-id="' + cont.id + '"]')
                    : document.getElementById('lienzo');
                const colW = ((cont ? cont.w : tab.ancho) - (COLUMNAS - 1) * GAP) / COLUMNAS;
                const colD = Math.round(dx / (colW + GAP));
                const filaD = Math.round(dy / (ALTO_FILA + GAP));
                if (dir.includes('e')) el.spanCol = Math.max(1, Math.min(COLUMNAS, oSC + colD));
                if (dir.includes('s')) el.spanRow = Math.max(1, oSR + filaD);
                if (dir === 'se') {
                    el.col = Math.max(1, Math.min(COLUMNAS, oCol));
                    if (el.col + el.spanCol - 1 > COLUMNAS) el.spanCol = COLUMNAS - el.col + 1;
                }
                aplicarEstilos(document.querySelector('[data-id="' + id + '"]'), el, true);
            }
        }
        function alSoltar() {
            document.removeEventListener('mousemove', alMover);
            document.removeEventListener('mouseup', alSoltar);
            sincronizarEditor();
        }
        document.addEventListener('mousemove', alMover);
        document.addEventListener('mouseup', alSoltar);
    });

    // Clic derecho → panel de edición
    lienzo.addEventListener('contextmenu', e => {
        const node = e.target.closest('.elemento-web');
        if (node) {
            e.preventDefault();
            setSeleccion(node.dataset.id);
            abrirEditor();
        }
    });

    // Doble clic con destino de navegación → cambia de pestaña
    lienzo.addEventListener('dblclick', e => {
        const node = e.target.closest('.elemento-web');
        if (!node) return;
        const el = elementos.get(node.dataset.id);
        if (el && el.destino) {
            const destino = pestañas.find(p => p.nombre === el.destino);
            if (destino) cambiarPestania(destino.id);
        }
    });

    // Clic en lienzo vacío → deseleccionar
    lienzo.addEventListener('mousedown', e => {
        if (e.target.id === 'lienzo' || e.target.classList.contains('mango-label')) setSeleccion(null);
    });

    // Soltar desde la paleta
    lienzo.addEventListener('dragover', e => e.preventDefault());
    lienzo.addEventListener('drop', e => {
        e.preventDefault();
        const tipo = e.dataTransfer.getData('text/plain');
        if (tipo && TIPOS[tipo]) colocarTipo(tipo, e.clientX, e.clientY);
    });

    // Redimensionar el lienzo con el mango
    lienzo.addEventListener('mousedown', e => {
        if (e.target.id !== 'mango-lienzo') return;
        e.preventDefault();
        e.stopPropagation();
        const tab = pestañaActual();
        const inicioX = e.clientX, inicioY = e.clientY;
        const oW = tab.ancho, oH = tab.alto;
        const z = tab.zoom;
        function alMover(ev) {
            tab.ancho = clamp(oW + (ev.clientX - inicioX) / z, 200, 4000);
            tab.alto = clamp(oH + (ev.clientY - inicioY) / z, 150, 3000);
            aplicarFondo();
            aplicarZoom();
        }
        function alSoltar() {
            document.removeEventListener('mousemove', alMover);
            document.removeEventListener('mouseup', alSoltar);
            renderLienzo();
        }
        document.addEventListener('mousemove', alMover);
        document.addEventListener('mouseup', alSoltar);
    });
}

/* ============================================================
   MODOS Y AUTO-ACOMODAR
   ============================================================ */
function toggleModo() {
    cambiarModo(modo === 'cuadricula' ? 'libre' : 'cuadricula');
}
function cambiarModo(nuevo) {
    if (modo === nuevo) return;
    if (nuevo === 'cuadricula') convertirLibreAGrid(null, null);
    else convertirGridALibre(null, null);
    modo = nuevo;
    document.getElementById('btn-modo').textContent = modo === 'cuadricula' ? t('modoCuadricula') : t('modoLibre');
    renderLienzo();
}

function convertirGridALibre(padreId, padreW) {
    const lista = padreId ? elementos.get(padreId).hijos : raices();
    const w = padreW != null ? padreW : (pestañaActual() ? pestañaActual().ancho : 1280);
    const colW = (w - (COLUMNAS - 1) * GAP) / COLUMNAS;
    lista.forEach(id => {
        const el = elementos.get(id);
        el.x = (el.col - 1) * (colW + GAP);
        el.y = (el.fila - 1) * (ALTO_FILA + GAP);
        el.w = el.spanCol * colW + (el.spanCol - 1) * GAP;
        el.h = el.spanRow * ALTO_FILA + (el.spanRow - 1) * GAP;
        convertirGridALibre(id, el.w);
    });
}

function convertirLibreAGrid(padreId, padreW) {
    const lista = padreId ? elementos.get(padreId).hijos : raices();
    const w = padreW != null ? padreW : (pestañaActual() ? pestañaActual().ancho : 1280);
    const colW = (w - (COLUMNAS - 1) * GAP) / COLUMNAS;
    lista.forEach(id => {
        const el = elementos.get(id);
        el.col = Math.max(1, Math.min(COLUMNAS, Math.round(el.x / (colW + GAP)) + 1));
        el.spanCol = Math.max(1, Math.min(COLUMNAS - el.col + 1, Math.round(el.w / (colW + GAP))));
        el.fila = Math.max(1, Math.round(el.y / (ALTO_FILA + GAP)) + 1);
        el.spanRow = Math.max(1, Math.round(el.h / (ALTO_FILA + GAP)));
        convertirLibreAGrid(id, el.w);
    });
}

function autoAcomodar() {
    if (modo !== 'cuadricula') cambiarModo('cuadricula');
    function acomodar(lista) {
        let col = 1, fila = 1;
        lista.forEach(id => {
            const el = elementos.get(id);
            if (col + el.spanCol - 1 > COLUMNAS) { col = 1; fila++; }
            el.col = col;
            el.fila = fila;
            col += el.spanCol;
            if (el.hijos.length) acomodar(el.hijos);
        });
    }
    acomodar(raices());
    renderLienzo();
}

/* Tamaño del lienzo desde la barra */
function aplicarTamanoLienzo() {
    const tab = pestañaActual();
    if (!tab) return;
    tab.ancho = clamp(parseInt(document.getElementById('ent-ancho').value) || 800, 200, 4000);
    tab.alto = clamp(parseInt(document.getElementById('ent-alto').value) || 600, 150, 3000);
    aplicarFondo();
    renderLienzo();
}
function aplicarPreset() {
    const v = document.getElementById('sel-preset').value;
    if (!v) return;
    const [a, h] = v.split(',');
    const tab = pestañaActual();
    if (!tab) return;
    tab.ancho = +a; tab.alto = +h;
    document.getElementById('sel-preset').value = '';
    aplicarFondo();
    renderLienzo();
}

/* ============================================================
   PANEL DE EDICIÓN
   ============================================================ */
function abrirEditor() {
    document.getElementById('panel-editor').classList.add('abierto');
    sincronizarEditor();
}
function cerrarEditor() {
    document.getElementById('panel-editor').classList.remove('abierto');
}

function sincronizarEditor() {
    const cuerpo = document.getElementById('editor-cuerpo');
    const etq = document.getElementById('etiqueta-tipo');
    const el = seleccionId ? elementos.get(seleccionId) : null;
    if (!el) {
        cuerpo.innerHTML = '<div class="resultado-vacio">' + t('editarInstruccion') + '</div>';
        etq.textContent = t('sinSeleccion');
        return;
    }
    const tipo = TIPOS[el.tipo];
    etq.textContent = tipoLabel(el.tipo);

    const filaC = (label, contenido) => {
        const g = document.createElement('div');
        g.className = 'grupo';
        const l = document.createElement('label');
        l.textContent = label;
        g.appendChild(l);
        const f = document.createElement('div');
        f.className = 'fila';
        f.appendChild(contenido);
        g.appendChild(f);
        return g;
    };

    const fNombre = document.createElement('input');
    fNombre.type = 'text';
    fNombre.value = el.nombre;
    fNombre.oninput = () => { el.nombre = fNombre.value; };

    const fTexto = document.createElement('textarea');
    fTexto.value = el.texto;
    fTexto.oninput = () => {
        el.texto = fTexto.value;
        const node = document.querySelector('[data-id="' + seleccionId + '"] .el-texto');
        if (node) node.textContent = el.texto;
    };

    const fColor = creadorColor('color');
    const fFondo = creadorColor('fondo');
    const fBordeColor = creadorColor('bordeColor');
    const rBorde = creadorRange('borde', 0, 10, 'px');
    const rRadio = creadorRange('radio', 0, 40, 'px');
    const rPadding = creadorRange('padding', 0, 40, 'px');
    const rFont = creadorRange('fontSize', 10, 48, 'px');
    const rOpacidad = creadorRange('opacidad', 10, 100, '%');
    const cNegrita = creadorCheck('negrita');

    const sAlign = document.createElement('select');
    [['left', t('alIzq')], ['center', t('alCentro')], ['right', t('alDer')], ['justify', t('alJust')]].forEach(p => {
        const o = document.createElement('option');
        o.value = p[0]; o.textContent = p[1];
        sAlign.appendChild(o);
    });
    sAlign.value = el.estilos.align;
    sAlign.onchange = () => { el.estilos.align = sAlign.value; aplicarLive(); };

    const sSombra = document.createElement('select');
    [['none', t('somNinguna')], ['soft', t('somSuave')], ['strong', t('somFuerte')]].forEach(p => {
        const o = document.createElement('option');
        o.value = p[0]; o.textContent = p[1];
        sSombra.appendChild(o);
    });
    sSombra.value = el.estilos.sombra;
    sSombra.onchange = () => { el.estilos.sombra = sSombra.value; aplicarLive(); };

    const sAnim = document.createElement('select');
    [['ninguna', t('anNinguna')], ['fade', t('anFade')], ['pulse', t('anPulse')], ['spin', t('anSpin')],
     ['bounce', t('anBounce')], ['slide', t('anSlide')], ['carga', t('anCarga')]].forEach(p => {
        const o = document.createElement('option');
        o.value = p[0]; o.textContent = p[1];
        sAnim.appendChild(o);
    });
    sAnim.value = el.anim;
    sAnim.onchange = () => { el.anim = sAnim.value; aplicarLive(); };

    cuerpo.innerHTML = '';
    cuerpo.appendChild(filaC(t('eNombre'), fNombre));
    if (!tipo.hijos) cuerpo.appendChild(filaC(t('eContenido'), fTexto));
    cuerpo.appendChild(filaC(t('eColorTexto'), fColor));
    cuerpo.appendChild(filaC(t('eColorFondo'), fFondo));
    if (el.estilos.borde > 0) cuerpo.appendChild(filaC(t('eColorBorde'), fBordeColor));
    cuerpo.appendChild(filaC(t('eBorde'), rBorde));
    cuerpo.appendChild(filaC(t('eRadio'), rRadio));
    cuerpo.appendChild(filaC(t('ePadding'), rPadding));
    cuerpo.appendChild(filaC(t('eFuente'), rFont));
    cuerpo.appendChild(filaC(t('eAlineacion'), sAlign));
    cuerpo.appendChild(filaC(t('eOpacidad'), rOpacidad));
    cuerpo.appendChild(filaC(t('eSombra'), sSombra));
    cuerpo.appendChild(filaC(t('eAnimacion'), sAnim));

    const gNeg = document.createElement('div');
    gNeg.className = 'grupo';
    const fNeg = document.createElement('div');
    fNeg.className = 'fila-cb';
    fNeg.appendChild(cNegrita);
    const lNeg = document.createElement('label');
    lNeg.textContent = t('eNegrita');
    lNeg.style.textTransform = 'none';
    fNeg.appendChild(lNeg);
    gNeg.appendChild(fNeg);
    cuerpo.appendChild(gNeg);

    if (modo === 'libre') {
        const nW = document.createElement('input');
        nW.type = 'number'; nW.value = Math.round(el.w);
        nW.onchange = () => { el.w = Math.max(20, +nW.value || 20); aplicarLive(); };
        const nH = document.createElement('input');
        nH.type = 'number'; nH.value = Math.round(el.h);
        nH.onchange = () => { el.h = Math.max(20, +nH.value || 20); aplicarLive(); };
        cuerpo.appendChild(filaC(t('eAncho'), nW));
        cuerpo.appendChild(filaC(t('eAlto'), nH));
    } else {
        cuerpo.appendChild(filaC(t('eColumnas'), creadorSpanRange('spanCol', COLUMNAS, ' cols')));
        cuerpo.appendChild(filaC(t('eFilas'), creadorSpanRange('spanRow', 12, ' filas')));
    }

    // Destino de navegación (solo elementos clicables)
    if (tipo.enlace) {
        const sDest = document.createElement('select');
        const oNing = document.createElement('option');
        oNing.value = '';
        oNing.textContent = t('eDestinoNinguna');
        sDest.appendChild(oNing);
        pestañas.forEach(p => {
            const o = document.createElement('option');
            o.value = p.nombre;
            o.textContent = p.nombre;
            sDest.appendChild(o);
        });
        sDest.value = el.destino || '';
        sDest.onchange = () => {
            el.destino = sDest.value;
            renderLienzo();
            sincronizarEditor();
        };
        const gDest = document.createElement('div');
        gDest.className = 'grupo';
        const lDest = document.createElement('label');
        lDest.textContent = t('eDestino');
        gDest.appendChild(lDest);
        const fDest = document.createElement('div');
        fDest.className = 'fila';
        fDest.appendChild(sDest);
        gDest.appendChild(fDest);
        const nota = document.createElement('div');
        nota.className = 'nota';
        nota.textContent = t('eDestinoNota');
        gDest.appendChild(nota);
        cuerpo.appendChild(gDest);
    }

    if (el.padre) {
        const padre = elementos.get(el.padre);
        const gPadre = document.createElement('div');
        gPadre.className = 'grupo';
        const lp = document.createElement('label');
        lp.textContent = tFmt('contenedora', { p: padre ? padre.nombre : '' });
        gPadre.appendChild(lp);
        cuerpo.appendChild(gPadre);
    }

    function creadorColor(campo) {
        const c = document.createElement('input');
        c.type = 'color';
        c.value = el.estilos[campo];
        c.oninput = () => { el.estilos[campo] = c.value; aplicarLive(); };
        return c;
    }
    function creadorRange(campo, min, max, sufijo) {
        const r = document.createElement('input');
        r.type = 'range'; r.min = min; r.max = max;
        r.value = el.estilos[campo];
        const val = document.createElement('span');
        val.className = 'valor';
        val.textContent = r.value + sufijo;
        r.oninput = () => {
            el.estilos[campo] = +r.value;
            val.textContent = r.value + sufijo;
            aplicarLive();
        };
        const f = document.createElement('div');
        f.className = 'fila';
        f.appendChild(r);
        f.appendChild(val);
        return f;
    }
    function creadorSpanRange(campo, max, sufijo) {
        const r = document.createElement('input');
        r.type = 'range'; r.min = 1; r.max = max;
        r.value = el[campo];
        const val = document.createElement('span');
        val.className = 'valor';
        val.textContent = r.value + sufijo;
        r.oninput = () => {
            el[campo] = +r.value;
            val.textContent = r.value + sufijo;
            const node = document.querySelector('[data-id="' + seleccionId + '"]');
            if (node) aplicarEstilos(node, el, true);
        };
        const f = document.createElement('div');
        f.className = 'fila';
        f.appendChild(r);
        f.appendChild(val);
        return f;
    }
    function creadorCheck(campo) {
        const c = document.createElement('input');
        c.type = 'checkbox';
        c.checked = !!el.estilos[campo];
        c.onchange = () => { el.estilos[campo] = c.checked; aplicarLive(); };
        return c;
    }
}

function aplicarLive() {
    const node = document.querySelector('[data-id="' + seleccionId + '"]');
    if (node) aplicarEstilos(node, elementos.get(seleccionId), true);
}

function accionEditor(accion) {
    const id = seleccionId;
    if (!id || !elementos.has(id)) return;
    const el = elementos.get(id);
    const lista = el.padre ? elementos.get(el.padre).hijos : raices();
    const i = lista.indexOf(id);

    if (accion === 'subir' && i > 0) { lista.splice(i, 1); lista.splice(i - 1, 0, id); }
    else if (accion === 'bajar' && i < lista.length - 1) { lista.splice(i, 1); lista.splice(i + 1, 0, id); }
    else if (accion === 'desanidar' && el.padre) {
        const padre = elementos.get(el.padre);
        padre.hijos.splice(padre.hijos.indexOf(id), 1);
        el.padre = null;
        raices().push(id);
    }
    else if (accion === 'duplicar') { duplicar(id); return; }
    else if (accion === 'eliminar') {
        lista.splice(i, 1);
        eliminarSubarbol(id);
        seleccionId = null;
    }
    renderLienzo();
    if (seleccionId) setSeleccion(seleccionId);
    sincronizarEditor();
}

function eliminarSubarbol(id) {
    const el = elementos.get(id);
    if (!el) return;
    el.hijos.forEach(eliminarSubarbol);
    elementos.delete(id);
}

function duplicar(id) {
    const orig = elementos.get(id);
    const mapa = new Map();
    function copiar(oid) {
        const o = elementos.get(oid);
        const n = Object.assign({}, o, {
            id: 'elem_' + contadorId++,
            hijos: [],
            x: o.x + 14, y: o.y + 14, col: o.col + 1
        });
        n.estilos = Object.assign({}, o.estilos);
        mapa.set(oid, n.id);
        elementos.set(n.id, n);
        o.hijos.forEach(ch => { const nid = copiar(ch); n.hijos.push(nid); elementos.get(nid).padre = n.id; });
        return n.id;
    }
    const nid = copiar(id);
    elementos.get(nid).padre = orig.padre;
    const lista = orig.padre ? elementos.get(orig.padre).hijos : raices();
    lista.splice(lista.indexOf(id) + 1, 0, nid);
    renderLienzo();
    setSeleccion(nid);
}

/* ============================================================
   GUARDAR / CARGAR PROYECTO
   ============================================================ */
function guardarProyecto() {
    const datos = {
        tipo: 'PromptBlueprint proyecto',
        version: VERSION,
        idioma,
        tema,
        modo,
        paleta,
        pestañaActiva,
        pestañas: pestañas.map(p => ({
            id: p.id, nombre: p.nombre, ancho: p.ancho, alto: p.alto, fondo: p.fondo,
            zoom: p.zoom, raices: p.raices
        })),
        elementos: Array.from(elementos.values())
    };
    descargarBlob(JSON.stringify(datos, null, 2), 'PromptBlueprint_proyecto.json', 'application/json');
    toast(t('guardado'));
}

function cargarProyecto(evento) {
    const file = evento.target.files && evento.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const datos = JSON.parse(e.target.result);
            if (!datos || datos.tipo !== 'PromptBlueprint proyecto') throw new Error('bad');
            restaurarProyecto(datos);
        } catch (err) {
            toast(t('cargadoError'));
        }
    };
    reader.readAsText(file);
    evento.target.value = '';
}

function restaurarProyecto(datos) {
    elementos.clear();
    (datos.elementos || []).forEach(o => elementos.set(o.id, o));
    let max = 0;
    elementos.forEach(e => { const m = String(e.id).match(/\d+$/); if (m) max = Math.max(max, +m[0]); });
    contadorId = max + 1;
    let maxSec = 0;
    (datos.paleta || []).forEach(s => { const m = String(s.id).match(/\d+$/); if (m) maxSec = Math.max(maxSec, +m[0]); });
    contadorSeccion = maxSec;
    pestañas = datos.pestañas || [];
    pestañaActiva = datos.pestañaActiva || (pestañas[0] ? pestañas[0].id : null);
    paleta = datos.paleta || crearPaletaDefault();
    idioma = datos.idioma || 'es';
    tema = Object.assign({}, TEMA_DEFECTO, datos.tema || {});
    modo = datos.modo || 'cuadricula';
    seleccionId = null;
    aplicarTema();
    aplicarIdioma();
    renderPestanas();
    renderPaleta();
    renderLienzo();
    actualizarTopBar();
    if (!pestañas.length) nuevaPestania(t('pestaniaInicio'), true);
}

function descargarBlob(texto, nombre, tipo) {
    const blob = new Blob([texto], { type: tipo });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ============================================================
   EXPORTAR JSON PARA LA IA
   ============================================================ */
function instruccionesIA() {
    if (idioma === 'en') {
        return [
            'Analyze this JSON document to build the website described in "paginas".',
            '"paginas" is a list of site sections/pages. Each page has "nombre" (name), "lienzo" (width, height, background) and "elementos" (elements).',
            '"modo" tells how the elements of each canvas are organized: "cuadricula" (12 columns) or "libre" (exact x/y positions).',
            'Each element has: id, tipo, etiqueta, nombre, texto, posicion, dimensiones, estilos and optionally animacion.',
            '"subsecciones" are elements nested inside a container (menu with submenus). Keep them as nested containers.',
            'When an element has "navegacion.destino", clicking it must go to the page whose "nombre" matches that value.',
            'Generate semantic, responsive HTML, CSS and JavaScript from this data. Use clear names and clean code.'
        ];
    }
    return [
        'Analiza este documento JSON para construir la web descrita en "paginas".',
        '"paginas" es una lista de secciones/páginas del sitio. Cada página tiene "nombre", "lienzo" (ancho, alto, fondo) y "elementos".',
        '"modo" indica cómo se organizan los elementos de cada lienzo: "cuadricula" (12 columnas) o "libre" (posiciones x/y exactas).',
        'Cada elemento tiene: id, tipo, etiqueta, nombre, texto, posicion, dimensiones, estilos y (opcional) animacion.',
        '"subsecciones" son elementos anidados dentro de un contenedor (menú con submenús). Respétalos como contenedores anidados.',
        'Cuando un elemento tenga "navegacion.destino", al pulsarlo debe llevar a la página cuyo "nombre" coincida con ese valor.',
        'Genera HTML semántico, CSS y JavaScript responsivos a partir de estos datos. Usa nombres claros y código limpio.'
    ];
}

function exportar() {
    const tab = pestañaActual();
    if (!tab) return;
    const paginas = pestañas.map(p => ({
        nombre: p.nombre,
        lienzo: { ancho: p.ancho, alto: p.alto, fondo: p.fondo },
        elementos: p.raices.map(id => jsonElemento(id))
    }));
    const datos = {
        herramienta: 'PromptBlueprint',
        version: VERSION,
        descripcion: 'Diseño exportado desde PromptBlueprint para que una IA construya la interfaz web.',
        modo,
        instrucciones_para_la_ia: instruccionesIA(),
        paginas
    };
    document.getElementById('json-salida').value = JSON.stringify(datos, null, 2);
    document.getElementById('modal-exportar').classList.add('abierto');
}

function jsonElemento(id) {
    const el = elementos.get(id);
    const t = TIPOS[el.tipo];
    const tab = pestañaActual();
    const base = {
        id: el.id,
        tipo: el.tipo,
        etiqueta: tipoLabel(el.tipo),
        nombre: el.nombre,
        texto: el.texto,
        posicion: modo === 'libre'
            ? { x: Math.round(el.x), y: Math.round(el.y) }
            : { columna: el.col, fila: el.fila },
        dimensiones: modo === 'libre'
            ? { ancho: Math.round(el.w), alto: Math.round(el.h) }
            : { spanCol: el.spanCol, spanRow: el.spanRow }
    };
    base.estilos = {
        color: el.estilos.color,
        fondo: el.estilos.fondo,
        borde: el.estilos.borde,
        bordeColor: el.estilos.bordeColor,
        radio: el.estilos.radio,
        padding: el.estilos.padding,
        fontSize: el.estilos.fontSize,
        negrita: el.estilos.negrita,
        alinear: el.estilos.align,
        opacidad: el.estilos.opacidad,
        sombra: el.estilos.sombra
    };
    if (el.anim !== 'ninguna') base.animacion = el.anim;
    if (t.enlace && el.destino) base.navegacion = { destino: el.destino };
    if (el.hijos.length) base.subsecciones = el.hijos.map(jsonElemento);
    return base;
}

function cerrarModal() {
    document.getElementById('modal-exportar').classList.remove('abierto');
}
function copiarJson() {
    const t = document.getElementById('json-salida');
    t.select();
    t.setSelectionRange(0, t.value.length);
    navigator.clipboard && navigator.clipboard.writeText(t.value);
    toast(t('copiado'));
}
function descargarJson() {
    const val = document.getElementById('json-salida').value;
    descargarBlob(val, 'PromptBlueprint_IA.json', 'application/json');
}
document.getElementById('modal-exportar').addEventListener('mousedown', e => {
    if (e.target.id === 'modal-exportar') cerrarModal();
});
document.getElementById('json-salida').addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'a') { e.preventDefault(); const x = e.target; x.select(); x.setSelectionRange(0, x.value.length); }
});

/* ============================================================
   AJUSTES
   ============================================================ */
let ajustesSeccionActiva = 'apariencia';

function abrirAjustes() {
    renderAjustes();
    document.getElementById('modal-ajustes').classList.add('abierto');
}
function cerrarAjustes() {
    document.getElementById('modal-ajustes').classList.remove('abierto');
}
document.getElementById('modal-ajustes').addEventListener('mousedown', e => {
    if (e.target.id === 'modal-ajustes') cerrarAjustes();
});

function renderAjustes() {
    const nav = document.getElementById('ajustes-nav');
    nav.innerHTML = '';
    const opciones = [
        ['apariencia', t('aApariencia')],
        ['idioma', t('aIdioma')],
        ['acerca', t('aAcercaDe')]
    ];
    opciones.forEach(o => {
        const b = document.createElement('div');
        b.className = 'opc' + (o[0] === ajustesSeccionActiva ? ' activa' : '');
        b.textContent = o[1];
        b.addEventListener('click', () => { ajustesSeccionActiva = o[0]; renderAjustes(); });
        nav.appendChild(b);
    });

    const panel = document.getElementById('ajustes-panel');
    panel.innerHTML = '';
    if (ajustesSeccionActiva === 'apariencia') renderAjustesApariencia(panel);
    else if (ajustesSeccionActiva === 'idioma') renderAjustesIdioma(panel);
    else renderAjustesAcerca(panel);
}

function renderAjustesApariencia(panel) {
    const g = document.createElement('div');
    g.className = 'grupo';
    const h = document.createElement('h4');
    h.textContent = t('aColores');
    g.appendChild(h);
    const nota = document.createElement('div');
    nota.className = 'nota';
    nota.textContent = t('aNotaColores');
    g.appendChild(nota);

    const campos = [
        ['fondo', t('aFondo')],
        ['panel', t('aPanel')],
        ['panel2', t('aPanel2')],
        ['borde', t('aBorde')],
        ['texto', t('aTexto')],
        ['textoS', t('aTextoS')],
        ['acento', t('aAcento')]
    ];
    campos.forEach(c => {
        const fila = document.createElement('div');
        fila.className = 'fila';
        const lab = document.createElement('label');
        lab.textContent = c[1];
        const inp = document.createElement('input');
        inp.type = 'color';
        inp.value = tema[c[0]];
        inp.addEventListener('input', () => {
            tema[c[0]] = inp.value;
            aplicarTema();
        });
        fila.appendChild(lab);
        fila.appendChild(inp);
        g.appendChild(fila);
    });

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = t('aRestablecer');
    btn.addEventListener('click', () => {
        tema = Object.assign({}, TEMA_DEFECTO);
        aplicarTema();
        renderAjustes();
    });
    g.appendChild(btn);
    panel.appendChild(g);
}

function renderAjustesIdioma(panel) {
    const g = document.createElement('div');
    g.className = 'grupo';
    const h = document.createElement('h4');
    h.textContent = t('aIdiomaLabel');
    g.appendChild(h);
    const sel = document.createElement('select');
    const oEs = document.createElement('option');
    oEs.value = 'es'; oEs.textContent = t('aEspanol');
    const oEn = document.createElement('option');
    oEn.value = 'en'; oEn.textContent = t('aIngles');
    sel.appendChild(oEs);
    sel.appendChild(oEn);
    sel.value = idioma;
    sel.addEventListener('change', () => cambiarIdioma(sel.value));
    g.appendChild(sel);
    panel.appendChild(g);
}

function renderAjustesAcerca(panel) {
    const g = document.createElement('div');
    g.className = 'grupo';
    const items = [
        ['Version', tFmt('aVersion', { v: VERSION })],
        ['Desarrollado por', t('aDesarrollado')],
        ['Plataforma', t('aPlataforma')]
    ];
    items.forEach(it => {
        const fila = document.createElement('div');
        fila.className = 'acerca-item';
        const k = document.createElement('span');
        k.className = 'k';
        k.textContent = it[0] + ':';
        const v = document.createElement('span');
        v.textContent = it[1];
        fila.appendChild(k);
        fila.appendChild(v);
        g.appendChild(fila);
    });
    panel.appendChild(g);
}

/* ============================================================
   FAQ
   ============================================================ */
function renderFaq() {
    const cuerpo = document.getElementById('faq-cuerpo');
    cuerpo.innerHTML = '';
    (I18N[idioma].faq || []).forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'faq-item';
        item.innerHTML =
            '<div class="faq-pregunta"><span class="num">' + (i + 1) + '</span><span>' + esc(p[0]) + '</span></div>' +
            '<div class="faq-respuesta">' + esc(p[1]) + '</div>';
        item.querySelector('.faq-pregunta').addEventListener('click', () => item.classList.toggle('abierto'));
        cuerpo.appendChild(item);
    });
}

function toggleFaq() {
    const pf = document.getElementById('panel-faq');
    pf.classList.toggle('abierto');
    if (pf.classList.contains('abierto')) renderFaq();
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
function init() {
    contadorPestania = 0;
    paleta = crearPaletaDefault();
    const idInicial = 'tab_' + (++contadorPestania);
    pestañas = [{ id: idInicial, nombre: t('pestaniaInicio'), ancho: 1280, alto: 720, fondo: '#ffffff', raices: [], zoom: 1 }];
    pestañaActiva = idInicial;

    aplicarTema();
    applyTraducciones();
    renderPestanas();
    renderPaleta();
    renderLienzo();
    actualizarTopBar();
    renderFaq();
    iniciarEventos();
}

init();