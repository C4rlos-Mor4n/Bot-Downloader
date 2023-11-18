const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const extraerEnlacesYouTube = require("../services/ExtractorDeEnlaces");

const flowPrincipal = addKeyword(EVENTS.WELCOME).addAnswer(
  "*¡Hola! Bienvenido, te saluda Aurora*. Estoy aquí para ayudarte a descargar tus videos de *YouTube*, incluyendo videos estándar y *YouTube Shorts*, de manera rápida y segura. 🚀\n\nSi tienes alguna sugerencia o idea para mejorar este bot, por favor escribe *feedback*. ¡Tus comentarios son muy valiosos! 💡\n\nY si lo que deseas es descargar un video, *simplemente indica el enlace de YouTube, ya sea un video estándar o un Short, y me encargaré del resto.* 📹",
  {
    capture: true,
    media: "https://i.imgur.com/FcZAKTX.jpeg",
  },
  async (ctx, { gotoFlow, fallBack, state }) => {
    const { body, from } = ctx;
    await state.update({ respuesta: body });

    const respuesta = state.get("respuesta");

    const resultado = await extraerEnlacesYouTube(respuesta);

    if (respuesta.toLowerCase().includes("feedback")) {
      return await gotoFlow(require("./flowFeedback"));
    } else if (resultado.enlaceValido === true) {
      await state.update({ YoutubeEnlace: resultado.enlace, Phone: from });
      console.log(
        "Enlace: " + resultado.enlace,
        "Phone: " + from,
        "Guardado correctamente"
      );
      return await gotoFlow(require("./flowDescargaYoutube"));
    } else if (resultado.mensaje) {
      // Manejar el caso en que se detecten múltiples enlaces
      return await fallBack(resultado.mensaje);
    } else {
      return await fallBack(
        "Por favor indica un enlace de YouTube valido.\n\nAqui tienes un ejemplo: *https://www.youtube.com/watch?v=JGwWNGJdvx8*"
      );
    }
  }
);

module.exports = flowPrincipal;
