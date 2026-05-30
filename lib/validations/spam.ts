// A deliberately small, hand-curated set of triggers. We rely more on URL/email
// detection than a giant wordlist — most spam is a link, not a word.

const SPAM_WORDS = new Set([
  // Commercial / promo
  "buy",
  "buynow",
  "purchase",
  "shop",
  "discount",
  "promo",
  "promocode",
  "coupon",
  "sale",
  "cheap",
  "deal",
  "deals",
  "subscribe",
  "subscription",
  "course",
  "ebook",
  "webinar",
  "masterclass",
  "bootcamp",
  // Money / scams
  "earn",
  "earnings",
  "income",
  "passive",
  "rich",
  "millionaire",
  "investment",
  "invest",
  "crypto",
  "btc",
  "bitcoin",
  "nft",
  "airdrop",
  "forex",
  "trade",
  "signals",
  "loan",
  "loans",
  "credit",
  "payday",
  "casino",
  "betting",
  "gambling",
  "lottery",
  "winner",
  "prize",
  // SEO / engagement bait
  "click",
  "clickhere",
  "follow",
  "followme",
  "dm",
  "viral",
  "trending",
  "telegram",
  "whatsapp",
  // Adult
  "porn",
  "xxx",
  "sex",
  "nude",
  "escort",
  "onlyfans",
  // Pharma
  "viagra",
  "cialis",
  "pills",
  "weightloss",
]);

// Anything that looks like a URL, even bare domains like "explicitwebsite.com"
const URL_LIKE = /(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|io|co|app|xyz|info|biz|me|tv|ng|us|uk|de|ru|cn|store|shop|site|click|link|tk|ml|gq|cf|ga|live))/i;

// Email-looking addresses
const EMAIL_LIKE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

// Common social handles ("@username") of >= 2 chars
const SOCIAL_HANDLE = /(?:^|\s)@[a-z0-9_.]{2,}/i;

// Phone-number-ish: at least 7 digits, allowing +, spaces, dashes, parens
const PHONE_LIKE = /(?:\+?\d[\d\s\-().]{6,}\d)/;

const NORMALIZER = /[^a-z0-9\s]/g;

function tokenize(input: string): Set<string> {
  return new Set(
    input
      .toLowerCase()
      .replace(NORMALIZER, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

function intersects(tokens: Set<string>, banned: Set<string>): string | null {
  for (const tok of tokens) {
    if (banned.has(tok)) {
      return tok;
    }
  }
  return null;
}

export interface SpamCheckResult {
  ok: boolean;
  reason?: string;
}

export function checkForSpam(
  text: string,
  author?: string | null
): SpamCheckResult {
  const combined = `${text} ${author ?? ""}`;

  if (URL_LIKE.test(combined)) {
    return { ok: false, reason: "Quotes can’t contain links or websites." };
  }
  if (EMAIL_LIKE.test(combined)) {
    return { ok: false, reason: "Quotes can’t contain email addresses." };
  }
  if (PHONE_LIKE.test(combined)) {
    return { ok: false, reason: "Quotes can’t contain phone numbers." };
  }
  if (SOCIAL_HANDLE.test(combined)) {
    return { ok: false, reason: "Quotes can’t contain @handles." };
  }

  const hit = intersects(tokenize(combined), SPAM_WORDS);
  if (hit) {
    return {
      ok: false,
      reason: `“${hit}” isn’t allowed — Verse is for quotes, not promotions.`,
    };
  }

  return { ok: true };
}
