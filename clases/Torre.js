class Torre {
    constructor(color) {
        this.color = color;
        this.imagen = color === 'blanca' ? '♖' : '♜';
    }
}

export default Torre