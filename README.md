# El Impostor (Angular) — modo offline

Proyecto Angular listo para abrir en VSCode.

## Requisitos
- Node.js 18+ (recomendado 20+)
- npm

## Instalación
```bash
npm install
```

## Ejecutar
```bash
npm start
```
Luego abre: http://localhost:4200

## Qué incluye
- Login/Registro **offline** (se guarda en `localStorage`).
- Menú (offline / instrucciones / online desactivado).
- Modo offline completo:
  - crear jugadores (alias)
  - elegir palabra (lista o personalizada)
  - reparto de roles en un dispositivo con modal
  - orden aleatorio de turno (el impostor nunca empieza)
  - resultado de ronda (descubierto / sobrevive)
  - el impostor gana si sobrevive **2 rondas seguidas**

## Notas
- No hay backend ni base de datos en esta versión.
- Todo el estado se guarda en `localStorage` bajo claves `ei.*`.
