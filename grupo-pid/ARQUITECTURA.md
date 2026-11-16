# Grupo PID — Mapa de navegación y estructura de componentes

## 1. Arquitectura de marca

```
GRUPO PID  (marca corporativa · verde + grafito)
├── PID AGUA              (azul + blanco)       depósitos, tratamiento de agua, depuradoras, mantenimiento
├── PULTRUSIÓN CANARIAS   (naranja + amarillo)  perfiles y estructuras en PRFV
└── PISCINAS OPTIMUS      (azul intenso)        modelos de piscinas
```

Cada página lleva `data-tema="grupo|agua|pultrusion|optimus"` en `<body>`: el tema cambia los colores de acento,
el fondo de la cabecera de sección y el logotipo que se muestra. La cabecera y el pie son siempre de Grupo PID
(grafito), para que el paraguas corporativo esté presente en todas las páginas.

## 2. Mapa de navegación (URLs definitivas)

```
/                                              Inicio · Grupo PID
│
├── /pid-agua/                                 PID Agua (portada de división)
│   ├── /pid-agua/depositos-prfv/              A. Depósitos de fibra PRFV (categoría)
│   │   ├── …/depositos-horizontales/
│   │   ├── …/depositos-verticales/
│   │   ├── …/depositos-enterrados/
│   │   └── …/depositos-superficie/
│   ├── /pid-agua/tanques-modulares/           B. Tanques modulares de gran capacidad
│   ├── /pid-agua/fosas-septicas/              C. Fosas sépticas (categoría)
│   │   ├── …/fosas-septicas-compactas/
│   │   └── …/fosas-septicas-biologicas/
│   ├── /pid-agua/depuradoras/                 D. Depuradoras de aguas residuales
│   └── /pid-agua/mantenimiento-depuradoras/   E. Mantenimiento de depuradoras
│
├── /pultrusion-canarias/                      Pultrusión Canarias (tecnología, ventajas, aplicaciones, formulario)
│   ├── /pultrusion-canarias/perfiles-prfv/
│   ├── /pultrusion-canarias/estructuras-prfv/
│   └── (categorías 3 y 4 preparadas, sin página hasta tener contenido)
│
├── /piscinas-optimus/                         Piscinas Optimus (catálogo de 8 espacios)
│   ├── /piscinas-optimus/modelo-1/ … /modelo-7/   (renombrar la URL cuando se conozca el nombre real)
│   └── /piscinas-optimus/categoria-adicional/
│
├── /proyectos/                                Galería filtrable por división
├── /sobre-grupo-pid/                          Empresa, áreas de actividad, cifras
├── /contacto/                                 Formulario completo (?division=…&producto=… lo rellena)
├── /aviso-legal/ · /privacidad/ · /cookies/   Textos legales (pendientes)
└── /404.html
```

**Menú principal:** Inicio · PID Agua ▾ · Pultrusión Canarias ▾ · Piscinas Optimus ▾ · Proyectos · Sobre Grupo PID · Contacto · [Solicitar presupuesto]
Los desplegables se generan solos a partir del catálogo; en móvil se convierten en acordeones dentro de un panel lateral.

## 3. Componentes (en `src/build.mjs`, sección «Componentes»)

| Componente | Uso |
|---|---|
| `head()` | `<title>`, metadescripción, canonical, Open Graph, verificación de Search Console, JSON-LD |
| `cabecera()` | Logo Grupo PID, menú con desplegables (mega menú en PID Agua), botón de presupuesto, menú móvil |
| `pie()` | Las tres marcas, enlaces, datos de contacto (o aviso de pendiente), legales |
| `migas()` | Ruta de navegación + JSON-LD `BreadcrumbList` |
| `foto()` | `<img>` optimizada (lazy, ancho/alto) o marcador «Fotografía pendiente» si no hay imagen |
| `tarjetaDivision()` | Bloque grande de la portada: logo, descripción, productos, «Descubrir soluciones» |
| `tarjetaProducto()` | Tarjeta de catálogo (foto, nombre, resumen, enlace) |
| `cifras()` | Datos de Grupo PID; valores vacíos se muestran como «Dato pendiente» |
| `galeria()` | Rejilla de fotos con visor ampliado; filtrable por división en /proyectos/ |
| `fichaProducto()` | Plantilla común de las 9 secciones (foto, nombre, descripción, aplicaciones, especificaciones, galería, documentación, FAQ, presupuesto) |
| `formulario()` | División → producto dependientes, datos de contacto, descripción, adjuntos, privacidad |
| `ctaBanda()` | «¿Qué solución necesita tu proyecto?» |
| `pendiente()` | Etiqueta visible de contenido provisional (se oculta con `modoRevision: false`) |

## 4. Gestión de contenidos

Todo el contenido está en `content/*.json`; las páginas se generan con `node src/build.mjs` → carpeta `dist/`
(HTML estático: rápido, indexable y sin base de datos). Añadir un producto = añadir un objeto al JSON y sus fotos
a `src/static/img/`. Ver `LEEME.md`.
