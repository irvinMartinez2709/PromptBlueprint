# PromptBlueprint

Diseña interfaces web arrastrando elementos a un lienzo y exporta el diseño como **JSON** para pasárselo a una IA y que construya la web.

Herramienta local: abre `PromptBlueprint.html` en cualquier navegador moderno. No requiere instalación ni dependencias.

## Versión actual

**v1.3.0**

## Características

- **Paleta de elementos** organizada en secciones por tipo (Básicos, Formularios, Contenedores, Navegación, Medios, Datos y Animaciones), con más de 40 elementos arrastrables.
- **Secciones expandidas por defecto** con botón para expandir/colapsar cada una. Paneles con scroll para ver todo el contenido.
- **Secciones jerárquicas**: crea subsecciones anidadas (Menú → Submenú → Sub-submenú) y reordénalas hacia arriba/abajo en la paleta.
- **Subsecciones en el lienzo**: arrastra un elemento encima de un contenedor (Menú, Tarjeta, Sección…) para anidarlo. El JSON exportado refleja la jerarquía.
- **Lienzo redimensionable**: arrastra la esquina inferior derecha, o usa ancho/alto con presets (Escritorio, Tablet, Móvil).
- **Zoom in/out** sobre el lienzo (botones − y +, y ajuste para que quepa en pantalla).
- **Modo cuadrícula y modo libre**: acomoda los elementos automáticamente en cuadrículas o colócalos en posición libre exacta. La cantidad de columnas de la cuadrícula es **personalizable** desde Ajustes.
- **Elementos redimensionables libremente**: cada elemento seleccionado tiene su propio mango (como el del lienzo) para cambiarle el tamaño arrastrando desde su esquina inferior derecha.
- **Sistema de pestañas (secciones)**: crea varios lienzos/páginas en el mismo proyecto. Un botón o enlace puede tener un "Destino de navegación" para llevar a otra sección, con un botón "Ir a la sección" para comprobarlo al instante.
- **Guardar / cargar proyectos**: guarda todo tu trabajo (pestañas, elementos, colores e idioma) en un archivo .json y continúa después. Además hay **autoguardado** en el navegador: si recargas la página se conserva lo hecho. El botón **"Limpiar lienzo"** borra todo y empieza de cero.
- **Buscador** para encontrar elementos al instante (ignora tildes).
- **Panel ocultable**: muestra u oculta la paleta para ganar espacio.
- **Deshacer / rehacer**: botones ↶ y ↷ en la barra superior para deshacer o rehacer los cambios sobre el lienzo (añadir, mover, redimensionar, duplicar, eliminar, pestañas, colores…).
- **Nombres únicos automáticos**: si añades dos elementos del mismo tipo, el segundo se nombra con sufijo `-1`, `-2`, etc. (ej. Botón, Botón-1, Botón-2).
- **Presets propios**: en Ajustes → Apariencia puedes guardar la combinación de colores actual como preset personalizado y eliminarlo cuando quieras.
- **Color de la cuadrícula**: el color de las líneas de la cuadrícula del lienzo es configurable desde Ajustes.
- **Zoom manual**: el porcentaje de zoom es un campo editable (25%–300%), además de los botones − y +.
- **Elementos con animaciones** (fade, pulso, giro, rebote, deslizar, brillo de carga) aplicables a cualquier elemento.
- **Editor de propiedades**: clic derecho sobre un elemento abre, saliendo desde la izquierda de la pantalla (sin tapar la paleta), un panel para editar texto, colores (con opción de **"sin color"** o transparente), bordes, esquinas, relleno, fuente, opacidad, sombra, animación, tamaño y destino de navegación. Si eliminas un elemento, el panel se cierra solo.
- **Panel de ajustes**: modo **claro/oscuro**, **presets de color** (incluidos los tuyos), colores personalizados al instante, **columnas de cuadrícula** (hasta 50), **color de la cuadrícula**, alterna entre **español e inglés**, incluye las **preguntas frecuentes** y la sección "Acerca de" (versión, desarrollador y plataforma).
- **Diálogos propios**: las confirmaciones y entradas de texto usan ventanas emergentes propias de la herramienta (no las del navegador).
- **Controles de ventana**: los paneles y ventanas que se pueden cerrar tienen su botón de cierre cuadrado y discreto (se enciende en rojo al pasar el ratón).
- **Cambio de modo sin mover elementos**: alternar entre modo cuadrícula y modo libre **mantiene cada elemento en su lugar**; solo "Auto-acomodar" o mover a mano los recolocan.
- **Botón "?"**: panel de preguntas y respuestas sobre la herramienta (también disponible en Ajustes → Ayuda).
- **Exportar JSON para la IA**: incluye la sección `instrucciones_para_la_ia` para que la IA sepa interpretar el documento (lienzo, modo, columnas, posición, estilos, subsecciones y destinos) y construya la web.

## Estructura del proyecto

```
PromptBlueprint/
├── PromptBlueprint.html → entrada principal
├── logo.ico             → icono de la herramienta
├── css/app.css     → estilos de la interfaz
├── js/i18n.js      → traducciones español/inglés
├── js/tipos.js     → registro de tipos de elementos
└── js/app.js       → lógica principal (paleta, lienzo, pestañas, guardar/cargar, ajustes)
```

## Cómo usarla

1. Abre `PromptBlueprint.html` en cualquier navegador moderno.
2. Arrastra (o haz clic) los elementos de la paleta izquierda hacia el lienzo.
3. Crea contenedores y arrastra elementos sobre ellos para formar menús con submenús.
4. Usa la barra de pestañas para crear varias secciones/páginas.
5. Haz clic derecho sobre un elemento para abrir el panel de propiedades y personalizarlo.
6. Guarda tu proyecto con "Guardar" (💾) y cárgalo cuando quieras seguir trabajando.
7. Pulsa **Exportar JSON** y pasa el código (con sus instrucciones para la IA) a tu IA para que construya la web.

## Versionado

- `1.x.0` → cambios grandes (nuevas funcionalidades).
- `1.x.x` → cambios pequeños o arreglos de errores.

Cada versión se publica aquí como una Release de GitHub.