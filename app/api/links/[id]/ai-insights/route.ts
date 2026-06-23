import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Redis } from "@upstash/redis";
import { LinkRepository } from "@/lib/repositories"; 
import { ClickRepository } from "@/lib/repositories/click.repository"; 
import { UserRepository } from "@/lib/repositories";
import type { GroupedCount, ClicksByDay } from "@/lib/repositories/click.repository";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ALLOWED_DAYS = [7, 14, 30, 90] as const;
type AllowedDays = (typeof ALLOWED_DAYS)[number];
const CACHE_TTL = 60 * 60 * 24; // 24h

function buildPrompt(data: {
  title: string | null;
  url: string;
  days: number;
  totalClicks: number;
  countries: GroupedCount[];
  devices: GroupedCount[];
  browsers: GroupedCount[];
  referrers: GroupedCount[];
  clicksByDay: ClicksByDay[];
}) {
  const fmt = (items: GroupedCount[]) =>
    items
      .slice(0, 5)
      .map((i) => `  - ${i.label}: ${i.count} cliques`)
      .join("\n") || "  - Sem dados";

  return `Você é um analista de marketing digital especializado em performance de links encurtados.

Analise os dados abaixo e responda SOMENTE com JSON válido, sem markdown, sem texto extra.

Link: ${data.title || data.url}
URL: ${data.url}
Período: últimos ${data.days} dias
Total de cliques: ${data.totalClicks}

Cliques por dia:
${data.clicksByDay.map((d) => `  ${d.date}: ${d.count}`).join("\n") || "  Sem dados"}

Top países:
${fmt(data.countries)}

Top dispositivos:
${fmt(data.devices)}

Top navegadores:
${fmt(data.browsers)}

Top referrers:
${fmt(data.referrers)}

Formato exato da resposta (JSON puro, sem markdown):
{
  "summary": "Resumo executivo em 2-3 frases diretas.",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "suggestions": ["sugestão 1", "sugestão 2"]
}`;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sp = req.nextUrl.searchParams;
  const rawDays = Number(sp.get("days") ?? "30");
  const days: AllowedDays = ALLOWED_DAYS.includes(rawDays as AllowedDays)
    ? (rawDays as AllowedDays)
    : 30;
  const forceRefresh = sp.get("refresh") === "1";

  // IDOR check
  const link = await LinkRepository.findById(id);
  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

  const user = await UserRepository.findByClerkId(userId);
  if (!user || link.userId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Plano check
  if (user.plan === "FREE") {
    return NextResponse.json(
      { error: "AI insights disponível nos planos Pro e Agência." },
      { status: 403 }
    );
  }

  const cacheKey = `ai-insights:${id}:${days}`;

  // Cache Redis (pula se forceRefresh)
  if (!forceRefresh) {
    const cached = await redis.get<{
      summary: string;
      insights: string[];
      suggestions: string[];
      generatedAt: string;
    }>(cacheKey);
    if (cached) return NextResponse.json({ ...cached, cached: true });
  }

  // Analytics
  const analytics = await ClickRepository.getLinkAnalytics(id, days);
  if (analytics.totalClicks === 0) {
    return NextResponse.json(
      { error: "Sem dados suficientes. Aguarde alguns cliques." },
      { status: 422 }
    );
  }

  // Gemini API
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
    },
  });

  const result = await model.generateContent(
    buildPrompt({
      title: link.title,
      url: link.url,
      days,
      totalClicks: analytics.totalClicks,
      countries: analytics.byCountry,
      devices: analytics.byDevice,
      browsers: analytics.byBrowser,
      referrers: analytics.byReferrer,
      clicksByDay: analytics.clicksByDay,
    })
  );

  const raw = result.response.text();

  console.log("RAW GEMINI RESPONSE:", raw);

  let parsed: { summary: string; insights: string[]; suggestions: string[] };
  try {
    parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return NextResponse.json(
      { error: "Falha ao processar resposta da IA." },
      { status: 500 }
    );
  }

  const response = { ...parsed, generatedAt: new Date().toISOString() };
  await redis.set(cacheKey, response, { ex: CACHE_TTL });

  return NextResponse.json({ ...response, cached: false });
}