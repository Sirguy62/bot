require("dotenv").config();
const { Client } = require("discord.js-selfbot-v13");
const keep_alive = require("./keep_alive");

const TOKENS = process.env.TOKENS.split(",").map((t) => t.trim());
const CHANNEL_IDS = process.env.CHANNEL_IDS.split(",").map((id) => id.trim());

const recentJoinsMap = new Map();

TOKENS.forEach((token, index) => {
  const tokenPreview = token.slice(0, 10) + "...";
  const CHANNEL_ID = CHANNEL_IDS[index] || CHANNEL_IDS[0];
  const client = new Client();
  const recentJoins = new Set();
  recentJoinsMap.set(token, recentJoins);

  let instanceName = `Token ${index + 1} (${tokenPreview})`;

  client.once("ready", () => {
    const guild = client.guilds.cache.first();
    const guildName = guild ? guild.name : "Unknown Guild";
    instanceName = `Guild: ${guildName}`;
    console.log(`✅ Logged in as ${client.user.tag} - ${instanceName}`);
    console.log(`📡 Monitoring channel: ${CHANNEL_ID} in ${instanceName}`);
  });

  client.on("guildMemberAdd", async (member) => {
    if (recentJoins.has(member.id)) return;
    recentJoins.add(member.id);
    setTimeout(() => recentJoins.delete(member.id), 5000);

    try {
      const channel = client.channels.cache.get(CHANNEL_ID);
      if (channel) {
        await channel.send(`📢 A new member **${member.user.tag}** joined **${member.guild.name}**!`);
        console.log(`📨 Sent join message for ${member.user.tag} via ${instanceName}`);
      } else {
        console.error(`⚠️ Channel ${CHANNEL_ID} not found for ${instanceName}`);
      }
    } catch (err) {
      console.error(`❌ Error sending join message in ${instanceName} (Channel ${CHANNEL_ID}):`, err);
    }
  });

  // Attempt to login and catch any failures
  client.login(token).catch((err) => {
    console.error(`❌ Failed to login with token ${index + 1}: ${tokenPreview}`);
    console.error(`🔎 Target Channel ID: ${CHANNEL_ID}`);
    console.error(`📛 Could not resolve client.user.tag — token is invalid`);
    console.error(`💥 Reason: ${err.message || err}`);
  });
});

keep_alive();
