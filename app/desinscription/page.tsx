import { EmailAnnouncementUnsubscribe } from "@/components/email-announcement-unsubscribe";

export default async function UnsubscribePage({
  searchParams,
}: PageProps<"/desinscription">) {
  const { token } = await searchParams;
  return <EmailAnnouncementUnsubscribe token={typeof token === "string" ? token : null} />;
}
