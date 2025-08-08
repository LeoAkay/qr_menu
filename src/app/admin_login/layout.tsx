import type { Metadata } from "next";
import "../global.css";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin dashboard login and control panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}