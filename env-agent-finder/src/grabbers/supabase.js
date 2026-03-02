const { openPage, waitForUserLogin, askUser } = require("./browser");

module.exports = {
  name: "Supabase",
  vars: ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],

  async grab() {
    const results = {};

    console.log("  📍 Opening Supabase dashboard...");
    const page = await openPage("https://supabase.com/dashboard/sign-in");

    await waitForUserLogin(page, null, "Supabase");

    console.log("  📍 Navigating to projects...");
    await page.goto("https://supabase.com/dashboard/projects", { waitUntil: "networkidle2", timeout: 30000 });
    await page.waitForTimeout(3000);

    // Ask which project to use
    console.log("");
    console.log("  💡 Select your project in the browser window, then:");
    const projectRef = await askUser("  Paste your Supabase project URL (e.g. https://supabase.com/dashboard/project/abc123) or project ref: ");

    let ref = projectRef;
    if (projectRef.includes("/project/")) {
      ref = projectRef.split("/project/")[1].split(/[/?#]/)[0];
    }

    if (ref) {
      console.log(`  📍 Opening project settings for: ${ref}`);
      await page.goto(`https://supabase.com/dashboard/project/${ref}/settings/api`, { waitUntil: "networkidle2", timeout: 30000 });
      await page.waitForTimeout(3000);

      // Try to extract values from the API settings page
      try {
        const extracted = await page.evaluate(() => {
          const text = document.body.innerText;
          const result = {};

          // Project URL
          const urlMatch = text.match(/(https:\/\/[a-z0-9]+\.supabase\.co)/);
          if (urlMatch) result.url = urlMatch[1];

          // Anon key (starts with eyJ)
          const anonMatch = text.match(/(eyJ[A-Za-z0-9_-]{100,})/);
          if (anonMatch) result.anonKey = anonMatch[1];

          return result;
        });

        if (extracted.url) {
          results.SUPABASE_URL = extracted.url;
          results.NEXT_PUBLIC_SUPABASE_URL = extracted.url;
          console.log(`  ✅ SUPABASE_URL = ${extracted.url}`);
        }

        if (extracted.anonKey) {
          results.SUPABASE_ANON_KEY = extracted.anonKey;
          results.NEXT_PUBLIC_SUPABASE_ANON_KEY = extracted.anonKey;
          console.log(`  ✅ SUPABASE_ANON_KEY = ${extracted.anonKey.substring(0, 30)}...`);
        }
      } catch {}

      // Service role key is usually hidden — ask user to reveal and paste
      if (!results.SUPABASE_SERVICE_ROLE_KEY) {
        console.log("");
        console.log("  💡 For the service_role key, click 'Reveal' next to it in the browser, then:");
        const srKey = await askUser("  Paste your SUPABASE_SERVICE_ROLE_KEY (or Enter to skip): ");
        if (srKey) {
          results.SUPABASE_SERVICE_ROLE_KEY = srKey;
          console.log("  ✅ SUPABASE_SERVICE_ROLE_KEY saved");
        }
      }
    }

    // Fallbacks
    if (!results.SUPABASE_URL) {
      const url = await askUser("  Paste your SUPABASE_URL (or Enter to skip): ");
      if (url) { results.SUPABASE_URL = url; results.NEXT_PUBLIC_SUPABASE_URL = url; }
    }
    if (!results.SUPABASE_ANON_KEY) {
      const key = await askUser("  Paste your SUPABASE_ANON_KEY (or Enter to skip): ");
      if (key) { results.SUPABASE_ANON_KEY = key; results.NEXT_PUBLIC_SUPABASE_ANON_KEY = key; }
    }

    await page.close();
    return results;
  },
};
