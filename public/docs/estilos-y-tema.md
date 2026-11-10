# Sistema de estilos del estudio oscuro

La interfaz utiliza CSS nativo y fuentes locales; ya no carga Tailwind ni Material Symbols desde un CDN. El sistema aprobado está documentado en `DESIGN.md` en la raíz del repositorio.

## Archivos activos

- `src/shared/styles/main.css`: importa tipografía y tokens/layout del estudio.
- `src/shared/styles/studio.css`: superficies, controles, foco, avisos de dispositivo y estado de carga.
- Los archivos CSS de cada Web Component definen sus propios controles y regiones. Se usa DOM ligero; los selectores deben tener un alcance explícito.
- `typography.css`: conserva Poppins local. IBM Plex Mono se declara en `studio.css`, con su licencia junto al archivo de fuente.

## Tokens

| Rol | Valor |
| --- | --- |
| Fondo / superficie / selección | `#000000` / `#111111` / `#282828` |
| Texto / secundario / metadatos | `#F4F4F4` / `#B4B4B4` / `#949494` |
| Datos procesados | `#88B5FF` |
| Separadores | `#292929` |
| Acción principal | `#F0F0F0` con texto oscuro |

El estudio es exclusivamente oscuro: no ofrece selector de tema. `ThemeManager` permanece como utilidad heredada y no decide la apariencia del estudio; el arranque aplica el modo oscuro sin reescribir la preferencia almacenada. Los estilos antiguos de vidrio y layout ya no se importan.

## Adaptación y accesibilidad

Escritorio y tablet horizontal conservan imágenes e inspector. Tablet vertical solicita rotación; teléfono solicita una pantalla mayor y escritorio estrecho solicita maximizar. `ScreenGuard` usa geometría y capacidad táctil. No se habilita procesamiento móvil.

Los controles tienen foco visible; los diálogos contienen el foco y lo devuelven al cerrarse. Las gráficas no animan datos y ofrecen tablas de frecuencias. `prefers-reduced-motion` elimina movimiento opcional. Los valores numéricos usan IBM Plex Mono; los textos de interfaz, Poppins.
