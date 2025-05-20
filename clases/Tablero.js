// Importa las clases necesarias
import FichaFactory from "./FichaFactory.js";
import Casilla from "./Casilla.js";

// Clase que representa el tablero de ajedrez y gestiona todas sus casillas
class Tablero {
    constructor() {
        // Crea una instancia de la fábrica de piezas
        // Esto aplica el patrón de Inyección de Dependencias, permitiendo al tablero
        // crear piezas sin necesidad de conocer los detalles de implementación
        this.factory = new FichaFactory();

        // Array que contendrá todas las casillas del tablero (64 en total)
        this.casillas = [];

        // Llama al método de inicialización para configurar el tablero
        this.inicializar();
    }

    // Método que configura el estado inicial del tablero
    inicializar() {
        // Limpia el array de casillas por si acaso (útil al reiniciar)
        this.casillas = [];

        // Doble bucle para crear las 64 casillas (8x8)
        for (let fila = 0; fila < 8; fila++) {
            for (let columna = 0; columna < 8; columna++) {
                let ficha = null;

                // Solo coloca piezas en las dos primeras y dos últimas filas
                // Las filas 0-1 son piezas negras, 6-7 son piezas blancas
                if (fila < 2 || fila > 5) {
                    // Usa la fábrica para crear la pieza adecuada para esta posición
                    ficha = this.factory.crearProducto(fila, columna);
                }

                // Crea una nueva casilla con sus coordenadas y la pieza (si existe)
                // y la añade al array de casillas
                this.casillas.push(new Casilla(fila, columna, ficha));
            }
        }
    }
}

// Exporta la clase para usarla en otros archivos
export default Tablero;