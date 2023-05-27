const qrcode = require("qrcode-terminal");
const { Client, MessageMedia } = require("whatsapp-web.js");
const firebase = require("firebase/compat/app");
require("./firebase.js");
require("firebase/compat/storage");
require("firebase/compat/firestore");
const cron = require("node-cron");
const moment = require("moment");

let targetGroup;

function sendMsg() {
  const filename = moment().format("L").replaceAll("/", ".");
  const storageRef = firebase.storage().ref().child(`${filename}.jpg`);
  // Get the download URL
  storageRef
    .getDownloadURL()
    .then((downloadURL) => {
      return MessageMedia.fromUrl(downloadURL);
    })
    .then((media) => {
      client.sendMessage(targetGroup.id._serialized, media);
      console.log("msg sent");
    });
}

// Use the saved values
const client = new Client({
  puppeteer: {
    args: ["--no-sandbox"],
  },
});

// Save session values to the file upon successful auth
client.on("authenticated", (session) => {
  console.log(session);
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  console.log("client ready");
  const groups = await client.getChats();
  targetGroup = groups.find((group) => group.name === "R k Illam");
  sendMsg();
});

cron.schedule("00 06 * * *", () => {
  sendMsg();
});

client.initialize();
