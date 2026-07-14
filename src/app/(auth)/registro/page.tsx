import type { Metadata } from "next";
import { CompanyForm } from "@/components/auth/company-form";

export const metadata: Metadata = {
  title: "Inscribe tu empresa | ADECLA",
};

export default function RegistroPage() {
  return <CompanyForm />;
}
