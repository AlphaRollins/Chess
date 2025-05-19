import Tablero from "./clases/Tablero.js";

document.addEventListener('DOMContentLoaded', () => {
    let tablero;
    let seleccion = null;
    let turno = 'blanca';
    let juegoTerminado = false;

    document.querySelector('.chessboard').style.pointerEvents = 'none';
    document.querySelector('.chessboard').style.opacity = '0.5';
    document.getElementById('turno').style.visibility = 'hidden';

    function renderTablero() {
        tablero.casillas.forEach(casilla => {
            const square = document.querySelector(
                `.square[data-x="${casilla.columna}"][data-y="${casilla.fila}"]`
            );
            if (square && casilla.ficha) {
                if (casilla.ficha.imagen && casilla.ficha.imagen.startsWith('<svg')) {
                    square.innerHTML = casilla.ficha.imagen;
                } else {
                    square.textContent = casilla.ficha.imagen || '';
                }
            } else if (square) {
                square.innerHTML = '';
            }
            square.classList.remove('selected');
            square.classList.remove('movible');
        });
    }

    function hayFichaEntre(origen, destino) {
        let dx = Math.sign(destino.columna - origen.columna);
        let dy = Math.sign(destino.fila - origen.fila);
        let x = origen.columna + dx;
        let y = origen.fila + dy;
        while (x !== destino.columna || y !== destino.fila) {
            if (tablero.casillas.find(c => c.columna === x && c.fila === y && c.ficha)) return true;
            x += dx;
            y += dy;
        }
        return false;
    }

    function reyEnJaque(color) {
        const rey = tablero.casillas.find(c => c.ficha && c.ficha.constructor.name === "Rey" && c.ficha.color === color);
        if (!rey) return false;
        return tablero.casillas.some(c =>
            c.ficha &&
            c.ficha.color !== color &&
            tablero.factory.mover(c.ficha, c, rey, hayFichaEntre)
        );
    }

    function hayVictoria() {
        const reyBlanco = tablero.casillas.find(c => c.ficha && c.ficha.constructor.name === "Rey" && c.ficha.color === "blanca");
        const reyNegro = tablero.casillas.find(c => c.ficha && c.ficha.constructor.name === "Rey" && c.ficha.color === "negra");
        if (!reyBlanco) return "negras";
        if (!reyNegro) return "blancas";
        return null;
    }

    function mostrarMovimientosValidos(casillaSeleccionada) {
        document.querySelectorAll('.square').forEach(sq => {
            sq.classList.remove('movible');
            sq.classList.remove('movible-captura');
        });
        if (!casillaSeleccionada || !casillaSeleccionada.ficha) return;
        tablero.casillas.forEach(destino => {
            if (
                destino !== casillaSeleccionada &&
                tablero.factory.mover(casillaSeleccionada.ficha, casillaSeleccionada, destino, hayFichaEntre)
            ) {
                const square = document.querySelector(
                    `.square[data-x="${destino.columna}"][data-y="${destino.fila}"]`
                );
                if (square) {
                    if (destino.ficha && destino.ficha.color !== casillaSeleccionada.ficha.color) {
                        square.classList.add('movible-captura');
                    } else {
                        square.classList.add('movible');
                    }
                }
            }
        });
    }

    function asignarEventos() {
        document.querySelectorAll('.square').forEach(square => {
            square.onclick = null;
            square.addEventListener('click', () => {
                if (juegoTerminado) return;
                const x = parseInt(square.getAttribute('data-x'));
                const y = parseInt(square.getAttribute('data-y'));
                const casilla = tablero.casillas.find(c => c.columna === x && c.fila === y);

                document.querySelectorAll('.square').forEach(sq => {
                    sq.classList.remove('selected');
                    sq.classList.remove('movible');
                });

                if (seleccion) {
                    if (
                        seleccion.ficha &&
                        tablero.factory.mover(seleccion.ficha, seleccion, casilla, hayFichaEntre)
                    ) {
                        casilla.ficha = seleccion.ficha;
                        seleccion.ficha = null;
                        seleccion = null;
                        turno = turno === 'blanca' ? 'negra' : 'blanca';
                        renderTablero();
                        asignarEventos();
                        actualizarTurno();

                        const ganador = hayVictoria();
                        if (ganador) {
                            juegoTerminado = true;
                            document.getElementById('turno').textContent = `¡Victoria de las ${ganador.charAt(0).toUpperCase() + ganador.slice(1)}!`;
                            document.querySelector('.chessboard').style.pointerEvents = 'none';
                            return;
                        }

                        if (reyEnJaque(turno)) {
                            document.getElementById('turno').textContent = `¡Jaque a las ${turno === 'blanca' ? 'Blancas' : 'Negras'}!`;
                        }
                    } else if (casilla.ficha && casilla.ficha.color === turno) {
                        seleccion = casilla;
                        square.classList.add('selected');
                        mostrarMovimientosValidos(seleccion);
                    } else {
                        seleccion = null;
                    }
                } else if (casilla.ficha && casilla.ficha.color === turno) {
                    seleccion = casilla;
                    square.classList.add('selected');
                    mostrarMovimientosValidos(seleccion);
                }
            });
        });
    }

    function actualizarTurno() {
        if (juegoTerminado) return;
        const turnoElem = document.getElementById('turno');
        if (turnoElem) {
            turnoElem.textContent = `Turno: ${turno === 'blanca' ? 'Blancas' : 'Negras'}`;
        }
    }

    document.getElementById('iniciar_juego').addEventListener('click', () => {
        tablero = new Tablero();
        seleccion = null;
        turno = 'blanca';
        juegoTerminado = false;
        renderTablero();
        asignarEventos();
        actualizarTurno();
        document.querySelector('.chessboard').style.pointerEvents = 'auto';
        document.querySelector('.chessboard').style.opacity = '1';
        document.getElementById('turno').style.visibility = 'visible';
        document.getElementById('iniciar_juego').style.display = 'none';
        document.getElementById('reiniciar_juego').style.display = 'inline-block';
    });

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

    document.getElementById('reiniciar_juego').style.display = 'none';
});