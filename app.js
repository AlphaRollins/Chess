// Importamos la clase Tablero desde otro archivo - esto es un patrón modular que ayuda a organizar el código
import Tablero from "./clases/Tablero.js";

// Esperamos a que el DOM esté completamente cargado para no tener problemas con elementos que no existan todavía
document.addEventListener('DOMContentLoaded', () => {
    // Variables principales del juego
    let tablero;         // Objeto que maneja la lógica del tablero
    let seleccion = null; // Guarda la casilla que el jugador ha seleccionado
    let turno = 'blanca'; // Control de turno (blancas o negras)
    let juegoTerminado = false; // Flag para saber si el juego terminó

    // Deshabilitamos el tablero al inicio para que no se pueda jugar hasta que se presione "Jugar"
    // Esto implementa el patrón de "Estado Inicial Seguro" donde la UI comienza en un estado controlado
    document.querySelector('.chessboard').style.pointerEvents = 'none';
    document.querySelector('.chessboard').style.opacity = '0.5';
    document.getElementById('turno').style.visibility = 'hidden';

    // Esta función implementa el patrón "Renderizado desde Modelo" donde la UI se actualiza
    // completamente basándose en el estado del modelo de datos (tablero)
    function renderTablero() {
        // Iteramos sobre cada casilla del modelo usando el método Array.forEach
        tablero.casillas.forEach(casilla => {
            // Usamos selectores CSS avanzados para encontrar el elemento DOM correspondiente
            // mediante los atributos data-* que funcionan como identificadores únicos
            const square = document.querySelector(
                `.square[data-x="${casilla.columna}"][data-y="${casilla.fila}"]`
            );

            // Implementación del patrón "Estado Condicional" donde el contenido
            // depende del estado de la casilla (si tiene ficha o no)
            if (square && casilla.ficha) {
                // Manejo especial para SVGs, reconociendo el tipo de contenido
                // Esto permite flexibilidad en la representación visual
                if (casilla.ficha.imagen && casilla.ficha.imagen.startsWith('<svg')) {
                    square.innerHTML = casilla.ficha.imagen;
                } else {
                    square.textContent = casilla.ficha.imagen || '';
                }
            } else if (square) {
                // Limpieza de elementos vacíos para mantener el DOM limpio
                square.innerHTML = '';
            }

            // Reseteo de clases CSS para evitar estados visuales inconsistentes
            // Esto es parte del patrón "UI Determinista"
            square.classList.remove('selected');
            square.classList.remove('movible');
        });
    }

    // Algoritmo de "Detección de Colisiones" para piezas que no pueden saltar otras
    // Implementa un recorrido lineal entre dos puntos usando incrementos unitarios
    function hayFichaEntre(origen, destino) {
        // Cálculo de dirección usando la función Math.sign que devuelve -1, 0 o 1
        // Esta es una forma elegante de obtener la dirección del movimiento
        let dx = Math.sign(destino.columna - origen.columna);
        let dy = Math.sign(destino.fila - origen.fila);

        // Empezamos en la primera casilla después del origen para evitar contar la pieza misma
        let x = origen.columna + dx;
        let y = origen.fila + dy;

        // Búsqueda lineal utilizando un bucle while con condición compuesta
        while (x !== destino.columna || y !== destino.fila) {
            // Usamos Array.find como una búsqueda eficiente en el array de casillas
            // Retornamos true inmediatamente si encontramos una obstrucción
            if (tablero.casillas.find(c => c.columna === x && c.fila === y && c.ficha)) return true;
            // Avanzamos a la siguiente casilla en la dirección calculada
            x += dx;
            y += dy;
        }
        // Si completamos el recorrido sin encontrar obstáculos, el camino está libre
        return false;
    }

    // Implementación de una regla básica del ajedrez: detección de jaque
    // Utiliza un enfoque de "fuerza bruta optimizada" verificando todas las piezas enemigas
    function reyEnJaque(color) {
        // Primero localizamos el rey usando reflection (constructor.name) y filtrado
        const rey = tablero.casillas.find(c =>
            c.ficha &&
            c.ficha.constructor.name === "Rey" &&
            c.ficha.color === color
        );

        // Manejo de caso borde (aunque raro en un juego normal)
        if (!rey) return false;

        // Uso del método Array.some que devuelve true si algún elemento cumple la condición
        // Esto es más eficiente que filter+length ya que se detiene en la primera coincidencia
        return tablero.casillas.some(c =>
            c.ficha &&
            c.ficha.color !== color &&
            // Delegamos la verificación de movimiento a la factory, siguiendo el principio de responsabilidad única
            tablero.factory.mover(c.ficha, c, rey, hayFichaEntre)
        );
    }

    // Detección de condición de victoria basada en la presencia de reyes
    // Implementa el patrón "Estado de Juego" verificando una condición terminal
    function hayVictoria() {
        // Búsqueda por filtrado con criterios múltiples
        const reyBlanco = tablero.casillas.find(c =>
            c.ficha &&
            c.ficha.constructor.name === "Rey" &&
            c.ficha.color === "blanca"
        );
        const reyNegro = tablero.casillas.find(c =>
            c.ficha &&
            c.ficha.constructor.name === "Rey" &&
            c.ficha.color === "negra"
        );

        // Lógica condicional simple que determina al ganador
        // basándose en la ausencia de un rey (capturado)
        if (!reyBlanco) return "negras";
        if (!reyNegro) return "blancas";

        // Retorno nulo indica que el juego continúa
        return null;
    }

    // Implementación visual de ayuda al usuario mostrando movimientos posibles
    // Esto mejora la usabilidad siguiendo el principio de "Feedback Inmediato"
    function mostrarMovimientosValidos(casillaSeleccionada) {
        // Limpieza de estado visual previo usando querySelectorAll para obtener todos los elementos
        document.querySelectorAll('.square').forEach(sq => {
            sq.classList.remove('movible');
            sq.classList.remove('movible-captura');
        });

        // Verificación de precondición para evitar procesamiento innecesario
        if (!casillaSeleccionada || !casillaSeleccionada.ficha) return;

        // Análisis exhaustivo de todas las casillas como destinos potenciales
        tablero.casillas.forEach(destino => {
            // Validación compuesta de movimiento:
            // 1. No es la misma casilla
            // 2. El movimiento es válido según las reglas de la pieza
            if (
                destino !== casillaSeleccionada &&
                tablero.factory.mover(casillaSeleccionada.ficha, casillaSeleccionada, destino, hayFichaEntre)
            ) {
                // Localización del elemento DOM correspondiente usando selectores data-*
                const square = document.querySelector(
                    `.square[data-x="${destino.columna}"][data-y="${destino.fila}"]`
                );

                if (square) {
                    // Diferenciación visual entre movimiento normal y captura
                    // Esto mejora la UX al proporcionar información contextual
                    if (destino.ficha && destino.ficha.color !== casillaSeleccionada.ficha.color) {
                        square.classList.add('movible-captura');
                    } else {
                        square.classList.add('movible');
                    }
                }
            }
        });
    }

    // Configuración de la interactividad del tablero usando eventos
    // Implementa el patrón "Delegación de Eventos" a nivel de casillas
    function asignarEventos() {
        // Seleccionamos todas las casillas para asignar eventos
        document.querySelectorAll('.square').forEach(square => {
            // Eliminamos eventos previos para evitar duplicación
            // Esto es crucial al reiniciar o actualizar el juego
            square.onclick = null;

            // Asignamos el nuevo manejador de eventos
            square.addEventListener('click', () => {
                // Verificación de estado de juego como guardia
                if (juegoTerminado) return;

                // Extracción de datos del DOM y conversión a enteros
                // Los atributos data-* se recuperan como strings
                const x = parseInt(square.getAttribute('data-x'));
                const y = parseInt(square.getAttribute('data-y'));

                // Mapeo del elemento DOM a su correspondiente objeto en el modelo
                const casilla = tablero.casillas.find(c => c.columna === x && c.fila === y);

                // Reseteo visual como preparación para actualización
                document.querySelectorAll('.square').forEach(sq => {
                    sq.classList.remove('selected');
                    sq.classList.remove('movible');
                });

                // LÓGICA PRINCIPAL DEL JUEGO: Manejo de selección y movimiento
                // Implementa una máquina de estados simple con dos estados principales:
                // 1. Con selección previa: intentar mover o cambiar selección
                // 2. Sin selección: seleccionar pieza propia

                if (seleccion) {
                    // CASO 1: Intento de movimiento con pieza ya seleccionada
                    if (
                        seleccion.ficha &&
                        tablero.factory.mover(seleccion.ficha, seleccion, casilla, hayFichaEntre)
                    ) {
                        // Ejecución del movimiento en el modelo de datos
                        // Esto sigue el patrón "Modelo Primero, UI Después"
                        casilla.ficha = seleccion.ficha;
                        seleccion.ficha = null;
                        seleccion = null;

                        // Cambio de turno usando operador ternario para alternancia
                        turno = turno === 'blanca' ? 'negra' : 'blanca';

                        // Actualización de UI y estado
                        renderTablero();
                        asignarEventos();
                        actualizarTurno();

                        // Verificación de condición de victoria
                        const ganador = hayVictoria();
                        if (ganador) {
                            // Manejo de fin de juego con actualización de UI
                            juegoTerminado = true;
                            document.getElementById('turno').textContent = `¡Victoria de las ${ganador.charAt(0).toUpperCase() + ganador.slice(1)}!`;
                            document.querySelector('.chessboard').style.pointerEvents = 'none';
                            return;
                        }

                        // Verificación y notificación de jaque
                        if (reyEnJaque(turno)) {
                            document.getElementById('turno').textContent = `¡Jaque a las ${turno === 'blanca' ? 'Blancas' : 'Negras'}!`;
                        }
                    }
                    // CASO 2: Cambio de selección a otra pieza propia
                    else if (casilla.ficha && casilla.ficha.color === turno) {
                        seleccion = casilla;
                        square.classList.add('selected');
                        mostrarMovimientosValidos(seleccion);
                    }
                    // CASO 3: Cancelación de selección
                    else {
                        seleccion = null;
                    }
                }
                // CASO 4: Primera selección (sin selección previa)
                else if (casilla.ficha && casilla.ficha.color === turno) {
                    seleccion = casilla;
                    square.classList.add('selected');
                    mostrarMovimientosValidos(seleccion);
                }
            });
        });
    }

    // Actualización de la información de turno en la UI
    // Implementa el patrón "Vista sincronizada con Modelo"
    function actualizarTurno() {
        // Verificación de precondición
        if (juegoTerminado) return;

        // Acceso al elemento DOM y actualización condicional de contenido
        const turnoElem = document.getElementById('turno');
        if (turnoElem) {
            turnoElem.textContent = `Turno: ${turno === 'blanca' ? 'Blancas' : 'Negras'}`;
        }
    }

    // Configuración del botón de inicio de juego
    // Implementa el patrón "Controlador de Acción" vinculando un evento a una secuencia de acciones
    document.getElementById('iniciar_juego').addEventListener('click', () => {
        // Inicialización del estado del juego creando una nueva instancia
        // Este es un ejemplo claro del uso de clases y objetos en JS
        tablero = new Tablero();
        seleccion = null;
        turno = 'blanca';
        juegoTerminado = false;

        // Secuencia de actualización de UI
        renderTablero();
        asignarEventos();
        actualizarTurno();

        // Activación visual y funcional del tablero
        document.querySelector('.chessboard').style.pointerEvents = 'auto';
        document.querySelector('.chessboard').style.opacity = '1';
        document.getElementById('turno').style.visibility = 'visible';

        // Alternancia de botones para la fase de juego
        document.getElementById('iniciar_juego').style.display = 'none';
        document.getElementById('reiniciar_juego').style.display = 'inline-block';
    });

    // Configuración del botón de reinicio
    // Similar al inicio pero preservando el estado de la UI
    document.getElementById('reiniciar_juego').addEventListener('click', () => {
        // Reinicialización del estado del juego
        tablero = new Tablero();
        seleccion = null;
        turno = 'blanca';
        juegoTerminado = false;

        // Actualización de UI
        renderTablero();
        asignarEventos();
        actualizarTurno();

        // Aseguramos que el tablero esté activado
        document.querySelector('.chessboard').style.pointerEvents = 'auto';
        document.querySelector('.chessboard').style.opacity = '1';
    });

    // Configuración inicial ocultando el botón de reinicio
    // Esto implementa el estado inicial consistente
    document.getElementById('reiniciar_juego').style.display = 'none';
});