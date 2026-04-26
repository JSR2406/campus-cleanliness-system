import { Request, Response } from 'express';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export const analyzeComplaint = async (req: Request, res: Response) => {
  const { description, location } = req.body;

  if (!description || !location) {
    return res.status(400).json({ error: 'Description and location are required' });
  }

  // 1. Try OpenRouter
  if (OPENROUTER_API_KEY) {
    try {
      const systemPrompt = `You are an AI assistant for a university campus facility management system.
When given an issue report, classify it and return ONLY a valid JSON object — no markdown, no extra text.

Available categories: Cleaning, Electrical, Structural, Plumbing, IT/Network, Safety Hazard, Pest Control, Gardening, Fire Safety, Other
Priority levels: LOW, MEDIUM, HIGH, CRITICAL

JSON schema:
{
  "category": string,
  "priority": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
  "urgencyScore": number (1-10),
  "tags": string[],
  "suggestedAction": string (1-2 sentences for staff),
  "estimatedSLA": string (e.g. "4 hours"),
  "isSafetyHazard": boolean,
  "confidence": number (0-100)
}`;

      const userPrompt = `Issue Description: "${description}"\nLocation: "${location}"`;

      const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'CampusClean AI',
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 350,
        }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        const raw: string = data.choices?.[0]?.message?.content || '';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        }
      } else {
        console.warn(`OpenRouter analysis failed: ${aiRes.status}`);
      }
    } catch (e) {
      console.warn('OpenRouter analysis error, using local heuristic:', e);
    }
  }

  // 2. Fallback to Local Heuristic
  const text = (description + ' ' + location).toLowerCase();
  let category = 'Other';
  let urgencyScore = 3;
  let isSafetyHazard = false;
  const tags: string[] = [];

  if (/electric|wiring|switch|socket|power|light|bulb|fan|ac|voltage|shock|spark|circuit|fuse/.test(text)) {
    category = 'Electrical'; urgencyScore = 7; tags.push('electrical');
    if (/shock|spark|exposed|fire|burning/.test(text)) { isSafetyHazard = true; urgencyScore = 10; }
  } else if (/crack|broken|wall|roof|ceiling|floor|pillar|struct|collapse|fallen|damage|window|door|glass/.test(text)) {
    category = 'Structural'; urgencyScore = 6; tags.push('structural');
    if (/collapse|crack.*wall|roof.*leak|ceiling.*fall/.test(text)) { isSafetyHazard = true; urgencyScore = 9; }
  } else if (/pipe|water|leak|drain|tap|overflow|flood|sewage|toilet|washroom|plumb/.test(text)) {
    category = 'Plumbing'; urgencyScore = 6; tags.push('plumbing');
    if (/flood|sewage|overflow/.test(text)) urgencyScore = 8;
  } else if (/garbage|trash|waste|clean|dirty|mess|litter|sweep|mop|spill|stain|smell/.test(text)) {
    category = 'Cleaning'; urgencyScore = 4; tags.push('cleanliness');
    if (/washroom|toilet|overflowing/.test(text)) urgencyScore = 7;
  } else if (/wifi|internet|projector|computer|network|router|server|printer|screen|tech/.test(text)) {
    category = 'IT/Network'; urgencyScore = 5; tags.push('technology');
  } else if (/rat|mouse|cockroach|insect|pest|bug|ant|termite|mosquito|fly|bird/.test(text)) {
    category = 'Pest Control'; urgencyScore = 6; tags.push('pest');
  } else if (/fire|smoke|extinguisher|alarm|fire.*hazard|dangerous|unsafe/.test(text)) {
    category = 'Fire Safety'; urgencyScore = 9; isSafetyHazard = true; tags.push('fire', 'safety');
  } else if (/garden|grass|tree|plant|branch|weed|ground|outdoor|lawn/.test(text)) {
    category = 'Gardening'; urgencyScore = 3; tags.push('maintenance');
  } else if (/hazard|danger|unsafe|risk|broken.*railing|missing.*cover/.test(text)) {
    category = 'Safety Hazard'; urgencyScore = 8; isSafetyHazard = true; tags.push('safety');
  }

  if (/lab|hospital|medical|kitchen|cafeteria|canteen/.test(text)) urgencyScore = Math.min(10, urgencyScore + 2);
  if (/hostel|dormitory|residence/.test(text)) urgencyScore = Math.min(10, urgencyScore + 1);

  const priority = urgencyScore >= 9 ? 'CRITICAL' : urgencyScore >= 7 ? 'HIGH' : urgencyScore >= 5 ? 'MEDIUM' : 'LOW';
  const slaMap: Record<string, string> = { CRITICAL: '2 hours', HIGH: '4 hours', MEDIUM: '24 hours', LOW: '72 hours' };
  const actionMap: Record<string, string> = {
    Electrical: 'Dispatch certified electrician. Cordon area if exposed wiring.',
    Structural: 'Assess structural integrity. Block off area if collapse risk.',
    Plumbing: 'Send plumber. Turn off water supply if overflow detected.',
    Cleaning: 'Assign cleaning crew with appropriate equipment.',
    'IT/Network': 'Escalate to IT department. Check hardware and network logs.',
    'Pest Control': 'Schedule pest control service and seal entry points.',
    'Fire Safety': 'URGENT: Inspect fire equipment, alert safety officer.',
    Gardening: 'Schedule grounds maintenance crew.',
    'Safety Hazard': 'Cordon area immediately. Assess and mitigate hazard.',
    Other: 'Review report and assign appropriate team member.',
  };

  return res.json({
    category, priority, urgencyScore, tags,
    suggestedAction: actionMap[category] || actionMap.Other,
    estimatedSLA: slaMap[priority],
    isSafetyHazard,
    confidence: category === 'Other' ? 45 : 72 + Math.floor(Math.random() * 20),
  });
};

export const analyzeHealth = async (req: Request, res: Response) => {
  const { total, completed, byCategory, byRegion } = req.body;
  
  if (OPENROUTER_API_KEY) {
    const prompt = `You are a campus facility AI analyst. Given these complaint stats, generate a campus health assessment.

Stats:
- Total open issues: ${total - completed}
- Resolved: ${completed} / ${total}
- By Category: ${JSON.stringify(byCategory)}
- By Region: ${JSON.stringify(byRegion)}

Return ONLY valid JSON:
{
  "score": <0-100 health score>,
  "grade": "A+"|"A"|"B"|"C"|"D"|"F",
  "summary": "<2 sentence summary of campus health>",
  "topRisk": "<highest risk area or category>",
  "recommendation": "<top 1 actionable recommendation>"
}`;

    try {
      const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'CampusClean AI',
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        const raw: string = data.choices?.[0]?.message?.content || '';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        }
      }
    } catch (e) {
      console.warn('OpenRouter health score failed, using local fallback:', e);
    }
  }

  // Local fallback
  const resolutionRate = total > 0 ? (completed / total) : 1;
  const safetyIssues = (byCategory['Safety Hazard'] || 0) + (byCategory['Fire Safety'] || 0) + (byCategory['Electrical'] || 0);
  const score = Math.round(Math.max(20, resolutionRate * 100 - safetyIssues * 5));
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
  const topRegion = Object.entries(byRegion).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Campus';
  
  return res.json({
    score, grade,
    summary: `Campus resolution rate is ${Math.round(resolutionRate * 100)}%. ${total - completed} issues currently open.`,
    topRisk: `${topRegion} has the highest number of unresolved issues`,
    recommendation: safetyIssues > 0
      ? 'Prioritize electrical and safety hazard reports — these pose immediate risk.'
      : 'Increase cleaning crew frequency in high-traffic zones.'
  });
};
