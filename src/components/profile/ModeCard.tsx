type ModeCardProps = {
  mode: string;
  description: string;
};

export default function ModeCard({ mode, description }: ModeCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 p-5 text-white shadow-lg">
      <p className="text-xs uppercase text-neutral-400">Mode</p>

      <div className="mt-1 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{mode}</h2>
          <p className="mt-1 text-sm text-neutral-300">{description}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
          👥
        </div>
      </div>
    </div>
  );
}