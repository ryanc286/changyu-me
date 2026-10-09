/*
  Turn a fetched Notion case page into src/content/work/<slug>.mdx.

  Usage: node scripts/notion-case-to-mdx.mjs page.txt
  page.txt: the Notion fetch output (needs the <properties> and <content> parts).

  Notion conventions (also explained on the Notion page):
  - Callout with the 🖼️ icon, text "id: label"  -> <Media id label />
      Two or more "id: label" lines -> <MediaRow>, images side by side.
      If a bullet list with one bullet per image comes right before it, each
      bullet becomes the text under its image.
  - Callout with the 📍 icon -> <Annotated>, a phone screen with callouts:
      first line "id: label", then one "Title | Explanation" line per callout.
  - Callout with the 🎬 icon -> <VideoRow>, screen recordings side by side:
      one "id: Title" line per video (public/videos/<slug>/<id>.mp4).
  - Callout with the 🔀 icon -> <StepCompare>, before/after step lists:
      "before: Step", "before: Step | Tag" (step that left), "after: Step".
      Uses public/images/<slug>/<id>.webp|jpg|png when the file exists.
  - Callout with the 📱 icon -> <DetailList>, phone screens on the left with text on the right,
      one per row: one "id: label" line per screen. A bullet list right before it, one
      "- **Title.** Text" bullet per screen, becomes the text beside each screen.
  - Callout with the 📊 icon -> <ClickMap>, a screen with areas outlined and their share:
      first line "id: label", then "Title | 12.5%" per area ("| highlight" on the one to end on).
      Lines beyond the areas set in the component show as a dim footnote.
  - Callout with the 🔁 icon -> <FlowSwap>, before/after flows as phone screens
      that switch when scrolled into view: "before: id: label",
      "before: id: label | gone" (step that was cut), "after: id: label".
      Images at public/images/<slug>/<id>.webp.
      Add a line "style: slider" to show it as a drag-to-compare slider instead.
      With one before and one after screen, both sit in the same spot so the line wipes one into the other.
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
    if (line.includes('📱')) {
      // Detail list: one "id: label" per screen, text from the bullets right before it
      const items = inner.filter(Boolean).map((l) => {
        const [id, ...rest] = l.split(':');
        const src = ['webp', 'png', 'jpg']
          .map((ext) => `/images/${slug}/${id.trim()}.${ext}`)
          .find((path) => existsSync(new URL(`../public${path}`, import.meta.url)));
        return { id: unescape(id.trim()), label: unescape(rest.join(':').trim()), ...(src ? { src } : {}) };
      });
      const prev = blocks.slice(-items.length);
      if (prev.length === items.length && prev.every((b) => b.type === 'list' && b.raw?.startsWith('- '))) {
        blocks.splice(-items.length);
        prev.forEach((b, k) => {
          const m = unescape(b.raw.slice(2)).match(/^\*\*(.+?)\*\*\s*(.*)$/);
          items[k] = { ...items[k], ...(m ? { title: m[1], text: m[2] } : { text: unescape(b.raw.slice(2)) }) };
        });
      }
      blocks.push({ type: 'block', md: `<DetailList items={${JSON.stringify(items)}} />` });
      continue;
    }
    if (line.includes('📊')) {
      // Click map: "id: label", then "Title | 12.5%" or "Title | 82% | highlight"
      const [head, ...rest] = inner.filter(Boolean);
      const [id, ...label] = head.split(':');
      const items = rest.map((l) => {
        const [title, value, flag] = unescape(l).split('|').map((t) => t.trim());
        return { title, value, ...(flag === 'highlight' ? { highlight: true } : {}) };
      });
      blocks.push({
        type: 'block',
        md: `<ClickMap id="${attr(id.trim())}" label="${attr(label.join(':').trim())}" src="/images/${slug}/${id.trim()}.webp" items={${JSON.stringify(items)}} />`,
      });
      continue;
    }
    if (line.includes('🔁')) {
      // Before/after flows of phone screens: "before: id: label", "before: id: label | gone", "after: id: label"
      const before = [];
      const after = [];
      const slider = inner.some((l) => /^style:\s*slider$/i.test(l.trim()));
      for (const l of inner.filter((l) => l && !/^style:/i.test(l.trim()))) {
        const [side, id, ...rest] = unescape(l).split(':');
        const [label, flag] = rest.join(':').split('|').map((t) => t.trim());
        const screen = { id: id.trim(), label, src: `/images/${slug}/${id.trim()}.webp`, ...(flag === 'gone' ? { gone: true } : {}) };
        (side.trim() === 'after' ? after : before).push(screen);
      }
      blocks.push({ type: 'block', md: `<${slider ? 'CompareSlider' : 'FlowSwap'} before={${JSON.stringify(before)}} after={${JSON.stringify(after)}} />` });
      continue;
    }
    if (line.includes('🔀')) {
      // Before/after step lists: "before: Step", "before: Step | Tag", "after: Step"
      const before = [];
      const after = [];
      for (const l of inner.filter(Boolean)) {
        const [side, ...rest] = unescape(l).split(':');
        const [label, tag] = rest.join(':').split('|').map((s) => s.trim());
        (side.trim() === 'after' ? after : before).push(tag ? { label, tag } : { label });
      }
      blocks.push({ type: 'block', md: `<StepCompare before={${JSON.stringify(before)}} after={${JSON.stringify(after)}} />` });
      continue;
    }
    if (line.includes('🎬')) {
      // Screen recordings side by side: one "id: Title" line per video,
      // files at public/videos/<slug>/<id>.mp4 with a <id>.webp poster
      const items = inner.filter(Boolean).map((l) => {
        const [id, ...rest] = l.split(':');
        const base = `/videos/${slug}/${id.trim()}`;
        const poster = existsSync(new URL(`../public${base}.webp`, import.meta.url)) ? `${base}.webp` : undefined;
        return { id: unescape(id.trim()), label: unescape(rest.join(':').trim()), src: `${base}.mp4`, ...(poster ? { poster } : {}) };
      });
      blocks.push({ type: 'block', md: `<VideoRow items={${JSON.stringify(items)}} />` });
      continue;
    }
    if (line.includes('📍')) {
      // Annotated screen: "id: label", then one "Title | Explanation" line per callout
      const [head, ...rest] = inner.filter(Boolean);
      const [id, ...label] = head.split(':');
      const src = ['webp', 'png', 'jpg']
        .map((ext) => `/images/${slug}/${id.trim()}.${ext}`)
        .find((path) => existsSync(new URL(`../public${path}`, import.meta.url)));
      const items = rest.map((l) => {
        const [title, ...text] = unescape(l).split('|');
        return { title: title.trim(), text: text.join('|').trim() };
      });
      blocks.push({
        type: 'block',
        md: `<Annotated id="${attr(id.trim())}" label="${attr(label.join(':').trim())}" src="${src ?? ''}" items={${JSON.stringify(items)}} />`,
      });
      continue;
    }
    if (line.includes('🖼')) {
      // One "id: label" line per image. Two or more lines become a side-by-side row.
      const images = inner.filter(Boolean).map((l) => {
        const [id, ...rest] = l.split(':');
        // Use the real image if it exists at public/images/<slug>/<id>.(webp|jpg|png)
        const src = ['webp', 'jpg', 'png']
          .map((ext) => `/images/${slug}/${id.trim()}.${ext}`)
          .find((path) => existsSync(new URL(`../public${path}`, import.meta.url)));
        return { id: unescape(id.trim()), label: unescape(rest.join(':').trim()), ...(src ? { src } : {}) };
      });
      if (images.length > 1) {
        // A bullet list right before the row, one bullet per image, becomes the text
        // under each image ("- **Title.** Description").
        const prev = blocks.slice(-images.length);
        if (prev.length === images.length && prev.every((b) => b.type === 'list' && b.raw?.startsWith('- '))) {
          blocks.splice(-images.length);
          prev.forEach((b, k) => {
            const m = unescape(b.raw.slice(2)).match(/^\*\*(.+?)\*\*\s*(.*)$/);
            images[k] = { ...images[k], ...(m ? { title: m[1], text: m[2] } : { text: unescape(b.raw.slice(2)) }) };
          });
        }
        blocks.push({ type: 'block', md: `<MediaRow items={${JSON.stringify(images)}} />` });
      } else {
        const { id, label, src } = images[0];
        blocks.push({ type: 'block', md: `<Media id="${attr(id)}" label="${attr(label)}"${src ? ` src="${src}"` : ''} />` });
      }
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
  blocks.push({ type: isList ? 'list' : 'block', md: mdxText(line), raw: line });
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
