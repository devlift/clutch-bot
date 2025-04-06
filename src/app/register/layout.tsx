import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Clutch Jobs",
  description: "Create an account & Start posting or hiring talents on Clutch Jobs"
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 