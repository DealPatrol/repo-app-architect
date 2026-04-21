const { openPage, waitForUserLogin, extractText, clickAndWait, askUser } = require("./browser");

module.exports = {
  name: "Stripe",
  vars: ["STRIPE_SECRET_KEY", "STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],

  async grab() {
    const results = {};

    console.log("  📍 Opening Stripe dashboard...");
    const page = await openPage("https://dashboard.stripe.com/login");

    await waitForUserLogin(page, '[data-testid="developers-nav-item"]', "Stripe");

    console.log("  📍 Navigating to API keys...");
    await page.goto("https://dashboard.stripe.com/test/apikeys", { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForTimeout(3000);

    // Try to extract publishable key
    try {
      const pkKey = await page.evaluate(() => {
        const rows = document.querySelectorAll('[class*="KeyRow"], tr, [data-testid]');
        for (const row of rows) {
          const text = row.textContent || "";
          if (text.includes("pk_test_") || text.includes("pk_live_")) {
            const match = text.match(/(pk_(?:test|live)_[A-Za-z0-9]+)/);
            if (match) return match[1];
          }
        }
        const all = document.body.innerText;
        const m = all.match(/(pk_(?:test|live)_[A-Za-z0-9]+)/);
        return m ? m[1] : null;
      });

      if (pkKey) {
        results.STRIPE_PUBLISHABLE_KEY = pkKey;
        console.log(`  ✅ STRIPE_PUBLISHABLE_KEY = ${pkKey.substring(0, 20)}...`);
      }
    } catch {}

    // Secret key needs to be revealed
    try {
      const skKey = await page.evaluate(() => {
        const all = document.body.innerText;
        const m = all.match(/(sk_(?:test|live)_[A-Za-z0-9]+)/);
        return m ? m[1] : null;
      });

      if (skKey) {
        results.STRIPE_SECRET_KEY = skKey;
        console.log(`  ✅ STRIPE_SECRET_KEY = ${skKey.substring(0, 15)}...`);
      } else {
        console.log("  ⚠️  Secret key is hidden. Click 'Reveal test key' in the browser, then:");
        const manual = await askUser("  Paste your STRIPE_SECRET_KEY (or Enter to skip): ");
        if (manual) results.STRIPE_SECRET_KEY = manual;
      }
    } catch {}

    // Publishable key fallback
    if (!results.STRIPE_PUBLISHABLE_KEY) {
      const manual = await askUser("  Paste your STRIPE_PUBLISHABLE_KEY (or Enter to skip): ");
      if (manual) results.STRIPE_PUBLISHABLE_KEY = manual;
    }

    await page.close();
    return results;
  },
};
