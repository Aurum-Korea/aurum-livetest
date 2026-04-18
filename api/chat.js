// api/chat.js — Gold AI edge function (S-02)
// Edge runtime declared here; do NOT add runtime key to vercel.json functions block.
export const config = { runtime: 'edge' };

const SYSTEM = `You are Gold AI for Aurum Korea — a concise, knowledgeable assistant for Korean investors interested in physical gold and silver stored in Singapore (Malca-Amit FTZ).

You know:
- Live gold/silver spot prices (provided in context)
- Korean retail gold premium (~20% over spot, kimchi premium + VAT)
- Aurum Korea pricing (~8% over spot — far cheaper than Korean retail)
- Founders Club: 5 gates, −1% to −3% lifetime price discount based on GMV
- AGP (Aurum Gold Plan): monthly gold accumulation savings plan
- Malca-Amit Singapore vault: Lloyd's of London insured, segregated storage, 0.75%–0.30% p.a.
- KRW/USD exchange rate and how it affects Korean investors

Rules:
- Answer in the same language as the user (Korean or English).
- Be concise — 2–4 sentences max unless a calculation is needed.
- Never give financial advice. Always end with: "이는 정보 제공 목적입니다 / For information only."
- Use ₩ for KRW amounts, $ for USD.
- When user asks about savings vs Korea, calculate: Korea retail = spot × 1.20 × krwRate, Aurum = spot × 1.08 × krwRate, savings = difference per oz.`;

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ text: 'Gold AI is not configured. Add ANTHROPIC_API_KEY to Vercel environment variables.' }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });

  try {
    const { messages, context } = await req.json();

    const contextBlock = `Current data:
- Gold spot: $${context.goldUSD}/oz
- Silver spot: $${context.silverUSD}/oz
- USD/KRW: ₩${context.krwRate}
- Korea retail gold (1oz): ₩${context.koreaRetailKRW}
- Aurum gold (1oz): ₩${context.aurumPriceKRW}
- Savings vs Korea (1oz): ₩${context.savingsKRW}
${context.userName ? `- User: ${context.userName}` : ''}
${context.userGate ? `- User gate: ${context.userGate}` : ''}
${context.userGMV ? `- User GMV: $${context.userGMV}` : ''}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM + '\n\n' + contextBlock,
        messages: messages.slice(-10),
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '응답을 받지 못했습니다.';
    return new Response(JSON.stringify({ text }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ text: '오류가 발생했습니다. 잠시 후 다시 시도하세요.' }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }
}
