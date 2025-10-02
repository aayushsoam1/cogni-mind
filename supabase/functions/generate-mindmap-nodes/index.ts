import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating mind map nodes for prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a mind map generator. Read user input and create a detailed Mind Map JSON.

RULES:
1) Output ONLY valid JSON without markdown formatting.
2) Each important concept, topic, skill, or career path becomes a "node".
3) Each node MUST have these fields:
   - id: unique id
   - label: short title (Hindi/Hinglish allowed)
   - type: one of ["topic","skill","job","internship","course","video","resource","project"]
   - description: 1-2 lines Hinglish summary
   - tags: list of keywords
   - resources: list of up to 4 resource objects (see resource schema below)
   - children: list of node ids (optional)
   - lang: language code like "hi" or "en"

4) Resource schema:
   {
     "r_id": "unique id",
     "title": "resource title",
     "provider": "NPTEL | SWAYAM | Diksha | NCVET | SkillIndia | Coursera | YouTube | Udemy | LinkedIn | Internshala | GitHub",
     "url": "direct link (prefer govt sites)",
     "type": "video | course | job | internship | pdf | article | guideline",
     "meta": {
        "official": true/false,
        "score": 0..1,
        "tags": []
     }
   }

5) Resource priority:
   - First: Indian Government official resources (NCVET, NPTEL, SWAYAM, Diksha, SkillIndia, AICTE, MSDE)
   - Second: Open resources (Coursera, Udemy, YouTube tutorials, GitHub projects)
   - Third: Jobs/Internships (LinkedIn, Naukri, Internshala)

6) Include edges array: [{ "from": node_id, "to": node_id, "relation": "prerequisite|related|leads_to|part_of" }]

7) For each skill/topic, include at least:
   - 1 official govt course (NPTEL/SWAYAM/Diksha/Skill India/NCVET link)
   - 1 YouTube tutorial
   - 1 Job/Internship sample link
   - 1 open learning platform course (Coursera/Udemy/edX)

8) Use realistic links. Mark meta.official = false for non-govt resources.

9) Create 5-15 nodes with clear hierarchy and relationships.

OUTPUT FORMAT:
{
  "nodes": [
    {
      "id": "n1",
      "label": "Node Title",
      "type": "skill",
      "description": "Brief Hinglish description",
      "tags": ["tag1", "tag2"],
      "resources": [
        {"r_id": "r1", "title": "NPTEL Course", "provider": "NPTEL", "url": "https://nptel.ac.in/...", "type": "course", "meta": {"official": true, "score": 0.95, "tags": []}},
        {"r_id": "r2", "title": "YouTube Tutorial", "provider": "YouTube", "url": "https://youtube.com/...", "type": "video", "meta": {"official": false, "score": 0.9, "tags": []}},
        {"r_id": "r3", "title": "Internship Link", "provider": "Internshala", "url": "https://internshala.com/...", "type": "internship", "meta": {"official": false, "score": 0.85, "tags": []}},
        {"r_id": "r4", "title": "Coursera Course", "provider": "Coursera", "url": "https://coursera.org/...", "type": "course", "meta": {"official": false, "score": 0.88, "tags": []}}
      ],
      "children": ["n2", "n3"],
      "lang": "en"
    }
  ],
  "edges": [
    {"from": "n1", "to": "n2", "relation": "prerequisite"}
  ]
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI Response:', content);

    // Parse the JSON response, handling potential markdown formatting
    let parsedContent;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(
      JSON.stringify(parsedContent),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-mindmap-nodes:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
