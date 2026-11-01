import {pageMetadata} from '@/lib/page-metadata';
import AiAssistantClient from './AiAssistantClient';

export const metadata = pageMetadata("/projects/ai-assistant", {
  title: "Arpit's AI Avatar | Arpit Agarwala",
  description: "Chat with Arpit's AI Avatar — ask about his projects, skills, experience, and more.",
});

export default function AiAssistantPage() {
  return <AiAssistantClient />;
}

