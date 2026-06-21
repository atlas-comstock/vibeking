"use client";

import Link from "next/link";
import { CoverVisual, type CoverVisualProps } from "./CoverVisual";

type Props = CoverVisualProps & {
  href: string;
};

export function CardCover({ href, ...visual }: Props) {
  const content = <CoverVisual {...visual} variant="card" />;

  if (href.startsWith("http")) {
    return (
      <a href={href} className="pin-cover-link" target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="pin-cover-link">
      {content}
    </Link>
  );
}