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
        let color = (fila > 5) ? 'blanca' : 'negra';

        let ficha;
        switch (tipo) {
            case 'torre':
                ficha = new Torre(color); break;
            case 'caballo':
                ficha = new Caballo(color); break;
            case 'alfil':
                ficha = new Alfil(color); break;
            case 'reina':
                ficha = new Reina(color); break;
            case 'rey':
                ficha = new Rey(color); break;
            case 'peon':
                ficha = new Peon(color); break;
        }
        if (ficha && ficha.imagen) {
            ficha.imagen = this.estilizarSVG(ficha.imagen, color);
        }
        return ficha;
    }

    estilizarSVG(svg, color) {
        let clase = color === 'blanca' ? 'pieza-blanca' : 'pieza-negra';
        return svg.replace('<svg ', `<svg class="${clase}" `);
    }

    obtenerTipo(fila, columna) {
        if (fila === 1) return 'peon';    
        if (fila === 6) return 'peon';  
        return this.TIPOS[columna]; 
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