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