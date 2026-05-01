import path from 'node:path';
import { chapterGroups as legacyGroups, chapters as legacyChapters } from '../../lib/chapters';
import { groupChapters, type CourseChapter, type CourseDefinition } from '../types';

const chapters: CourseChapter[] = legacyChapters.map((chapter) => ({
  id: chapter.id,
  title: chapter.title,
  navLabel: chapter.sidebarTitle,
  summary: chapter.summary,
  readTime: chapter.readTime,
  icon: chapter.icon,
  badgeClass: chapter.badgeClass,
  groupId: chapter.group,
  groupLabel: chapter.groupLabel,
  sourceFile: `ch${chapter.id}.html`,
}));

export const chipCourse: CourseDefinition = {
  slug: 'chip',
  title: '芯片设计与制造完全指南',
  subtitle: '从通用计算到专用加速',
  description: 'CPU、GPU、FPGA 与 ASIC 的系统化教程，串联架构原理、制造工艺和无人机应用。',
  icon: '⚡',
  sourceRoot: path.resolve(process.cwd(), 'src/course-sources/chip/chapters'),
  storageKey: 'chip-course-progress',
  chapters,
  groups: groupChapters(chapters),
};

export { legacyGroups as chipLegacyGroups };
