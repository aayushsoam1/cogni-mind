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
            content: `You are a NotebookLM-style mind map generator. Create an interactive Mind Map with 3 parent categories: Study, Jobs, Notes.

RULES:
1) Output ONLY valid JSON without markdown formatting.

2) Create minimum 3 parent category nodes:
   - One "Study" parent node (id: "study_parent")
   - One "Jobs" parent node (id: "jobs_parent")  
   - One "Notes" parent node (id: "notes_parent")

3) Node Schema:
   {
     "id": "unique_id",
     "label": "short_title",
     "type": "study | job | note | topic",
     "category": "study | job | note",
     "description": "1-2 line Hinglish description",
     "tags": ["keyword1", "keyword2"],
     "resources": [
       {
         "r_id": "unique",
         "title": "resource title",
         "provider": "NPTEL | SWAYAM | Diksha | NCVET | SkillIndia | Coursera | YouTube | Udemy | LinkedIn | Internshala | GitHub",
         "url": "direct link",
         "type": "pdf | course | video | job | internship | article | guideline",
         "meta": {
           "official": true/false,
           "score": 0..1,
           "tags": []
         }
       }
     ],
     "children": ["linked_node_ids"],
     "lang": "hi" or "en"
   }

4) Category-specific rules:
   - "Study" nodes: Only Govt official resources (NPTEL, SWAYAM, Diksha, NCVET, SkillIndia) + open learning (Coursera, YouTube, Udemy)
   - "Jobs" nodes: Only Internships + Jobs links (LinkedIn, Internshala, Naukri)
   - "Notes" nodes: AI-generated summary, PDF notes, guidelines

5) For each topic, create:
   - At least 1 Study node with govt course + YouTube tutorial + open course
   - At least 1 Job node with internship + job link
   - At least 1 Note node with summary + guideline

6) Edges Array with relationships:
   [
     {"from": "study_parent", "to": "study_node_id", "relation": "contains"},
     {"from": "jobs_parent", "to": "job_node_id", "relation": "contains"},
     {"from": "notes_parent", "to": "note_node_id", "relation": "contains"},
     {"from": "study_node_id", "to": "job_node_id", "relation": "leads_to"},
     {"from": "job_node_id", "to": "note_node_id", "relation": "related"}
   ]

7) Create 8-15 child nodes total across all 3 categories with clear hierarchy.

8) Use realistic links. Mark meta.official = false for non-govt resources.

OUTPUT FORMAT:
{
  "nodes": [
    {
      "id": "study_parent",
      "label": "📚 Study Materials",
      "type": "topic",
      "category": "study",
      "description": "Official courses aur learning resources",
      "tags": ["education"],
      "resources": [],
      "children": ["s1", "s2"],
      "lang": "hi"
    },
    {
      "id": "jobs_parent",
      "label": "💼 Jobs & Internships",
      "type": "topic",
      "category": "job",
      "description": "Career opportunities aur placements",
      "tags": ["career"],
      "resources": [],
      "children": ["j1", "j2"],
      "lang": "hi"
    },
    {
      "id": "notes_parent",
      "label": "📝 Notes & Guides",
      "type": "topic",
      "category": "note",
      "description": "AI-generated notes aur guidelines",
      "tags": ["notes"],
      "resources": [],
      "children": ["n1", "n2"],
      "lang": "hi"
    },
    {
      "id": "s1",
      "label": "Python Basics",
      "type": "study",
      "category": "study",
      "description": "Python fundamentals aur syntax",
      "tags": ["python", "programming"],
      "resources": [
        {"r_id": "r1", "title": "NPTEL Python Course", "provider": "NPTEL", "url": "https://nptel.ac.in/courses/106/106/106106182/", "type": "course", "meta": {"official": true, "score": 0.95, "tags": ["python"]}},
        {"r_id": "r2", "title": "Python Tutorial Hindi", "provider": "YouTube", "url": "https://youtube.com/watch?v=example", "type": "video", "meta": {"official": false, "score": 0.9, "tags": ["tutorial"]}},
        {"r_id": "r3", "title": "Python Programming", "provider": "Coursera", "url": "https://coursera.org/learn/python", "type": "course", "meta": {"official": false, "score": 0.88, "tags": ["python"]}}
      ],
      "children": [],
      "lang": "hi"
    },
    {
      "id": "j1",
      "label": "Python Developer Intern",
      "type": "job",
      "category": "job",
      "description": "Python internship opportunities",
      "tags": ["python", "internship"],
      "resources": [
        {"r_id": "r4", "title": "Python Internship", "provider": "Internshala", "url": "https://internshala.com/internships/python", "type": "internship", "meta": {"official": false, "score": 0.85, "tags": ["internship"]}},
        {"r_id": "r5", "title": "Python Developer Jobs", "provider": "LinkedIn", "url": "https://linkedin.com/jobs/python-developer", "type": "job", "meta": {"official": false, "score": 0.87, "tags": ["job"]}}
      ],
      "children": [],
      "lang": "hi"
    },
    {
      "id": "n1",
      "label": "Python Quick Notes",
      "type": "note",
      "category": "note",
      "description": "Python ke important concepts ka summary",
      "tags": ["notes", "python"],
      "resources": [
        {"r_id": "r6", "title": "Python Cheat Sheet", "provider": "GitHub", "url": "https://github.com/python-cheatsheet", "type": "pdf", "meta": {"official": false, "score": 0.92, "tags": ["cheatsheet"]}},
        {"r_id": "r7", "title": "Python Best Practices", "provider": "GitHub", "url": "https://github.com/python-guide", "type": "guideline", "meta": {"official": false, "score": 0.9, "tags": ["guide"]}}
      ],
      "children": [],
      "lang": "hi"
    }
  ],
  "edges": [
    {"from": "study_parent", "to": "s1", "relation": "contains"},
    {"from": "jobs_parent", "to": "j1", "relation": "contains"},
    {"from": "notes_parent", "to": "n1", "relation": "contains"},
    {"from": "s1", "to": "j1", "relation": "leads_to"},
    {"from": "j1", "to": "n1", "relation": "related"}
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
