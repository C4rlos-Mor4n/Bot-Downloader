const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");

const flowFeedback = addKeyword(EVENTS.ACTION).addAnswer(
  "Por favor acontinuación, escribe tu *comentario*. ¡Gracias!*",
  { capture: true },
  async (ctx, { endFlow, state }) => {
    const { body, from } = ctx;

    await state.update({ feedback: body, Phone: from });
    const feedback = state.get("feedback");
    const Phone = state.get("Phone");

    console.log("[USUARIO]: " + Phone + " [COMENTARIO]: " + feedback);
    return await endFlow(
      "Listo el desarrollador lo revisará y lo tendrá en cuenta, gracias por tu ayuda!"
    );
  }
);

module.exports = flowFeedback;
