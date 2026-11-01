import type { Metadata } from "next";

import { ProfileDetails } from "@/components/auth/profile-details";

export const metadata: Metadata = { title: "Trang cá nhân | Classio" };

export default function ProfilePage() {
  return <ProfileDetails />;
}
