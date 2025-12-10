export const prerender = false;

const getRankFromRating = (rating: number): string => {
  if (rating >= 2800) return 'Red';
  if (rating >= 2400) return 'Orange';
  if (rating >= 2000) return 'Yellow';
  if (rating >= 1600) return 'Blue';
  if (rating >= 1200) return 'Cyan';
  if (rating >= 800) return 'Green';
  if (rating >= 400) return 'Brown';
  return 'Gray';
};

export async function GET() {
  try {
    const username = 'charlie1126';
    
    // Fetch contest history - server acts as proxy to bypass CORS
    const historyRes = await fetch(`https://atcoder.jp/users/${username}/history/json`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      }
    });
    
    if (!historyRes.ok) {
      throw new Error(`Failed to fetch contest history: ${historyRes.status}`);
    }
    const contestHistory = await historyRes.json();
    
    // Process contest history
    let rating = 0;
    let maxRating = 0;
    let lastContestDate = '';
    
    if (contestHistory && contestHistory.length > 0) {
      const latestContest = contestHistory[contestHistory.length - 1];
      rating = latestContest.NewRating || 0;
      maxRating = Math.max(...contestHistory.map((c: any) => c.NewRating || 0));
      lastContestDate = new Date(latestContest.EndTime).toLocaleDateString('ko-KR');
    }
    
    const rank = getRankFromRating(rating);
    const contests = contestHistory.length;
    
    // Get current rank from HTML page
    let currentRank = 30000; // default fallback
    
    try {
      const userPageRes = await fetch(`https://atcoder.jp/users/${username}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html",
        }
      });
      
      if (userPageRes.ok) {
        const html = await userPageRes.text();
        const rankMatch = html.match(/Rank\s*<\/th>\s*<td[^>]*>\s*([\d,]+)/i);
        
        if (rankMatch && rankMatch[1]) {
          currentRank = parseInt(rankMatch[1].replace(/,/g, ''));
        }
      }
    } catch (e) {
      // Use fallback rank on error
    }
    
    // Recent contests
    const recentContests = contestHistory.map((contest: any) => ({
      name: contest.ContestName || '',
      rank: contest.Place || 0,
      userOldRating: contest.OldRating || 0,
      userNewRating: contest.NewRating || 0,
      userRatingChange: (contest.NewRating || 0) - (contest.OldRating || 0),
      performance: contest.Performance || 0,
      contestEndTime: contest.EndTime || ''
    }));
    
    const data = {
      rating: rating || 0,
      rank: rank || 'Gray',
      maxRating: maxRating || 0,
      currentRank: currentRank || 30000,
      contests: contests || 0,
      lastContestDate: lastContestDate || '',
      recentContests: recentContests || []
    };
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('AtCoder API error:', error);
    
    // Return fallback data on error to prevent frontend crashes
    return new Response(JSON.stringify({ 
      rating: 0,
      rank: 'Gray',
      maxRating: 0,
      currentRank: 30000,
      contests: 0,
      lastContestDate: '',
      recentContests: []
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
