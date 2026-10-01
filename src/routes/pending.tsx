import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PieceCard } from "@/components/piece-card";
import { PitchDialog } from "@/components/pitch-dialog";
import { MonthlyReport } from "@/components/monthly-report";
import { RequireSession, useMember } from "@/components/guards";
import { Shell } from "@/components/shell";
import { listPieces } from "@/lib/press/server";

export const Route = createFileRoute("/pending")({ component: PendingRoute });

function PendingRoute() {
  return (
    <RequireSession>
      <Shell>
        <PendingDesk />
      </Shell>
    </RequireSession>
  );
}

function PendingDesk() {
  const me = useMember();
  const pieces = useQuery({ queryKey: ["pieces"], queryFn: () => listPieces() });
  const all = pieces.data ?? [];
  const mine = all.filter((p) => p.pitchedByUserId === me.data?.userId);
  const pitches = mine.filter((p) => p.stage === "pitch");
  const pipeline = mine.filter(
    (p) => p.stage !== "pitch" && p.stage !== "rejected",
  );
  const rejected = mine.filter((p) => p.stage === "rejected");

  return (
    <div className="space-y-6">
      <MonthlyReport role={me.data?.role ?? null} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">রোল অপেক্ষমান</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            অ্যাডমিন ডেস্ক সেট করলে কিউ খুলবে। তার আগেও বিষয় পাঠাতে পারেন — ভিডিও রিভিউ পাস করে রাইটার অ্যাসাইন করলে সেই রাইটারের কিউতে যাবে।
          </p>
          {me.data?.email ? (
            <p className="mt-2 text-xs text-muted-foreground">{me.data.email}</p>
          ) : null}
        </div>
        <PitchDialog />
      </div>
      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold">আমার পিচ</h2>
        {pieces.isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        ) : pitches.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            এখনো পিচ নেই। উপরের বাটন থেকে বিষয় পাঠান।
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pitches.map((piece) => (
              <PieceCard
                key={piece.id}
                piece={piece}
                role={me.data?.role ?? "planner"}
                viewer={me.data ?? null}
              />
            ))}
          </div>
        )}
      </section>
      {pipeline.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-semibold">পাইপলাইনে</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {pipeline.map((piece) => (
              <PieceCard
                key={piece.id}
                piece={piece}
                role={me.data?.role ?? null}
                viewer={me.data ?? null}
              />
            ))}
          </div>
        </section>
      ) : null}
      {rejected.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-semibold">ফেরত পিচ</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rejected.map((piece) => (
              <PieceCard
                key={piece.id}
                piece={piece}
                role={me.data?.role ?? "planner"}
                viewer={me.data ?? null}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
