const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const input = path.join(root, "Office_Aquarium.html");
const output = path.resolve(process.argv[2] || "");

if (!output) throw new Error("Output path is required.");

let html = fs.readFileSync(input, "utf8");

function audioDataUri(relativePath, mimeType) {
  const file = path.join(root, relativePath.replace(/^\.\//, ""));
  if (!fs.existsSync(file)) throw new Error(`Missing audio asset for web bundle: ${relativePath}`);
  return `data:${mimeType};base64,${fs.readFileSync(file).toString("base64")}`;
}

html = html.replace(
  /<link\s+rel="stylesheet"\s+href="([^"]+)"\s*\/?>/g,
  (match, href) => {
    const file = path.join(root, href);
    if (!fs.existsSync(file)) throw new Error(`Missing stylesheet for web bundle: ${href}`);
    return `<style data-inlined-from="${href}">\n${fs.readFileSync(file, "utf8")}\n</style>`;
  }
);

html = html.replace(
  /<script\s+src="([^"]+)"><\/script>/g,
  (match, src) => {
    const file = path.join(root, src);
    if (!fs.existsSync(file)) throw new Error(`Missing script for web bundle: ${src}`);
    const script = fs.readFileSync(file, "utf8").replace(/<\/script/gi, "<\\/script");
    return `<script data-inlined-from="${src}">\n${script}\n</script>`;
  }
);

const audioReplacements = new Map([
  ["./assets/audio/game_music_loop.webm", audioDataUri("./assets/audio/game_music_loop.webm", "audio/webm")],
  ["./assets/audio/game_music_loop.mp3", audioDataUri("./assets/audio/game_music_loop.mp3", "audio/mpeg")],
  ["./assets/audio/new_message_alert.webm", audioDataUri("./assets/audio/new_message_alert.webm", "audio/webm")],
  ["./assets/audio/new_message_alert.mp3", audioDataUri("./assets/audio/new_message_alert.mp3", "audio/mpeg")]
]);
for (const [assetPath, dataUri] of audioReplacements) {
  html = html.split(assetPath).join(dataUri);
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html);
process.stdout.write(`${JSON.stringify({ ok: true, output, bytes: Buffer.byteLength(html) }, null, 2)}\n`);
