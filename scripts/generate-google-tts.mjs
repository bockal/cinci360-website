import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const input = process.argv[2] ?? "content/podcast/episode-001-your-building-is-lying-to-you.ssml";
const output = process.argv[3] ?? "public/audio/podcast/episode-001-your-building-is-lying-to-you.mp3";
const voiceName = process.env.GOOGLE_TTS_VOICE ?? "en-US-Chirp3-HD-Charon";
const languageCode = process.env.GOOGLE_TTS_LANGUAGE ?? "en-US";

if (!projectId) {
  throw new Error("Set GOOGLE_CLOUD_PROJECT to your Google Cloud project ID.");
}

const accessToken = execFileSync("gcloud", ["auth", "print-access-token"], { encoding: "utf8" }).trim();
const ssml = readFileSync(resolve(input), "utf8");

const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "x-goog-user-project": projectId,
    "Content-Type": "application/json; charset=utf-8",
  },
  body: JSON.stringify({
    input: { ssml },
    voice: { languageCode, name: voiceName },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 0.95,
      pitch: -1,
    },
  }),
});

if (!response.ok) {
  throw new Error(`Google Cloud TTS failed: ${response.status} ${await response.text()}`);
}

const data = await response.json();
if (!data.audioContent) {
  throw new Error("Google Cloud TTS returned no audioContent.");
}

const destination = resolve(output);
mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, Buffer.from(data.audioContent, "base64"));
console.log(`Wrote ${destination}`);
