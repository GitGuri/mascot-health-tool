import express from 'express';
import { getSupabase } from '../supabaseClient.js';

const router = express.Router();

const SAMPLE_RESOURCES = [
  {
    title: "National AIDS Council Zimbabwe - Youth Hub",
    url: "https://www.nac.org.zw/youth",
    category: "HIV Prevention",
    source: "NAC Zimbabwe",
    description: "Youth-focused HIV prevention resources, testing info, and support services for young people"
  },
  {
    title: "CeSHHAR - Young People's Health",
    url: "https://ceshhar.org/young-people",
    category: "HIV Prevention",
    source: "CeSHHAR Zimbabwe",
    description: "Research-based resources for young people on HIV prevention and sexual health"
  },
  {
    title: "UNFPA Zimbabwe - Adolescent Sexual Health",
    url: "https://zimbabwe.unfpa.org/topics/adolescents",
    category: "General Sexual Health",
    source: "UNFPA",
    description: "Comprehensive reproductive health information for adolescents and young adults"
  },
  {
    title: "Ministry of Health - Family Planning Guidelines",
    url: "https://mohcc.gov.zw/family-planning",
    category: "Pregnancy Prevention",
    source: "Government of Zimbabwe",
    description: "Official family planning methods, access points, and contraceptive options"
  },
  {
    title: "PSI Zimbabwe - Youth Health",
    url: "https://psizimbabwe.co.zw/youth",
    category: "Sexual Health",
    source: "PSI",
    description: "Contraception, HIV testing, and reproductive health services for youth"
  },
  {
    title: "Love Matters Zimbabwe",
    url: "https://lovemattersafrica.com/zimbabwe",
    category: "Sexual Health",
    source: "Love Matters",
    description: "Non-judgmental sexual health information, relationships, and body literacy"
  },
  {
    title: "SARA Zimbabwe - Youth Resources",
    url: "https://sarazimbabwe.org/resources",
    category: "HIV Prevention",
    source: "SARA",
    description: "HIV prevention resources specifically for university students"
  },
  {
    title: "WHO - Adolescent HIV Testing",
    url: "https://www.who.int/news-room/fact-sheets/detail/hiv-aids",
    category: "HIV Prevention",
    source: "World Health Organization",
    description: "Global guidelines and information on HIV testing for adolescents"
  },
  {
    title: "Planned Parenthood - Youth Contraception Guide",
    url: "https://www.plannedparenthood.org/learn/birth-control",
    category: "Pregnancy Prevention",
    source: "Planned Parenthood",
    description: "Complete guide to contraception methods and effectiveness"
  }
];

router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('title');
    
    if (error) {
      console.warn("Supabase fetch failed, returning sample data:", error.message);
      return res.json(SAMPLE_RESOURCES);
    }
    res.json(data || SAMPLE_RESOURCES);
  } catch (error) {
    console.error("Error fetching resources:", error);
    // Return sample data as fallback
    res.json(SAMPLE_RESOURCES);
  }
});

router.get('/seed', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('resources')
      .upsert(SAMPLE_RESOURCES, { onConflict: 'title' });
    
    if (error) throw error;
    res.json({ message: "Resources seeded successfully", count: SAMPLE_RESOURCES.length });
  } catch (error) {
    console.error("Error seeding resources:", error);
    res.status(500).json({ error: "Failed to seed resources" });
  }
});

export default router;