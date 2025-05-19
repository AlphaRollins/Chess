import FichaFactory from "./FichaFactory.js";
import Casilla from "./Casilla.js";

class Tablero {
    constructor() {
        this.factory = new FichaFactory();
        this.casillas = [];
        this.inicializar();
    }

    inicializar() {
        this.casillas = [];
        for (let fila = 0; fila < 8; fila++) {
            for (let columna = 0; columna < 8; columna++) {
                let ficha = null;
                if (fila < 2 || fila > 5) {
                    ficha = this.factory.crearProducto(fila, columna);
                }   
                this.casillas.push(new Casilla(fila, columna, ficha));
            }
        }
    }
}

export default Tablero;