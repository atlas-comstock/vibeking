"use client";

import { CoverVisual, type CoverVisualProps } from "./CoverVisual";

type Props = Omit<CoverVisualProps, "variant">;

export function CoverHero(props: Props) {
  return <CoverVisual {...props} variant="hero" />;
}