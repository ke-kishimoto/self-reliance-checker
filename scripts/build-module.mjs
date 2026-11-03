import { readFile, writeFile } from 'node:fs/promises';
import { marked } from 'marked';

const root = new URL('../', import.meta.url);
const modules = ['ownership', 'learning', 'discovery', 'problem-solving', 'technical', 'communication', 'improvement'];
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
