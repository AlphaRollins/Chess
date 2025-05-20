# Proyecto de Ajedrez en JavaScript

Aajedrez HTML, CSS y JavaScript. Estructura del código y cómo funcionan las diferentes partes.

## Estructura del Proyecto

La aplicación sigue una arquitectura modular y utiliza patrones de diseño para organizar el código de manera eficiente:

```
├── index.html          # Página principal que muestra el tablero
├── style.css           # Estilos CSS para el tablero y piezas
├── app.js              # Punto de entrada y controlador principal
└── clases/
    ├── Tablero.js      # Maneja el estado general del tablero
    ├── Casilla.js      # Representa una casilla individual
    ├── FichaFactory.js # Fábrica para crear piezas de ajedrez
    ├── Alfil.js        # Implementación de la pieza Alfil
    ├── Caballo.js      # Implementación de la pieza Caballo
    ├── Peon.js         # Implementación de la pieza Peón
    ├── Reina.js        # Implementación de la pieza Reina
    ├── Rey.js          # Implementación de la pieza Rey
    └── Torre.js        # Implementación de la pieza Torre
```

## Flujo de Ejecución

1. El usuario carga la página `index.html`
2. Se ejecuta `app.js` cuando el DOM está completamente cargado
3. Al hacer clic en "Jugar", se crea una instancia de `Tablero`
4. `Tablero` utiliza `FichaFactory` para crear las piezas
5. `FichaFactory` instancia los objetos específicos (Peon, Torre, etc.)
6. El usuario interactúa con el tablero haciendo clic en las casillas
7. La lógica en `app.js` maneja la selección y movimiento de piezas

## Componentes Principales

### app.js

Este es el **controlador principal** del juego que coordina todo:

- Inicializa el tablero cuando se hace clic en "Jugar"
- Maneja la selección de piezas y movimientos
- Valida los movimientos utilizando la lógica de `FichaFactory`
- Actualiza la interfaz de usuario después de cada movimiento
- Detecta situaciones de jaque y victoria
- Gestiona los turnos entre jugadores

Funciones importantes:

- `renderTablero()`: Actualiza la visualización del tablero basado en el estado interno
- `hayFichaEntre()`: Verifica si hay piezas entre un origen y un destino
- `reyEnJaque()`: Detecta si un rey está en jaque
- `hayVictoria()`: Verifica si hay un ganador
- `mostrarMovimientosValidos()`: Muestra visualmente los movimientos posibles
- `asignarEventos()`: Configura los eventos de clic en cada casilla

### Tablero.js

Representa el **estado completo del tablero** de ajedrez:

- Crea una matriz de 8x8 casillas
- Inicializa las piezas en sus posiciones iniciales
- Almacena referencias a todas las casillas

En términos de lógica:

- Implementa el patrón Composite al actuar como contenedor de casillas
- Centraliza el estado del juego en un único objeto
- Delega la creación de piezas a FichaFactory (Inyección de Dependencias)

### Casilla.js

Esta clase simple pero fundamental representa **cada posición individual** en el tablero:

- Almacena coordenadas (fila, columna)
- Mantiene referencia a la pieza que ocupa la casilla (si hay alguna)
- Actúa como un Value Object que vincula piezas con posiciones

A nivel de lógica, proporciona una abstracción clara para la relación entre posiciones y piezas.

### FichaFactory.js

Este componente es el **cerebro del juego**, ya que:

- Implementa el patrón Factory Method para crear diferentes tipos de piezas
- Contiene toda la lógica de movimiento para cada tipo de pieza
- Valida si un movimiento es legal según las reglas del ajedrez

La función `mover()` es particularmente importante porque:

- Centraliza las reglas para cada tipo de pieza
- Implementa las restricciones de movimiento específicas
- Maneja casos especiales como el movimiento inicial de peones
- Verifica que no haya piezas bloqueando el camino

Desglose de las reglas de movimiento:

- **Peón**: Avanza 1 casilla (o 2 desde posición inicial) y captura en diagonal
- **Torre**: Movimiento recto (horizontal o vertical)
- **Caballo**: Movimiento en L (2+1 o 1+2 casillas)
- **Alfil**: Movimiento diagonal
- **Reina**: Combinación de torre y alfil
- **Rey**: 1 casilla en cualquier dirección

## Patrones de Diseño Implementados

1. **Factory Method**: En `FichaFactory` para crear diferentes tipos de piezas sin especificar la clase exacta.
2. **Composite**: El tablero funciona como un contenedor para un conjunto de casillas.
3. **Strategy**: La validación de movimientos usa diferentes estrategias según el tipo de pieza.
4. **Inyección de Dependencias**: El tablero recibe una fábrica de piezas en lugar de crear piezas directamente.

## Flujo de Interacción de Usuario

1. El usuario presiona "Jugar" para iniciar una partida
2. El tablero se renderiza con las piezas en posición inicial
3. Para mover, el usuario:
   - Hace clic en una pieza (se resalta la selección)
   - Se muestran los movimientos válidos
   - Hace clic en la casilla destino
4. Si el movimiento es válido:
   - La pieza se mueve
   - El turno cambia al otro jugador
   - Se verifica jaque o victoria
5. El juego continúa hasta que un rey es capturado

## Aspectos Técnicos Destacables

- **Modularidad**: Cada clase tiene una responsabilidad bien definida
- **Encapsulación**: Las reglas de juego están centralizadas en la fábrica
- **Reutilización**: La función `hayFichaEntre()` se usa para varios tipos de piezas
- **Separación visual/lógica**: La representación visual está separada del modelo de datos
- **Manipulación del DOM eficiente**: Solo se actualizan los elementos necesarios
