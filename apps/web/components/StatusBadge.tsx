import type { DeliverableStatus, WishStatus } from "@vibeking/shared";
import type { Locale } from "@/lib/locale";
import { labels, t } from "@/lib/i18n";

type Status = WishStatus | DeliverableStatus;

const statusClass: Record<Status, string> = {
  open: "status-open",
  claimed: "status-claimed",
  in_progress: "status-progress",
  delivered: "status-delivered",
  accepted: "status-accepted",
  rejected: "status-rejected",
  draft: "status-draft",
  live: "status-live",
  archived: "status-archived",
};

export function StatusBadge({ status, locale }: { status: Status; locale: Locale }) {
  const label = labels.status[status as keyof typeof labels.status];
  return (
    <span className={`status-badge ${statusClass[status]}`}>
      {label ? t(label, locale) : status}
    </span>
  );
}