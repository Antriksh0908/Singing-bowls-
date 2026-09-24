import { Buyer } from './types';

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: (buyer: Buyer) => string;
  generateBody: (buyer: Buyer, senderName?: string, companyName?: string) => string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tibetan-artisan',
    name: 'Artisan Tibetan 7-Metal Singing Bowls (Direct Sourcing)',
    category: 'Tibetan Bowls',
    subject: (buyer) => `Wholesale Hand-Hammered 7-Metal Singing Bowls for ${buyer.name}`,
    generateBody: (buyer, senderName = 'Aria Vance', companyName = 'Himalayan Resonant Instruments') => 
`Dear ${buyer.buyerName || 'Procurement Team'},

I noticed ${buyer.name} in ${buyer.city}, ${buyer.state} is dedicated to genuine sound healing and meditation tools, especially ${buyer.specialty || 'handcrafted acoustic instruments'}.

We work directly with certified artisan metalsmiths in Nepal and northern India to produce authentic, 7-metal hand-hammered Tibetan singing bowls (Thadobati, Jambati, and Lingam styles). Each bowl is individually struck and acoustic-tested to sustain deep harmonic overtones for up to 90 seconds.

Key benefits for ${buyer.name}:
• Direct artisan pricing (35–45% below standard US wholesale distributors)
• Fair Trade & Copper-Tin metallurgical authenticity certificates included
• Complimentary hand-carved rosewood mallets & silk brocade cushions with every set
• Ready inventory in our US transit hub with 3-5 business day dispatch

Would you be open to receiving our 2026 Wholesale Catalog and pricing tier sheet?

Warmest regards,

${senderName}
B2B Sourcing & Export Lead
${companyName}
Phone / WhatsApp: +1 (800) 555-BOWL
Direct Catalog: https://singingbowls-export.example.com/wholesale`,
  },
  {
    id: 'crystal-quartz',
    name: '432Hz Tuned Quartz Crystal Bowls (Chakra Complete Sets)',
    category: 'Crystal Bowls',
    subject: (buyer) => `432Hz Tuned Quartz Crystal Singing Bowls Supply for ${buyer.name}`,
    generateBody: (buyer, senderName = 'Aria Vance', companyName = 'Himalayan Resonant Instruments') => 
`Hi ${buyer.buyerName || 'Procurement Manager'},

Hope you're having a wonderful week in ${buyer.city}!

I'm reaching out because many sound bath studios and wellness practitioners have faced inventory delays on high-purity frosted and clear quartz crystal singing bowls tuned to the natural 432Hz frequency.

At ${companyName}, we manufacture 99.99% pure American quartz crystal bowls with:
• Laser-calibrated tuning to 432Hz (standard 440Hz also available)
• Complete 7-Chakra & 8-Chakra sets (8" to 14" diameter)
• Heavy-duty padded velvet flight travel cases with protective nesting
• Silicone O-rings and crystal suede strikers included at no extra charge

Given your focus on ${buyer.specialty || 'sound therapy equipment'}, we would love to offer ${buyer.name} a 20% introductory discount on your first wholesale order.

May I email you our full specification sheet and acoustic frequency audio samples?

Best regards,

${senderName}
Wholesale Director
${companyName}`,
  },
  {
    id: 'soundbath-studio',
    name: 'Sound Healing Studio Practitioner Starter Kits',
    category: 'Studios & Centers',
    subject: (buyer) => `Practitioner Grade Sound Healing Bowl Packages - ${buyer.name}`,
    generateBody: (buyer, senderName = 'Aria Vance', companyName = 'Himalayan Resonant Instruments') => 
`Hello ${buyer.buyerName || 'Studio Director'},

Greetings from ${companyName}. We've been following the inspiring sound healing gatherings at ${buyer.name} in ${buyer.city}, ${buyer.state}.

We partner directly with leading US yoga studios and sound bath academies to supply practitioner-grade singing bowl kits. Whether your students are looking for their first meditation bowl or your studio is upgrading its concert-level sound bath array, our curated wholesale packages eliminate the middleman markup.

What we offer your studio:
• Custom studio branding / laser engraving available
• Flexible MOQ (minimum order quantity starting at just $500)
• Free delivery on US orders over $1,500
• 30-Day acoustic satisfaction guarantee

I would love to send over our curated Studio Partner Guide. Let me know if you'd like a quick preview!

In harmony,

${senderName}
Partner Relations
${companyName}`,
  },
  {
    id: 'quick-inquiry',
    name: 'Short Direct Procurement Inquiry (High Open Rate)',
    category: 'Quick Pitch',
    subject: (buyer) => `Quick question regarding singing bowl inventory at ${buyer.name}`,
    generateBody: (buyer, senderName = 'Aria Vance', companyName = 'Himalayan Resonant Instruments') => 
`Hi ${buyer.buyerName || 'Purchasing Team'},

Are you currently taking on new suppliers for ${buyer.specialty || 'singing bowls and meditation sound tools'} at ${buyer.name}?

We supply authentic 7-metal Tibetan bowls and 432Hz quartz crystal bowls directly to US retailers, offering 35% lower wholesale rates than major domestic distributors with fast US shipping.

If you have 2 minutes, should I send our 1-page line sheet and price list?

Thank you,

${senderName}
${companyName}
USA Wholesale Desk`,
  },
];
