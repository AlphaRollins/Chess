// Clase simplificada para Pieza

class Pieza {
    constructor(tipo, color, imagen) {
        this.tipo = tipo;
        this.color = color;
        this.imagen = imagen;
        this.imagen = this.imagen.replace('<svg ', `<svg class="pieza-${color}" `);
    }
}

export default Pieza;