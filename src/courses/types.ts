export interface CourseChapter {
  id: string;
  title: string;
  navLabel: string;
  summary: string;
  readTime: string;
  icon: string;
  badgeClass: string;
  groupId: string;
  groupLabel: string;
  sourceFile: string;
}

export interface CourseGroup {
  id: string;
  label: string;
  chapters: CourseChapter[];
}

export interface CourseDefinition {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  sourceRoot: string;
  storageKey: string;
  chapters: CourseChapter[];
  groups: CourseGroup[];
}

export function groupChapters(chapters: CourseChapter[]): CourseGroup[] {
  const groups = new Map<string, CourseGroup>();

  chapters.forEach((chapter) => {
    if (!groups.has(chapter.groupId)) {
      groups.set(chapter.groupId, {
        id: chapter.groupId,
        label: chapter.groupLabel,
        chapters: [],
      });
    }

    groups.get(chapter.groupId)!.chapters.push(chapter);
  });

  return Array.from(groups.values());
}

export function coursePath(slug: string) {
  return `/course/${slug}/`;
}

export function chapterPath(slug: string, chapterId: string) {
  return `/course/${slug}/chapter/${chapterId}/`;
}
