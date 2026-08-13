/* ============================================================
   PROMPTBLUEPRINT — Registro de tipos de elementos
   ============================================================ */
const COLUMNAS = 12;
const GAP = 8;
const ALTO_FILA = 56;

const CATES = {
    basico:       { es: 'Básicos',      en: 'Basic' },
    formularios:  { es: 'Formularios',  en: 'Forms' },
    contenedores: { es: 'Contenedores', en: 'Containers' },
    navegacion:   { es: 'Navegación',   en: 'Navigation' },
    medios:       { es: 'Medios',       en: 'Media' },
    datos:        { es: 'Datos',        en: 'Data' },
    animaciones:  { es: 'Animaciones',  en: 'Animations' }
};

const ORDEN_CATEGORIAS = ['basico', 'formularios', 'contenedores', 'navegacion', 'medios', 'datos', 'animaciones'];

const TIPOS = {
    // Básicos
    boton:     { es: 'Botón', en: 'Button', cat: 'basico', w: 120, h: 40, span: 3, bg: '#2563eb', color: '#ffffff', radio: 8, texto_es: 'Botón', texto_en: 'Button', emoji: '🔘', enlace: true },
    texto:     { es: 'Texto', en: 'Text', cat: 'basico', w: 170, h: 26, span: 4, bg: 'transparent', color: '#111111', radio: 0, texto_es: 'Texto de ejemplo', texto_en: 'Sample text', emoji: '🔤' },
    titulo:    { es: 'Título', en: 'Title', cat: 'basico', w: 280, h: 44, span: 6, bg: 'transparent', color: '#111111', radio: 0, fontSize: 28, negrita: true, texto_es: 'Título de la página', texto_en: 'Page title', emoji: '🔠' },
    parrafo:   { es: 'Párrafo', en: 'Paragraph', cat: 'basico', w: 280, h: 64, span: 6, bg: 'transparent', color: '#333333', radio: 0, fontSize: 14, texto_es: 'Este es un párrafo de ejemplo que describe el contenido de la sección.', texto_en: 'This is a sample paragraph describing the content of the section.', emoji: '📄' },
    enlace:    { es: 'Enlace', en: 'Link', cat: 'basico', w: 100, h: 26, span: 3, bg: 'transparent', color: '#2563eb', radio: 0, texto_es: 'Enlace →', texto_en: 'Link →', emoji: '🔗', enlace: true },
    separador: { es: 'Separador', en: 'Divider', cat: 'basico', w: 220, h: 6, span: 6, bg: 'transparent', color: '#cccccc', radio: 0, borde: 0, texto_es: '', texto_en: '', emoji: '➖' },
    imagen:    { es: 'Imagen', en: 'Image', cat: 'basico', w: 160, h: 120, span: 4, bg: 'linear-gradient(135deg,#c7d2fe,#93c5fd)', color: '#475569', radio: 8, texto_es: 'Imagen', texto_en: 'Image', emoji: '🖼️' },
    icono:     { es: 'Icono', en: 'Icon', cat: 'basico', w: 44, h: 44, span: 2, bg: 'transparent', color: '#2563eb', radio: 0, fontSize: 26, texto_es: '⭐', texto_en: '⭐', emoji: '⭐' },

    // Formularios
    input:     { es: 'Campo de texto', en: 'Text field', cat: 'formularios', w: 220, h: 38, span: 5, bg: '#ffffff', color: '#666666', radio: 6, borde: 1, bordeColor: '#cccccc', texto_es: 'Escribe aquí…', texto_en: 'Type here…', emoji: '📝' },
    textarea:  { es: 'Área de texto', en: 'Text area', cat: 'formularios', w: 240, h: 92, span: 6, bg: '#ffffff', color: '#666666', radio: 6, borde: 1, bordeColor: '#cccccc', texto_es: 'Escribe un texto más largo…', texto_en: 'Write a longer text…', emoji: '📃' },
    select:    { es: 'Lista desplegable', en: 'Dropdown', cat: 'formularios', w: 200, h: 38, span: 5, bg: '#ffffff', color: '#333333', radio: 6, borde: 1, bordeColor: '#cccccc', texto_es: 'Selecciona una opción ▾', texto_en: 'Choose an option ▾', emoji: '🔽' },
    checkbox:  { es: 'Casilla', en: 'Checkbox', cat: 'formularios', w: 140, h: 26, span: 4, bg: 'transparent', color: '#333333', radio: 0, texto_es: '☑ Opción 1', texto_en: '☑ Option 1', emoji: '☑️' },
    radio:     { es: 'Opción radio', en: 'Radio option', cat: 'formularios', w: 140, h: 26, span: 4, bg: 'transparent', color: '#333333', radio: 0, texto_es: '◉ Opción A', texto_en: '◉ Option A', emoji: '🔘' },
    switch:    { es: 'Interruptor', en: 'Toggle', cat: 'formularios', w: 150, h: 30, span: 4, bg: '#ffffff', color: '#333333', radio: 0, borde: 1, bordeColor: '#cccccc', texto_es: '●── Activo', texto_en: '●── On', emoji: '🔄' },
    rango:     { es: 'Barra de rango', en: 'Range slider', cat: 'formularios', w: 200, h: 22, span: 5, bg: 'transparent', color: '#2563eb', radio: 0, texto_es: '──────●────', texto_en: '──────●────', emoji: '🎚️' },

    // Contenedores
    contenedor: { es: 'Contenedor', en: 'Container', cat: 'contenedores', w: 260, h: 150, span: 6, bg: '#f8f9fa', color: '#888888', radio: 8, borde: 1, bordeColor: '#dee2e6', texto_es: '', texto_en: '', hijos: true, emoji: '📦' },
    tarjeta:    { es: 'Tarjeta', en: 'Card', cat: 'contenedores', w: 220, h: 150, span: 5, bg: '#ffffff', color: '#888888', radio: 12, borde: 1, bordeColor: '#e6e6e6', sombra: 'soft', texto_es: '', texto_en: '', hijos: true, emoji: '🃏' },
    seccion:    { es: 'Sección', en: 'Section', cat: 'contenedores', w: 420, h: 200, span: 12, bg: '#f1f3f5', color: '#888888', radio: 8, texto_es: '', texto_en: '', hijos: true, emoji: '🧱' },
    fila:       { es: 'Fila', en: 'Row', cat: 'contenedores', w: 420, h: 100, span: 12, bg: 'transparent', color: '#888888', radio: 0, texto_es: '', texto_en: '', hijos: true, emoji: '➡️' },
    columna:    { es: 'Columna', en: 'Column', cat: 'contenedores', w: 170, h: 200, span: 4, bg: 'transparent', color: '#888888', radio: 0, borde: 1, bordeColor: '#dee2e6', texto_es: '', texto_en: '', hijos: true, emoji: '⬇️' },

    // Navegación
    menuNav:     { es: 'Menú de navegación', en: 'Navigation menu', cat: 'navegacion', w: 520, h: 52, span: 12, bg: '#1f2937', color: '#ffffff', radio: 6, texto_es: '', texto_en: '', hijos: true, emoji: '🧭' },
    itemMenu:    { es: 'Elemento de menú', en: 'Menu item', cat: 'navegacion', w: 96, h: 32, span: 2, bg: '#374151', color: '#ffffff', radio: 4, texto_es: 'Menú', texto_en: 'Menu', emoji: '🔖', enlace: true },
    tabs:        { es: 'Pestañas', en: 'Tabs', cat: 'navegacion', w: 340, h: 42, span: 8, bg: '#ffffff', color: '#333333', radio: 6, borde: 1, bordeColor: '#dee2e6', texto_es: '| Pestaña 1 | Pestaña 2 | Pestaña 3 |', texto_en: '| Tab 1 | Tab 2 | Tab 3 |', emoji: '📑' },
    breadcrumb:  { es: 'Migas de pan', en: 'Breadcrumbs', cat: 'navegacion', w: 280, h: 30, span: 7, bg: 'transparent', color: '#2563eb', radio: 0, texto_es: 'Inicio › Sección › Página', texto_en: 'Home › Section › Page', emoji: '🍞' },
    paginacion:  { es: 'Paginación', en: 'Pagination', cat: 'navegacion', w: 250, h: 38, span: 6, bg: '#ffffff', color: '#333333', radio: 6, borde: 1, bordeColor: '#dee2e6', texto_es: '‹ 1 2 3 4 ›', texto_en: '‹ 1 2 3 4 ›', emoji: '🔢' },

    // Medios
    video:         { es: 'Video', en: 'Video', cat: 'medios', w: 320, h: 180, span: 8, bg: '#0f172a', color: '#ffffff', radio: 8, fontSize: 40, texto_es: '▶', texto_en: '▶', emoji: '🎬' },
    audio:         { es: 'Audio', en: 'Audio', cat: 'medios', w: 280, h: 46, span: 7, bg: '#334155', color: '#ffffff', radio: 6, texto_es: '▶ ▶ ▶  ⏺  ▮▮', texto_en: '▶ ▶ ▶  ⏺  ▮▮', emoji: '🎵' },
    sliderImg:     { es: 'Carrusel', en: 'Carousel', cat: 'medios', w: 420, h: 200, span: 10, bg: 'linear-gradient(90deg,#a5b4fc,#67e8f9,#fbcfe8)', color: '#ffffff', radio: 8, texto_es: '● ○ ○   ◀  ▶', texto_en: '● ○ ○   ◀  ▶', emoji: '🎠' },
    barraProgreso: { es: 'Barra de progreso', en: 'Progress bar', cat: 'medios', w: 220, h: 18, span: 6, bg: '#ffffff', color: '#2563eb', radio: 9, borde: 1, bordeColor: '#dee2e6', texto_es: '████████░░ 80%', texto_en: '████████░░ 80%', emoji: '📊' },

    // Datos
    tabla:     { es: 'Tabla', en: 'Table', cat: 'datos', w: 340, h: 130, span: 8, bg: '#ffffff', color: '#333333', radio: 6, borde: 1, bordeColor: '#dee2e6', fontSize: 12, texto_es: 'Col 1 | Col 2 | Col 3\n────+─────+────\nA1    | B1    | C1\nA2    | B2    | C2', texto_en: 'Col 1 | Col 2 | Col 3\n────+─────+────\nA1    | B1    | C1\nA2    | B2    | C2', emoji: '📋' },
    lista:     { es: 'Lista', en: 'List', cat: 'datos', w: 240, h: 120, span: 6, bg: '#ffffff', color: '#333333', radio: 6, borde: 1, bordeColor: '#dee2e6', texto_es: '• Primer elemento\n• Segundo elemento\n• Tercer elemento', texto_en: '• First item\n• Second item\n• Third item', emoji: '📃' },
    badge:     { es: 'Insignia', en: 'Badge', cat: 'datos', w: 90, h: 30, span: 3, bg: '#dcfce7', color: '#166534', radio: 14, texto_es: '¡Nuevo!', texto_en: 'New!', emoji: '🏷️' },
    alerta:    { es: 'Alerta', en: 'Alert', cat: 'datos', w: 320, h: 54, span: 8, bg: '#fef3c7', color: '#92400e', radio: 8, borde: 1, bordeColor: '#f59e0b', texto_es: '⚠️ Atención: revisa esta información.', texto_en: '⚠️ Attention: check this information.', emoji: '⚠️' },
    tooltip:   { es: 'Tooltip', en: 'Tooltip', cat: 'datos', w: 130, h: 34, span: 4, bg: '#1f2937', color: '#ffffff', radio: 6, texto_es: 'Info útil 💡', texto_en: 'Useful info 💡', emoji: '💬' },
    spinner:   { es: 'Cargando', en: 'Loading', cat: 'datos', w: 50, h: 50, span: 2, bg: '#e2e8f0', color: '#2563eb', radio: 50, fontSize: 22, texto_es: '⟳', texto_en: '⟳', anim: 'spin', emoji: '⏳' },

    // Animaciones
    textoAnimado: { es: 'Texto fade', en: 'Fade text', cat: 'animaciones', w: 240, h: 34, span: 6, bg: 'transparent', color: '#2563eb', radio: 0, fontSize: 20, negrita: true, texto_es: '✨ Aparece suavemente', texto_en: '✨ Appears smoothly', anim: 'fade', emoji: '✨' },
    pulso:        { es: 'Botón pulso', en: 'Pulse button', cat: 'animaciones', w: 130, h: 44, span: 4, bg: '#e11d48', color: '#ffffff', radio: 8, texto_es: 'Pulsa aquí', texto_en: 'Press here', anim: 'pulse', emoji: '💓' },
    rebote:       { es: 'Caja rebote', en: 'Bounce box', cat: 'animaciones', w: 110, h: 60, span: 4, bg: '#f59e0b', color: '#ffffff', radio: 10, texto_es: 'Rebote', texto_en: 'Bounce', anim: 'bounce', emoji: '🏀' },
    deslizar:     { es: 'Panel deslizante', en: 'Sliding panel', cat: 'animaciones', w: 280, h: 80, span: 7, bg: '#10b981', color: '#ffffff', radio: 10, texto_es: '← Se desliza', texto_en: '← Slides in', anim: 'slide', emoji: '🎯' },
    carga:        { es: 'Carga animada', en: 'Animated loading', cat: 'animaciones', w: 200, h: 44, span: 6, bg: 'transparent', color: '#94a3b8', radio: 6, texto_es: 'Cargando contenido…', texto_en: 'Loading content…', anim: 'carga', emoji: '🌊' }
};

function tipoLabel(tipo) {
    const t = TIPOS[tipo];
    if (!t) return tipo;
    return idioma === 'en' ? t.en : t.es;
}

function tipoTexto(tipo) {
    const t = TIPOS[tipo];
    if (!t) return '';
    return idioma === 'en' ? t.texto_en : t.texto_es;
}

function catNombre(clave) {
    const c = CATES[clave];
    if (!c) return clave;
    return idioma === 'en' ? c.en : c.es;
}