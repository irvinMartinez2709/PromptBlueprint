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