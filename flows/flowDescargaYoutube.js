const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const downloadVideo = require("../services/downloaderYoutube");
const Queue = require("queue-promise");
const fs = require("fs").promises; // Utilizar fs.promises

const queueMP3 = new Queue({
  concurrent: 1,
  interval: 3000,
});

const queueMP4 = new Queue({
  concurrent: 1,
  interval: 3000,
});

async function handleDownloadMP3(provider, Phone, result, type) {
  try {
    if (type === "mp3") {
      await provider.sendAudio(`${Phone}@s.whatsapp.net`, result.filePath);
      await provider.sendText(
        `${Phone}@s.whatsapp.net`,
        "¡Listo! He completado la descarga y envío del audio que mencionaste. ¡Gracias por tu espera!"
      );
      console.log(`Audio guardado en: ${result.filePath}`);
    }
  } catch (error) {
    console.error(`Error al enviar el ${type}:`, error);
    await provider.sendText(
      `${Phone}@s.whatsapp.net`,
      "Ha ocurrido un error al procesar tu solicitud de audio. Por favor, inténtalo de nuevo más tarde."
    );
    return;
  }
  try {
    await fs.unlink(result.filePath);
    console.log(`El ${type} ha sido eliminado: ${result.filePath}`);
  } catch (error) {
    console.error(`Error al eliminar el ${type}:`, error.message);
  }
}

async function handleDownloadMP4(provider, Phone, result, type) {
  try {
    if (type === "mp4") {
      await provider.sendVideo(
        `${Phone}@s.whatsapp.net`,
        result.filePath,
        "¡Listo! He completado la descarga y envío del video que mencionaste. ¡Gracias por tu espera!"
      );
      console.log(`Video guardado en: ${result.filePath}`);
    }
  } catch (error) {
    console.error(`Error al enviar el ${type}:`, error);
    await provider.sendText(
      `${Phone}@s.whatsapp.net`,
      "Ha ocurrido un error al procesar tu solicitud de video. Por favor, inténtalo de nuevo más tarde."
    );
    return;
  }
  try {
    await fs.unlink(result.filePath);
    console.log(`El ${type} ha sido eliminado: ${result.filePath}`);
  } catch (error) {
    console.error(`Error al eliminar el ${type}:`, error.message);
  }
}

const flowDescargaYoutube = addKeyword(EVENTS.ACTION).addAnswer(
  "¡Estamos casi listos para descargar tu video! 🎉📥\n\n*Por favor, elige el formato de tu descarga:*\n\n🎵 Para *MP3*\n🎬 Para *MP4*",
  { capture: true },
  async (ctx, { provider, fallBack, state, endFlow }) => {
    const { body } = ctx;
    await state.update({ Formato: body });

    const Formato = state.get("Formato").toLowerCase();
    const EnlaceYouTube = state.get("YoutubeEnlace");
    const Phone = state.get("Phone");

    if (Formato === "mp3") {
      await provider.sendText(
        `${Phone}@s.whatsapp.net`,
        "Por favor espera un momento, estoy descargando tu audio..."
      );

      queueMP3.start();
      queueMP3.enqueue(() => downloadVideo(EnlaceYouTube, Phone, Formato));

      queueMP3.on("resolve", async (result) => {
        // Pasar result a handleDownloadMP3
        await handleDownloadMP3(provider, Phone, result, Formato);
        return await endFlow();
      });
    } else if (Formato === "mp4") {
      await provider.sendText(
        `${Phone}@s.whatsapp.net`,
        "Por favor espera un momento, estoy descargando tu video..."
      );

      queueMP4.start();
      queueMP4.enqueue(() => downloadVideo(EnlaceYouTube, Phone, Formato));

      queueMP4.on("resolve", async (result) => {
        // Pasar result a handleDownloadMP4

        await handleDownloadMP4(provider, Phone, result, Formato);
        return await endFlow();
      });
    } else {
      return await fallBack(
        "Por favor, indica si deseas descargar en formato *MP3* o *MP4*."
      );
    }
  }
);

module.exports = flowDescargaYoutube;
