# PromptBlueprint

Diseña interfaces web arrastrando elementos a un lienzo y exporta el diseño como **JSON** para pasárselo a una IA y que construya la web.

Herramienta 100% local: un solo archivo `PromptBlueprint.html`, sin dependencias ni instalación.

## Versión actual

**v1.0.0**

## Características

- **Paleta de elementos** organizada en secciones por tipo (Básicos, Formularios, Contenedores, Navegación, Medios, Datos y Animaciones), con más de 40 elementos arrastrables.
- **Secciones jerárquicas**: crea subsecciones anidadas (Menú → Submenú → Sub-submenú) y reordénalas hacia arriba/abajo en la paleta.
- **Subsecciones en el lienzo**: arrastra un elemento encima de un contenedor (Menú, Tarjeta, Sección…) para anidarlo como subsección. El JSON exportado refleja la jerarquía.
- **Lienzo redimensionable**: arrastra la esquina inferior derecha, o usa ancho/alto con presets (Escritorio, Tablet, Móvil).
- **Modo cuadrícula y modo libre**: acomoda los elementos automáticamente en cuadrículas de 12 columnas o colócalos en posición libre exacta.
- **Buscador** para encontrar elementos al instante.
- **Panel ocultable**: muestra u oculta la paleta para ganar espacio.
- **Elementos con animaciones** (fade, pulso, giro, rebote, deslizar, brillo de carga) aplicables a cualquier elemento.
- **Editor de propiedades**: clic derecho sobre un elemento abre a la izquierda un panel para editar texto, colores, bordes, esquinas, relleno, fuente, opacidad, sombra, animación y tamaño.
- **Botón "?"**: panel de preguntas y respuestas sobre la herramienta.
- **Exportar JSON**: genera el código listo para tu IA (lienzo, modo, posición, estilos y subsecciones anidadas), con opción de copiar o descargar.

## Cómo usarla

1. Abre `PromptBlueprint.html` en cualquier navegador moderno.
2. Arrastra (o haz clic) los elementos de la paleta izquierda hacia el lienzo.
3. Crea contenedores y arrastra elementos sobre ellos para formar menús con submenús.
4. Haz clic derecho sobre un elemento para abrir el panel de propiedades y personalizarlo.
5. Ajusta el tamaño del lienzo y elige cuadrícula o modo libre.
6. Pulsa **Exportar JSON** y pasa el código a tu IA para que construya la web.

## Versionado

- `1.x.0` → cambios grandes (nuevas funcionalidades).
- `1.x.x` → cambios pequeños o arreglos de errores.

Cada versión se publica aquí como una Release de GitHub.