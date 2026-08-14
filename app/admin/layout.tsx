import { AdminNav } from "@/components/admin/admin-nav";
import { isAdmin } from "@/lib/admin-auth";

export const metadata = {
  title: "Admin — Padel House",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // The nav is hidden on the login screen — showing "Odjava" to someone who
  // isn't signed in is just noise.
  const signedIn = await isAdmin();
  return (
    <>
      {signedIn && <AdminNav />}
      {children}
    </>
  );
}
