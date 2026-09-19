// Auto-detects this machine's current LAN IPv4 address and writes it into
// .env as EXPO_PUBLIC_API_URL, so switching between networks (home Wi-Fi,
// hotspot, etc.) never requires manually editing the backend URL.
const os = require("os");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ENV_PATH = path.join(__dirname, "..", ".env");
const KEY = "EXPO_PUBLIC_API_URL";

function isPrivateIPv4(address) {
  return (
    /^10\./.test(address) ||
    /^192\.168\./.test(address) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  );
}

function pickLanIp() {
  const interfaces = os.networkInterfaces();

  // Prefer common Wi-Fi/Ethernet adapter names first, then fall back to any
  // other private IPv4 address (skips VPN adapters like Radmin/Hamachi,
  // which use their own private-looking ranges but aren't the real LAN).
  const preferredNames = ["Wi-Fi", "wlan0", "en0", "Ethernet"];
  const candidates = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    for (const addr of addrs || []) {
      if (addr.family !== "IPv4" || addr.internal) continue;
      if (!isPrivateIPv4(addr.address)) continue;
      candidates.push({ name, address: addr.address });
    }
  }

  const preferred = candidates.find((c) => preferredNames.some((p) => c.name.includes(p)));
  return (preferred || candidates[0])?.address || null;
}

function main() {
  const ip = pickLanIp();
  if (!ip) {
    console.warn("[set-lan-ip] Could not detect a LAN IPv4 address — leaving .env untouched.");
    return;
  }

  const url = `http://${ip}:${PORT}`;
  let contents = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
  const line = `${KEY}=${url}`;

  if (contents.match(new RegExp(`^${KEY}=.*$`, "m"))) {
    contents = contents.replace(new RegExp(`^${KEY}=.*$`, "m"), line);
  } else {
    contents += (contents.endsWith("\n") || contents === "" ? "" : "\n") + line + "\n";
  }

  fs.writeFileSync(ENV_PATH, contents);
  console.log(`[set-lan-ip] ${KEY} set to ${url}`);
}

main();
