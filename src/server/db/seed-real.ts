import { db, connection } from "./index";
import { salons, queues } from "./schema";

const realSalons = [
  { name: "Lakme Salon Patia-Bhubaneswar", rating: "4.8", reviewCount: 2554, category: "Beauty Parlour", address: "1st Floor, khata No 474/156, KIIT Rd, in front of Manyavar" },
  { name: "Green Trends Unisex Salon, Patia", rating: "4.7", reviewCount: 4887, category: "Beauty Parlour", address: "1st Floor, D1 Square, Nandankanan Rd, above Utkal Hyundai Showroom" },
  { name: "J'Lone Luxury Unisex Salon", rating: "4.9", reviewCount: 1095, category: "Beauty Parlour", address: "Food Court, Plot No 36/A, Mall at, Infocity Ave" },
  { name: "Indulge The Salon, Patia", rating: "4.4", reviewCount: 1130, category: "Beauty Parlour", address: "Petrol Pump, Trishna Apartment, Nandankanan Rd, next to HP" },
  { name: "The Jawed Habib Salon-Chandrasekharpur", rating: "4.9", reviewCount: 2373, category: "Beauty Parlour", address: "Royal Towers, Nandankanan Road, Damana Square - Damana School Rd" },
  { name: "7sense Unisex Salon & Academy,Patia", rating: "4.7", reviewCount: 446, category: "Beauty Parlour", address: "Landmark-lafamme fitness, Nandan Kanan - Patia Station Rd" },
  { name: "Pixie Unisex Salon, Patia", rating: "4.7", reviewCount: 681, category: "Beauty Parlour", address: "Plot No. - 370/2119, adjacent to Espirit Toyota" },
  { name: "Holy Hair Salon", rating: "4.7", reviewCount: 207, category: "Beauty Parlour", address: "KIIT Rd, near biggies burger, behind axis bank" },
  { name: "Looks Salon Patia", rating: "4.7", reviewCount: 379, category: "Beauty Parlour", address: "1st floor, Prakriti Tower, Magnetic Square, near KIIT Road" },
  { name: "Toni&Guy Essensuals Bhubaneswar", rating: "4.9", reviewCount: 726, category: "Beauty Parlour", address: "2nd floor, Toni&Guy Essensuals, Maruti villa, A/2, KIIT Rd" },
  { name: "H+ salon Patia", rating: "4.7", reviewCount: 292, category: "Beauty Parlour", address: "2nd floor, the plaza" },
  { name: "Naturals Salon and Spa KIIT Road", rating: "4.4", reviewCount: 809, category: "Beauty Parlour", address: "2nd Floor, KIIT Rd, near Dominoz Pizza" },
  { name: "A1 Make Up Studio & Unisex Salon", rating: "4.9", reviewCount: 350, category: "Beauty Parlour", address: "KIIT Rd, near Sani mandir" },
  { name: "Chinnis Beauty Salon", rating: "4.9", reviewCount: 701, category: "Beauty Parlour", address: "Sailashree Bihar, near Jagatnnath Temple" },
  { name: "NEW YOU UNISEX SALON", rating: "4.6", reviewCount: 184, category: "Beauty Parlour", address: "Plot No- 485, KIIT Rd, behind Biriyani Box" },
  { name: "MMT Unisex Salon", rating: "4.8", reviewCount: 309, category: "Beauty Parlour", address: "GPS Tower, 450/4507" },
  { name: "Vedas Ayurveda", rating: "4.8", reviewCount: 1306, category: "Beauty Parlour", address: "F 19 , Near Hotel 7 Saat Chandrashekharpur, behind Trident College" },
  { name: "L Zone", rating: "4.7", reviewCount: 489, category: "Hair salon", address: "Infront Of Royal Enfield Showroom, D-12, KIIT Rd" },
  { name: "Bingwel - clinic and spa", rating: "4.8", reviewCount: 340, category: "Spa", address: "KIIT Rd, near v2" },
  { name: "HABIT SALON & SPA", rating: "4.8", reviewCount: 223, category: "Beauty Parlour", address: "Patia Chowk Hdfc Bank" },
  { name: "Beardo Studio Flagship Men’s Salon", rating: "4.8", reviewCount: 395, category: "Hair salon", address: "KIIT Rd, near Apollo Villa" },
  { name: "NVN Unisex Salon, Patia", rating: "5.0", reviewCount: 284, category: "Barber shop", address: "1st Floor, Patia Square, Plot no- 386, Nandankanan Rd, near Union Bank" },
  { name: "You Unisex Salon", rating: "4.9", reviewCount: 147, category: "Beauty Parlour", address: "Biggies Burger, behind Axis Bank" },
  { name: "LA18 Beauty & Wellness Center", rating: "4.8", reviewCount: 355, category: "Beauty Parlour", address: "Plot No - 248, Damana Square, S.S. Vihar Road" },
  { name: "Q Royal Salon & Spa", rating: "4.8", reviewCount: 224, category: "Beauty Parlour", address: "Nandankanan Rd" },
  { name: "Bangs - Studio & Salon", rating: "4.9", reviewCount: 199, category: "Beauty Parlour", address: "Besides BOCCA CAFE" },
  { name: "ROLEX HAIR STUDIO ( UNISEX SALON )", rating: "4.8", reviewCount: 98, category: "Barber shop", address: "Nandankanan Rd, near bocca cafe" },
  { name: "Lakme Salon For Him and Her in Z1", rating: "4.9", reviewCount: 174, category: "Beauty Parlour", address: "Z1 Vyom, Convenient Shopping, Z1 Kalarahanga" },
  { name: "Aera Luxury Salon & Spa", rating: "4.9", reviewCount: 151, category: "Beauty Parlour", address: "KIIT Rd, near HP Petrol Pump" },
  { name: "B Blond Unisex Salon", rating: "4.4", reviewCount: 790, category: "Beauty Parlour", address: "Plot No. 248, 1st Floor, S.S. Vihar Road" },
  { name: "Hyness Unisex Salon", rating: "4.9", reviewCount: 295, category: "Beauty Parlour", address: "3rd Floor, Galaxy Mall, Nandankanan Rd, near Mani Tribhuvan" },
  { name: "RevolutionBride Unisex Saloon", rating: "4.8", reviewCount: 188, category: "Beauty Parlour", address: "3rd Floor, Galaxy Mall, Nandankanan Rd, opposite to Mani Tribhuvan Apartment" },
  { name: "TONI&GUY Infocity", rating: "5.0", reviewCount: 178, category: "Beauty Parlour", address: "Cult Building, Plot no 38 / 1, Technology Corridor" },
  { name: "You & Me Unisex Salon", rating: "4.8", reviewCount: 160, category: "Beauty Parlour", address: "gate 32, Plot no. 61/A, KIIT Rd, near Sriyaram Hotel, opposite KIIT Campus 3" },
  { name: "VALENCIA SALON", rating: "4.4", reviewCount: 114, category: "Beauty Parlour", address: "Plot no, 152, Infocity Ave, near Patia" },
  { name: "Revamp Salon", rating: "4.8", reviewCount: 157, category: "Beauty Parlour", address: "2nd floor, near opulent Hariyana handloom, above Meher mobile" },
  { name: "Abhash the luxury unisex salon", rating: "4.9", reviewCount: 73, category: "Beauty Parlour", address: "Kit chhakka, Nandankanan Rd" },
  { name: "Hair Point Saloon & Spa", rating: "4.4", reviewCount: 28, category: "Spa", address: "Magnet Square, KIIT Rd, near Khadim's" },
];

async function seedRealData() {
  console.log("Seeding real Google Maps salons...");

  for (const s of realSalons) {
    await db.insert(salons).values({
      name: s.name,
      rating: s.rating,
      reviewCount: s.reviewCount,
      category: s.category,
      address: s.address,
      status: "open",
    });
  }

  // Create a mock queue for the first salon just to have some activity
  const lakmeResult = await db.select().from(salons).limit(1);
  if (lakmeResult[0]) {
    await db.insert(queues).values([
      { salonId: lakmeResult[0].id, tokenNumber: 421, status: "completed" },
      { salonId: lakmeResult[0].id, tokenNumber: 422, status: "completed" },
      { salonId: lakmeResult[0].id, tokenNumber: 423, status: "in-progress" },
      { salonId: lakmeResult[0].id, tokenNumber: 424, status: "waiting" },
      { salonId: lakmeResult[0].id, tokenNumber: 425, status: "waiting" },
    ]);
  }

  console.log(`Successfully seeded ${realSalons.length} real salons!`);
  await connection.end();
}

seedRealData().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
