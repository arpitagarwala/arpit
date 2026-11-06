export const ENQUIRY_INTENTS = ['Ask about an app', 'Purchase or license an app', 'Build a custom app'] as const;
export type EnquiryIntent = typeof ENQUIRY_INTENTS[number];
export type AppEnquiry = { name: string; reply: string; app: string; intent: EnquiryIntent; message: string };

export function appEnquiryLinks(enquiry: AppEnquiry, email: string, whatsapp?: string) {
  const subject = `${enquiry.intent} — ${enquiry.app || 'New project'}`;
  const body = `Hi Arpit,\n\n${enquiry.message.trim()}\n\nEnquiry: ${enquiry.intent}\nApp: ${enquiry.app || 'New project'}\nName: ${enquiry.name.trim()}${enquiry.reply.trim() ? `\nReply to: ${enquiry.reply.trim()}` : ''}`;
  return {
    body,
    email: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    whatsapp: whatsapp ? `${whatsapp.split('?')[0]}?text=${encodeURIComponent(body)}` : undefined,
  };
}
