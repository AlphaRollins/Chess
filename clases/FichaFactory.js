// Importa las clases de las diferentes piezas de ajedrez de sus respectivos archivos
import Caballo from "./Caballo.js";
import Torre from "./Torre.js";
import Alfil from "./Alfil.js";
import Reina from "./Reina.js";
import Rey from "./Rey.js";
import Peon from "./Peon.js";

// Esta clase se encarga de crear y gestionar las piezas del ajedrez usando el patrón Factory
class FichaFactory {
    // Array que define qué tipo de pieza va en cada columna de la primera fila 
    // (se replica para la última fila)
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

    // Método principal que crea una pieza según su posición en el tablero
    // Implementa el patrón Factory Method
    crearProducto(fila, columna) {
        // Determina qué tipo de pieza debe ir en esa posición
        let tipo = this.obtenerTipo(fila, columna)
        // Determina el color basado en la fila (piezas en filas superiores son negras, inferiores blancas)
        let color = (fila > 5) ? 'blanca' : 'negra';

        // Crea la instancia correcta según el tipo
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
        // Si la pieza tiene un SVG como imagen, aplica estilo según su color
        if (ficha && ficha.imagen) {
            ficha.imagen = this.estilizarSVG(ficha.imagen, color);
        }
        return ficha;
    }

    // Añade una clase CSS al SVG para estilizarlo según su color
    estilizarSVG(svg, color) {
        let clase = color === 'blanca' ? 'pieza-blanca' : 'pieza-negra';
        // Usa regex/replace para modificar el tag SVG e incluir la clase CSS
        return svg.replace('<svg ', `<svg class="${clase}" `);
    }

    // Determina qué tipo de pieza debe ir en cada posición
    obtenerTipo(fila, columna) {
        // Peones van en las filas 1 y 6
        if (fila === 1) return 'peon';
        if (fila === 6) return 'peon';
        // Para otras filas, el tipo depende de la columna según el array TIPOS
        return this.TIPOS[columna];
    }

    // *** PARTE CRÍTICA ***
    // Este método implementa las reglas de movimiento para cada tipo de pieza
    // Es un ejemplo del patrón Strategy, donde cada pieza tiene su estrategia de movimiento
    mover(ficha, origen, destino, hayFichaEntre) {
        // No se puede mover si no hay pieza
        if (!ficha) return false;
        // No se puede mover a una casilla ocupada por una pieza del mismo color
        if (destino.ficha && destino.ficha.color === ficha.color) return false;

        // Calcula el desplazamiento en X e Y
        const dx = destino.columna - origen.columna;
        const dy = destino.fila - origen.fila;
        // Obtiene el tipo de pieza usando reflection (el nombre de la clase)
        const tipo = ficha.constructor.name;

        // Reglas de movimiento del PEÓN
        if (tipo === "Peon") {
            // Define la dirección de movimiento según el color (las blancas suben, las negras bajan)
            let dir = ficha.color === 'blanca' ? -1 : 1;
            // Fila inicial donde el peón puede avanzar 2 casillas
            let filaInicial = ficha.color === 'blanca' ? 6 : 1;

            // Movimiento recto (1 o 2 casillas desde posición inicial)
            if (
                dx === 0 &&  // Sin movimiento horizontal
                !destino.ficha &&  // No puede haber pieza en el destino
                ((origen.fila + dir === destino.fila) ||  // Movimiento normal de 1 casilla
                    (origen.fila === filaInicial && origen.fila + 2 * dir === destino.fila && !hayFichaEntre(origen, destino)))  // Movimiento inicial de 2 casillas
            ) return true;

            // Captura en diagonal
            if (
                Math.abs(dx) === 1 &&  // Movimiento diagonal (1 columna)
                origen.fila + dir === destino.fila &&  // Avanza en la dirección correcta
                destino.ficha &&  // Debe haber una pieza para capturar
                destino.ficha.color !== ficha.color  // Debe ser de color opuesto
            ) return true;

            // Si no cumple ninguna condición, no es válido
            return false;
        }

        // Reglas de movimiento de la TORRE
        if (tipo === "Torre") {
            // La torre se mueve en línea recta (horizontal o vertical)
            if (dx === 0 || dy === 0) return !hayFichaEntre(origen, destino);
            return false;
        }

        // Reglas de movimiento del CABALLO
        if (tipo === "Caballo") {
            // El caballo se mueve en L (2+1 o 1+2 casillas)
            // El caballo puede saltar por encima de otras piezas
            return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
        }

        // Reglas de movimiento del ALFIL
        if (tipo === "Alfil") {
            // El alfil se mueve en diagonal (mismo número de casillas en X e Y)
            return Math.abs(dx) === Math.abs(dy) && !hayFichaEntre(origen, destino);
        }

        // Reglas de movimiento de la REINA
        if (tipo === "Reina") {
            // La reina combina los movimientos de torre y alfil
            return ((dx === 0 || dy === 0) || (Math.abs(dx) === Math.abs(dy))) && !hayFichaEntre(origen, destino);
        }

        // Reglas de movimiento del REY
        if (tipo === "Rey") {
            // El rey se mueve 1 casilla en cualquier dirección
            return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
        }

        // Por defecto no es válido
        return false;
    }
}

// Exporta la clase para usarla en otros archivos
export default FichaFactory