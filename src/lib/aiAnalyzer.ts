// AI Issue Analyzer — powered by OpenRouter API
// Uses OpenAI-compatible format. Model: google/gemini-flash-1.5 (fast + cheap via OpenRouter)

export interface AIAnalysis {
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  urgencyScore: number; // 1-10
  tags: string[];
  suggestedAction: string;
  estimatedSLA: string;
  isSafetyHazard: boolean;
  confidence: number; // 0-100
}

export const ALL_CATEGORIES = [
  'Cleaning', 'Electrical', 'Structural', 'Plumbing',
  'IT/Network', 'Safety Hazard', 'Pest Control',
  'Gardening', 'Fire Safety', 'Other'
] as const;

// ─── OpenRouter-powered analysis (via backend) ─────────────────────────────────────────────
export async function analyzeWithOpenRouter(
  description: string,
  location: string
): Promise<AIAnalysis> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ description, location }),
    });

    if (!res.ok) throw new Error(`Backend analysis failed ${res.status}`);
    return await res.json() as AIAnalysis;
  } catch (e) {
    console.warn('Analysis failed:', e);
    // Fallback to a minimal default if the backend is completely down
    return {
      category: 'Other',
      priority: 'LOW',
      urgencyScore: 3,
      tags: [],
      suggestedAction: 'Review report and assign appropriate team member.',
      estimatedSLA: '72 hours',
      isSafetyHazard: false,
      confidence: 0,
    };
  }
}

// ─── Campus Health Score generator ───────────────────────────────────────────
export async function generateCampusHealthInsight(
  stats: { total: number; completed: number; byCategory: Record<string, number>; byRegion: Record<string, number> }
): Promise<{ score: number; grade: string; summary: string; topRisk: string; recommendation: string }> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/health', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(stats),
    });
    
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend health score failed, using local fallback:', e);
  }
  return buildLocalHealthScore(stats);
}

function buildLocalHealthScore(stats: { total: number; completed: number; byCategory: Record<string, number>; byRegion: Record<string, number> }) {
  const resolutionRate = stats.total > 0 ? (stats.completed / stats.total) : 1;
  const safetyIssues = (stats.byCategory['Safety Hazard'] || 0) + (stats.byCategory['Fire Safety'] || 0) + (stats.byCategory['Electrical'] || 0);
  const score = Math.round(Math.max(20, resolutionRate * 100 - safetyIssues * 5));
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
  const topRegion = Object.entries(stats.byRegion).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Campus';
  return {
    score, grade,
    summary: `Campus resolution rate is ${Math.round(resolutionRate * 100)}%. ${stats.total - stats.completed} issues currently open.`,
    topRisk: `${topRegion} has the highest number of unresolved issues`,
    recommendation: safetyIssues > 0
      ? 'Prioritize electrical and safety hazard reports — these pose immediate risk.'
      : 'Increase cleaning crew frequency in high-traffic zones.'
  };
}
