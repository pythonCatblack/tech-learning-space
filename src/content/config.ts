import { defineCollection, z } from 'astro:content';

const chapters = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    sidebarTitle: z.string(),
    summary: z.string(),
    readTime: z.string(),
    icon: z.string(),
    group: z.string(),
    groupLabel: z.string(),
  }),
});

export const collections = {
  chapters,
};
