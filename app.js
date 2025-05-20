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
    document.querySelector('.chessboard').style.pointerEvents = 'none';
    document.querySelector('.chessboard').style.opacity = '0.5';
    document.getElementById('turno').style.visibility = 'hidden';

    // Esta función dibuja el estado actual del tablero en el HTML
    function renderTablero() {
        // Recorremos cada casilla del tablero
        tablero.casillas.forEach(casilla => {
            // Buscamos el elemento HTML que corresponde a estas coordenadas
            const square = document.querySelector(
                `.square[data-x="${casilla.columna}"][data-y="${casilla.fila}"]`
            );
            // Si hay una ficha en esta casilla, mostramos su imagen
            if (square && casilla.ficha) {
                // Maneja SVGs como representación de fichas
                if (casilla.ficha.imagen && casilla.ficha.imagen.startsWith('<svg')) {
                    square.innerHTML = casilla.ficha.imagen;
                } else {
                    square.textContent = casilla.ficha.imagen || '';
                }
            } else if (square) {
                // Si no hay ficha, limpiamos el contenido
                square.innerHTML = '';
            }
            // Quitamos cualquier marca visual de seleccion o movimientos posibles
            square.classList.remove('selected');
            square.classList.remove('movible');
        });
    }

    // Función para verificar si hay piezas entre un origen y un destino (para movimientos de alfil, torre, reina)
    function hayFichaEntre(origen, destino) {
        // Calculamos la dirección del movimiento
        let dx = Math.sign(destino.columna - origen.columna);
        let dy = Math.sign(destino.fila - origen.fila);
        // Empezamos desde la casilla siguiente al origen
        let x = origen.columna + dx;
        let y = origen.fila + dy;
        // Recorremos casilla por casilla hasta llegar al destino
        while (x !== destino.columna || y !== destino.fila) {
            // Si hay una ficha en medio, no se puede mover
            if (tablero.casillas.find(c => c.columna === x && c.fila === y && c.ficha)) return true;
            x += dx;
            y += dy;
        }
        // No hay fichas bloqueando el camino
        return false;
    }

    // Verifica si un rey está en jaque (amenazado)
    function reyEnJaque(color) {
        // Primero encontramos dónde está el rey
        const rey = tablero.casillas.find(c => c.ficha && c.ficha.constructor.name === "Rey" && c.ficha.color === color);
        if (!rey) return false; // Si no hay rey (raro pero posible en testing), no hay jaque

        // Verificamos si alguna pieza enemiga puede capturar al rey
        return tablero.casillas.some(c =>
            c.ficha &&
            c.ficha.color !== color &&
            tablero.factory.mover(c.ficha, c, rey, hayFichaEntre)
        );
    }

    // Verifica si algún jugador ha ganado (cuando un rey es comido)
    function hayVictoria() {
        // Buscamos los reyes en el tablero
        const reyBlanco = tablero.casillas.find(c => c.ficha && c.ficha.constructor.name === "Rey" && c.ficha.color === "blanca");
        const reyNegro = tablero.casillas.find(c => c.ficha && c.ficha.constructor.name === "Rey" && c.ficha.color === "negra");

        // Si no está el rey blanco, ganan las negras
        if (!reyBlanco) return "negras";
        // Si no está el rey negro, ganan las blancas
        if (!reyNegro) return "blancas";
        // Si están ambos, nadie ha ganado aún
        return null;
    }

    // Muestra visualmente los movimientos posibles para una pieza seleccionada
    function mostrarMovimientosValidos(casillaSeleccionada) {
        // Limpiamos cualquier marca anterior
        document.querySelectorAll('.square').forEach(sq => {
            sq.classList.remove('movible');
            sq.classList.remove('movible-captura');
        });

        // Si no hay selección o no hay ficha, no hacemos nada
        if (!casillaSeleccionada || !casillaSeleccionada.ficha) return;

        // Verificamos cada casilla del tablero como posible destino
        tablero.casillas.forEach(destino => {
            // Si es un movimiento válido según las reglas de la pieza
            if (
                destino !== casillaSeleccionada && // No es la misma casilla
                tablero.factory.mover(casillaSeleccionada.ficha, casillaSeleccionada, destino, hayFichaEntre)
            ) {
                // Encontramos el elemento HTML correspondiente
                const square = document.querySelector(
                    `.square[data-x="${destino.columna}"][data-y="${destino.fila}"]`
                );
                if (square) {
                    // Aplicamos un estilo distinto si es un movimiento de captura
                    if (destino.ficha && destino.ficha.color !== casillaSeleccionada.ficha.color) {
                        square.classList.add('movible-captura');
                    } else {
                        square.classList.add('movible');
                    }
                }
            }
        });
    }

    // Asigna los eventos click a todas las casillas del tablero
    function asignarEventos() {
        document.querySelectorAll('.square').forEach(square => {
            // Limpiamos cualquier evento anterior para evitar duplicados
            square.onclick = null;

            // Añadimos el evento click
            square.addEventListener('click', () => {
                // Si el juego terminó, ignoramos los clicks
                if (juegoTerminado) return;

                // Obtenemos coordenadas de la casilla clickeada
                const x = parseInt(square.getAttribute('data-x'));
                const y = parseInt(square.getAttribute('data-y'));
                // Encontramos la casilla en nuestro modelo de datos
                const casilla = tablero.casillas.find(c => c.columna === x && c.fila === y);

                // Limpiamos marcas visuales para refrescar
                document.querySelectorAll('.square').forEach(sq => {
                    sq.classList.remove('selected');
                    sq.classList.remove('movible');
                });

                // Si ya habia una selección, intentamos mover
                if (seleccion) {
                    // Si la pieza seleccionada puede moverse a la casilla clickeada
                    if (
                        seleccion.ficha &&
                        tablero.factory.mover(seleccion.ficha, seleccion, casilla, hayFichaEntre)
                    ) {
                        // Movemos la pieza en el modelo de datos
                        casilla.ficha = seleccion.ficha;
                        seleccion.ficha = null;
                        seleccion = null;
                        // Cambiamos el turno
                        turno = turno === 'blanca' ? 'negra' : 'blanca';
                        // Actualizamos visualización y eventos
                        renderTablero();
                        asignarEventos();
                        actualizarTurno();

                        // Verificamos si alguien ganó
                        const ganador = hayVictoria();
                        if (ganador) {
                            juegoTerminado = true;
                            document.getElementById('turno').textContent = `¡Victoria de las ${ganador.charAt(0).toUpperCase() + ganador.slice(1)}!`;
                            document.querySelector('.chessboard').style.pointerEvents = 'none';
                            return;
                        }

                        // Verificamos si el jugador está en jaque
                        if (reyEnJaque(turno)) {
                            document.getElementById('turno').textContent = `¡Jaque a las ${turno === 'blanca' ? 'Blancas' : 'Negras'}!`;
                        }
                    }
                    // Si clickeamos en una pieza del mismo color, la seleccionamos
                    else if (casilla.ficha && casilla.ficha.color === turno) {
                        seleccion = casilla;
                        square.classList.add('selected');
                        mostrarMovimientosValidos(seleccion);
                    }
                    // Si clickeamos en otro lado, cancelamos la seleccion
                    else {
                        seleccion = null;
                    }
                }
                // Si no había selección y clickeamos en una pieza de nuestro color
                else if (casilla.ficha && casilla.ficha.color === turno) {
                    seleccion = casilla;
                    square.classList.add('selected');
                    mostrarMovimientosValidos(seleccion);
                }
            });
        });
    }

    // Actualiza el indicador de turno en la interfaz
    function actualizarTurno() {
        if (juegoTerminado) return;
        const turnoElem = document.getElementById('turno');
        if (turnoElem) {
            turnoElem.textContent = `Turno: ${turno === 'blanca' ? 'Blancas' : 'Negras'}`;
        }
    }

    // Evento para el botón "Jugar" - inicia una nueva partida
    document.getElementById('iniciar_juego').addEventListener('click', () => {
        tablero = new Tablero(); // Creamos un nuevo tablero con las piezas en posición inicial
        seleccion = null;
        turno = 'blanca';
        juegoTerminado = false;
        renderTablero();
        asignarEventos();
        actualizarTurno();
        // Activamos el tablero y lo mostramos claramente
        document.querySelector('.chessboard').style.pointerEvents = 'auto';
        document.querySelector('.chessboard').style.opacity = '1';
        document.getElementById('turno').style.visibility = 'visible';
        // Ocultamos el botón "Jugar" y mostramos "Reiniciar"
        document.getElementById('iniciar_juego').style.display = 'none';
        document.getElementById('reiniciar_juego').style.display = 'inline-block';
    });

    // Evento para el botón "Reiniciar" - reinicia la partida actual
    document.getElementById('reiniciar_juego').addEventListener('click', () => {
        tablero = new Tablero();
        seleccion = null;
        turno = 'blanca';
        juegoTerminado = false;
        renderTablero();
        asignarEventos();
        actualizarTurno();
        document.querySelector('.chessboard').style.pointerEvents = 'auto';
        document.querySelector('.chessboard').style.opacity = '1';
    });

    // Ocultamos el botón "Reiniciar" al inicio
    document.getElementById('reiniciar_juego').style.display = 'none';
});