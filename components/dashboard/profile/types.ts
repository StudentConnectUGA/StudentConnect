// components/profile/types.ts
export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  ugaId: string | null;
  major: string | null;
  year: string | null;
  bio: string | null;
  phoneNumber: string | null;
  phoneVisible: boolean;
  meetingPrefs: string | null;
  showGrades: boolean;
  showCourses: boolean;
  showTutorProfile: boolean;
};
