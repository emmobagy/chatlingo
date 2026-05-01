export const TUTOR_AVATARS: Record<string, string> = {
  t1: '/tutors/Tutor-2.png', // female, caucasian
  t2: '/tutors/Tutor-4.png', // female, african
  t3: '/tutors/Tutor-6.png', // female, asian
  t4: '/tutors/Tutor-8.png', // female, latina
  t5: '/tutors/Tutor-1.png', // male, caucasian
  t6: '/tutors/Tutor-3.png', // male, african
  t7: '/tutors/Tutor-5.png', // male, asian
  t8: '/tutors/Tutor-7.png', // male, latino
};

export function getTutorAvatar(tutorId: string | undefined): string {
  return TUTOR_AVATARS[tutorId ?? ''] ?? '/tutors/Tutor-1.png';
}
