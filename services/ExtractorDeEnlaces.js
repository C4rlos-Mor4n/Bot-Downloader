async function extraerEnlacesYouTube(texto) {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:shorts\/|[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;

  let coincidencia = regex.exec(texto);
  let enlaces = [];

  while (coincidencia !== null) {
    enlaces.push(coincidencia[0]);
    coincidencia = regex.exec(texto);
  }

  if (enlaces.length === 1) {
    // Retorna verdadero y el enlace encontrado
    return { enlaceValido: true, enlace: enlaces[0], mensaje: null };
  } else if (enlaces.length > 1) {
    // Retorna falso y un mensaje indicando que se encontraron múltiples enlaces
    return {
      enlaceValido: false,
      enlace: null,
      mensaje:
        "Se encontraron múltiples enlaces. Por favor, envía solo un enlace a la vez.",
    };
  } else {
    // Retorna falso si no se encontró ningún enlace
    return { enlaceValido: false, enlace: null, mensaje: null };
  }
}

// Ejemplo de uso
// const texto = "Aquí va tu texto con múltiples enlaces de YouTube https://www.youtube.com/watch?v=dQw4w9WgXcQ, https://youtu.be/v5_SYkFpFiY";
// const resultado = extraerEnlacesYouTube(texto);
// console.log(resultado); // { enlaceValido: false, enlace: null, mensaje: 'Se encontraron múltiples enlaces. Por favor, envía solo un enlace a la vez.' }

module.exports = extraerEnlacesYouTube;
