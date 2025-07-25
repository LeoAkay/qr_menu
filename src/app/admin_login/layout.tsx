import type { Metadata } from "next";
import "../global.css";
import RootLayout from "../layout";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin dashboard login and control panel",
};


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Instead of overriding <body>, wrap in a div and use RootLayout with className
  return (
    <RootLayout bodyClassName="dashboard-mode">
      <div>
        {children}
      </div>
    </RootLayout>
  );
}