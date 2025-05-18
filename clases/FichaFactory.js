import Caballo from "./Caballo.js";
import Torre from "./Torre.js";
import Alfil from "./Alfil.js";
import Reina from "./Reina.js";
import Rey from "./Rey.js";
import Peon from "./Peon.js";

class FichaFactory {
    TIPOS = [
        'torre',
        'caballo',
        'alfil',
        'reina',
        'rey',
        'alfil',
        'caballo',
        'torre'
    ]

    constructor() { }

    crearProducto(fila, columna) {
        let tipo = this.obtenerTipo(fila, columna)
        let color = (fila < 2) ? 'negra' : 'blanca';

        switch (tipo) {
            case 'torre':
                return new Torre(color);
            case 'caballo':
                return new Caballo(color);
            case 'alfil':
                return new Alfil(color);
            case 'reina':
                return new Reina(color);
            case 'rey':
                return new Rey(color);
            case 'peon':
                return new Peon(color);
        }
    }

    obtenerTipo(fila, columna) {
        return fila === 1 || fila === 6
            ? 'peon'
            : this.TIPOS[columna]
    }

    mover(ficha, origen, destino, hayFichaEntre) {
        if (!ficha) return false;
        if (destino.ficha && destino.ficha.color === ficha.color) return false;

        const dx = destino.columna - origen.columna;
        const dy = destino.fila - origen.fila;
        const tipo = ficha.constructor.name;

        if (tipo === "Peon") {
            let dir = ficha.color === 'blanca' ? -1 : 1;
            let filaInicial = ficha.color === 'blanca' ? 6 : 1;
            if (
                dx === 0 &&
                !destino.ficha &&
                ((origen.fila + dir === destino.fila) ||
                (origen.fila === filaInicial && origen.fila + 2*dir === destino.fila && !hayFichaEntre(origen, destino)))
            ) return true;
            if (
                Math.abs(dx) === 1 &&
                origen.fila + dir === destino.fila &&
                destino.ficha &&
                destino.ficha.color !== ficha.color
            ) return true;
            return false;
        }

        if (tipo === "Torre") {
            if (dx === 0 || dy === 0) return !hayFichaEntre(origen, destino);
            return false;
        }

        if (tipo === "Caballo") {
            return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
        }

        if (tipo === "Alfil") {
            return Math.abs(dx) === Math.abs(dy) && !hayFichaEntre(origen, destino);
        }

        if (tipo === "Reina") {
            return ((dx === 0 || dy === 0) || (Math.abs(dx) === Math.abs(dy))) && !hayFichaEntre(origen, destino);
        }

        if (tipo === "Rey") {
            return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
        }

        return false;
    }
}

export default FichaFactory