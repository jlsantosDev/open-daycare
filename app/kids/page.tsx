import { AppShell } from "@/components/AppShell/AppShell";
import { KidsSection } from "@/components/KidsSection/KidsSection";

/** Kids list screen: AppShell + heading + search/grid client component. */
export default function KidsPage() {
  return (
    <AppShell activeItem="kids">
      <div className="mx-auto w-full max-w-[880px] px-4 pb-20 pt-[34px] sm:px-10">
        <KidsSection />
      </div>
    </AppShell>
  );
}
