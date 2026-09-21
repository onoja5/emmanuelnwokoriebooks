import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

export function WhatsAppContact() {
  return (
    <a
      className="whatsapp-contact"
      href={whatsappUrl(
        "Hello Emmanuel, I have an enquiry about your books. Please can you assist me?",
      )}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Emmanuel on WhatsApp at 0704 710 0043"
    >
      <MessageCircle aria-hidden="true" />
      <span>WhatsApp</span>
    </a>
  );
}
