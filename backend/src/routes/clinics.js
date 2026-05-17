import express from 'express';
import { getSupabase } from '../supabaseClient.js';

const router = express.Router();

const SAMPLE_CLINICS = [
  {
    name: "CeSHHAR Zimbabwe - Harare",
    type: "HIV Research & Prevention Center",
    address: "45 Van Praagh Ave, Milton Park, Harare",
    lat: -17.8252,
    lng: 31.0335,
    services: ["HIV Testing", "PrEP", "ART", "Counseling", "STI Screening"],
    phone: "+263 242 748 577",
    website: "https://ceshhar.org"
  },
  {
    name: "Newlands Clinic",
    type: "HIV Clinic",
    address: "11 Maasdorp Ave, Newlands, Harare",
    lat: -17.7939,
    lng: 31.0864,
    services: ["HIV Testing", "ART", "Viral Load Monitoring"],
    phone: "+263 867 700 0613"
  },
  {
    name: "Sally Mugabe Central Hospital",
    type: "Referral Hospital",
    address: "Corner Mazowe & Lomagundi Roads, Harare",
    lat: -17.8504,
    lng: 31.0329,
    services: ["HIV Testing", "ART", "Maternity", "Pregnancy Care", "STI Treatment"],
    phone: "+263 242 621 111"
  },
  {
    name: "Bulawayo City Health Department",
    type: "Municipal Clinic",
    address: "Corner 6th Ave & Leopold Takawira, Bulawayo",
    lat: -20.1489,
    lng: 28.5848,
    services: ["HIV Testing", "PrEP", "Family Planning", "Pregnancy Testing"],
    phone: "+263 292 886 544"
  },
  {
    name: "Masvingo Provincial Hospital",
    type: "Provincial Hospital",
    address: "Masvingo - Beitbridge Rd, Masvingo",
    lat: -20.0737,
    lng: 30.8339,
    services: ["HIV Services", "Maternity", "Prevention Services"],
    phone: "+263 392 262 411"
  },
  {
    name: "Parirenyatwa Group of Hospitals",
    type: "Referral Hospital",
    address: "Parirenyatwa Road, Harare",
    lat: -17.8212,
    lng: 31.0523,
    services: ["HIV Testing", "ART", "STI Clinic", "Family Planning", "Maternity"],
    phone: "+263 242 705 531"
  },
  {
    name: "Mpilo Central Hospital",
    type: "Referral Hospital",
    address: "Corner 6th Ave & Oxford Street, Bulawayo",
    lat: -20.1557,
    lng: 28.5736,
    services: ["HIV Services", "Maternity", "Family Planning", "STI Treatment"],
    phone: "+263 292 266 666"
  },
  {
    name: "Chitungwiza Central Hospital",
    type: "District Hospital",
    address: "Chitungwiza, Harare",
    lat: -18.0118,
    lng: 31.0743,
    services: ["HIV Testing", "ART", "Maternity", "Youth Friendly Services"],
    phone: "+263 867 700 0613"
  }
];

router.get('/', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('name');
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error("Error fetching clinics:", error);
    res.status(500).json({ error: "Failed to fetch clinics" });
  }
});

router.get('/seed', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('clinics')
      .upsert(SAMPLE_CLINICS, { onConflict: 'name' });
    
    if (error) throw error;
    res.json({ message: "Clinics seeded successfully", count: SAMPLE_CLINICS.length });
  } catch (error) {
    console.error("Error seeding clinics:", error);
    res.status(500).json({ error: "Failed to seed clinics" });
  }
});

export default router;