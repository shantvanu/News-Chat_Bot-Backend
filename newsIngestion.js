// News article ingestion service
// Ingests sample news articles for the RAG pipeline

import { vectorStore } from "./vectorStore.js";
import { generateEmbedding, chunkText } from "./embeddings.js";
import { log } from "./index.js";

// Sample news articles covering various topics
const sampleArticles = [
  {
    title: "Tech Giants Report Mixed Earnings",
    content: "Major technology companies released their quarterly earnings reports this week, with combined revenues exceeding market expectations. Apple reported strong iPhone sales, while Microsoft saw continued growth in cloud services. Google's parent Alphabet showed resilience in advertising revenue despite economic headwinds. Amazon's AWS division continued to dominate the cloud computing market. These results signal continued strength in the technology sector despite broader economic concerns.",
    source: "TechDaily",
    publishedAt: "2024-04-15",
    url: "https://example.com/tech-earnings"
  },
  {
    title: "Global Climate Summit Reaches Historic Agreement",
    content: "World leaders at the annual climate summit have agreed to a new framework for reducing carbon emissions. The agreement includes binding targets for developed nations and financial support for developing countries to transition to clean energy. Environmental groups have praised the ambitious targets, though some critics argue implementation mechanisms remain weak. The agreement represents the most significant climate action since the Paris Agreement.",
    source: "EcoNews",
    publishedAt: "2024-04-14",
    url: "https://example.com/climate-summit"
  },
  {
    title: "Markets Rally on Inflation Data",
    content: "Global stock markets rallied today following the release of lower-than-expected inflation data. The US Consumer Price Index rose by just 0.2% last month, suggesting that inflationary pressures are easing. The S&P 500 hit a new record high, while European and Asian markets followed suit. Analysts attribute the rally to growing optimism about a soft landing for the economy. The Federal Reserve's signal of potential rate cuts in 2024 has further boosted investor sentiment.",
    source: "FinanceWeekly",
    publishedAt: "2024-04-13",
    url: "https://example.com/market-rally"
  },
  {
    title: "Breakthrough in Quantum Computing Announced",
    content: "Researchers have achieved a major milestone in quantum computing, demonstrating a 1000-qubit processor that maintains coherence for record durations. This advancement brings practical quantum computing closer to reality, with potential applications in drug discovery, cryptography, and complex optimization problems. Tech companies are racing to commercialize quantum technology, with IBM, Google, and startups competing for dominance in this emerging field.",
    source: "ScienceToday",
    publishedAt: "2024-04-12",
    url: "https://example.com/quantum-breakthrough"
  },
  {
    title: "Electric Vehicle Sales Surpass Milestones",
    content: "Global electric vehicle (EV) sales have reached a new record, with EVs now accounting for 20% of all new car sales. China remains the largest EV market, followed by Europe and North America. Tesla continues to lead in market share, though traditional automakers are gaining ground with new electric models. Analysts project EVs will represent 50% of global car sales by 2030, driven by improving battery technology and expanding charging infrastructure.",
    source: "AutoInsight",
    publishedAt: "2024-04-11",
    url: "https://example.com/ev-sales"
  },
  {
    title: "Major Sports League Announces Expansion",
    content: "The league commissioner announced today that two new teams will join the competition starting in 2026. The cities of Las Vegas and Seattle have been awarded the franchises, citing strong local sports culture and state-of-the-art facilities. This expansion is expected to generate significant revenue for the league and create hundreds of new jobs.",
    source: "SportsWorld",
    publishedAt: "2024-04-10",
    url: "https://example.com/sports-expansion"
  },
  {
    title: "NASA's New Space Telescope Sends First Images",
    content: "The latest space observatory has beamed back its first high-resolution images of deep space, revealing previously unknown galaxies and star clusters. Scientists say the data will allow them to peer back into the history of the universe with unprecedented clarity. The mission is part of an international collaboration to study dark matter and the origins of our solar system.",
    source: "SpaceExplorer",
    publishedAt: "2024-04-09",
    url: "https://example.com/nasa-telescope"
  },
  {
    title: "New AI Model Outperforms Humans in Coding Tasks",
    content: "A leading AI startup has released a new language model that can solve complex programming problems faster and more accurately than human software engineers in benchmark tests. The model shows deep understanding of system architecture and security patterns. Industry leaders are discussing the potential impact on entry-level developer roles and the need for new skill sets.",
    source: "CodingNews",
    publishedAt: "2024-04-08",
    url: "https://example.com/ai-coding"
  },
  {
    title: "Sustainable Fashion Wave Hits Retail Stores",
    content: "Major clothing brands are shifting towards sustainable materials as consumer demand for eco-friendly fashion grows. Recycled polyester and organic cotton are becoming standard in many collections. Retailers also report a surge in secondary market sales and clothing rental services among Gen Z shoppers concerned about fast fashion's environmental impact.",
    source: "TrendWatch",
    publishedAt: "2024-04-07",
    url: "https://example.com/eco-fashion"
  },
  {
    title: "Global Supply Chain Disruptions Easing",
    content: "Recent data shows that congestion at major ports has significantly decreased, leading to faster delivery times for consumer electronics and automotive parts. Shipping costs have also started to stabilize. However, experts warn that geopolitical tensions could still pose risks to global trade routes in the coming months.",
    source: "LogisticsWeekly",
    publishedAt: "2024-04-06",
    url: "https://example.com/supply-chain"
  },
  {
    title: "Breakthrough Cancer Research Shows Promise",
    content: "A new clinical trial for a targeted therapy has shown remarkable results in patients with resistant forms of the disease. The treatment works by using the body's immune system to identify and destroy cancerous cells without damaging healthy tissue. While still in early stages, researchers are optimistic about potential FDA approval by next year.",
    source: "HealthGazette",
    publishedAt: "2024-04-05",
    url: "https://example.com/cancer-research"
  },
  {
    title: "Cryptocurrency Regulations Tighten Globally",
    content: "Central banks and financial regulators in several countries have announced new rules for digital asset exchanges. The regulations focus on anti-money laundering compliance and consumer protection. While some in the crypto community see this as a hurdle, others believe it's a necessary step towards mass adoption and institutional investment.",
    source: "CryptoNews",
    publishedAt: "2024-04-04",
    url: "https://example.com/crypto-regs"
  },
  {
    title: "The Rise of Remote Work in Small Towns",
    content: "High-speed internet expansion and the shift to remote work have led to a population boom in rural areas formerly seeing a decline. Small-town economies are benefiting from new residents who bring high salaries from tech and finance hubs. Local governments are investing in coworking spaces and improved infrastructure to sustain this growth.",
    source: "LocalLife",
    publishedAt: "2024-04-03",
    url: "https://example.com/remote-rural"
  },
  {
    title: "World Cup Hosting Cities Named",
    content: "FIFA has officially announced the list of cities that will host matches for the next World Cup. The tournament will be spread across 16 cities in three countries, making it the largest event in the history of the sport. Millions of fans are expected to travel, and hospitality sectors are already preparing for the massive influx of tourists.",
    source: "SportsNetwork",
    publishedAt: "2024-04-02",
    url: "https://example.com/worldcup-hosts"
  },
  {
    title: "New Energy Storage Battery Technology",
    content: "A startup has unveiled a solid-state battery capable of storing twice the energy of current lithium-ion models while being significantly safer and faster to charge. This technology could solve the intermittency problem of solar and wind energy and revolutionize the electric vehicle industry by extending range to over 1000 kilometers.",
    source: "EnergyFuture",
    publishedAt: "2024-04-01",
    url: "https://example.com/battery-tech"
  },
  {
    title: "Central Bank Keeps Interest Rates Steady",
    content: "The Federal Reserve decided to maintain its benchmark interest rate at the current level, citing signs that inflation is slowing while the job market remains strong. Investors reacted positively to the news, seeing it as a sign that the cycle of rate hikes may be coming to an end. However, the bank left the door open for future adjustments if needed.",
    source: "MarketWatch",
    publishedAt: "2024-03-31",
    url: "https://example.com/fed-decision"
  },
  {
    title: "Cybersecurity Attacks Target Critical Infrastructure",
    content: "A wave of sophisticated ransomware attacks has targeted power grids and water treatment plants in several regions. Government agencies are calling for increased investment in national cybersecurity defense. Experts say the attacks appear to be state-sponsored, highlighting the growing role of cyber warfare in modern geopolitical conflicts.",
    source: "SecurityReport",
    publishedAt: "2024-03-30",
    url: "https://example.com/cyber-attacks"
  },
  {
    title: "Hollywood Studio Announces Major Streaming Shift",
    content: "In a move that surprised the film industry, a major studio announced it would release all its upcoming blockbusters simultaneously in theaters and on its streaming platform. The decision reflects the changing habits of audiences and the growing power of digital platforms over traditional cinema. Cinema owners have expressed concern about the future of their business model.",
    source: "EntertainmentDaily",
    publishedAt: "2024-03-29",
    url: "https://example.com/streaming-shift"
  },
  {
    title: "New Study Links Ultra-Processed Foods to Health Risks",
    content: "A comprehensive long-term study has found strong correlations between high consumption of ultra-processed foods and increased risk of chronic diseases. Nutritionists are calling for clearer food labeling and public health campaigns to encourage whole food diets. The food industry has defended its products, pointing to their convenience and affordability.",
    source: "WellnessReporter",
    publishedAt: "2024-03-28",
    url: "https://example.com/food-study"
  },
  {
    title: "Tourism Industry Reaches Pre-Pandemic Levels",
    content: "International travel bookings for the upcoming summer season have surpassed 2019 levels in many major destinations. Airlines are adding new routes to meet the demand. While the industry is celebrating the recovery, some cities are facing challenges with over-tourism and are considering measures to manage visitor numbers and protect local environments.",
    source: "TravelGlobe",
    publishedAt: "2024-03-27",
    url: "https://example.com/tourism-recovery"
  },
  {
    title: "Renewable Energy Capacity Sees Record Growth",
    content: "Global investment in solar and wind power reached an all-time high last year, with total capacity growing by 30%. Costs for renewable energy continue to fall, making it the cheapest source of electricity in many parts of the world. Governments are speeding up the approval process for new projects to meet climate targets.",
    source: "GreenTech",
    publishedAt: "2024-03-26",
    url: "https://example.com/renewables-record"
  },
  {
    title: "Deep Sea Exploration Reveals New Species",
    content: "Marine biologists using remote-operated vehicles in the deepest parts of the ocean have discovered dozens of previously unknown species. The findings highlight how little we still know about the Earth's oceans and the need for greater protection of deep-sea ecosystems from potential mining operations. The new species have unique adaptations to extreme pressure and darkness.",
    source: "OceanScience",
    publishedAt: "2024-03-25",
    url: "https://example.com/deep-sea-discovery"
  },
  {
    title: "Major Retailer Launches AI-Powered Personal Shopper",
    content: "The world's largest retailer has introduced a new feature in its mobile app that uses generative AI to recommend products based on user style and previous purchases. The company says early tests show a significant increase in customer satisfaction and average order value. This marks a major step in the integration of AI into the everyday shopping experience.",
    source: "RetailToday",
    publishedAt: "2024-03-24",
    url: "https://example.com/ai-shopper"
  },
  {
    title: "City Implements Universal Basic Income Pilot",
    content: "A major metropolitan area has launched a pilot program providing a guaranteed monthly income to 5000 families living below the poverty line. Researchers will study the impact on health, education, and employment outcomes over the next three years. Proponents say it's a solution to automation-led job displacement, while critics worry about its long-term cost.",
    source: "EconomyNow",
    publishedAt: "2024-03-23",
    url: "https://example.com/ubi-pilot"
  },
  {
    title: "Mars Rover Finds Evidence of Ancient Water",
    content: "The Perseverance rover has analyzed rock samples that show clear signs of being formed in a liquid water environment billions of years ago. This discovery strengthens the case for Mars being habitable in its distant past. Scientists are already planning next steps to return these samples to Earth for more detailed analysis.",
    source: "SpaceUpdate",
    publishedAt: "2024-03-22",
    url: "https://example.com/mars-water"
  },
  {
    title: "New E-Sports Arena Opens to Sold-Out Crowds",
    content: "Thousands of fans packed into a state-of-the-art arena specifically built for e-sports tournaments. The event featured top teams competing in popular games with multi-million dollar prize pools. The growth of pro gaming continues to attract major sponsors and television network interest, rivaling traditional sports in viewership among younger age groups.",
    source: "GameScene",
    publishedAt: "2024-03-21",
    url: "https://example.com/esports-arena"
  },
  {
    title: "Government Launches AI Ethics Task Force",
    content: "A new inter-departmental task force has been formed to create a regulatory framework for the ethical development and use of artificial intelligence. The group includes tech experts, philosophers, and legal scholars. The focus will be on transparency, bias prevention, and ensuring AI systems are aligned with human rights and democratic values.",
    source: "PublicPolicy",
    publishedAt: "2024-03-20",
    url: "https://example.com/ai-ethics"
  },
  {
    title: "Record Drought Affects Global Wheat Prices",
    content: "Low rainfall in major agriculture belts has led to significantly lower wheat yields this season, sending prices to their highest level in years. Food security experts are concerned about the impact on vulnerable regions. Some countries are considering export bans to protect domestic supply, while others look towards alternative crops and drought-resistant varieties.",
    source: "AgriNews",
    publishedAt: "2024-03-19",
    url: "https://example.com/wheat-prices"
  },
  {
    title: "New Smart Home Security Standard Released",
    content: "The major tech companies have finally agreed on a unified communication protocol for smart home devices. This means that cameras, locks, and sensors from different brands will now work seamlessly together. The standard also includes rigorous security requirements to protect user privacy and prevent unauthorized access to home networks.",
    source: "TechHome",
    publishedAt: "2024-03-18",
    url: "https://example.com/smart-home-std"
  },
  {
    title: "Revolutionary Desalination Method Announced",
    content: "Scientists have developed a low-cost, energy-efficient way to remove salt from seawater using graphene filters. This could provide a sustainable solution to the growing water crisis in coastal desert regions. The researchers say the technology is ready for large-scale pilot projects and could produce drinking water at half the cost of current methods.",
    source: "ScienceDaily",
    publishedAt: "2024-03-17",
    url: "https://example.com/desalination"
  },
  {
    title: "Electric Aviation Startup Completes First Flight",
    content: "A short-haul electric plane capable of carrying 9 passengers successfully completed a 30-minute test flight today. The aircraft produces zero emissions during flight and is significantly quieter than traditional planes. The company aims to obtain commercial certification by 2026, targeting regional routes often underserved by current airlines.",
    source: "AeroFuture",
    publishedAt: "2024-03-16",
    url: "https://example.com/electric-flight"
  },
  {
    title: "Art Market Sees Surge in Digital Collections",
    content: "Major auction houses report record sales for digital art, with many collectors seeing them as a viable long-term investment. This trend is driven by the use of blockchain technology to verify authenticity and ownership. While some see it as a speculative bubble, others believe it's a permanent shift in how art is created and traded.",
    source: "ArtCurrents",
    publishedAt: "2024-03-15",
    url: "https://example.com/digital-art"
  },
  {
    title: "New Health App Uses AI to Predict Heart Issues",
    content: "An app that monitors heart rate and activity through a smartwatch has been shown to detect early signs of cardiac issues with high accuracy in a large clinical study. The AI algorithm analyzes subtle patterns that may be missed by traditional monitoring. The developers hope this will lead to earlier interventions and save thousands of lives annually.",
    source: "MedTech",
    publishedAt: "2024-03-14",
    url: "https://example.com/heart-ai"
  },
  {
    title: "Global Initiative to End Plastic Waste Launched",
    content: "Over 100 countries have joined a new treaty aimed at eliminating plastic pollution in the world's oceans by 2040. The agreement includes bans on many single-use plastics and requirements for companies to take responsibility for the entire lifecycle of their products. Critics say the treaty needs stronger enforcement mechanisms to be effective.",
    source: "EarthDaily",
    publishedAt: "2024-03-13",
    url: "https://example.com/plastic-treaty"
  },
  {
    title: "Next-Gen Gaming Console Features Revealed",
    content: "Leaked documents have revealed the specifications of the next major gaming console, promising 8K resolution and near-instant load times. The hardware will also feature dedicated AI cores for more realistic NPC behavior and environmental physics. Gamers are eagerly awaiting an official announcement, which is expected during the upcoming summer tech expo.",
    source: "GamingBeat",
    publishedAt: "2024-03-12",
    url: "https://example.com/next-gen-console"
  },
  {
    title: "Social Media Platform Announces Privacy Overhaul",
    content: "Following several high-profile data leaks, a major social network has announced it will default to end-to-end encryption for all private messages and allow users to delete their entire history with one click. The move is seen as an attempt to win back user trust and comply with increasingly strict international data protection laws.",
    source: "SocialNetNews",
    publishedAt: "2024-03-11",
    url: "https://example.com/privacy-overhaul"
  },
  {
    title: "Breakthrough in Fusion Energy Research",
    content: "Researchers at a national laboratory have achieved a net energy gain in a fusion reaction for the second time, producing more power than was used to trigger it. This brings the dream of clean, limitless energy one step closer. While commercial fusion is still decades away, scientists say this result proves the fundamental physics is sound.",
    source: "EnergyReport",
    publishedAt: "2024-03-10",
    url: "https://example.com/fusion-energy"
  },
  {
    title: "City Implements Smart Traffic Management System",
    content: "A new AI-driven traffic light system has reduced travel times by 20% and fuel consumption by 15% in a major business district. The system uses cameras and sensors to adjust light timings in real-time based on actual traffic flow. The city plans to expand the project to all major arterial roads by next year to improve urban air quality.",
    source: "UrbanFuture",
    publishedAt: "2024-03-09",
    url: "https://example.com/smart-traffic"
  },
  {
    title: "New Synthetic Meat Facility Opens",
    content: "One of the largest lab-grown meat production plants in the world has started operations, aiming to bring down the cost of cultured beef to parity with traditional products. The company says its process uses 90% less land and water than conventional ranching. Initial products will target the restaurant industry before a wider retail rollout.",
    source: "FutureFood",
    publishedAt: "2024-03-08",
    url: "https://example.com/lab-meat"
  },
  {
    title: "Archaeologists Discover Lost Mayan City",
    content: "Using LIDAR technology to peer through the dense jungle canopy, researchers have found a sprawling ancient city with pyramids, plazas, and thousands of structures. The find suggests the Mayan civilization was much larger and more interconnected than previously thought. The site will now be protected as a UNESCO World Heritage site to prevent looting.",
    source: "HistoryWeekly",
    publishedAt: "2024-03-07",
    url: "https://example.com/mayan-city"
  },
  {
    title: "Major Bank Launches Fully Digital Branch",
    content: "A leading financial institution has opened its first physical location that has no human staff, with all services handled via interactive kiosks and video links to remote advisors. The 'smart branch' is designed to reduce costs and provide 24/7 service. Customers can open accounts, apply for loans, and get wealth management advice using the on-site technology.",
    source: "BankingToday",
    publishedAt: "2024-03-06",
    url: "https://example.com/digital-branch"
  },
  {
    title: "New 3D Printing Method for Organs",
    content: "Scientists have demonstrated a new technique that can 3D print functional human heart tissue with its own network of blood vessels. This is a major step towards printing entire transplantable organs for patients on waiting lists. While clinical trials are still far off, the breakthrough solves one of the biggest challenges in the field: providing nutrients to thick tissues.",
    source: "BioScience",
    publishedAt: "2024-03-05",
    url: "https://example.com/3d-organs"
  },
  {
    title: "Tech Startup Unveils Holographic Display",
    content: "A new display technology has been showcased that can create high-definition 3D images that floating in mid-air without the need for glasses or headsets. The developers see applications in gaming, medical imaging, and remote teleconferencing. Several major electronics manufacturers are reportedly in talks to license the technology for future mobile devices.",
    source: "DisplayNews",
    publishedAt: "2024-03-04",
    url: "https://example.com/holographic"
  },
  {
    title: "Global Forest Restoration Project Surpasses Goal",
    content: "An international coalition has announced that over 100 million trees have been successfully planted across three continents in the last two years. The project focuses on reforestation of areas critical for biodiversity and carbon sequestration. Scientists are using drones and satellite imagery to monitor the health and growth of the new forests to ensure long-term success.",
    source: "NatureWatch",
    publishedAt: "2024-03-03",
    url: "https://example.com/forest-restoration"
  },
  {
    title: "New Search Engine Focuses on User Privacy",
    content: "A new search engine has launched with a business model that doesn't rely on tracking users or storing data. Instead, it generates revenue through anonymous advertising based only on the search term. Early reviews praise the clean interface and the quality of the results, providing a viable alternative to tech giants and their data-heavy business models.",
    source: "WebToday",
    publishedAt: "2024-03-02",
    url: "https://example.com/privacy-search"
  },
  {
    title: "Major Film Festival Honors Independent Creators",
    content: "This year's festival lineup features a record number of films made with micro-budgets and innovative digital tools, showing the democratization of filmmaking. Several projects were picked up by major distributors for multi-million dollar deals. The jury highlighted stories that bring fresh perspectives and diverse voices to global audiences.",
    source: "FilmDaily",
    publishedAt: "2024-03-01",
    url: "https://example.com/filmfest"
  },
  {
    title: "Scientists Discover Water Ice in Unexpected Lunar Region",
    content: "Data from a recently landed lunar probe suggests the presence of significant water ice deposits in areas of the Moon that receive intermittent sunlight. Previously, it was thought that ice could only exist in permanently shadowed craters. This finding could make future human settlements much more feasible by providing a local source of air, water, and fuel.",
    source: "MoonWeekly",
    publishedAt: "2024-02-29",
    url: "https://example.com/lunar-ice"
  },
  {
    title: "New Material Can Harvest Energy from Ambient Light",
    content: "Researchers have created a transparent coating for windows that can generate electricity from even low-intensity indoor lighting. The material is highly efficient and could allow buildings to power their own sensors and low-power devices without being connected to the grid. This represents a significant advancement in sustainable building design.",
    source: "BuildersFuture",
    publishedAt: "2024-02-28",
    url: "https://example.com/energy-harvest"
  },
  {
    title: "Global Study Finds Remote Workers are More Productive",
    content: "A massive multi-year study across twenty countries has concluded that employees working from home at least three days a week are 15% more productive than their office-based counterparts. The study cites reduced commute stress and fewer office distractions as the main drivers. Companies are now re-evaluating their long-term real estate needs as a result.",
    source: "WorkToday",
    publishedAt: "2024-02-27",
    url: "https://example.com/remote-study"
  }
];

export async function ingestNewsArticles() {
  const stats = await vectorStore.getStats();
  if (stats.articleCount > 0) {
    log(`Vector store already initialized with ${stats.articleCount} articles`);
    return;
  }

  log("Starting news article ingestion...");

  for (let i = 0; i < sampleArticles.length; i++) {
    const articleData = sampleArticles[i];
    log(`Processing article ${i + 1}/${sampleArticles.length}: "${articleData.title}"`);
    const article = {
      id: `article-${i + 1}`,
      ...articleData,
    };

    // Chunk the article content
    const chunks = chunkText(article.content);
    log(`  - Split into ${chunks.length} chunks`);
    const chunkData = [];

    for (let j = 0; j < chunks.length; j++) {
      const chunkContent = chunks[j];
      // log(`  - Generating embedding for chunk ${j + 1}/${chunks.length}`);
      const embedding = await generateEmbedding(chunkContent);

      chunkData.push({
        articleId: article.id,
        content: chunkContent,
        chunkIndex: j,
        embedding: embedding,
        article: article
      });
    }

    await vectorStore.addChunks(chunkData);
  }

  log(`Ingested ${sampleArticles.length} articles`);
}
