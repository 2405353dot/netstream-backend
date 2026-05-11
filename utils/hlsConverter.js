const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const ffmpegPath = "C:\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe";

const normalizePath = (filePath) => {
  return filePath.replace(/\\/g, "/");
};

const runFFmpeg = (args) => {
  return new Promise((resolve, reject) => {
    const process = execFile(ffmpegPath, args, (error, stdout, stderr) => {
      if (error) {
        console.log("FFmpeg error:", error.message);
        console.log("FFmpeg stderr:", stderr);
        return reject(error);
      }

      resolve({ stdout, stderr });
    });

    process.stderr.on("data", (data) => {
      console.log(data.toString());
    });
  });
};

const convertQuality = async (inputPath, outputDir, quality) => {
  const qualityDir = path.join(outputDir, quality.name);
  fs.mkdirSync(qualityDir, { recursive: true });

  const args = [
    "-y",
    "-i",
    normalizePath(inputPath),

    "-map",
    "0:v:0",
    "-map",
    "0:a:0?",

    "-vf",
    `scale=w=${quality.width}:h=${quality.height}:force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2`,

    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-b:v",
    quality.videoBitrate,
    "-maxrate",
    quality.maxrate,
    "-bufsize",
    quality.bufsize,

    "-c:a",
    "aac",
    "-b:a",
    quality.audioBitrate,
    "-ar",
    "48000",

    "-hls_time",
    "6",
    "-hls_playlist_type",
    "vod",
    "-hls_flags",
    "independent_segments",

    "-hls_segment_filename",
    `${normalizePath(qualityDir)}/segment_%03d.ts`,

    `${normalizePath(qualityDir)}/index.m3u8`,
  ];

  await runFFmpeg(args);
};

const createMasterPlaylist = (outputDir) => {
  const master = `#EXTM3U
#EXT-X-VERSION:3

#EXT-X-STREAM-INF:BANDWIDTH=3200000,RESOLUTION=1280x720
720p/index.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=1600000,RESOLUTION=854x480
480p/index.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=426x240
240p/index.m3u8
`;

  fs.writeFileSync(path.join(outputDir, "master.m3u8"), master);
};

const convertToHLS = async (inputPath, videoId) => {
  const outputDir = path.join(__dirname, "../hls", String(videoId));

  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const qualities = [
    {
      name: "720p",
      width: 1280,
      height: 720,
      videoBitrate: "2800k",
      maxrate: "2996k",
      bufsize: "4200k",
      audioBitrate: "128k",
    },
    {
      name: "480p",
      width: 854,
      height: 480,
      videoBitrate: "1400k",
      maxrate: "1498k",
      bufsize: "2100k",
      audioBitrate: "96k",
    },
    {
      name: "240p",
      width: 426,
      height: 240,
      videoBitrate: "600k",
      maxrate: "642k",
      bufsize: "900k",
      audioBitrate: "64k",
    },
  ];

  for (const quality of qualities) {
    console.log(`Starting ${quality.name} conversion...`);
    await convertQuality(inputPath, outputDir, quality);
    console.log(`${quality.name} conversion finished.`);
  }

  createMasterPlaylist(outputDir);

  console.log("Master playlist created.");

  return `/hls/${videoId}/master.m3u8`;
};

module.exports = convertToHLS; 