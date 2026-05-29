// AI chatbot for VibeTix event attendees
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, eventsContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `You are VibeBot, the friendly AI assistant for VibeTix — an Indian event ticketing platform.
You help attendees with questions about events: timings, venues, prices (always in ₹ INR), seat availability, booking process, UPI payments, refunds, dress code, and event vibe.

Payment info to share when asked:
- Pay securely via UPI: PhonePe, Google Pay, Paytm, BHIM — direct app deep-link, no QR scan needed
- UPI ID: 7796801516@ibl (VibeTix Events)
- Card payments also supported
- A confirmation email is sent only after the UTR is verified
- QR ticket is generated instantly after successful payment

Seat booking: cinema-style live seat map with color coding — green=available, gold=VIP, grey=booked. Users pick seats before paying.

Here is the live events catalog (JSON):
${JSON.stringify(eventsContext ?? [], null, 0)}

Keep answers short, warm, and helpful. Use ₹ for prices. If you don't know something specific, say so honestly and suggest contacting support@vibetix.in.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit, try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("event-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
