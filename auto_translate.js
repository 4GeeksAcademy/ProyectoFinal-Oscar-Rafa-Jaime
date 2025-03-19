const fs = require("fs");
const fetch = require("node-fetch");

// 🔑 Your Google Cloud Translation API Key
const API_KEY = "AIzaSyA7X03N8ZFLmU3zB4DmRTt4sQS3BxVw_Vc"; // Replace with your actual API key from Google Cloud
const URL = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

// 📂 File paths
const enFile = "./src/translations/en.json";  // Make sure this is the correct path to your en.json file
const esFile = "./src/translations/es.json"; // Make sure this is the correct path to your es.json file

// 🗂 Load JSON files
const en = JSON.parse(fs.readFileSync(enFile, "utf8"));
const es = JSON.parse(fs.readFileSync(esFile, "utf8"));

// 🌍 Find missing translations in Spanish
const missingInEs = Object.keys(en).filter(key => !(key in es));

async function translateText(text) {
  const response = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target: "es", source: "en" })
  });

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

async function autoFillMissingTranslations() {
  for (const key of missingInEs) {
    es[key] = await translateText(en[key]);
    console.log(`✅ Translated: ${en[key]} ➡️ ${es[key]}`);
  }

  // ✍️ Save updated Spanish translations
  fs.writeFileSync(esFile, JSON.stringify(es, null, 2));
  console.log("🚀 es.json updated with missing translations!");
}

// 🏃 Run the function
autoFillMissingTranslations();
