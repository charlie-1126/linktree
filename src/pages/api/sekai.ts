export const prerender = false;

const SPREADSHEET_ID = "1ymT8-xpanxAE2reZub7zzHdfgUT0jnLuGlZafXD-e-g";

export async function GET({ locals }: { locals: any }) {
  const API_KEY = locals.runtime?.env?.GOOGLE_API_KEY;
  try {
    const ranges = [
      "parse!B1:B39", // 곡명
      "parse!C1:C39", // 난이도
      "parse!D1:D39", // 레벨
      "parse!E1:E39", // 상수
      "parse!F1:F39", // 레이팅
      "parse!G1:G39", // 앨범 URL
      "B39 계산기!E4:E42", // 성과 (AP, FC 등)
      "B39 계산기!D1", // 최고 티어
      "B39 계산기!E1", // 최고 티어 시즌
      "B39 계산기!E48", // 플레이어 레이팅
    ];

    // Google Sheets API를 직접 fetch로 호출 (API 키 사용)
    const rangesParam = ranges
      .map((r) => `ranges=${encodeURIComponent(r)}`)
      .join("&");
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?${rangesParam}&key=${API_KEY}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const sheetData = await response.json();
    const valueRanges = sheetData.valueRanges || [];
    const [
      songs,
      difficulties,
      levels,
      constants,
      ratings,
      albumUrls,
      ranks,
      bestTier,
      bestSeason,
      playerRating,
    ] = valueRanges;

    // Best 39 데이터 구성
    const best39 = (songs?.values || []).map((row: any[], index: number) => ({
      song: row[0] || "",
      difficulty: difficulties?.values?.[index]?.[0] || "",
      level: levels?.values?.[index]?.[0] || "",
      constant: parseFloat(constants?.values?.[index]?.[0] || "0"),
      rating: parseFloat(ratings?.values?.[index]?.[0] || "0"),
      albumUrl: albumUrls?.values?.[index]?.[0] || "",
      rank: ranks?.values?.[index]?.[0] || "",
    }));

    const data = {
      playerRating: parseFloat(playerRating?.values?.[0]?.[0] || "0"),
      bestTier: bestTier?.values?.[0]?.[0] || "",
      bestSeason: bestSeason?.values?.[0]?.[0] || "",
      best39,
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Google Sheets fetch error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
