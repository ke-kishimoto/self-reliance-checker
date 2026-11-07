import { readFile, writeFile } from 'node:fs/promises';
import { marked } from 'marked';

const root = new URL('../', import.meta.url);
const modules = ['ownership', 'learning', 'discovery', 'problem-solving', 'technical', 'communication', 'improvement', 'ownership-quick', 'learning-quick', 'discovery-quick', 'problem-solving-quick', 'technical-quick', 'communication-quick', 'improvement-quick', 'system-understanding-case'];
const placeholder = '{{CONTENT}}';

for (const name of modules) {
  const source = await readFile(new URL(`src/content/${name}.md`, root), 'utf8');
  const layout = await readFile(new URL(`src/layouts/${name}.html`, root), 'utf8');
  if (layout.split(placeholder).length !== 2) {
    throw new Error(`${name}: the layout must contain exactly one content placeholder.`);
  }
  const output = layout.replace(placeholder, () => marked.parse(source));
  await writeFile(new URL(`${name}.html`, root), output);
  console.log(`Generated ${name}.html`);
}

// 仕事の場面ごとのケースは、本文とメタデータから共通の枠で生成します。
const cases = JSON.parse(await readFile(new URL('src/data/situation-cases.json', root), 'utf8'));
const caseLayout = await readFile(new URL('src/layouts/situation-case.html', root), 'utf8');
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
for (const item of cases) {
  if (!/^situation-\d{2}-case$/.test(item.slug) || !Number.isInteger(item.number) || item.slug !== `situation-${String(item.number).padStart(2, '0')}-case` || typeof item.title !== 'string') {
    throw new Error('仕事の場面のメタデータが正しくありません。');
  }
  const source = await readFile(new URL(`src/content/${item.slug}.md`, root), 'utf8');
  if (caseLayout.split(placeholder).length !== 2) throw new Error('ケースのテンプレートには本文の挿入箇所が一つ必要です。');
  const output = caseLayout.replaceAll('{{TITLE}}', () => escapeHtml(item.title))
    .replaceAll('{{NUMBER}}', () => String(item.number).padStart(2, '0'))
    .replace(placeholder, () => marked.parse(source));
  await writeFile(new URL(`${item.slug}.html`, root), output);
  console.log(`Generated ${item.slug}.html`);
}
