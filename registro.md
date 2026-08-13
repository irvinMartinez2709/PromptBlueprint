# Registro del proyecto

## PromptBlueprint

### 1

2026-08-13 15:51

Crear la herramienta PromptBlueprint (diseño de frontend que se exporta como JSON para que una IA construya la web). Requisitos v1.0.0:

- Permitir crear subsecciones jerárquicas (Menú 1 → Submenú 1 → Sub-submenú…) que se puedan intercambiar/reordenar.
- Muchos elementos arrastrables al lienzo (paleta dividida en secciones por tipo, con buscador, ocultable/mostrable).
- Lienzo con tamaño redimensionable.
- Botón para acomodar elementos automáticamente en cuadrículas o cambiar a modo libre.
- Elementos con animaciones.
- Edición de elementos (color, forma, etc.) con un panel que se abre a la izquierda al hacer clic derecho.
- Botón "?" en una esquina con un panel de preguntas y respuestas (FAQ) de la herramienta.
- Versionado semver: 1.x.0 = cambios grandes, 1.x.x = arreglos pequeños. Esta será la versión 1.0.0.
- Subir cada versión a GitHub en el repositorio "PromptBlueprint" (flujo tipo app-android-release, pero sin app ni APK).

[Qué hice yo (Opencode)]
- Leí el estado actual (PromptBlueprint.html simple) y cargué las skills `registro` y `app-android-release`.
- Encontré el token de GitHub incrustado en remotes existentes (usuario irvinMartinez2709) para poder crear el repo y publicar.
- Creé este archivo `registro.md` (entrada 1).
- Pendiente: construir el HTML v1.0.0, verificar, crear el repo GitHub "PromptBlueprint" y publicar la versión 1.0.0.

---

### 2

2026-08-13 16:05

[Qué hice yo (Opencode)] — Construcción y publicación de la v1.0.0

- Reescribí `PromptBlueprint.html` (archivo único, sin dependencias) con todas las funciones pedidas:
  - Paleta de elementos con ~40 elementos divididos en 7 secciones por tipo (Básicos, Formularios, Contenedores, Navegación, Medios, Datos, Animaciones).
  - Secciones jerárquicas: crear subsecciones anidadas (Menú → Submenú → Sub-submenú) y reordenarlas arriba/abajo en la paleta; añadir/renombrar/eliminar secciones.
  - Elementos anidables en el lienzo (contenedores) → jerarquía en el JSON exportado.
  - Lienzo redimensionable (mango + campos + presets Escritorio/Tablet/Móvil) y fondo configurable.
  - Modo cuadrícula (12 columnas) ↔ modo libre, con botón "Auto-acomodar".
  - Buscador de elementos (ignora acentos/mayúsculas) y panel izquierdo ocultable.
  - Elementos con animaciones (fade, pulso, giro, rebote, deslizar, brillo de carga) aplicables a cualquier elemento.
  - Editor de propiedades que se abre a la izquierda con clic derecho (texto, colores, borde, esquinas, relleno, fuente, negrita, alineación, opacidad, sombra, tamaño, animación, subir/bajar/desanidar/duplicar/eliminar).
  - Botón "?" con panel FAQ de la herramienta.
  - Exportar JSON (v1.0.0) con lienzo, modo, posición/estilos y subsecciones anidadas; copiar o descargar.
- Corregí bugs durante la verificación: el lienzo no era contenedor de grid (los elementos se renderizaban con altura mínima), el mango se perdía al re-renderizar, y el buscador no ignoraba tildes.
- Verifiqué con Playwright (suite en `C:\Users\irvin\AppData\Local\Temp\opencode\pwtest\pb-test.cjs`): 20/20 tests PASS, sin errores JS.
- Creé `README.md` con la descripción y uso de la herramienta.
- Publiqué en GitHub:
  - Repositorio creado: https://github.com/irvinMartinez2709/PromptBlueprint (rama main).
  - Commit inicial + tag `v1.0.0` y push a main.
  - Release "PromptBlueprint v1.0.0" con el asset `PromptBlueprint.html`:
    https://github.com/irvinMartinez2709/PromptBlueprint/releases/tag/v1.0.0
- Versionado semver acordado: 1.x.0 = cambios grandes; 1.x.x = arreglos pequeños. Cada versión se sube a GitHub.

---

### 3

2026-08-13 16:40

Versión 1.1.0 — Cambios grandes solicitados por el usuario:

1. No tiene que ser todo un solo HTML → reestructuré el proyecto en varios archivos: `index.html`, `css/app.css`, `js/i18n.js`, `js/tipos.js`, `js/app.js`. Eliminé el antiguo `PromptBlueprint.html`.
2. Sliders (scrollbars) en los paneles; secciones de la paleta expandidas por defecto con botón para expandir/colapsar cada una (antes se compactaban y no se veían los elementos).
3. Zoom in/out en el lienzo (botones − / +, porcentaje y "ajustar zoom" para que quepa).
4. Guardar/cargar proyectos (archivo .json que restaura pestañas, elementos, colores e idioma).
5. Sistema de barra de pestañas: múltiples lienzos/secciones editables; los botones/enlaces pueden tener "Destino de navegación" para llevar a otra sección (doble clic en el lienzo navega a la pestaña destino).
6. Panel de ajustes (⚙) para cambiar los colores de la interfaz (fondo, paneles, bordes, texto, acento) en vivo.
7. Sección "Acerca de" en ajustes: "Versión: 1.1.0", "Desarrollado por: Irisny", "Plataforma: Web".
8. Ajustes permite cambiar la herramienta entre español e inglés (toda la interfaz, elementos, FAQ y "Acerca de" se traducen).
9. El panel de propiedades (clic derecho) ahora se abre a la izquierda de la PANTALLA (position fixed), no junto a la paleta.
10. El JSON exportado incluye una sección `instrucciones_para_la_ia` que explica a la IA cómo usar el JSON (mencionado también en el FAQ). El JSON ahora exporta todas las "paginas" (pestañas).

[Qué hice yo (Opencode)]
- Cargué skills `registro`; planifiqué tareas y actualicé versión a 1.1.0.
- Creé los archivos: index.html, css/app.css, js/i18n.js (traducciones ES/EN), js/tipos.js (registro de tipos con etiquetas es/en) y js/app.js (toda la lógica). Borré el viejo PromptBlueprint.html.
- Corregí bugs durante la verificación: colisión de nombres (`const t` local que pisaba la función global de traducción `t()` en chip() y construirDOM()), y título del botón de zoom "−" con carácter Unicode que rompía la selección en el test.
- Verifiqué con Playwright (`pwtest\pb11-test.cjs`): 37/37 checks PASS, sin errores JS.
- Actualicé README.md para v1.1.0.
- Publicar en GitHub: commit, tag `v1.1.0`, push y Release con los archivos (pendiente de ejecutar).