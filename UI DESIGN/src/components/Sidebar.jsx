import StaggeredMenu from "./StaggeredMenu";
import { useTheme } from "../context/ThemeContext";

const navigationItems = [
  {
    label: "Dashboard",
    ariaLabel: "Open dashboard and live metrics",
    description: "Overview & live metrics",
    icon: "grid",
  },
  {
    label: "Negotiation Scenarios",
    ariaLabel: "Browse predefined and custom negotiation scenarios",
    description: "Browse & create scenarios",
    icon: "target",
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
    label: "Negotiation History",
    ariaLabel: "View session history, transcripts, and download records",
    description: "Session audit & downloads",
    icon: "history",
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
  const { isDark } = useTheme();

  function handleMenuItemClick(item) {
    onNavigate?.(item.page || item.label);
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
      colors={isDark ? ["#17161B", "#25242C"] : ["#E2E8F0", "#F8FAFC"]}
      accentColor="#34D399"
      isFixed={true}
    />
  );
}

