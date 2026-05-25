import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VoiceProfileEditor } from "@/components/voice-profile-editor";

export const metadata = {
  title: "ContentLoop — voice profile",
  description:
    "Teach ContentLoop how you write. Apply your voice to every generation automatically.",
};

export default function VoicePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <VoiceProfileEditor />
      </main>
      <SiteFooter />
    </>
  );
}
