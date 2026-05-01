import { cpSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sensorFusionSource = path.resolve(root, '..', 'sensor-fusion-tutorial');
const targets = [
  { slug: 'chip', sourceRoot: root, targetRoot: path.resolve(root, 'src/course-sources/chip/chapters'), count: 13 },
  { slug: 'sensor-fusion', sourceRoot: sensorFusionSource, targetRoot: path.resolve(root, 'src/course-sources/sensor-fusion/chapters'), count: 17 },
];

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function copyChapterFiles(sourceRoot, targetRoot, count) {
  ensureDir(targetRoot);

  for (let chapterNumber = 1; chapterNumber <= count; chapterNumber += 1) {
    const fileName = `ch${chapterNumber}.html`;
    const sourceFile = path.join(sourceRoot, fileName);
    const targetFile = path.join(targetRoot, fileName);

    if (!statSync(sourceFile, { throwIfNoEntry: false })) {
      throw new Error(`Missing source chapter: ${sourceFile}`);
    }

    cpSync(sourceFile, targetFile);
    console.log(`[ok] ${fileName} -> ${targetFile}`);
  }
}

for (const target of targets) {
  console.log(`Syncing ${target.slug}...`);
  copyChapterFiles(target.sourceRoot, target.targetRoot, target.count);
}
