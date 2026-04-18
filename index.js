const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReConnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisConnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const crypto = require("crypto");
const dotenv = require("dotenv");
const FormData = require("form-data");
const { createCanvas, loadImage } = require('canvas');
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const axios = require("axios");
const chalk = require("chalk");
const moment = require('moment');
const config = require("./setting/config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ~ Thumbnail Vid
const localPhotoPath = "https://files.catbox.moe/6ogo26.jpg";

function startBot() {
  console.log(chalk.red(`
⠈⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣀⡴⢧⣀⠀⠀⣀⣠⠤⠤⠤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⠏⢀⡴⠊⠁⠀⠀⠀⠀⠀⠀⠈⠙⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢶⣶⣒⣶⠦⣤⣀⠀
⠀⠀⠀⠀⠀⠀⢀⣰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣟⠲⡌⠙⢦⠈⢧
⠀⠀⠀⣠⢴⡾⢟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡴⢃⡠⠋⣠⠋
⠐⠀⠞⣱⠋⢰⠁⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⠤⢖⣋⡥⢖⣫⠔⠋
⠈⠠⡀⠹⢤⣈⣙⠚⠶⠤⠤⠤⠴⠶⣒⣒⣚⣩⠭⢵⣒⣻⠭⢖⠏⠁⢀⣀
⠠⠀⠈⠓⠒⠦⠭⠭⠭⣭⠭⠭⠭⠭⠿⠓⠒⠛⠉⠉⠀⠀⣠⠏⠀⠀⠘⠞
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢤⣀⠀⠀⠀⠀⠀⠀⣀⡤⠞⠁⠀⣰⣆⠀
⠀⠀⠀⠀⠀⠘⠿⠀⠀⠀⠀⠀⠈⠉⠙⠒⠒⠛⠉⠁⠀⠀⠀⠉⢳⡞⠉⠀⠀⠀⠀⠀

`));


console.log(chalk.red(`
Информация 🇷🇺
Дев : t.me/ibnuror
Канал : https://t.me/ibnuror21
`));


console.log(chalk.blue(`
[ 🚀 BOT BERJALAN... ]
`));
};

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("Connection.update", async (update) => {
            const { Connection, lastDisConnect } = update;
            if (Connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (Connection === "close") {
              const shouldReConnect =
                lastDisConnect?.error?.output?.statusCode !==
                DisConnectReason.loggedOut;
              if (shouldReConnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp Connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function ConnectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `
<blockquote>Voc Project Md [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Status : Process
`,
      { parse_mode: "HTML" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `
<blockquote>Voc Project Md [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Status : Not Connected
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        await ConnectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
<blockquote>Voc Project Md [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Status : Gagal ❌
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `
<blockquote>Voc Project Md [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Status : Connected
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "HTML",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
  let customcode = "BOKEP123"
  const code = await sock.requestPairingCode(botNumber, customcode);
  const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

  await bot.editMessageText(
    `
<blockquote>Voc Project Md [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
— Code Pairing : ${formattedCode}
`,
    {
      chat_id: chatId,
      message_id: statusMessage,
      parse_mode: "HTML",
  });
};
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
<blockquote>Voc Project Md [ 𖣂 ]</blockquote>
— Number : ${botNumber}.
─ Status : Error ❌ ${error.message}
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

let premiumUsers = JSON.parse(fs.readFileSync("./database/premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./database/admin.json"));

function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

ensureFileExists("./database/premium.json");
ensureFileExists("./database/admin.json");

function savePremiumUsers() {
  fs.writeFileSync("./database/premium.json", JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
  fs.writeFileSync("./database/admin.json", JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`bot ${botNum}:`, error);
      }
    }
  });
}

watchFile("./database/premium.json", (data) => (premiumUsers = data));
watchFile("./database/admin.json", (data) => (adminUsers = data));

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find((user) => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

const MEMEKUY = ["123456789"]; // ganti dengan ID kamu
const dbCmd = "./database/command.json"; ///kalian buat folder database kalo sudah ada ngga usah buat lagi dan kasih di dalam folder data base file yang bernama command.json di dalam file nya cukup kalian isi []

function getCmdStatus() {
  return fs.readJsonSync(dbCmd).catch(() => ({}));
}

function saveCmdStatus(data) {
  fs.writeJsonSync(dbCmd, data, { spaces: 2 });
}

function isCmdOn(cmd) {
  const data = getCmdStatus();
  return data[cmd] !== false; // default aktif  //kalo kalian ganti true nanti bakal off 
}

function isMekiw(id) {
  return MEMEKUY.includes(String(id));
}

const DB_MMK = "./database/groups.json"

let groupList = new Set()

async function loadDB() {
  const exists = await fs.pathExists(DB_MMK)

  if (exists) {
    const data = await fs.readJson(DB_MMK)
    groupList = new Set(data)
  }
}

loadDB()

async function saveGroups() {
  await fs.writeJson(DB_MMK, [...groupList], { spaces: 2 })
}

bot.on("message", async (msg) => {
  if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
    if (!groupList.has(msg.chat.id)) {
      groupList.add(msg.chat.id)
      await saveGroups()
    }
  }
})

bot.on("new_chat_members", async (msg) => {
  if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
    groupList.add(msg.chat.id)
    await saveGroups()
  }
})

bot.on("left_chat_member", async (msg) => {
  groupList.delete(msg.chat.id)
  await saveGroups()
})

function getTotalGrup() {
  return groupList.size
}

const userDbPath = "./database/users.json"

function getAllUsers() {
  try {
    return fs.readJsonSync(userDbPath)
  } catch {
    return []
  }
}

function saveUser(userId) {
  let users = getAllUsers()

  if (!users.includes(userId)) {
    users.push(userId)
    fs.writeJsonSync(userDbPath, users)
  }
}

function getTotalUsers() {
  return getAllUsers().length
}
// ================= SAFE FUNCTION =================
async function safeSend(type, chatId, content, options = {}) {
  try {
    if (type === "text") return await bot.sendMessage(chatId, content, options);
    if (type === "photo") return await bot.sendPhoto(chatId, content, options);
    if (type === "video") return await bot.sendVideo(chatId, content, options);
  } catch (err) {
    if (err.response?.statusCode === 403) {
      console.log(`🚫 User ${chatId} block bot`);
    } else {
      console.log("ERROR:", err.message);
    }
  }
}

async function safeDelete(chatId, messageId) {
  try {
    await bot.deleteMessage(chatId, messageId);
  } catch {}
}

// ================= REQUIRED CHATS =================
const REQUIRED_CHATS = [
  "@vnxzgntng",
  "@aboutvinxz",
  "@VinxzGantengg"
]

async function isUserJoinAll(userId) {
  try {
    for (let chat of REQUIRED_CHATS) {
      const res = await bot.getChatMember(chat, userId)
      const status = res.status

      const valid =
        status === "member" ||
        status === "administrator" ||
        status === "creator"

      if (!valid) return false
    }
    return true
  } catch (err) {
    console.log("CHECK JOIN ERROR:", err)
    return false
  }
}

// ================= MENU =================
function getRandomImage() {
  const images = [
    "https://d.uguu.se/QcwEkseG.jpg",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

const userButtonColor = {}
const buttonIntervals = new Map()

async function sendStartMenu(chatId, from) {
  const userId = from.id
  const randomImage = getRandomImage()

  const runtimeStatus = formatRuntime()
  const memoryStatus = formatMemory()
  const grup = getTotalGrup() 
  const totalUser = getTotalUsers()

  const status = sessions.size > 0 ? "🟢 ACTIVE" : "🔴 OFFLINE"

  const chosenColor = userButtonColor[userId] || "primary"

  let styles
  if (chosenColor === "disco") {
    styles = ["primary","success","danger"]
  } else {
    const safeColor = {
      danger: "danger",
      success: "success",
      secondary: "primary" 
    }
    styles = [ safeColor[chosenColor] || "primary" ]
  }

  let index = 0
  let keyboard = [
    [
      { text: "ᴀᴜᴛʜᴏʀ", url: "https://t.me/VinxzGanteng", style: styles[index] },
      { text: "ᴄʜᴀɴɴᴇʟ ᴀᴜᴛʜᴏʀ", url: "https://t.me/vnxzgntng", style: styles[index] }
    ],
    [
      { text: "ɢʀᴏᴜᴘs ʟɪᴛᴇʀᴀsɪ", url: "https://t.me/YappingVnxz", style: styles[index] }, 
      { text: "ɢʀᴏᴜᴘs ᴍᴅ", url: "https://t.me/MdVnxz", style: styles[index] }
    ], 
    [
      { text: "ᴄᴏɴᴛʀᴏʟ ɢʀᴏᴜᴘs", callback_data: "tols", style: styles[index] },
      { text: "ᴛᴏᴏʟs ᴍᴇɴᴜ", callback_data: "memek", style: styles[index] }
    ]
  ]

  const photoOptions = {
    caption: `
<blockquote>(⌮) нι ιм вσт мυℓтι ∂ινα¢є νιηχzσƒƒι¢ιαℓ</blockquote>

<blockquote>(⸙ᴠɴxᴢ) ʜᴀʟᴏ ɢᴀʏs,
[ ᴛᴇʀɪᴍᴀᴋᴀsɪʜ ᴛᴇʟᴀʜ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ʙᴏᴛ ᴍᴜʟᴛɪ ᴅɪᴠᴀᴄᴇ ᴠιηχz ]</blockquote>

<blockquote>⌮ sʏsᴛᴇᴍ ɪɴғᴏ ⌮</blockquote>
• ᴀᴜᴛʜᴏʀ: @VinxzGanteng
• ʙᴏᴛɴᴀᴍᴇ: ᴠɪɴxᴢᴏғғᴄ - ᴍᴅ
• sᴛᴀᴛᴜs: ${status}
• ʀᴜɴᴛɪᴍᴇ: ${runtimeStatus}
• ᴍᴇᴍᴏʀʏ: ${memoryStatus}
• ᴛᴏᴛᴀʟɢʀᴜʙ: ${grup}
• ᴛᴏᴛᴀʟᴜsᴇʀ: ${totalUser}

<blockquote>⎈ ᴛʜᴀɴᴋs ⎈</blockquote>
`,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard }
  }

  let sent = await safeSend("photo", chatId, randomImage, photoOptions)
  if (!sent) return

  const messageId = sent.message_id

  if (styles.length > 1) {
    const intervalId = setInterval(async () => {
      index++
      if (index >= styles.length) index = 0

      const newKeyboard = keyboard.map(row =>
        row.map(btn => ({ ...btn, style: styles[index] }))
      )

      try {
        await bot.editMessageReplyMarkup(
          { inline_keyboard: newKeyboard },
          { chat_id: chatId, message_id: messageId }
        )
      } catch {}
    }, 2000)

    buttonIntervals.set(messageId, intervalId)
  }
}

// ================= START =================
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id
  if (!isCmdOn("start")) {
    return bot.sendMessage(chatId, "❌ Command judi dimatikan");
  }
  
  const isOwnerUser = config.OWNER_ID.includes(String(userId))
  const joined = await isUserJoinAll(userId)
  
  if (!joined && !isOwnerUser) {
    return safeSend("text", chatId,
      "❌ Kamu harus join channel & grup dulu",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📢 Channel 1", url: `https://t.me/${REQUIRED_CHATS[0].replace("@","")}` }],
            [{ text: "📢 Channel 2", url: `https://t.me/${REQUIRED_CHATS[1].replace("@","")}` }],
            [{ text: "👥 Group", url: `https://t.me/${REQUIRED_CHATS[2].replace("@","")}` }],
            [{ text: "🔄 Cek", callback_data: "cek_join_all" }]
          ]
        }
      }
    )
  }

  await safeSend("video", chatId, "https://files.catbox.moe/7as4wh.mp4", {
    caption: "𝘚𝘪𝘭𝘢𝘩𝘬𝘢𝘯 𝘗𝘪𝘭𝘪𝘩 𝘉𝘶𝘵𝘵𝘰𝘯 𝘞𝘢𝘳𝘯𝘢 𝘋𝘪 𝘉𝘢𝘸𝘢𝘩 𝘜𝘯𝘵𝘶𝘬 𝘔𝘦𝘭𝘪𝘩𝘢𝘵 𝘔𝘦𝘯𝘶 𝘚𝘦𝘭𝘢𝘯𝘫𝘶𝘵𝘯𝘺𝘢!",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🔴 ᴍᴇʀᴀʜ", callback_data: "color_danger", style: "danger" },
          { text: "🟢 ʜɪᴊᴀᴜ", callback_data: "color_success", style: "success" }
        ],
        [
          { text: "🔵 ʙɪʀᴜ", callback_data: "color_secondary", style: "primary" },
          { text: "🪔 ᴅɪsᴋᴏ", callback_data: "color_disco", style: "danger" }
        ]
      ]
    }
  })
})

// ================= CALLBACK =================
bot.on("callback_query", async (query) => {
  if (!query.message) return;

  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const messageId = query.message.message_id;
  const data = query.data;

  // ================= JOIN CHECK =================
  if (data === "cek_join_all") {
    const joined = await isUserJoinAll(userId);

    if (!joined) {
      return bot.answerCallbackQuery(query.id, {
        text: "❌ Kamu belum join semua!",
        show_alert: true
      });
    }

    await bot.answerCallbackQuery(query.id, {
      text: "✅ Join terverifikasi!"
    });

    await safeDelete(chatId, messageId);
    return sendStartMenu(chatId, query.from);
  }

  // ================= STOP INTERVAL =================
  if (buttonIntervals.has(messageId)) {
    clearInterval(buttonIntervals.get(messageId));
    buttonIntervals.delete(messageId);
  }

  // ================= COLOR =================
  if (data.startsWith("color_")) {
    const color = data.replace("color_", "");
    userButtonColor[userId] = color;

    await bot.answerCallbackQuery(query.id, {
      text: "🎨 Warna dipilih"
    });

    await safeDelete(chatId, messageId);
    return sendStartMenu(chatId, query.from);
  }

  // ================= MENU =================
  let caption = "";
  let replyMarkup = {};
  let selectedImage = "https://d.uguu.se/QcwEkseG.jpg"; // default biar aman

  if (data === "tols") {
    caption = `
╭━( 𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐬 𝐆𝐫𝐨𝐮𝐩𝐬 𝐕𝟏 )
┃ᝰ.ᐟ /info
┃╰┈➤ Check Telegram Account ID 
┃ᝰ.ᐟ 
┃╰┈➤ 
┃ᝰ.ᐟ 
┃╰┈➤ 
┃ᝰ.ᐟ 
┃╰┈➤  
┃ᝰ.ᐟ 
┃╰┈➤ 
┃ᝰ.ᐟ 
┃╰┈➤
┃ᝰ.ᐟ /
┃╰┈➤ 
┃ᝰ.ᐟ /
┃╰┈➤
┃ᝰ.ᐟ /
┃╰┈➤
┃ᝰ.ᐟ /
┃╰┈➤ 
┃ᝰ.ᐟ /
┃╰┈➤
╰━━━━━━━━━━━━━━━༉‧
`;
    replyMarkup = {
      inline_keyboard: [[
        { text: "[ ⎋ ] ʙᴀᴄᴋ ᴛᴏ ᴍᴇɴᴜ", callback_data: "back_to_main" }
      ]]
    };

  } else if (data === "memek") {
    caption = `
📁 MENU LAIN

Ini menu tambahan
`;
    replyMarkup = {
      inline_keyboard: [[
        { text: "[ ⎋ ] ʙᴀᴄᴋ ᴛᴏ ᴍᴇɴᴜ", callback_data: "back_to_main" }
      ]]
    };

  } else if (data === "back_to_main") {
    await bot.answerCallbackQuery(query.id);
    await safeDelete(chatId, messageId);
    return sendStartMenu(chatId, query.from);
  }

  // ================= SEND =================
  if (caption) {
    await safeDelete(chatId, messageId);

    await safeSend("photo", chatId, selectedImage, {
      caption,
      parse_mode: "HTML",
      reply_markup: replyMarkup
    });
  }

  await bot.answerCallbackQuery(query.id);
});
///tols
const quotes = [
  "Jangan mikir, nanti pusing 😎",
  "Makan dulu, baru mikir masalah hidup 🍕",
  "Kalau gagal, bilang aja rejeki lagi nyasar 😂",
  "Santai aja, semua orang salah kok 😏",
  "Kerja keras? Nanti dulu, tidur dulu 🛌",
  "Hidup itu kayak kopi, pahit tapi mantep ☕",
  "Kalau bingung, scroll HP aja 📱",
  "Jangan terlalu serius, nanti stres 😜",
  "Kalau nggak ngerti, pura-pura ngerti aja 😆",
  "Jangan cepat marah, nanti rugi 😎",
  "Nanti aja, hari ini belum mood 😴",
  "Kalau takut gagal, ya tetap gagal 😏",
  "Hidup itu singkat, mending main game 🎮",
  "Kalau laper, makan dulu baru mikir 🍔",
  "Jangan bandel, tapi bandel dikit gapapa 😅",
  "Tersenyumlah, orang lain bingung 😎",
  "Kalau bosen, scroll TikTok aja 📱",
  "Ngak papa salah, nanti belajar dari salah 😆",
  "Jangan terlalu mikir, nanti otak meledak 💥",
  "Kalau takut, pura-pura berani 😏",
  "Hidup itu drama, jadi nikmati aja 🎭",
  "Kalau nggak ngerti, tanya Google aja 🌐",
  "Nanti dulu, coffee time ☕",
  "Jangan terlalu serius, nanti tua lebih cepat 😜",
  "Kalau lelah, tidur aja dulu 💤",
  "Hidup itu puzzle, tapi kita nggak dapet manual 😎",
  "Kalau gagal, bilang aja lagi latihan 😆",
  "Jangan khawatir, nanti juga selesai 😏",
  "Kalau bingung, selfie aja dulu 🤳",
  "Hidup itu kayak meme, kadang nggak masuk akal 😂",
  "Kalau capek, rebahan aja dulu 😴",
  "Jangan pusing mikirin orang lain 😎",
  "Kalau takut, pura-pura santai aja 😏",
  "Hidup itu rollercoaster, nikmati tiap tikungan 🎢",
  "Kalau salah, tersenyum aja 😁",
  "Jangan serius banget, nanti sakit kepala 😜",
  "Kalau bingung, makan cokelat dulu 🍫",
  "Hidup itu kayak Wi-Fi, kadang full, kadang lelet 📶",
  "Kalau gagal, bilang aja nyoba eksperimen 😆",
  "Jangan buru-buru, nanti salah langkah 😏",
  "Kalau nggak ngerti, tanya temen aja 🤷‍♂️",
  "Hidup itu singkat, jadi skip drama 😎",
  "Kalau bosen, nonton anime aja 📺",
  "Jangan takut salah, salah itu keren 😅",
  "Kalau lelah, minum kopi dulu ☕",
  "Hidup itu kayak es krim, cair kalau kebanyakan mikir 🍦",
  "Kalau takut, pura-pura berani di chat 😏",
  "Jangan pusing, nanti rambut rontok 😜",
  "Kalau nggak ngerti, ketawa aja 😂",
  "Hidup itu lucu, jangan terlalu serius 😎",
  "Gagal itu urusan nanti, yang penting sombong dulu 😆",
  "Cita-cita setinggi langit, tenaga sebatas kasur 🛌",
  "Hidup tanpa cinta itu hampa, hidup tanpa kuota itu siksa 📱",
  "Oksigen itu gratis, yang bayar itu kalau lu masuk RS 🏥",
  "Jangan lari dari masalah, nanti capek, mending jalan santai 🚶‍♂️",
  "Masa depanmu tergantung pada mimpimu, jadi perbanyaklah tidur 😴",
  "Tuhan, kalau dia bukan jodohku, tolong hapus kata 'bukan' itu ✨",
  "Jodoh emang nggak kemana, tapi saingan dimana-mana 🏃‍♂️",
  "Uang bukan segalanya, tapi segalanya butuh uang 💸",
  "Belajarlah dari bulu ketek, walau terjepit tetap tegar 💪",
  "Gajian itu kayak mantan, cuma lewat doang 📉",
  "Kesuksesan berawal dari niat, kegagalan berawal dari 'nanti aja' 😏",
  "Dibalik pria sukses, ada banyak mantan yang menyesal 😎",
  "Jangan iri atas kesuksesan orang, lu nggak tau dia tidurnya jam berapa 🌙",
  "Bekerjalah sampai saldo rekeningmu terlihat seperti nomor telepon 📞",
  "Bermimpilah setinggi langit, kalau jatuh ya masuk UGD 🚑",
  "Cantik itu relatif, tergantung letak filter dan cahaya ✨",
  "Netizen adalah hakim paling jujur tapi nggak punya perasaan ⚖️",
  "Hidup itu berat, kalau ringan itu kapas ☁️",
  "Mantan itu alumni, nggak perlu daftar ulang 🎓",
  "Istiqomah itu berat, yang ringan itu istirahat 🛌",
  "Kalau ada yang nyariin gua, bilang aja gua lagi jadi orang kaya 💰",
  "Skripsi yang baik adalah skripsi yang selesai, bukan yang dipikirin 🎓",
  "Dunia itu bulat, kalau kotak itu nasi berkat 🍱",
  "Ganteng itu bonus, setia itu harus, kalau lu punya keduanya, lu halusinasi 🤣",
  "Jangan pernah menyerah, kecuali kalau udah ngantuk 💤",
  "Sahabat sejati itu yang kalau lu jatoh, dia ketawa dulu baru nolongin 😂",
  "Rejeki itu kayak jemuran, kalau mendung ya diangkat ⛈️",
  "Hargai kedua orang tuamu, mereka lulusan SD tapi bisa besarin sarjana 🎓",
  "Teknologi makin canggih, tapi perasaan manusia makin kuno 💔",
  "Kenyataan itu pahit, yang manis itu janji manisnya 🍭",
  "Diam itu emas, tapi kalau laper ya ngomong laper 🍔",
  "Hati-hati dengan lisan, luka hati susah sembuhnya 💉",
  "Sabar itu ada batasnya, kalau nggak ada batasnya namanya sabar tawakal ✨",
  "Cinta itu buta, tapi bisa bedain mana mobil mana motor 🚗",
  "Jangan pernah nengok ke belakang, kecuali kalau mau nyebrang 🛣️",
  "Pintar itu pilihan, bego itu bakat alami 😆",
  "Orang sukses itu banyak rencana, orang gagal itu banyak alasan 😏",
  "Waktu adalah uang, kalau lu nggak punya uang berarti lu nggak punya waktu 💸",
  "Jangan cuma jadi penonton bagi kesuksesan orang lain 🎭",
  "Jadilah diri sendiri, kecuali lu bisa jadi Batman 🦇",
  "Hidup adalah seni menggambar tanpa penghapus 🎨",
  "Kebohongan akan menyelamatkanmu sementara, tapi menghancurkanmu selamanya 💣",
  "Mencintai diri sendiri adalah awal dari romansa seumur hidup ❤️",
  "Pengetahuan adalah kekuatan, tapi karakter adalah segalanya 💎",
  "Masa lalu adalah sejarah, masa depan adalah misteri 🔮",
  "Kesalahan adalah bukti bahwa kamu sedang mencoba 🛠️",
  "Berhenti membandingkan dirimu dengan orang lain 🚫",
  "Lakukan sekarang, atau tidak sama sekali 🔥",
  "Vnxz - MD: Sistem stabil, user yang labil 😎"
];
// --- FUNGSI MENGGAMBAR KARTU ID ---
async function createIdCard(avatarUrl, name, username, userId, date, dcId) {
  const canvas = createCanvas(800, 500);
  const ctx = canvas.getContext('2d');

  // 1. Background Gradasi Premium (Navy to Ocean)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0a192f');
  gradient.addColorStop(0.6, '#112240');
  gradient.addColorStop(1, '#1d3557');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Efek Pola Hexagon (Visual Premium)
  ctx.strokeStyle = 'rgba(100, 255, 218, 0.05)';
  ctx.lineWidth = 1;
  const hexSize = 25;
  for (let y = 0; y < canvas.height + hexSize; y += hexSize * 1.5) {
    for (let x = 0; x < canvas.width + hexSize; x += hexSize * Math.sqrt(3)) {
      let cx = x + (y % (hexSize * 3) === 0 ? 0 : hexSize * Math.sqrt(3) / 2);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        ctx.lineTo(cx + hexSize * Math.cos(i * Math.PI / 3), y + hexSize * Math.sin(i * Math.PI / 3));
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // 3. Avatar (Foto Profil)
  try {
    const defaultAvatar = 'https://telegra.ph/file/857e233364952b655a6d3.jpg';
    const avatar = await loadImage(avatarUrl || defaultAvatar);
    
    // Glow effect untuk avatar
    ctx.shadowColor = 'rgba(100, 255, 218, 0.3)';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.6)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(175, 220, 115, 0, Math.PI * 2, true); 
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    ctx.save();
    ctx.beginPath();
    ctx.arc(175, 220, 110, 0, Math.PI * 2, true); 
    ctx.clip();
    ctx.drawImage(avatar, 65, 110, 220, 220); 
    ctx.restore();
  } catch (e) { console.error("Error Avatar:", e); }

  // 4. Teks Identitas (Posisi Lebih ke Atas)
  const mainTextColor = '#ffffff'; 
  const accentColor = '#64ffda';
  ctx.textBaseline = 'top';

  const startY = 110; // Dinaikkan dari 120 ke 110
  
  ctx.fillStyle = mainTextColor; 
  ctx.font = 'bold 24px Arial';
  ctx.fillText('TELEGRAM', 360, startY);
  
  ctx.font = 'bold 65px Arial'; // Font sedikit diperbesar
  ctx.fillText('ID CARD', 360, startY + 25);

  ctx.fillStyle = accentColor; 
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Vnxz - MD', 360, startY + 105); 

  // Data List
  ctx.fillStyle = mainTextColor;
  ctx.font = 'bold 22px Arial';
  const dataYStart = startY + 160;
  const lineSpacing = 45;

  const labels = ['User ID :', 'Username :', 'Tanggal :', 'DC ID :'];
  const values = [userId, username, date, dcId];

  labels.forEach((label, i) => {
    ctx.font = 'bold 22px Arial';
    ctx.fillText(label, 390, dataYStart + (i * lineSpacing));
    ctx.font = '22px Arial';
    ctx.fillText(values[i], 560, dataYStart + (i * lineSpacing));
  });

  // Small ID under avatar
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`ID: ${userId}`, 175, 365);

  // Footer
  ctx.textAlign = 'right';
  ctx.fillStyle = '#8892b0';
  ctx.font = '14px Arial';
  ctx.fillText('Generated by VinxzOfficial Md VnxzOfficial • @VinxzGanteng', 780, 485);

  return canvas.toBuffer('image/png');
}

// --- FUNGSI ANIMASI LOADING ---
async function sendLoadingAnimation(chatId) {
  const stages = [
    "⏳ [▢▢▢▢▢▢▢▢▢▢] 0%",
    "⏳ [■■■▢▢▢▢▢▢▢] 30%",
    "⏳ [■■■■■■▢▢▢▢] 60%",
    "⏳ [■■■■■■■■■■] 100%",
    "✅ **Selesai! Menampilkan hasil...**"
  ];
  const sentMsg = await bot.sendMessage(chatId, stages[0], { parse_mode: "HTML" });
  for (let i = 1; i < stages.length; i++) {
    await new Promise(res => setTimeout(res, 400));
    await bot.editMessageText(stages[i], { chat_id: chatId, message_id: sentMsg.message_id, parse_mode: "HTML" }).catch(() => {});
  }
  return sentMsg.message_id;
}

// --- COMMAND /INFO ---
bot.onText(/\/info(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  
  if (!isCmdOn("info")) {
    return bot.sendMessage(chatId, "❌ Command judi dimatikan");
  }
  
  let target = msg.reply_to_message ? msg.reply_to_message.from : (match[1] ? null : msg.from);
  
  if (match[1] && !msg.reply_to_message) {
    try { 
      const chatInfo = await bot.getChat(match[1].startsWith('@') ? match[1] : `@${match[1].replace('@', '')}`);
      target = chatInfo;
    } catch (e) { return bot.sendMessage(chatId, "❌ User tidak ditemukan."); }
  }

  const loadingMsgId = await sendLoadingAnimation(chatId);
  let photoUrl = null;
  try {
    const profile = await bot.getUserProfilePhotos(target.id, { limit: 1 });
    if (profile.total_count > 0) photoUrl = await bot.getFileLink(profile.photos[0][0].file_id);
  } catch (e) {}

  const name = target.first_name || "User";
  const userNm = target.username ? '@' + target.username : "tidak ada";
  const uid = target.id.toString();
  const date = new Date().toISOString().split('T')[0];
  
  const cardBuffer = await createIdCard(photoUrl, name, userNm, uid, date, "1");

  if (cardBuffer) {
    const caption = `<blockquote>👤 USER INFO CARD</blockquote>\n\n` +
                    `◦ <b>Nama:</b> ${name}\n` +
                    `◦ <b>ID:</b> \`${uid}\`\n` +
                    `◦ <b>Username:</b> ${userNm}\n` +
                    `◦ <b>Date:</b> ${date}\n\n` +
                    `<em>"${quotes[Math.floor(Math.random() * quotes.length)]}"</em>`;

    await bot.sendPhoto(chatId, cardBuffer, { 
      caption: caption, 
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "ᴀᴜᴛʜᴏʀ", url: "https://t.me/VinxzGanteng", style: "primary" }, 
          { text: "ᴄʜᴀɴɴᴇʟ ᴀᴜᴛʜᴏʀ", url: "https://t.me/vnxzgntng", style: "success" }
        ], 
        [
        {text: "ʙᴏᴛ ᴍᴅ", url: "https://t.me/MultiDivaceVnxz_bot", style: "danger" }
        ]
        ]
      }
    });
    bot.deleteMessage(chatId, loadingMsgId).catch(() => {});
  }
});

// --- COMMAND /ID ---
bot.onText(/\/id(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
    if (!isCmdOn("id")) {
    return bot.sendMessage(chatId, "❌ Command judi dimatikan");
  }
  try {
    const targetChat = match[1] ? await bot.getChat(match[1].startsWith('@') ? match[1] : `@${match[1].replace('@', '')}`) : await bot.getChat(chatId);
    const loadingMsgId = await sendLoadingAnimation(chatId);
    
    let photoUrl = targetChat.photo ? await bot.getFileLink(targetChat.photo.big_file_id) : null;
    const title = targetChat.title || "Group/Channel";
    const userNm = targetChat.username ? '@' + targetChat.username : "Public";
    const cid = targetChat.id.toString();
    const date = new Date().toISOString().split('T')[0];

    const cardBuffer = await createIdCard(photoUrl, title, userNm, cid, date, "N/A");

    if (cardBuffer) {
      const caption = `📢 *${targetChat.type.toUpperCase()} INFO CARD*\n\n` +
                      `◦ *Title:* ${title}\n` +
                      `◦ *ID:* \`${cid}\`\n` +
                      `◦ *Username:* ${userNm}\n` +
                      `◦ *Type:* ${targetChat.type}\n\n` +
                      `_"${quotes[Math.floor(Math.random() * quotes.length)]}"_`;

      await bot.sendPhoto(chatId, cardBuffer, { 
        caption: caption, 
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
          { text: "ᴀᴜᴛʜᴏʀ", url: "https://t.me/VinxzGanteng", style: "primary" }, 
          { text: "ᴄʜᴀɴɴᴇʟ ᴀᴜᴛʜᴏʀ", url: "https://t.me/vnxzgntng", style: "success" }
        ], 
        [
        {text: "ʙᴏᴛ ᴍᴅ", url: "https://t.me/MultiDivaceVnxz_bot", style: "danger" }
        ]]
        }
      });
      bot.deleteMessage(chatId, loadingMsgId).catch(() => {});
    }
  } catch (e) { bot.sendMessage(chatId, "❌ Gagal memproses data."); }
});
function isAdmin(msg) {
  return bot.getChatAdministrators(msg.chat.id).then(admins => {
    return admins.some(a => a.user.id === msg.from.id);
  }).catch(() => false);
}
bot.onText(/\/pin/, async (msg) => {
  const chatId = msg.chat.id;
    if (!isCmdOn("pin")) {
    return bot.sendMessage(chatId, "❌ Command judi dimatikan");
  }

  if (!(await isAdmin(msg))) {
    return bot.sendMessage(chatId, "⚠️ Hanya admin grup yang bisa pin pesan.");
  }

  const replyMsg = msg.reply_to_message;
  if (!replyMsg) {
    return bot.sendMessage(chatId, "⚠️ Balas pesan yang ingin dipin dengan /pin.");
  }

  try {
    // Pin pesan apapun (teks, foto, video, dokumen, sticker, dll)
    await bot.pinChatMessage(chatId, replyMsg.message_id, { disable_notification: false });
    bot.sendMessage(
      chatId,
      `📌 Pesan berhasil dipin oleh admin @${msg.from.username || msg.from.first_name}.`
    );
  } catch (err) {
    console.log('Gagal pin pesan:', err.message);
    bot.sendMessage(
      chatId,
      "❌ Gagal pin pesan. Pastikan bot punya izin admin untuk mempin pesan."
    );
  }
});

bot.onText(/\/unpin/, async (msg) => {
  const chatId = msg.chat.id;
    if (!isCmdOn("unpin")) {
    return bot.sendMessage(chatId, "❌ Command judi dimatikan");
  }

  if (!(await isAdmin(msg))) {
    return bot.sendMessage(chatId, "⚠️ Hanya admin grup yang bisa unpin pesan.");
  }

  try {
    await bot.unpinChatMessage(chatId);
    bot.sendMessage(chatId, "📌 Pesan yang dipin berhasil dilepas.");
  } catch (err) {
    console.log('Gagal unpin pesan:', err.message);
    bot.sendMessage(
      chatId,
      "❌ Gagal unpin pesan. Pastikan bot punya izin admin untuk mempin pesan."
    );
  }
});
const KONTOL = ['8223112057']; // ID owner (pastikan ID benar)
const MEMEK_ID = '@vnxzgntng';
bot.onText(/\/req (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const requestText = match[1];
    if (!isCmdOn("req")) {
    return bot.sendMessage(chatId, "❌ Command judi dimatikan");
  }

  try {
    // 1. Ambil foto profil user
    let profilePhotoId = null;
    try {
      const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });
      if (photos && photos.total_count > 0) {
        profilePhotoId = photos.photos[0][0].file_id;
      }
    } catch (e) {
      console.log("User menyembunyikan foto profil atau error.");
    }

    // 2. Susun data
    const name = escapeHTML(`${msg.from.first_name} ${msg.from.last_name || ""}`.trim());
    const username = msg.from.username ? `@${escapeHTML(msg.from.username)}` : "Tidak ada";
    const cleanRequest = escapeHTML(requestText);
    const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    let messageToSend = `<blockquote>📨 Request Baru Dari User</blockquote>\n` +
      `──────────────────\n` +
      `👤 𝗡𝗮𝗺𝗮: <b>${name}</b>\n` +
      `🔗 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: ${username}\n` +
      `🆔 𝗜𝗱: <code>${userId}</code>\n` +
      `💬 𝗣𝗲𝘀𝗮𝗻: ${cleanRequest}\n` +
      `🗓 𝗪𝗮𝗸𝘁𝘂: ${waktu}\n` +
      `──────────────────`;

    // 3. Inline keyboard (Dihapus properti 'style' karena tidak standar API Telegram)
    const opts = {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💬 ᴄʜᴀᴛ ᴘᴇɴɢɪʀɪᴍ", url: `tg://user?id=${userId}`, style: "primary" },
            { text: "☄️ ᴀᴜᴛʜᴏʀ", url: "https://t.me/VinxzGanteng", style: "success" }
          ],
          [
            { text: "🎐 ᴄʜᴀɴɴᴇʟ", url: "https://t.me/vnxzgntng", style: "primary" }, 
            { text: "🤖 ʙᴏᴛ ᴍᴅ", url: "https://t.me/MultiDivaceVnxz_bot", style: "success" }
          ]
        ]
      }
    };

    // 4. Fungsi kirim
    const sendToTarget = async (targetId) => {
      try {
        if (profilePhotoId) {
          await bot.sendPhoto(targetId, profilePhotoId, { caption: messageToSend, ...opts });
        } else {
          await bot.sendMessage(targetId, messageToSend, opts);
        }
      } catch (e) {
        console.error(`Gagal kirim ke ${targetId}:`, e.message);
      }
    };

    // Gabungkan Channel ID dengan daftar Owner ID
    const targets = [MEMEK_ID, ...KONTOL];
    
    // Kirim ke semua target
    await Promise.all(targets.map(id => sendToTarget(id)));

    // Balasan ke user pengirim
    await bot.sendMessage(chatId, "✅ <b>Requestmu telah terkirim!</b>\nAdmin akan segera mengeceknya.", { parse_mode: "HTML" });

  } catch (err) {
    console.error("Crash Avoided:", err);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat memproses request.");
  }
});
bot.onText(/\/on (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isMekiw(userId)) {
    return bot.sendMessage(chatId, "❌ Khusus owner");
  }

  const cmd = match[1].toLowerCase();

  const data = getCmdStatus();
  data[cmd] = true;
  saveCmdStatus(data);

  bot.sendMessage(chatId, `✅ Command *${cmd}* berhasil diaktifkan`, {
    parse_mode: "Markdown"
  });
});

bot.onText(/\/off (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isMekiw(userId)) {
    return bot.sendMessage(chatId, "❌ Khusus owner");
  }

  const cmd = match[1].toLowerCase();

  const data = getCmdStatus();
  data[cmd] = false;
  saveCmdStatus(data);

  bot.sendMessage(chatId, `❌ Command *${cmd}* berhasil dimatikan`, {
    parse_mode: "Markdown"
  });
});

bot.onText(/\/listcmd/, (msg) => {
  const chatId = msg.chat.id;
  const data = getCmdStatus();

  if (Object.keys(data).length === 0) {
    return bot.sendMessage(chatId, "📭 Belum ada command diatur");
  }

  let text = "📋 Status Command:\n\n";

  for (let cmd in data) {
    text += `• ${cmd} : ${data[cmd] ? "✅ ON" : "❌ OFF"}\n`;
  }

  bot.sendMessage(chatId, text);
});





















// ~ function Bugs 

// ~ End Function Bugs