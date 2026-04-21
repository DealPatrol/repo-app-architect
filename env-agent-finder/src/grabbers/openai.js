const { openPage, waitForUserLogin, askUser } = require("./browser");

module.exports = {
  name: "OpenAI",
  vars: ["OPENAI_API_KEY"],

  async grab() {
    const results = {};

    console.log("  📍 Opening OpenAI dashboard...");
    const page = await openPage("https://platform.openai.com/login");

    await waitForUserLogin(page, null, "OpenAI");

    console.log("  📍 Navigating to API keys...");
    await page.goto("https://platform.openai.com/api-keys", { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log("  📍 Looking for 'Create new secret key' button...");

    try {
      const createBtn = await page.$('button:has-text("Create new secret key"), [data-testid="create-api-key-button"]');
      if (createBtn) {
        console.log("");
        console.log("  💡 To grab a key automatically:");
        console.log("     1. Click 'Create new secret key' in the browser");
        console.log("     2. Give it a name (e.g. 'env-agent-finder')");
        console.log("     3. Copy the key that appears");
        console.log("     4. Paste it below");
        console.log("");
      }
    } catch {}

    // OpenAI never shows existing keys in full, so we always need the user to create/paste
    const key = await askUser("  Paste your OPENAI_API_KEY (or Enter to skip): ");
    if (key) {
      results.OPENAI_API_KEY = key;
      console.log("  ✅ OPENAI_API_KEY saved");
    }

    await page.close();
    return results;
  },
};
