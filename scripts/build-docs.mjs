import { readFile, writeFile, unlink, access, mkdir, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

// Optional fixed list (used only if files exist). Otherwise we auto-discover markdown under docs/
const preferredDocs = [
  { id: 'penjelasan-project', title: '1. Penjelasan Project', file: 'docs/PENJELASAN_PROJECT.md' },
  { id: 'cara-setup', title: '2. Cara Setup', file: 'docs/CARA_SETUP.md' },
  { id: 'struktur-project', title: '3. Struktur Project', file: 'docs/STRUKTUR_PROJECT.md' },
  { id: 'penjelasan-kode', title: '4. Penjelasan Kode', file: 'docs/PENJELASAN_KODE.md' },
  { id: 'firebase-guide', title: '5. Panduan Firebase', file: 'docs/FIREBASE_GUIDE.md' },
  { id: 'troubleshooting', title: '6. Troubleshooting & FAQ', file: 'docs/TROUBLESHOOTING.md' },
  { id: 'panduan-tim', title: '7. Panduan Tim', file: 'docs/PANDUAN_TIM.md' },
  { id: 'glosarium', title: '8. Glosarium', file: 'docs/GLOSARIUM.md' },
];

marked.setOptions({
  headerIds: true,
  mangle: false,
});

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function htmlShell({ tocHtml, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dokumentasi Lengkap UVerse - Campus Forum Project</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif; line-height: 1.8; color: #333; background: #f5f5f5; margin: 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .paper { background: #fff; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,.08); padding: 56px; }
    h1 { color: #2c3e50; font-size: 40px; margin: 24px 0; border-bottom: 4px solid #3498db; padding-bottom: 14px; }
    h2 { color: #34495e; font-size: 30px; margin: 40px 0 16px; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px; }
    h3 { color: #16a085; font-size: 24px; margin: 24px 0 10px; }
    h4 { color: #2980b9; font-size: 20px; margin: 18px 0 8px; }
    p { margin: 12px 0; text-align: justify; }
    ul, ol { margin: 10px 0 16px 28px; }
    li { margin: 6px 0; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; color: #e74c3c; font-family: Consolas, "Courier New", monospace; }
    pre { background: #2c3e50; color: #ecf0f1; padding: 18px; border-radius: 6px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #3498db; color: #fff; }
    .toc { background: #ecf0f1; padding: 24px; border-radius: 8px; }
    .toc a { color: #3498db; text-decoration: none; font-weight: 600; }
    .toc a:hover { text-decoration: underline; }
    .cover { text-align: center; padding: 80px 0 30px; }
    .cover h1 { font-size: 52px; border: none; margin-bottom: 10px; }
    .muted { color: #7f8c8d; }
    .section-sep { height: 2px; background: #eee; margin: 50px 0; }
    @media print { body { background: #fff; } .paper { box-shadow: none; padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="paper">
      <section class="cover">
        <h1>DOKUMENTASI LENGKAP</h1>
        <h1>UVerse - Campus Forum Project</h1>
        <p class="muted">Dari Setup hingga Deployment • Versi 1.0 • November 2025</p>
      </section>

      <div class="section-sep"></div>

      <section class="toc">
        <h2>Daftar Isi</h2>
        ${tocHtml}
      </section>

      <div class="section-sep"></div>

      ${bodyHtml}
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  const docsDir = path.join(repoRoot, 'docs');
  await mkdir(docsDir, { recursive: true });

  const items = [];
  // First try preferred list
  for (const d of preferredDocs) {
    const full = path.join(repoRoot, d.file);
    if (!(await exists(full))) {
      // skip silently; we'll auto-discover later
      continue;
    }
    const md = await readFile(full, 'utf8');
    const html = marked.parse(md);
    items.push({ ...d, html });
  }

  // If nothing from preferred list, auto-discover any .md under docs/ recursively
  async function walk(dir) {
    const out = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name === 'DOKUMENTASI_LENGKAP.html') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        out.push(...await walk(p));
      } else if (e.isFile() && /\.md$/i.test(e.name)) {
        out.push(p);
      }
    }
    return out;
  }

  if (items.length === 0) {
    const found = await walk(docsDir);
    found.sort();
    let idx = 1;
    for (const f of found) {
      const md = await readFile(f, 'utf8');
      const html = marked.parse(md);
      const base = path.basename(f, path.extname(f));
      const id = base.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const title = `${idx}. ${base.replace(/[-_]+/g, ' ')}`;
      items.push({ id, title, file: path.relative(repoRoot, f).replace(/\\/g, '/'), html });
      idx += 1;
    }
  }

  if (items.length === 0) {
    throw new Error('No markdown files found to build.');
  }

  const tocHtml = `<ol>\n${items
    .map((i) => `  <li><a href="#${i.id}">${i.title}</a></li>`) 
    .join('\n')}\n</ol>`;

  const bodyHtml = items
    .map((i) => `
<section id="${i.id}">
  <h1>${i.title}</h1>
  ${i.html}
</section>
<div class="section-sep"></div>
`).join('\n');

  const finalHtml = htmlShell({ tocHtml, bodyHtml });
  const outPath = path.join(docsDir, 'DOKUMENTASI_LENGKAP.html');
  await writeFile(outPath, finalHtml, 'utf8');
  console.log(`[build-docs] Wrote ${outPath}`);

  // Delete source .md files after successful build
  // Delete source .md files after successful build
  for (const d of items) {
    const full = path.join(repoRoot, d.file || '');
    if (await exists(full)) {
      try {
        await unlink(full);
        console.log(`[build-docs] Deleted ${path.relative(repoRoot, full)}`);
      } catch (e) {
        console.warn(`[build-docs] Could not delete ${path.relative(repoRoot, full)}:`, e?.message || e);
      }
    }
  }
}

main().catch((err) => {
  console.error('[build-docs] Failed:', err);
  process.exit(1);
});
