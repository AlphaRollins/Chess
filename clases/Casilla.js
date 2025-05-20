// Clase que representa una casilla individual del tablero de ajedrez
class Casilla {
    // Constructor que inicializa una nueva casilla
    constructor(fila, columna, ficha = null) {
        // Almacena la coordenada de fila (0-7, donde 0 es la fila superior)
        this.fila = fila

        // Almacena la coordenada de columna (0-7, donde 0 es la columna izquierda)
        this.columna = columna

        // Referencia a la pieza que ocupa esta casilla (null si está vacía)
        // El parámetro tiene un valor predeterminado de null, lo que significa
        // que si no se proporciona, la casilla se inicializa como vacía
        this.ficha = ficha
    }
}

// Exporta la clase para usarla en otros archivos
export default Casilla