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
            content: `You are a NotebookLM-style mind map generator. Create an interactive Mind Map with 4 parent categories: Study, Jobs, Notes, Videos.

MAIN RULES:
1) Output ONLY valid JSON without markdown formatting.

2) Create minimum 4 parent category nodes:
   - One "Study" parent node (id: "study_parent")
   - One "Jobs" parent node (id: "jobs_parent")  
   - One "Notes" parent node (id: "notes_parent")
   - One "Videos" parent node (id: "videos_parent")

3) Node Schema:
   {
     "id": "unique_id",
     "label": "short_title",
     "type": "study | job | note | video | topic",
     "category": "study | job | note | video",
     "description": "1-3 line Hinglish description",
     "tags": ["keyword1", "keyword2"],
     "resources": [
       {
         "r_id": "unique",
         "title": "resource title",
         "provider": "NPTEL | SWAYAM | Diksha | NCVET | SkillIndia | Coursera | YouTube | Udemy | LinkedIn | Internshala | GitHub | OpenAI Careers | Google Careers | Meta Careers | Amazon Jobs | Microsoft Careers | Apple Jobs | NVIDIA Careers | IBM Careers | Adobe Careers | Accenture Careers | TCS Careers | Infosys Careers | Wipro Careers | Flipkart Careers",
         "url": "direct link",
         "type": "pdf | course | video | job | internship | article | guideline",
         "meta": {
           "official": true/false,
           "mock": true/false,
           "score": 0..1,
           "tags": [],
           "snippet": "short job description or course summary",
           "youtube_id": "video_id_if_youtube",
           "view": "inner | web"
         }
       }
     ],
     "children": ["linked_node_ids"],
     "lang": "hi" or "en",
     "visual": { "color": "#hex", "shape": "rounded" }
   }

4) JOBS-SPECIFIC RULES (CRITICAL):
   - Include at least 10-15 job nodes from these companies: OpenAI, Google, Meta (Facebook), Amazon, Microsoft, Apple, NVIDIA, IBM, Adobe, Accenture, TCS, Infosys, Wipro, Flipkart
   - For each company job node:
     * provider = "<Company> Careers" (e.g., "OpenAI Careers", "Google Careers")
     * url = official careers URL:
       - OpenAI: "https://openai.com/careers/"
       - Google: "https://careers.google.com/"
       - Meta: "https://www.metacareers.com/"
       - Amazon: "https://www.amazon.jobs/"
       - Microsoft: "https://careers.microsoft.com/"
       - Apple: "https://www.apple.com/careers/"
       - NVIDIA: "https://www.nvidia.com/en-us/about-nvidia/careers/"
       - IBM: "https://www.ibm.com/employment/"
       - Adobe: "https://www.adobe.com/careers.html"
       - Accenture: "https://www.accenture.com/in-en/careers"
       - TCS: "https://www.tcs.com/careers"
       - Infosys: "https://www.infosys.com/careers/"
       - Wipro: "https://careers.wipro.com/"
       - Flipkart: "https://www.flipkartcareers.com/"
     * meta.official = true
     * meta.mock = false
     * meta.snippet = realistic 1-2 line job description matching the topic
     * meta.score = relevance 0.8-0.98
     * label = "<Role> — <Company>" (e.g., "ML Engineer — OpenAI", "SDE II — Google")
   - Mix global (OpenAI, Google, Meta, Amazon, Microsoft, Apple, NVIDIA, IBM, Adobe) and Indian (Accenture, TCS, Infosys, Wipro, Flipkart) companies

5) STUDY-SPECIFIC RULES:
   - Each Study node must include:
     * 1 Government resource (NPTEL/SWAYAM/Diksha/NCVET/SkillIndia) with meta.official=true
     * 1 YouTube tutorial with url="https://youtube.com/embed/<VIDEO_ID>", meta.youtube_id="<VIDEO_ID>"
     * 1 Open course (Coursera/Udemy) with meta.official=false
     * 1 GitHub resource or project repo
   - Add meta.score and relevant tags to all resources

6) NOTES & PDF RULES:
   - For Notes nodes provide:
     * AI-generated summary (5-8 bullet points in description)
     * PDF resource with meta.view="inner" for inline preview and meta.view="web" for new tab
     * If no real PDF available, use url="auto_generated_<topic>.pdf" and meta.mock=true
   - Example: {"r_id":"r_note1","title":"Complete Notes PDF","provider":"AI Generated","url":"auto_generated_python.pdf","type":"pdf","meta":{"official":false,"mock":true,"score":0.9,"view":"inner"}}

7) VIDEOS RULES:
   - Video resources should use embeddable YouTube URL: "https://youtube.com/embed/<VIDEO_ID>"
   - Include meta.youtube_id for easy extraction
   - Example: {"r_id":"r_vid1","title":"Python Tutorial","provider":"YouTube","url":"https://youtube.com/embed/kqtD5dpn9C8","type":"video","meta":{"official":false,"score":0.92,"youtube_id":"kqtD5dpn9C8"}}

8) Edges Array with relationships:
   [
     {"from": "study_parent", "to": "study_node_id", "relation": "contains"},
     {"from": "jobs_parent", "to": "job_node_id", "relation": "contains"},
     {"from": "notes_parent", "to": "note_node_id", "relation": "contains"},
     {"from": "videos_parent", "to": "video_node_id", "relation": "contains"},
     {"from": "study_node_id", "to": "job_node_id", "relation": "leads_to"},
     {"from": "job_node_id", "to": "note_node_id", "relation": "related"}
   ]

9) Create 30-40 child nodes total across all 4 categories with clear hierarchy.

10) Language: Use Hinglish/Hindi if user input is in Hindi, otherwise English.

11) Max nodes: 40 (priority: Study nodes + Company jobs + Notes + Videos)

OUTPUT FORMAT:
{
  "topic": "user_topic_here",
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
      "lang": "hi",
      "visual": {"color": "#3b82f6", "shape": "rounded"}
    },
    {
      "id": "jobs_parent",
      "label": "💼 Jobs & Career",
      "type": "topic",
      "category": "job",
      "description": "Top global & Indian companies ke career opportunities",
      "tags": ["career", "jobs"],
      "resources": [],
      "children": ["j1", "j2"],
      "lang": "hi",
      "visual": {"color": "#10b981", "shape": "rounded"}
    },
    {
      "id": "notes_parent",
      "label": "📝 Notes & Guides",
      "type": "topic",
      "category": "note",
      "description": "AI-generated notes aur PDF guidelines",
      "tags": ["notes"],
      "resources": [],
      "children": ["n1", "n2"],
      "lang": "hi",
      "visual": {"color": "#8b5cf6", "shape": "rounded"}
    },
    {
      "id": "videos_parent",
      "label": "🎥 Video Tutorials",
      "type": "topic",
      "category": "video",
      "description": "Curated video learning resources",
      "tags": ["videos", "tutorials"],
      "resources": [],
      "children": ["v1", "v2"],
      "lang": "hi",
      "visual": {"color": "#f59e0b", "shape": "rounded"}
    },
    {
      "id": "j_openai_1",
      "label": "ML Engineer — OpenAI",
      "type": "job",
      "category": "job",
      "description": "Work on large-scale AI models and cutting-edge research.",
      "tags": ["ml", "research", "llm", "ai"],
      "resources": [
        {
          "r_id": "r_openai_careers",
          "title": "OpenAI Careers — ML Engineer Roles",
          "provider": "OpenAI Careers",
          "url": "https://openai.com/careers/",
          "type": "job",
          "meta": {
            "official": true,
            "mock": false,
            "score": 0.98,
            "snippet": "Build safe and useful AI systems at the forefront of AI research.",
            "tags": ["ml", "ai", "research"]
          }
        }
      ],
      "children": [],
      "lang": "en",
      "visual": {"color": "#10b981", "shape": "rounded"}
    },
    {
      "id": "j_google_1",
      "label": "Software Engineer — Google",
      "type": "job",
      "category": "job",
      "description": "Develop next-generation technologies at Google.",
      "tags": ["sde", "backend", "distributed systems"],
      "resources": [
        {
          "r_id": "r_google_careers",
          "title": "Google Careers — Software Engineering",
          "provider": "Google Careers",
          "url": "https://careers.google.com/",
          "type": "job",
          "meta": {
            "official": true,
            "mock": false,
            "score": 0.96,
            "snippet": "Work on products used by billions worldwide.",
            "tags": ["software", "engineering"]
          }
        }
      ],
      "children": [],
      "lang": "en",
      "visual": {"color": "#10b981", "shape": "rounded"}
    }
  ],
  "edges": [
    {"from": "study_parent", "to": "s1", "relation": "contains"},
    {"from": "jobs_parent", "to": "j_openai_1", "relation": "contains"},
    {"from": "jobs_parent", "to": "j_google_1", "relation": "contains"},
    {"from": "notes_parent", "to": "n1", "relation": "contains"},
    {"from": "videos_parent", "to": "v1", "relation": "contains"}
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
