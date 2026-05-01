import { chipCourse } from './chip';
import { sensorFusionCourse } from './sensor-fusion';
export { chapterPath, coursePath } from './types';

export const courses = [chipCourse, sensorFusionCourse] as const;

export type CourseSlug = (typeof courses)[number]['slug'];

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}
