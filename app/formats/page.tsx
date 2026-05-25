import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CustomFormatEditor } from "@/components/custom-format-editor";

export const metadata = {
  title: "ContentLoop — custom formats",
  description:
    "Define your own platform-specific output formats. Pro feature.",
};

export default function FormatsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <CustomFormatEditor />
      </main>
      <SiteFooter />
    </>
  );
}
