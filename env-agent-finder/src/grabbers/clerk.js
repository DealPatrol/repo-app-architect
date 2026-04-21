const { openPage, waitForUserLogin, askUser } = require("./browser");

module.exports = {
  name: "Clerk",
  vars: ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],

  async grab() {
    const results = {};

    console.log("  📍 Opening Clerk dashboard...");
    const page = await openPage("https://dashboard.clerk.com/sign-in");

    await waitForUserLogin(page, null, "Clerk");

    console.log("  📍 Looking for API keys...");
    await page.waitForTimeout(2000);

    // Try to navigate to API keys
    try {
      const extracted = await page.evaluate(() => {
        const text = document.body.innerText;
        const result = {};

        const pkMatch = text.match(/(pk_(?:test|live)_[A-Za-z0-9]+)/);
        if (pkMatch) result.publishable = pkMatch[1];

        const skMatch = text.match(/(sk_(?:test|live)_[A-Za-z0-9]+)/);
        if (skMatch) result.secret = skMatch[1];

        return result;
      });

      if (extracted.publishable) {
        results.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = extracted.publishable;
        console.log(`  ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = ${extracted.publishable.substring(0, 20)}...`);
      }

      if (extracted.secret) {
        results.CLERK_SECRET_KEY = extracted.secret;
        console.log(`  ✅ CLERK_SECRET_KEY = ${extracted.secret.substring(0, 15)}...`);
      }
    } catch {}

    console.log("");
    console.log("  💡 In the Clerk dashboard:");
    console.log("     1. Select your application");
    console.log("     2. Go to 'API Keys' in the sidebar");
    console.log("     3. Copy the keys shown");
    console.log("");

    if (!results.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      const pk = await askUser("  Paste NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (or Enter to skip): ");
      if (pk) results.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk;
    }

    if (!results.CLERK_SECRET_KEY) {
      const sk = await askUser("  Paste CLERK_SECRET_KEY (or Enter to skip): ");
      if (sk) results.CLERK_SECRET_KEY = sk;
    }

    await page.close();
    return results;
  },
};
