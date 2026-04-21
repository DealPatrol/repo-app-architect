const { openPage, waitForUserLogin, askUser } = require("./browser");

module.exports = {
  name: "Anthropic",
  vars: ["ANTHROPIC_API_KEY"],

  async grab() {
    const results = {};

    console.log("  📍 Opening Anthropic console...");
    const page = await openPage("https://console.anthropic.com/login");

    await waitForUserLogin(page, null, "Anthropic");

    console.log("  📍 Navigating to API keys...");
    await page.goto("https://console.anthropic.com/settings/keys", { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log("");
    console.log("  💡 In the browser window:");
    console.log("     1. Click 'Create Key'");
    console.log("     2. Copy the key that appears");
    console.log("     3. Paste it below");
    console.log("");

    const key = await askUser("  Paste your ANTHROPIC_API_KEY (or Enter to skip): ");
    if (key) {
      results.ANTHROPIC_API_KEY = key;
      console.log("  ✅ ANTHROPIC_API_KEY saved");
    }

    await page.close();
    return results;
  },
};
