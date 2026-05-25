import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Workspace } from "@/components/workspace";

export const metadata = {
  title: "ContentLoop — workspace",
  description:
    "Paste long-form content, pick output formats, and ship in your voice.",
};

export default function AppPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-white/5 bg-neutral-950">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Workspace
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Paste → pick formats → generate. Output stays platform-native.
            </p>
          </div>
        </div>
        <Workspace />
      </main>
      <SiteFooter />
    </>
  );
}
