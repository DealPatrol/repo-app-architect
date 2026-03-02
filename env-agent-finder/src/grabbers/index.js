const stripe = require("./stripe");
const openai = require("./openai");
const supabase = require("./supabase");
const vercel = require("./vercel");
const clerk = require("./clerk");
const anthropic = require("./anthropic");

const ALL_GRABBERS = [stripe, openai, anthropic, supabase, vercel, clerk];

function findGrabbersForServices(services, missingVars) {
  const missingSet = new Set(missingVars.map((v) => v.name));
  const needed = [];

  for (const grabber of ALL_GRABBERS) {
    const hasOverlap = grabber.vars.some((v) => missingSet.has(v));
    const serviceDetected = services.some(
      (s) => s.name.toLowerCase().includes(grabber.name.toLowerCase()) ||
             grabber.name.toLowerCase().includes(s.name.toLowerCase())
    );

    if (hasOverlap || serviceDetected) {
      const relevantVars = grabber.vars.filter((v) => missingSet.has(v));
      if (relevantVars.length > 0) {
        needed.push({ grabber, relevantVars });
      }
    }
  }

  return needed;
}

module.exports = { ALL_GRABBERS, findGrabbersForServices };
