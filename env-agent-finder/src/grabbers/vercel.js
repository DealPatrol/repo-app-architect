const { openPage, waitForUserLogin, askUser } = require("./browser");

module.exports = {
  name: "Vercel",
  vars: ["BLOB_READ_WRITE_TOKEN"],

  async grab() {
    const results = {};

    console.log("  📍 Opening Vercel dashboard...");
    const page = await openPage("https://vercel.com/login");

    await waitForUserLogin(page, null, "Vercel");

    console.log("  📍 Navigating to Blob stores...");
    await page.goto("https://vercel.com/dashboard/stores", { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log("");
    console.log("  💡 In the browser window:");
    console.log("     1. Click on your Blob store (or create one)");
    console.log("     2. Go to the store settings");
    console.log("     3. Find and copy the BLOB_READ_WRITE_TOKEN");
    console.log("");

    const token = await askUser("  Paste your BLOB_READ_WRITE_TOKEN (or Enter to skip): ");
    if (token) {
      results.BLOB_READ_WRITE_TOKEN = token;
      console.log("  ✅ BLOB_READ_WRITE_TOKEN saved");
    }

    await page.close();
    return results;
  },
};
