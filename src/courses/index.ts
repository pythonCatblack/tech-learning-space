import { chipCourse } from './chip';
import { sensorFusionCourse } from './sensor-fusion';
import { aiDevLifecycleCourse } from './ai-dev-lifecycle';
export { chapterPath, coursePath } from './types';

export const courses = [chipCourse, sensorFusionCourse, aiDevLifecycleCourse] as const;

export type CourseSlug = (typeof courses)[number]['slug'];

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}
