const words = [
    "sol", "luz", "mar", "rio", "nube", "paz", "flor", "cima", "lago", "viento",
    "roca", "playa", "loma", "pino", "foca", "luna", "rosa", "nieve", "gato", "perro",
    "casa", "muro", "rayo", "sola", "lobo", "mono", "sapo", "leon", "rana", "puma",
    "pez", "olla", "duro", "caja", "mesa", "faro", "vaca", "lazo", "sola", "tela",
    "vela", "seda", "lomo", "miel", "piedra", "arena", "rojo", "azul", "gris", "verde",
    "blanco", "negro", "dorado", "plata", "alma", "lugar", "sitio", "punto", "puerta", "valor",
    "pico", "alto", "bajo", "dulce", "amargo", "frito", "vivo", "corto", "largo", "ancho",
    "estrecho", "fino", "grueso", "frio", "calor", "hielo", "mango", "hoja", "fruta", "avion",
    "barco", "tren", "carro", "camion", "bomba", "rueda", "coche", "arbol", "flama", "fuego",
    "llama", "nieve", "trono", "pared", "campo", "cerro", "llano", "marco", "baile", "cielo"
];

function getRandomWord() {
    const index = Math.floor(Math.random() * words.length);
    return words[index];
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generatePassphrase() {
    const word1 = getRandomWord();
    const word2 = getRandomWord();
    const word3 = getRandomWord();

    return `${word1}${getRandomNumber(0, 99)}-${word2}${getRandomNumber(0, 99)}_${word3}`;
}