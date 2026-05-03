import { chipCourse } from './chip';
import { sensorFusionCourse } from './sensor-fusion';
import { aiDevLifecycleCourse } from './ai-dev-lifecycle';
import { ai3DManufacturingCourse } from './ai-3d-manufacturing';
export { chapterPath, coursePath } from './types';

export const courses = [chipCourse, sensorFusionCourse, aiDevLifecycleCourse, ai3DManufacturingCourse] as const;

export type CourseSlug = (typeof courses)[number]['slug'];

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}
