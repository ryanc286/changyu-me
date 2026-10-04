/*
  Turn a fetched Notion case page into src/content/work/<slug>.mdx.

  Usage: node scripts/notion-case-to-mdx.mjs page.txt
  page.txt: the Notion fetch output (needs the <properties> and <content> parts).

  Notion conventions (also explained on the Notion page):
  - Callout with the 🖼️ icon, text "id: label"  -> <Media id label />  (uses public/images/<slug>/<id>.webp|jpg|png if present)
  - Quote (> ...)                               -> <Hypothesis>        (highlighted statement)
  - Table with columns Number | Label            -> <Stats />           (big numbers row)
  - Headings, paragraphs, lists, bold            -> plain Markdown
  Writes to src/content/work/<slug>.mdx, or src/content/tools/<slug>.mdx for tools.
  Keeps company (cases), order, cover and link from the existing file. 狀態 = 草稿 is not synced.
*/
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const raw = readFileSync(process.argv[2], 'utf8');
const props = JSON.parse(raw.match(/<properties>\s*([\s\S]*?)\s*<\/properties>/)[1]);
const content = raw.match(/<content>\n?([\s\S]*?)\n?<\/content>/)[1];

const slug = (props.Slug ?? '').trim();
if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Bad Slug: "${slug}"`);
if (props['狀態'] === '草稿') {
  console.log(`${slug}: 草稿, not synced.`);
  process.exit(0);
}
// Case studies live in work/, tools in tools/
const workFile = new URL(`../src/content/work/${slug}.mdx`, import.meta.url);
const toolFile = new URL(`../src/content/tools/${slug}.mdx`, import.meta.url);
const isTool = !existsSync(workFile) && existsSync(toolFile);
const file = isTool ? toolFile : workFile;
if (!existsSync(file)) throw new Error(`No case or tool file for "${slug}". Add it to the site first.`);

// Keep structural fields from the current file
const current = readFileSync(file, 'utf8');
const keep = {};
for (const k of ['company', 'order', 'cover', 'draft', 'link']) {
  const m = current.match(new RegExp(`^${k}: (.*)$`, 'm'));
  if (m) keep[k] = m[1];
}

// Notion escapes these with a backslash; MDX treats { } < as code, so re-escape them
const unescape = (s) => s.replace(/\\([\\*~`$[\]<>{}|^])/g, '$1');
const mdxText = (s) => unescape(s).replace(/[{}]/g, (c) => '\\' + c).replace(/</g, '&lt;');
const attr = (s) => unescape(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const yaml = (s) => JSON.stringify(unescape(s ?? '').trim());

const lines = content.split('\n');
const blocks = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;

  if (line.startsWith('<callout')) {
    const inner = [];
    while (++i < lines.length && !lines[i].startsWith('</callout>')) inner.push(lines[i].trim());
    const text = inner.join(' ').trim();
    if (line.includes('🖼')) {
      const [id, ...rest] = text.split(':');
      // Use the real image if it exists at public/images/<slug>/<id>.(webp|jpg|png)
      const img = ['webp', 'jpg', 'png']
        .map((ext) => `/images/${slug}/${id.trim()}.${ext}`)
        .find((path) => existsSync(new URL(`../public${path}`, import.meta.url)));
      const src = img ? ` src="${img}"` : '';
      blocks.push({ type: 'block', md: `<Media id="${attr(id.trim())}" label="${attr(rest.join(':').trim())}"${src} />` });
    } else {
      blocks.push({ type: 'block', md: mdxText(text) });
    }
    continue;
  }

  if (line.startsWith('<table')) {
    const rows = [];
    let row = null;
    while (++i < lines.length && !lines[i].startsWith('</table>')) {
      const l = lines[i].trim();
      if (l === '<tr>') row = [];
      else if (l === '</tr>') rows.push(row);
      else {
        const m = l.match(/^<td[^>]*>(.*)<\/td>$/);
        if (m && row) row.push(unescape(m[1]).trim());
      }
    }
    const body = line.includes('header-row="true"') ? rows.slice(1) : rows;
    const items = body.map(([value, label]) => ({ value, label }));
    blocks.push({ type: 'block', md: `<Stats items={${JSON.stringify(items)}} />` });
    continue;
  }

  if (line.startsWith('> ')) {
    blocks.push({ type: 'block', md: `<Hypothesis>${mdxText(line.slice(2))}</Hypothesis>` });
    continue;
  }

  const isList = /^(\s*)(- |\d+\. )/.test(line);
  blocks.push({ type: isList ? 'list' : 'block', md: mdxText(line) });
}

// Blank line between blocks; list items in the same list stay together
let body = '';
blocks.forEach((b, n) => {
  const prev = blocks[n - 1];
  body += n === 0 ? '' : b.type === 'list' && prev?.type === 'list' ? '\n' : '\n\n';
  body += b.md;
});

const front = [
  '---',
  // Cases keep their company from the site; tools take it from Notion
  isTool ? (props.Company ? `company: ${yaml(props.Company)}` : null) : `company: ${keep.company}`,
  `order: ${keep.order}`,
  keep.cover ? `cover: ${keep.cover}` : null,
  keep.draft ? `draft: ${keep.draft}` : null,
  keep.link ? `link: ${keep.link}` : null,
  `subtitle: ${yaml(props['副標題'])}`,
  `role: ${yaml(props.Role)}`,
  `timeline: ${yaml(props.Timeline)}`,
  `type: ${yaml(props.Type)}`,
  `notion: ${yaml(props.url)}`,
  '---',
]
  .filter(Boolean)
  .join('\n');

const next = `${front}\n\n{/* Synced from Notion. Edit the case there, not here. */}\n\n${body}\n`;
const changed = next !== current;
writeFileSync(file, next);
console.log(`${slug}: ${changed ? 'updated' : 'no changes'} (${blocks.length} blocks)`);
