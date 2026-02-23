const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
const upload = multer({ dest: "uploads/" });

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

app.use(express.static("public"));

// app.post("/convert", upload.single("video"), (req, res) => {
//     if (!req.file) return res.status(400).send("No file");

//     const { fps, width, duration } = req.body;
//     const inputPath = req.file.path;
//     const outputPath = inputPath + ".gif";

//     res.setHeader("Content-Type", "application/octet-stream");

//     ffmpeg(inputPath)
//         .outputOptions([
//             `-vf fps=${fps || 15},scale=${width || 480}:-1:flags=lanczos`,
//             `-t ${duration || 5}`,
//             "-loop 0"
//         ])
//         .format("gif")
//         .on("progress", (progress) => {
//             if (progress.percent) {
//                 console.log("Progress:", progress.percent.toFixed(2) + "%");
//             }
//         })
//         .on("end", () => {
//             res.download(outputPath, "output.gif", () => {
//                 fs.unlinkSync(inputPath);
//                 fs.unlinkSync(outputPath);
//             });
//         })
//         .on("error", (err) => {
//             console.error(err);
//             res.status(500).send("Error");
//         })
//         .save(outputPath);
// });
app.post("/convert", upload.single("video"), (req, res) => {
    if (!req.file) return res.status(400).send("No file");

    const { fps, width, duration, originalSize, quality } = req.body;

    const inputPath = req.file.path;
    const outputPath = inputPath + ".gif";

    let scaleFilter = originalSize === "true"
        ? `fps=${fps || 15}`
        : `fps=${fps || 15},scale=${width || 480}:-1:flags=lanczos`;

    // 🔥 กำหนดจำนวนสีตาม quality
    let colors = 128;
    if (quality === "low") colors = 64;
    if (quality === "medium") colors = 128;
    if (quality === "high") colors = 256;

    ffmpeg(inputPath)
        .outputOptions([
            `-vf ${scaleFilter},split[s0][s1];[s0]palettegen=max_colors=${colors}[p];[s1][p]paletteuse`,
            `-t ${duration || 5}`,
            "-loop 0"
        ])
        .format("gif")
        .on("end", () => {

            res.setHeader("Content-Type", "image/gif");
            const stream = fs.createReadStream(outputPath);

            stream.pipe(res);

            stream.on("close", () => {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            });

        })
        .on("error", (err) => {
            console.error(err);

            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

            if (!res.headersSent) {
                return res.status(500).send("Error");
            }
        })
        .save(outputPath);
});
// app.listen(3000, () => {
//     console.log("Server running at http://localhost:3000");
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running");
});
