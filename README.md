# PromptBlueprint

Diseña interfaces web arrastrando elementos a un lienzo y exporta el diseño como **JSON** para pasárselo a una IA y que construya la web.

Herramienta local: abre `index.html` en cualquier navegador moderno. No requiere instalación ni dependencias.

## Versión actual

**v1.1.0**

## Características

- **Paleta de elementos** organizada en secciones por tipo (Básicos, Formularios, Contenedores, Navegación, Medios, Datos y Animaciones), con más de 40 elementos arrastrables.
- **Secciones expandidas por defecto** con botón para expandir/colapsar cada una. Paneles con scroll para ver todo el contenido.
- **Secciones jerárquicas**: crea subsecciones anidadas (Menú → Submenú → Sub-submenú) y reordénalas hacia arriba/abajo en la paleta.
- **Subsecciones en el lienzo**: arrastra un elemento encima de un contenedor (Menú, Tarjeta, Sección…) para anidarlo. El JSON exportado refleja la jerarquía.
- **Lienzo redimensionable**: arrastra la esquina inferior derecha, o usa ancho/alto con presets (Escritorio, Tablet, Móvil).
- **Zoom in/out** sobre el lienzo (botones − y +, y ajuste para que quepa en pantalla).
- **Modo cuadrícula y modo libre**: acomoda los elementos automáticamente en cuadrículas de 12 columnas o colócalos en posición libre exacta.
- **Sistema de pestañas (secciones)**: crea varios lienzos/páginas en el mismo proyecto. Un botón o enlace puede tener un "Destino de navegación" para llevar a otra sección.
- **Guardar / cargar proyectos**: guarda todo tu trabajo (pestañas, elementos, colores e idioma) en un archivo .json y continúa después.
- **Buscador** para encontrar elementos al instante (ignora tildes).
- **Panel ocultable**: muestra u oculta la paleta para ganar espacio.
- **Elementos con animaciones** (fade, pulso, giro, rebote, deslizar, brillo de carga) aplicables a cualquier elemento.
- **Editor de propiedades**: clic derecho sobre un elemento abre a la izquierda de la pantalla un panel para editar texto, colores, bordes, esquinas, relleno, fuente, opacidad, sombra, animación, tamaño y destino de navegación.
- **Panel de ajustes**: cambia los colores de la interfaz al instante, alterna entre **español e inglés**, y muestra la sección "Acerca de" (versión, desarrollador y plataforma).
- **Botón "?"**: panel de preguntas y respuestas sobre la herramienta.
- **Exportar JSON para la IA**: incluye la sección `instrucciones_para_la_ia` para que la IA sepa interpretar el documento (lienzo, modo, posición, estilos, subsecciones y destinos) y construya la web.

## Estructura del proyecto

```
PromptBlueprint/
├── index.html      → entrada principal
├── css/app.css     → estilos de la interfaz
├── js/i18n.js      → traducciones español/inglés
├── js/tipos.js     → registro de tipos de elementos
└── js/app.js       → lógica principal (paleta, lienzo, pestañas, guardar/cargar, ajustes)
```

## Cómo usarla

1. Abre `index.html` en cualquier navegador moderno.
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