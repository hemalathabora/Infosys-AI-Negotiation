import StaggeredMenu from "./StaggeredMenu";

const navigationItems = [
  {
    label: "Dashboard",
    ariaLabel: "Open dashboard and live metrics",
    description: "Overview & live metrics",
    icon: "grid",
  },
  {
    label: "Configure Agents",
    ariaLabel: "Configure negotiation agents",
    description: "Agent strategies & rules",
    icon: "usersActive",
  },
  {
    label: "Negotiation Arena",
    ariaLabel: "Open live negotiation arena",
    description: "Live simulation feed",
    icon: "target",
  },
  {
    label: "Analytics",
    ariaLabel: "View negotiation analytics",
    description: "Performance insights",
    icon: "barChart",
  },
  {
    label: "Reports",
    ariaLabel: "View audit reports",
    description: "Audit logs & summaries",
    icon: "file",
  },
];

export default function Sidebar({
  isOpen,
  onClose,
  stats,
  onNavigate,
  onClearHistory,
  onReplayIntro,
}) {
  function handleMenuItemClick(item) {
    onNavigate?.(item.label);
    onClose?.();
  }

  return (
    <StaggeredMenu
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      items={navigationItems}
      stats={stats}
      onNavigate={onNavigate}
      onClearHistory={onClearHistory}
      onReplayIntro={onReplayIntro}
      onItemClick={handleMenuItemClick}
      displaySocials={false}
      displayItemNumbering={false}
      colors={["#17161B", "#25242C"]}
      accentColor="#34D399"
      isFixed={true}
    />
  );
}
