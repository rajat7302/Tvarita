import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import ArtForm from '../models/ArtForm.js';
import Artist from '../models/Artist.js';
import Show from '../models/Show.js';

dotenv.config();

const artForms = [
  {
    name: "Choliya Dance",
    category: "Dance",
    state: "Uttarakhand",
    region: "Kumaon (Pithoragarh / Almora)",
    description: "A martial folk dance performed with swords and shields, originating from the Kumaon region of Uttarakhand.",
    historicalContext: "Dating back over a thousand years, Choliya was originally performed by Rajput warriors during marriage processions to ward off evil spirits.",
    isUnderrepresented: true,
    images: ["https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80"]
  },
  {
    name: "Langvir Nritya",
    category: "Dance",
    state: "Uttarakhand",
    region: "Garhwal (Tehri / Chamoli)",
    description: "An acrobatic folk dance of the Garhwal region where a male dancer balances and performs feats atop a high bamboo pole.",
    historicalContext: "Practiced traditionally in Garhwal villages during local festivals, showcasing immense core strength, agility, and devotion.",
    isUnderrepresented: true,
    images: ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80"]
  },
  {
    name: "Chhau Dance",
    category: "Dance",
    state: "Odisha",
    region: "Mayurbhanj",
    description: "A semi-classical Indian dance with martial and folk traditions.",
    historicalContext: "Enacted during Chaitra Parva incorporating martial arts techniques and elaborate masks.",
    isUnderrepresented: true,
    images: ["https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80"]
  }
];

const seedData = async () => {
  try {
    await connectDB();
    await ArtForm.deleteMany();
    await Artist.deleteMany();
    await Show.deleteMany();

    const createdArtForms = await ArtForm.insertMany(artForms);
    console.log(`[Seed]: Created ${createdArtForms.length} Art Forms including Choliya & Garhwali traditions.`);

    const choliya = createdArtForms.find(a => a.name === "Choliya Dance");

    const artist = await Artist.create({
      name: "Kumaon Cultural Choliya Troupe",
      type: "group",
      members: ["Harish Dhami", "Bhopal Singh", "Diwan Karki"],
      artFormId: choliya._id,
      bio: "Traditional sword dancers dedicated to preserving original Kumaoni martial rhythms and brass instruments.",
      images: ["https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80"]
    });

    await Show.create({
      title: "Choliya Martial Folk Heritage Live",
      artFormId: choliya._id,
      artistId: artist._id,
      date: new Date(Date.now() + 86400000 * 3),
      time: "17:00 IST",
      venue: "Parade Ground",
      city: "Dehradun",
      ticketPrice: 150,
      description: "Experience authentic sword play and traditional Ransingha brass music of Kumaon."
    });

    console.log('[Seed]: Successfully seeded Pahadi cultural entries.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();