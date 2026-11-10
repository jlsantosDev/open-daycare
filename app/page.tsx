import { AppShell } from "@/components/AppShell/AppShell";
import { FeedSection } from "@/components/FeedSection/FeedSection";
import { classroom, user } from "@/data/mock";

export default function Home() {
  return (
    <AppShell activeItem="feed">
      <div className="mx-auto w-full max-w-[760px] px-4 pb-20 pt-[34px] sm:px-10">
        {/* Saludo */}
        <header className="mb-6">
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-accent">
            GUARDERÍA · {classroom.name.toUpperCase()}
          </div>
          <h1 className="m-0 font-heading text-[30px] font-semibold text-heading">
            Buenas, {user.name.split(" ")[0]}
          </h1>
          <p className="m-0 mt-[5px] text-[14.5px] text-muted-strong">{classroom.summary}</p>
        </header>

        {/* Caja + separador + feed (client: dueño del estado de posts, SPEC 06) */}
        <FeedSection />
      </div>
    </AppShell>
  );
}
