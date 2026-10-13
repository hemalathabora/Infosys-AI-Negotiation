export default function QuickActions({ actions }) {
  return (
    <div className="rounded-2xl border border-[#1d374d] bg-[#0b1d2d] p-5">
      <h3 className="text-xl font-black text-white">Quick Actions</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            className="rounded-2xl border border-[#1d374d] bg-[#0d1d2e] p-4 text-left transition-colors hover:border-[#c4ff3a]/60"
          >
            <p className="text-lg font-bold text-white">{action.title}</p>
            <p className="mt-2 text-sm text-[#8ca6bb]">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
