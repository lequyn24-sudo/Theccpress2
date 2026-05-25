// fix_hrefs.js
// Updates listing card hrefs from generic article.html to per-article pages,
// based on the thumbnail filename embedded in each card's background-image style.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const thumbnailToSlug = {
  'us-core-ppi-rises-5-2-yoy-vs-4-3-expected-bitcoin-reacts': 'us-core-ppi-rises-bitcoin-reacts',
  'blackrock-sees-136-28-million-worth-of-bitcoin-sold-telegram-post-says': 'blackrock-bitcoin-sell-controversy',
  'tokenized-stocks-market-cap-surpasses-1-6-billion-ethereum-41-1-share': 'tokenized-stocks-1-6b-ethereum',
  'defi-development-corp-sol-per-share-up-108-percent-yoy': 'defi-development-corp-sol-per-share-108-yoy',
  'mubadala-holds-more-than-565-million-of-blackrocks-bitcoin-etf': 'mubadala-565m-bitcoin-etf',
  'dartmouth-college-added-3-37-million-solana-staking-etf-position-in-q1': 'dartmouth-college-solana-staking-etf-13f',
  'bitdeer-mined-sold-198-btc-this-week-report': 'bitdeer-mining-198-btc-weekly-report',
  'vitalik-buterin-ethereum-foundation-leaner-role': 'vitalik-buterin-ethereum-foundation-leaner-role',
  'jpmorgan-tokenized-money-market-fund-ethereum': 'jpmorgan-tokenized-money-market-fund',
  'hong-kongs-first-officially-approved-stablecoin-completes-ethereum-testing': 'hong-kong-stablecoin-ethereum-testing',
  'verus-ethereum-exploit-drains-11-6-million': 'verus-ethereum-exploit-11-6-million',
  'thorchain-reportedly-suffers-10-million-exploit-affecting-assets-across-multiple-blockchains': 'thorchain-10-million-exploit-timeline',
};

// Files in subdirectories (use relative path ../articles/[slug].html)
const subpageFiles = [
  'stories/market-drama.html',
  'stories/company-sagas.html',
  'stories/project-rise-fall.html',
  'conflicts/regulation.html',
  'conflicts/company.html',
  'conflicts/ideology.html',
  'people/founders.html',
  'people/influencers.html',
  'people/institutions.html',
  'power/exchanges.html',
  'power/vcs.html',
  'power/regulators.html',
  'investigations/fraud.html',
  'investigations/collapse.html',
  'investigations/controversy.html',
];

// Root-level files (use relative path articles/[slug].html)
const rootFiles = [
  'cmc.html',
  'sponsored-articles.html',
  'press-release.html',
  'stories.html',
  'conflicts.html',
  'people.html',
  'power.html',
  'investigations.html',
];

function extractThumbBase(thumbUrl) {
  // thumbUrl looks like: ../mockup%20thumbnail/SOME-NAME-thumbnail-750x533.jpg
  // or: mockup%20thumbnail/SOME-NAME-thumbnail-350x250.jpg
  const decoded = thumbUrl.replace(/%20/g, ' ');
  const basename = path.basename(decoded); // e.g. SOME-NAME-thumbnail-750x533.jpg
  // Strip -thumbnail-NNNxNNN.jpg suffix
  const base = basename.replace(/-thumbnail-\d+x\d+\.jpg$/, '');
  return base;
}

function processFile(filePath, isSubpage) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Match each listing-card block:
  // <a href="..." class="listing-card"> ... background-image:url('...thumb...') ... </a>
  // We use a regex that captures the opening tag and looks for the background-image within ~500 chars ahead.
  // Strategy: split into card blocks, find thumb in each, replace href.

  // Regex to find listing-card anchor open tags with any href
  // We'll do a two-pass: first find all card opening tags with their positions,
  // then for each, scan forward to find the background-image URL and determine the correct href.

  const cardOpenRe = /<a\s+href="([^"]*)"(\s+class="listing-card"|[^>]*class="listing-card"[^>]*)>/g;
  let match;
  const replacements = [];

  while ((match = cardOpenRe.exec(content)) !== null) {
    const fullMatch = match[0];
    const currentHref = match[1];
    const matchStart = match.index;
    const matchEnd = match.index + fullMatch.length;

    // Look ahead up to 800 chars for a background-image:url(...)
    const lookAhead = content.substring(matchEnd, matchEnd + 800);
    const thumbRe = /background-image\s*:\s*url\(['"]([^'"]+)['"]\)/;
    const thumbMatch = thumbRe.exec(lookAhead);

    if (thumbMatch) {
      const thumbUrl = thumbMatch[1];
      const thumbBase = extractThumbBase(thumbUrl);
      const slug = thumbnailToSlug[thumbBase];

      if (slug) {
        const newHref = isSubpage ? `../articles/${slug}.html` : `articles/${slug}.html`;
        if (currentHref !== newHref) {
          // Build the replacement open tag with updated href
          const newOpenTag = fullMatch.replace(
            /href="[^"]*"/,
            `href="${newHref}"`
          );
          replacements.push({ start: matchStart, end: matchEnd, replacement: newOpenTag, slug });
        }
      } else {
        console.log(`  [WARN] No slug mapping for thumb: "${thumbBase}" in ${filePath}`);
      }
    }
  }

  // Apply replacements in reverse order to preserve positions
  replacements.sort((a, b) => b.start - a.start);
  for (const r of replacements) {
    content = content.substring(0, r.start) + r.replacement + content.substring(r.end);
    changed = true;
    console.log(`  Updated card -> ${r.slug}`);
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Saved: ${filePath}`);
  } else {
    console.log(`No changes: ${filePath}`);
  }
}

console.log('\n--- Processing subpage files (../articles/[slug].html) ---');
subpageFiles.forEach(rel => {
  const filePath = path.join(ROOT, rel);
  if (fs.existsSync(filePath)) {
    console.log(`\nProcessing: ${rel}`);
    processFile(filePath, true);
  } else {
    console.log(`[SKIP] Not found: ${rel}`);
  }
});

console.log('\n--- Processing root-level files (articles/[slug].html) ---');
rootFiles.forEach(rel => {
  const filePath = path.join(ROOT, rel);
  if (fs.existsSync(filePath)) {
    console.log(`\nProcessing: ${rel}`);
    processFile(filePath, false);
  } else {
    console.log(`[SKIP] Not found: ${rel}`);
  }
});

console.log('\nDone fixing hrefs.');
