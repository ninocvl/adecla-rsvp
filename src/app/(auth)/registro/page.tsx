import type { Metadata } from "next";
import { CompanyForm } from "@/components/auth/company-form";

export const metadata: Metadata = {
  title: "Registro de empresa | ADECLA",
};

export default function RegistroPage() {
  return <CompanyForm />;
}
