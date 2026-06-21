import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { DeliverableExperience } from "@/components/DeliverableExperience";
import { Nav } from "@/components/Nav";
import { api } from "@/lib/api";
import { getLocale } from "@/lib/locale";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function DeliverablePage({ params }: Props) {
  const locale = await getLocale();
  const { slug } = await params;

  let deliverable;
  try {
    deliverable = await api.getDeliverable(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <Nav />
      <DeliverableExperience deliverable={deliverable} locale={locale} />
    </>
  );
}