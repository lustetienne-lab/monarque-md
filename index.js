const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const config = require("./config");

// --- 1. Mini-serveur web pour garder le bot en ligne sur les hébergeurs ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(XXXINLINECODEXXX7XXXINLINECODEXXX);
});

app.listen(PORT, () => {
  console.log(XXXINLINECODEXXX8XXXINLINECODEXXX);
});

// --- 2. Fonction principale du bot WhatsApp ---
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });

  // Sauvegarde des identifiants de session
  sock.ev.on("creds.update", saveCreds);

  // Gestion de la connexion
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("👉 Scanne le QR code affiché dans les logs pour connecter le bot.");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log("Connexion fermée. Reconnexion en cours...", shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log(XXXINLINECODEXXX9XXXINLINECODEXXX);
    }
  });

  // Gestion des messages reçus
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");

    // Extraction du texte du message
    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      "";

    if (!body.startsWith(config.PREFIX)) return;

    const args = body.slice(config.PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    console.log(XXXINLINECODEXXX10XXXINLINECODEXXX);

    // --- Commandes de base ---

    switch (command) {
      case "ping": {
        const start = Date.now();
        await sock.sendMessage(from, { text: "Pong! 🏓" }, { quoted: msg });
        const latency = Date.now() - start;
        await sock.sendMessage(from, { text: XXXINLINECODEXXX11XXXINLINECODEXXX }, { quoted: msg });
        break;
      }

      case "alive": {
        const statusText = XXXINLINECODEXXX12XXXINLINECODEXXX +
          XXXINLINECODEXXX13XXXINLINECODEXXX +
          XXXINLINECODEXXX14XXXINLINECODEXXX +
          XXXINLINECODEXXX15XXXINLINECODEXXX;
        await sock.sendMessage(from, { text: statusText }, { quoted: msg });
        break;
      }

      case "menu": {
        const menuText = XXXINLINECODEXXX16XXXINLINECODEXXX +
          XXXINLINECODEXXX17XXXINLINECODEXXX +
          XXXINLINECODEXXX18XXXINLINECODEXXX +
          XXXINLINECODEXXX19XXXINLINECODEXXX +
          XXXINLINECODEXXX20XXXINLINECODEXXX +
          XXXINLINECODEXXX21XXXINLINECODEXXX +
          XXXINLINECODEXXX22XXXINLINECODEXXX +
          XXXINLINECODEXXX23XXXINLINECODEXXX +
          XXXINLINECODEXXX24XXXINLINECODEXXX +
          XXXINLINECODEXXX25XXXINLINECODEXXX;
        await sock.sendMessage(from, { text: menuText }, { quoted: msg });
        break;
      }

      case "tagall": {
        if (!isGroup) {
          return await sock.sendMessage(from, { text: config.MESSAGES.GROUP_ONLY }, { quoted: msg });
        }
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        let mentions = [];
        let tagMsg = XXXINLINECODEXXX26XXXINLINECODEXXX;

        for (let p of participants) {
          tagMsg += XXXINLINECODEXXX27XXXINLINECODEXXX;
          mentions.push(p.id);
        }

        await sock.sendMessage(from, { text: tagMsg, mentions }, { quoted: msg });
        break;
      }

      default:
        break;
    }
  });
}

// Lancement
startBot().catch((err) => console.error("Erreur critique :", err));
