const puppeteer = require("puppeteer");
const readline = require("readline");

let browser = null;

async function launchBrowser() {
  if (browser) return browser;

  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1280,800",
    ],
  });

  browser.on("disconnected", () => { browser = null; });
  return browser;
}

async function closeBrowser() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

async function openPage(url) {
  const b = await launchBrowser();
  const page = await b.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  return page;
}

async function waitForUserLogin(page, checkSelector, serviceName) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });

  console.log("");
  console.log(`  🔐 ${serviceName}: Please log in using the browser window.`);
  console.log(`     Once you're logged in, press ENTER here to continue...`);
  console.log("");

  await new Promise((resolve) => {
    rl.question("  Press ENTER when logged in > ", () => {
      rl.close();
      resolve();
    });
  });

  if (checkSelector) {
    try {
      await page.waitForSelector(checkSelector, { timeout: 5000 });
    } catch {
      // User said they're logged in, trust them
    }
  }
}

async function extractText(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return await page.$eval(selector, (el) => el.textContent.trim());
  } catch {
    return null;
  }
}

async function extractInputValue(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return await page.$eval(selector, (el) => el.value || el.textContent?.trim());
  } catch {
    return null;
  }
}

async function clickAndWait(page, selector, waitMs = 2000) {
  try {
    await page.click(selector);
    await page.waitForTimeout(waitMs);
  } catch {}
}

async function askUser(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

module.exports = {
  launchBrowser,
  closeBrowser,
  openPage,
  waitForUserLogin,
  extractText,
  extractInputValue,
  clickAndWait,
  askUser,
};
