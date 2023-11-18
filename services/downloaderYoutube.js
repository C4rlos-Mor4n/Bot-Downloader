const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg"); // Asegúrate de tener esto si usas ffmpeg
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

function downloadVideo(url, filename, format = "mp4") {
  return new Promise((resolve, reject) => {
    if (!ytdl.validateURL(url)) {
      reject(new Error("URL no válida"));
      return;
    }

    ytdl
      .getInfo(url)
      .then((info) => {
        const videoTitle = info.videoDetails.title;

        const outputDirectory = path.join(__dirname, "downloads");
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory, { recursive: true });
        }

        const filePath = path.join(outputDirectory, `${filename}.${format}`);
        let stream = ytdl.downloadFromInfo(info, {
          quality: "highest",
          filter: format === "mp4" ? "videoandaudio" : "audioonly",
        });

        if (format === "mp3") {
          const audioCodec = info.formats.find((f) =>
            f.mimeType.includes("audio/mp4")
          ).codec;
          const audioFilePath = path.join(outputDirectory, `${filename}.mp3`);
          ffmpeg(stream)
            .audioCodec(audioCodec === "mp3" ? "copy" : "libmp3lame")
            .toFormat("mp3")
            .on("end", function () {
              resolve({ filePath: audioFilePath, videoTitle });
            })
            .on("error", function (err) {
              reject(err);
            })
            .saveToFile(audioFilePath);
        } else {
          stream.pipe(fs.createWriteStream(filePath));
          stream.on("finish", () => {
            resolve({ filePath, videoTitle });
          });
        }

        stream.on("error", (error) => {
          reject(error);
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = downloadVideo;
