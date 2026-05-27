const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'articles.json');
let articles = [];
try {
  articles = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (e) {
  console.error('Error loading articles.json:', e);
  process.exit(1);
}

// Hardcoded mapping for exact phrases that don't match titles directly
const hardcodedMappings = {
  "blackrock crypto earnings beat expectations as etf flows return": "blackrock-bitcoin-sell-controversy",
  "defi hacks drop 28% in q1 but exploit value hits record": "verus-ethereum-exploit-11-6-million",
  "us lawmakers reintroduce stablecoin bill with bipartisan support": "hong-kong-stablecoin-ethereum-testing",
  "michael saylor's strategy pauses weekly bitcoin purchases ahead of q1 earnings release": "mubadala-565m-bitcoin-etf",
  "michael saylors strategy pauses weekly bitcoin purchases ahead of q1 earnings release": "mubadala-565m-bitcoin-etf",
  "michael saylor's strategy pause signals a new phase in corporate bitcoin treasury management": "mubadala-565m-bitcoin-etf",
  "michael saylors strategy pause signals a new phase in corporate bitcoin treasury management": "mubadala-565m-bitcoin-etf",
  "founders are speaking less like builders and more like political operators": "how-founder-narratives-now-steer-token-market-reality",
  "the loudest accounts are no longer just amplifiers they are informal gatekeepers": "trading-venues-shape-market-perception",
  "the loudest accounts are no longer just amplifiers, they are informal gatekeepers": "trading-venues-shape-market-perception",
  "which vc firms quietly rotated out of layer 1 bets and into infrastructure": "tokenized-stocks-1-6b-ethereum",
  "how we analyze bias": "why-regulators-are-quietly-watching-crypto-risk",
  "learn more about our process": "why-regulators-are-quietly-watching-crypto-risk",
  "view all sources": "why-regulators-are-quietly-watching-crypto-risk",
  "australia's premier crypto event returns for 2025": "australia-crypto-event-2025",
  "australia's premier crypto event returns": "australia-crypto-event-2025",
  "australias premier crypto event returns": "australia-crypto-event-2025",
  "air summit 2026: where ai powers the next wave of innovation": "air-summit-2026",
  "air summit 2026 where ai powers the next wave of innovation": "air-summit-2026",
  "air summit 2026": "air-summit-2026",
  "fintech revolution summit 2026": "fintech-revolution-summit-2026"
};

// Token cleaning helper
const stopWords = new Set(["the", "a", "an", "of", "and", "in", "on", "at", "to", "for", "is", "are", "was", "were", "with", "about", "as", "by", "that", "this", "but", "who", "its", "it"]);
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.has(word));
}

// Find closest article by title token match
function findMatchingArticle(titleText) {
  const cleanQuery = titleText.trim().toLowerCase().replace(/[,\s]+/g, ' ');
  
  // 1. Check hardcoded mappings first
  for (const [phrase, slug] of Object.entries(hardcodedMappings)) {
    if (cleanQuery.includes(phrase) || phrase.includes(cleanQuery)) {
      const match = articles.find(a => a.slug === slug);
      if (match) return match;
      // If it is one of the manual static files not in JSON
      if (slug === 'australia-crypto-event-2025' || slug === 'air-summit-2026' || slug === 'fintech-revolution-summit-2026') {
        return { slug };
      }
    }
  }

  // 2. Token based matching
  const queryTokens = tokenize(titleText);
  if (queryTokens.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  articles.forEach(article => {
    const articleTokens = tokenize(article.title);
    let matchCount = 0;
    queryTokens.forEach(t => {
      if (articleTokens.includes(t)) matchCount++;
    });

    if (matchCount > highestScore) {
      highestScore = matchCount;
      bestMatch = article;
    }
  });

  // Require at least 2 matching tokens for a valid match
  return highestScore >= 2 ? bestMatch : null;
}

// Recursive HTML search and replacement
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'articles' && file !== 'mockup thumbnail') {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.html')) {
      processHtmlFile(filePath);
    }
  });
}

function processHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  // Identify directory depth for relative paths
  const relativeDepth = path.relative(path.join(__dirname, '..'), path.dirname(filePath));
  const prefix = relativeDepth ? '../' : '';

  // Regex to find href="article.html" or href="../article.html"
  // and match the surrounding HTML block to get the title
  // Let's do it using a regex search for elements linking to article.html
  
  // Match anchor tags: <a href="...article.html"...>...</a>
  const linkRegex = /<a\s+[^>]*href="(?:\.\.\/)?article\.html"[^>]*>([\s\S]*?)<\/a>/gi;
  content = content.replace(linkRegex, (match, innerHtml) => {
    // Extract text content from inner HTML (remove nested tags)
    let cleanText = innerHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // If inside a card, let's search for a headline/title child text
    const titleMatch = innerHtml.match(/class="[^"]*(?:title|headline|current)[^"]*"[^>]*>([\s\S]*?)<\//i);
    if (titleMatch) {
      cleanText = titleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    const matchArticle = findMatchingArticle(cleanText);
    if (matchArticle) {
      console.log(`Matched link text "${cleanText.substring(0, 40)}" in ${path.basename(filePath)} -> slug: ${matchArticle.slug}`);
      return match.replace(/href="(?:\.\.\/)?article\.html"/i, `href="${prefix}articles/${matchArticle.slug}.html"`);
    } else {
      // Default fallback to first article if no match found but it is an article link
      const fallback = articles[0];
      console.log(`WARN: No match for link text "${cleanText.substring(0, 40)}" in ${path.basename(filePath)}, falling back to ${fallback.slug}`);
      return match.replace(/href="(?:\.\.\/)?article\.html"/i, `href="${prefix}articles/${fallback.slug}.html"`);
    }
  });

  // Regex to find cards with onclick="location.href='articles/...html'"
  // Let's make sure they are correct. If there are any onclick="location.href='article.html'" we fix those too.
  const onclickRegex = /onclick="location\.href='(?:\.\.\/)?article\.html'"/gi;
  content = content.replace(onclickRegex, (match) => {
    // If we have an onclick to the general article.html, let's use the default fallback (XRP article)
    const fallback = articles[0];
    return `onclick="location.href='${prefix}articles/${fallback.slug}.html'"`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated:', path.relative(path.join(__dirname, '..'), filePath));
  }
}

console.log('Starting link updates across HTML files...');
processDirectory(path.join(__dirname, '..'));
console.log('Link updates complete.');
