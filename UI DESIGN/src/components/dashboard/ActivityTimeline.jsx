export default function ActivityTimeline({ items }) {
  return (
    <div className="rounded-2xl border border-[#1d374d] bg-[#0b1d2d] p-5">
      <h3 className="text-xl font-black text-white">System Activity</h3>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={`${item.title}-${item.time}`} className="flex gap-3">
            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#c4ff3a]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="text-sm text-[#8ca6bb]">{item.detail}</p>
              <p className="mt-1 text-xs text-[#7fa7c0]">{item.subDetail || item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
