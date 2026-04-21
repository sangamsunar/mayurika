/**
 * Product seeder — copies 69 GLB files into backend/uploads/models
 * and inserts product documents into MongoDB.
 *
 * Run from project root:
 *   node seed_products.js
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') })

const Product = require('./backend/models/product')

const SRC  = 'C:/Users/Kiryuuxu/Downloads/3d jewellery files'
const DEST = path.join(__dirname, 'backend/uploads/models')

// Sanitise filename for storage
const safe = f => f.replace(/[\s()]/g, '_').replace(/__+/g, '_')

// ── Product definitions ───────────────────────────────────────────────────────
// Each entry: src (relative to SRC), plus all product fields.
// model3D is filled in at runtime after the file is copied.
const PRODUCTS = [

  // ── ROOT LEVEL (unisex) ───────────────────────────────────────────────────
  {
    src: 'chain_bracelet.glb',
    name: 'Classic Chain Bracelet',
    description: 'A sleek and durable chain bracelet crafted in polished gold or silver. Versatile enough for daily wear yet elegant for special occasions. Available in multiple metal options and custom lengths.',
    category: 'bracelet', gender: 'unisex', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['999', '925'] },
    minWeightTola: 2, maxWeightTola: 5, makingChargePerTola: 2800, jartiAmount: 0,
  },
  {
    src: 'necklace.glb',
    name: 'Classic Chain Necklace',
    description: 'An everyday gold or silver chain necklace with a timeless design. Lightweight and perfect as a standalone piece or with a pendant. Customisable in length and metal purity.',
    category: 'necklace', gender: 'unisex', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['999', '925'] },
    minWeightTola: 3, maxWeightTola: 7, makingChargePerTola: 2500, jartiAmount: 0,
  },

  // ── MAN ───────────────────────────────────────────────────────────────────
  {
    src: 'man/543_-_ring.glb',
    name: "Classic Gentleman's Band Ring",
    description: "A bold and understated gold band ring designed for the modern Nepali gentleman. Clean lines and substantial weight give this ring a commanding presence on any hand. Available in gold and silver.",
    category: 'ring', gender: 'male', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['999', '925'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 4000, jartiAmount: 0,
  },
  {
    src: 'man/jaguar_ring.glb',
    name: 'Jaguar Statement Ring',
    description: "A bold men's ring featuring a jaguar-inspired design for those who dare to stand out. Crafted in heavy gold or silver for maximum impact. A symbol of strength and confidence.",
    category: 'ring', gender: 'male', ageGroup: 'adult',
    style: { type: 'youth', subStyle: 'streetwear' }, occasion: 'casual',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['925'] },
    minWeightTola: 2.5, maxWeightTola: 5, makingChargePerTola: 5000, jartiAmount: 0,
  },
  {
    src: 'man/pendent/khanda_pendant_chain_neckalce.glb',
    name: 'Khanda Pendant Chain Necklace',
    description: 'A powerful double-edged sword pendant necklace crafted in sterling silver or gold. The Khanda motif symbolises divine power and courage. Comes with a sturdy matching chain.',
    category: 'necklace', gender: 'male', ageGroup: 'adult',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 3, maxWeightTola: 6, makingChargePerTola: 3500, jartiAmount: 0,
  },
  {
    src: 'man/pendent/louboutin_necklace.glb',
    name: 'Stiletto Pendant Necklace',
    description: 'A striking fashion-forward pendant necklace inspired by iconic luxury footwear design. Perfect for the bold, style-conscious man. Available in rose gold and silver finishes.',
    category: 'necklace', gender: 'male', ageGroup: 'adult',
    style: { type: 'youth', subStyle: 'streetwear' }, occasion: 'casual',
    metalOptions: ['silver', 'roseGold'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 4000, jartiAmount: 0,
  },
  {
    src: 'man/pendent/skull_pendant_-_jewellery_-_50mm.glb',
    name: 'Skull Pendant Necklace',
    description: 'A detailed 50mm skull pendant crafted in oxidised silver for an edgy statement look. A favourite among those with bold personal style. Pairs perfectly with leather or chain necklaces.',
    category: 'necklace', gender: 'male', ageGroup: 'adult',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 2.5, maxWeightTola: 5, makingChargePerTola: 3800, jartiAmount: 0,
  },
  {
    src: 'man/ring/ch_tierney_gntsupdtd2.glb',
    name: 'Tierney Classic Band Ring',
    description: "A refined gentleman's band ring with subtle engraved detailing. Clean modern styling makes it suitable for both daily wear and formal occasions. Available in gold and silver.",
    category: 'ring', gender: 'male', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['999', '925'] },
    minWeightTola: 1.5, maxWeightTola: 3, makingChargePerTola: 4500, jartiAmount: 0,
  },
  {
    src: 'man/youngstars/pendent/rune_pendant.glb',
    name: 'Norse Rune Pendant Necklace',
    description: 'An ancient-inspired rune pendant in sterling silver, beloved by youth who appreciate Norse mythology and bold symbolism. Each rune carries a unique meaning of strength and protection.',
    category: 'necklace', gender: 'male', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3, makingChargePerTola: 3200, jartiAmount: 0,
  },
  {
    src: 'man/youngstars/pendent/sleeper_necklace_from_gothic_-_3d_printable_free.glb',
    name: 'Gothic Sleeper Chain Necklace',
    description: 'A dark and dramatic gothic-style chain necklace designed for youth with a flair for the dramatic. Intricate link design in oxidised silver creates a standout piece. Perfect for streetwear and alternative fashion.',
    category: 'necklace', gender: 'male', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 3000, jartiAmount: 0,
  },
  {
    src: 'man/youngstars/pendent/tidus_necklace.glb',
    name: 'Fantasy Crystal Pendant Necklace',
    description: 'A fantasy-inspired pendant necklace featuring an intricate crystal holder design. Popular among youth and gaming enthusiasts. Crafted in silver with optional gold plating.',
    category: 'necklace', gender: 'male', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'streetwear' }, occasion: 'casual',
    metalOptions: ['silver', 'gold'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3.5, makingChargePerTola: 3500, jartiAmount: 0, stoneCharge: 500,
  },
  {
    src: 'man/youngstars/ring/gold-plated_silver_ring.glb',
    name: 'Gold-Plated Silver Band Ring',
    description: 'A sleek silver ring with a premium gold plating finish, offering the look of gold at a more accessible price point. Smooth and comfortable for daily wear. Available in different sizes.',
    category: 'ring', gender: 'male', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 1, maxWeightTola: 2.5, makingChargePerTola: 3500, jartiAmount: 0,
  },
  {
    src: 'man/youngstars/ring/lauren__derek_ring1a.glb',
    name: "Engraved Couple's Band Ring",
    description: 'A beautifully crafted band ring with engraved detailing, popular as a couple\'s ring or personal style statement. Available in gold and silver for the fashion-forward youth.',
    category: 'ring', gender: 'male', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'minimalist' }, occasion: 'gifting',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3, makingChargePerTola: 4000, jartiAmount: 0,
  },
  {
    src: 'man/youngstars/ring/predator_ring.glb',
    name: 'Predator Skull Ring',
    description: "An ultra-bold skull-inspired ring for those with daring personal style. Heavy-weight silver construction with intricate skull detailing. A collector's piece and conversation starter.",
    category: 'ring', gender: 'male', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 2, maxWeightTola: 4.5, makingChargePerTola: 5500, jartiAmount: 0,
  },

  // ── UNISEX ────────────────────────────────────────────────────────────────
  {
    src: 'unisex/medallion.glb',
    name: 'Gold Medallion Pendant',
    description: 'A timeless gold medallion pendant that exudes classic elegance. Suitable for all genders, this piece can be worn alone or layered with other necklaces. Crafted in 22K or 18K gold.',
    category: 'necklace', gender: 'unisex', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 2, maxWeightTola: 5, makingChargePerTola: 3500, jartiAmount: 0,
  },
  {
    src: 'unisex/necklace/gothic_pendant_necklace.glb',
    name: 'Gothic Cross Pendant Necklace',
    description: 'A dramatic gothic cross pendant on a delicate silver chain. Perfect for those who embrace alternative fashion and bold symbolism. Unisex design suitable for any gender.',
    category: 'necklace', gender: 'unisex', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3.5, makingChargePerTola: 3200, jartiAmount: 0,
  },
  {
    src: 'unisex/necklace/inktober_1_-_ring.glb',
    name: 'Artistic Signet Ring',
    description: 'An artistically designed signet ring with a unique abstract motif. Created in the spirit of artistic expression, this ring stands apart from conventional designs. Available in gold and silver.',
    category: 'ring', gender: 'unisex', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'minimalist' }, occasion: 'casual',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3, makingChargePerTola: 4000, jartiAmount: 0,
  },
  {
    src: 'unisex/necklace/jashin_necklace.glb',
    name: 'Jashin Symbol Pendant Necklace',
    description: 'A striking skull-and-triangle pendant inspired by ancient death-god symbolism, beloved by anime enthusiasts and alternative fashion followers. Crafted in oxidised silver for an authentic dark finish.',
    category: 'necklace', gender: 'unisex', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3, makingChargePerTola: 3500, jartiAmount: 0,
  },
  {
    src: 'unisex/necklace/locket_necklace.glb',
    name: 'Classic Locket Necklace',
    description: "A heartfelt locket necklace that holds cherished memories close. The timeless oval locket opens to hold a small photograph or keepsake. A perfect gifting piece for loved ones.",
    category: 'necklace', gender: 'unisex', ageGroup: 'adult',
    style: { type: 'casual', subStyle: null }, occasion: 'gifting',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['925'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 3000, jartiAmount: 0,
  },
  {
    src: 'unisex/necklace/sharks_tooth_necklace.glb',
    name: "Shark's Tooth Pendant Necklace",
    description: "A bold shark's tooth pendant necklace symbolising strength and fearlessness. Crafted in silver with an authentic tooth-shaped design. Popular among adventurers and bold fashion lovers.",
    category: 'necklace', gender: 'unisex', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'streetwear' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 1, maxWeightTola: 2.5, makingChargePerTola: 3000, jartiAmount: 0,
  },
  {
    src: 'unisex/necklace/witcher_necklace_01.glb',
    name: 'Wolf Medallion Pendant Necklace',
    description: 'A detailed wolf head medallion necklace inspired by the legendary Witcher series. Crafted in silver with intricate engraving that captures every detail of the wolf motif.',
    category: 'necklace', gender: 'unisex', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 3800, jartiAmount: 0,
  },
  {
    src: 'unisex/ring/a_gold-plated_silver_ring.glb',
    name: 'Gold-Plated Silver Statement Ring',
    description: 'A striking statement ring combining the warmth of gold plating over a solid silver base. Unisex design with clean modern lines. Affordable luxury for everyday wear.',
    category: 'ring', gender: 'unisex', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3, makingChargePerTola: 3800, jartiAmount: 0,
  },
  {
    src: 'unisex/ring/gotay_greekkeybnd.glb',
    name: 'Greek Key Band Ring',
    description: 'A classic Greek key meander pattern etched around a sturdy gold or silver band. The ancient Greek motif symbolises infinity and eternal flow. Timeless enough for daily wear.',
    category: 'ring', gender: 'unisex', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['999', '925'] },
    minWeightTola: 1.5, maxWeightTola: 3.5, makingChargePerTola: 4200, jartiAmount: 0,
  },
  {
    src: 'unisex/ring/narya_gandalfs_ring.glb',
    name: 'Elvish Signet Ring',
    description: "An intricately carved elvish signet ring inspired by high fantasy mythology. Fine filigree detailing and a gem setting make this a truly special collector's piece. Crafted in gold or silver.",
    category: 'ring', gender: 'unisex', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'gifting',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 5000, jartiAmount: 0, stoneCharge: 1000,
  },
  {
    src: 'unisex/ring/one_ring.glb',
    name: 'Engraved Gold Ring',
    description: "A smooth, weighty gold ring with fine elvish-script engraving on the inner and outer band. Inspired by legendary jewellery of literature, this ring is a timeless collector's item.",
    category: 'ring', gender: 'unisex', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'gifting',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 4500, jartiAmount: 0,
  },
  {
    src: 'unisex/ring/vilya._elronds_ring.glb',
    name: 'Sapphire Elvish Signet Ring',
    description: 'A magnificent elvish signet ring set with a deep blue sapphire stone. Features delicate filigree and a commanding gemstone centre. A true statement piece and collector\'s ring.',
    category: 'ring', gender: 'unisex', ageGroup: 'adult',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'gifting',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 2, maxWeightTola: 4.5, makingChargePerTola: 5500, jartiAmount: 0, stoneCharge: 2000,
  },

  // ── WOMEN — BRACELETS ─────────────────────────────────────────────────────
  {
    src: 'women/bracelet/bracelet (1).glb',
    name: 'Delicate Chain Bracelet',
    description: 'A slender and elegant chain bracelet in gold or rose gold, perfect for layering or wearing alone. Lightweight and comfortable for all-day wear. A versatile accessory for any outfit.',
    category: 'bracelet', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 1.5, maxWeightTola: 3.5, makingChargePerTola: 3000, jartiAmount: 0,
  },
  {
    src: 'women/bracelet/bracelet.glb',
    name: 'Woven Gold Bracelet',
    description: 'A stunning woven-pattern gold bracelet with a secure clasp. The intricate weave adds texture and sparkle to any look. Available in gold and rose gold with multiple purity options.',
    category: 'bracelet', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: null }, occasion: 'daily',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 2, maxWeightTola: 5, makingChargePerTola: 3200, jartiAmount: 0,
  },

  // ── WOMEN — EARRINGS ──────────────────────────────────────────────────────
  {
    src: 'women/earring/basic_shape_earrings.glb',
    name: 'Geometric Shape Drop Earrings',
    description: 'Clean geometric shapes in gold or silver make these earrings a minimalist essential. Lightweight design ensures comfort for all-day wear. Versatile for office or evening outings.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['925'] },
    minWeightTola: 0.5, maxWeightTola: 1.5, makingChargePerTola: 2500, jartiAmount: 0,
  },
  {
    src: 'women/earring/bimbo_thicc_earring.glb',
    name: 'Bold Chunky Hoop Earrings',
    description: 'Eye-catching chunky hoop earrings with a smooth polished finish. A bold statement for confident women who love oversized accessories. Available in gold and rose gold.',
    category: 'earring', gender: 'female', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'streetwear' }, occasion: 'casual',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 1, maxWeightTola: 2.5, makingChargePerTola: 3000, jartiAmount: 0,
  },
  {
    src: 'women/earring/damond_earrings.glb',
    name: 'Diamond-Cut Drop Earrings',
    description: 'Sparkling diamond-cut drop earrings that catch light beautifully from every angle. Perfect for weddings, festivals and special occasions. Available in 22K gold.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 1, maxWeightTola: 2.5, makingChargePerTola: 4000, jartiAmount: 0, stoneCharge: 1500,
  },
  {
    src: 'women/earring/diamond_crossover_hoop_earrings.glb',
    name: 'Diamond Crossover Hoop Earrings',
    description: 'Elegant crossover hoop earrings with a diamond-studded design for a luxurious look. The overlapping hoop design adds a modern twist to a classic style. Perfect for formal events.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 1.5, maxWeightTola: 3, makingChargePerTola: 5000, jartiAmount: 0, stoneCharge: 3000,
  },
  {
    src: 'women/earring/earrings.glb',
    name: 'Classic Gold Stud Earrings',
    description: 'Timeless gold stud earrings that complement any look. Simple yet sophisticated, these studs are the perfect everyday jewellery staple. Available in all gold purity options.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 0.5, maxWeightTola: 1.5, makingChargePerTola: 2500, jartiAmount: 0,
  },
  {
    src: 'women/earring/earrings_001.glb',
    name: 'Floral Gold Stud Earrings',
    description: 'Delicately crafted floral-motif gold stud earrings that add a feminine touch to any outfit. The subtle bloom design is inspired by traditional Nepali motifs. A popular gifting choice.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: null }, occasion: 'gifting',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 0.5, maxWeightTola: 1.5, makingChargePerTola: 3000, jartiAmount: 0,
  },
  {
    src: 'women/earring/earrings_low_poly.glb',
    name: 'Geometric Faceted Earrings',
    description: 'Modern geometric faceted earrings with a sculptural low-polygon design. A contemporary piece perfect for fashion-forward women. Available in gold and silver.',
    category: 'earring', gender: 'female', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'minimalist' }, occasion: 'casual',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 0.5, maxWeightTola: 1.5, makingChargePerTola: 2800, jartiAmount: 0,
  },
  {
    src: 'women/earring/gales_earring.glb',
    name: 'Wind-Inspired Drop Earrings',
    description: 'Flowing drop earrings inspired by the graceful movement of wind. The organic curved design adds elegance and movement to your look. Crafted in gold or rose gold.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: null }, occasion: 'daily',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 0.5, maxWeightTola: 1.5, makingChargePerTola: 3200, jartiAmount: 0,
  },
  {
    src: 'women/earring/gold_leaf_earring.glb',
    name: 'Gold Leaf Drop Earrings',
    description: "Delicate leaf-shaped gold drop earrings that bring nature's elegance to your look. The detailed leaf veining adds organic beauty to this lightweight piece. Perfect for festivals and daily wear.",
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'cottagecore' }, occasion: 'festival',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 0.5, maxWeightTola: 1.5, makingChargePerTola: 3500, jartiAmount: 0,
  },
  {
    src: 'women/earring/golden_ball_crystal_diamond_drop_earrings.glb',
    name: 'Crystal Ball Drop Earrings',
    description: 'Glamorous crystal ball drop earrings with shimmering diamond-cut detailing. The combination of a golden ball and dangling crystal creates a dazzling two-tier effect. Ideal for weddings and gala events.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 1, maxWeightTola: 2.5, makingChargePerTola: 4500, jartiAmount: 0, stoneCharge: 2000,
  },
  {
    src: 'women/earring/golden_earrings.glb',
    name: 'Classic Golden Drop Earrings',
    description: 'Timeless golden drop earrings with a smooth polished finish. A wardrobe essential that pairs beautifully with both traditional and modern outfits. Available in 22K and 18K gold.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 0.5, maxWeightTola: 1.5, makingChargePerTola: 3000, jartiAmount: 0,
  },
  {
    src: 'women/earring/gotay_glick.glb',
    name: 'Textured Gold Hoop Earrings',
    description: 'Medium-sized hoop earrings with a hammered texture for a handcrafted artisan look. The irregular surface catches light beautifully. A fashionable everyday essential in gold or rose gold.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 0.5, maxWeightTola: 2, makingChargePerTola: 3200, jartiAmount: 0,
  },
  {
    src: 'women/earring/hammered_golden_earrings.glb',
    name: 'Hammered Gold Disc Earrings',
    description: 'Artisanal hammered gold disc earrings with an organic beaten texture. Each pair has a slightly unique hammered pattern making them truly one-of-a-kind. Lightweight and wearable every day.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 0.5, maxWeightTola: 1.5, makingChargePerTola: 3500, jartiAmount: 0,
  },
  {
    src: 'women/earring/huggie_earrings_with_carat_of_diamonds.glb',
    name: 'Diamond Huggie Hoop Earrings',
    description: 'Luxurious huggie-style hoop earrings set with a full carat of brilliant-cut diamonds. Huggies wrap close to the ear for a sleek and comfortable fit. A perfect investment piece.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 1, maxWeightTola: 2.5, makingChargePerTola: 5500, jartiAmount: 0, stoneCharge: 5000,
  },
  {
    src: 'women/earring/swan_earring.glb',
    name: 'Swan Drop Earrings',
    description: 'Graceful swan-shaped drop earrings symbolising elegance and purity. The detailed swan silhouette in gold or silver adds a poetic touch to any bridal or formal look.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['22K', '18K'], silver: ['925'] },
    minWeightTola: 0.5, maxWeightTola: 2, makingChargePerTola: 4000, jartiAmount: 0,
  },
  {
    src: 'women/earring/thin_gold_hoop_earrings (1).glb',
    name: 'Thin Gold Hoop Earrings',
    description: 'Minimalist thin gold hoop earrings that are a timeless everyday essential. The fine round hoop is lightweight and comfortable for extended wear. Available in yellow and rose gold.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 0.5, maxWeightTola: 1, makingChargePerTola: 2500, jartiAmount: 0,
  },
  {
    src: 'women/earring/thin_gold_hoop_earrings.glb',
    name: 'Slim Gold Hoop Earrings',
    description: 'Sleek slim-profile gold hoop earrings with a polished finish. A must-have minimalist accessory that elevates any outfit effortlessly. Lightweight and suitable for sensitive ears.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 0.5, maxWeightTola: 1, makingChargePerTola: 2500, jartiAmount: 0,
  },
  {
    src: 'women/earring/topaz_earrings.glb',
    name: 'Blue Topaz Drop Earrings',
    description: 'Stunning blue topaz drop earrings set in gold. The deep blue gemstone contrasts beautifully with warm gold for a vibrant and captivating look. Perfect for festive occasions and gifting.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: null }, occasion: 'festival',
    metalOptions: ['gold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 1, maxWeightTola: 2, makingChargePerTola: 4000, jartiAmount: 0, stoneCharge: 2500,
  },
  {
    src: 'women/earring/turkish_earring_exclusive_for_the_first_time.glb',
    name: 'Turkish Filigree Drop Earrings',
    description: 'Exquisite Turkish-style filigree drop earrings featuring intricate lacework in gold. An exclusive design inspired by Ottoman jewellery craftsmanship. A statement piece for festivals and weddings.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'festival',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 1, maxWeightTola: 3, makingChargePerTola: 5000, jartiAmount: 0,
  },
  {
    src: 'women/earring/turkish_earring_exclusive_for_the_first_time_no3.glb',
    name: 'Turkish Filigree Chandelier Earrings',
    description: 'Lavish chandelier earrings with multi-tiered Turkish filigree work. The dramatic drop and intricate gold lacework make these a showstopper for any bridal ceremony or festival celebration.',
    category: 'earring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 1.5, maxWeightTola: 4, makingChargePerTola: 5500, jartiAmount: 0,
  },

  // ── WOMEN — NECKLACES ─────────────────────────────────────────────────────
  {
    src: 'women/necklace/chrome_hearts_silver_ring_cross_necklace_pendant.glb',
    name: 'Silver Cross Pendant Necklace',
    description: 'A bold silver cross pendant necklace with chunky chain link design. The cross pendant is crafted with intricate detailing for maximum visual impact. A statement piece for the fashion-forward woman.',
    category: 'necklace', gender: 'female', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 2, maxWeightTola: 4.5, makingChargePerTola: 3500, jartiAmount: 0,
  },
  {
    src: 'women/necklace/free_low-poly_sapphire_pendant_necklace_earring.glb',
    name: 'Sapphire Pendant Necklace',
    description: 'A graceful sapphire pendant necklace featuring a vivid blue gemstone set in gold. Ideal for weddings and formal occasions. Can be paired with matching earrings for a coordinated look.',
    category: 'necklace', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 3, maxWeightTola: 6, makingChargePerTola: 4500, jartiAmount: 0, stoneCharge: 5000,
  },
  {
    src: 'women/necklace/gemstone_necklace.glb',
    name: 'Multi-Gemstone Necklace',
    description: 'A dazzling multi-gemstone necklace featuring colourful precious and semi-precious stones set in gold. Each gemstone is individually selected for colour and brilliance. A vibrant festive piece.',
    category: 'necklace', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'festival',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 4, maxWeightTola: 9, makingChargePerTola: 5000, jartiAmount: 0, stoneCharge: 8000,
  },
  {
    src: 'women/necklace/harrison_farnetpndt.glb',
    name: 'Classic Pendant Necklace',
    description: 'An elegantly proportioned gold pendant necklace with a clean teardrop design. Lightweight and versatile for everyday wear or special occasions. A timeless addition to any collection.',
    category: 'necklace', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 2, maxWeightTola: 5, makingChargePerTola: 3500, jartiAmount: 0,
  },
  {
    src: 'women/necklace/jewelry.glb',
    name: 'Statement Gold Necklace',
    description: 'A stunning statement gold necklace with a bold layered design. Crafted for women who want their jewellery to be the centrepiece of their look. Available in multiple gold purity options.',
    category: 'necklace', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 5, maxWeightTola: 10, makingChargePerTola: 4500, jartiAmount: 0,
  },
  {
    src: 'women/necklace/snowflake_necklace.glb',
    name: 'Snowflake Pendant Necklace',
    description: 'A delicate snowflake pendant necklace in gold or silver, symbolising uniqueness and beauty. The intricate symmetrical snowflake design makes this a perfect gifting piece. Lightweight and elegant.',
    category: 'necklace', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'cottagecore' }, occasion: 'gifting',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3.5, makingChargePerTola: 3500, jartiAmount: 0,
  },

  // ── WOMEN — RINGS ─────────────────────────────────────────────────────────
  {
    src: 'women/ring/528_-_ring_wings.glb',
    name: 'Angel Wing Ring',
    description: 'A beautifully sculpted angel wing ring that wraps around the finger with delicate feather detailing. Symbolising protection and freedom, this ring is perfect for gifting to a loved one.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: null }, occasion: 'gifting',
    metalOptions: ['gold', 'silver'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3.5, makingChargePerTola: 4500, jartiAmount: 0,
  },
  {
    src: 'women/ring/bracelet.glb',
    name: 'Classic Gold Bangle Bracelet',
    description: 'A smooth and lustrous gold bangle bracelet with a timeless circular design. The seamless round bangle can be worn alone for minimalist elegance or stacked with others for a bold look.',
    category: 'bracelet', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 2, maxWeightTola: 5, makingChargePerTola: 3000, jartiAmount: 0,
  },
  {
    src: 'women/ring/ch_tierney_gntsupdtd2.glb',
    name: 'Tierney Diamond Band Ring',
    description: "A refined women's band ring with subtle engraving and a diamond-like polish. Perfect as an engagement ring alternative or anniversary gift. Available in gold and rose gold.",
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 1.5, maxWeightTola: 3, makingChargePerTola: 5000, jartiAmount: 0,
  },
  {
    src: 'women/ring/chapelhills_monahan.glb',
    name: 'Chapel Hills Engagement Ring',
    description: 'An elegant solitaire-inspired engagement ring with a sculpted band and prominent centre setting. Designed for the momentous proposal, this ring speaks of timeless love and commitment.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 1.5, maxWeightTola: 3.5, makingChargePerTola: 6000, jartiAmount: 0, stoneCharge: 3000,
  },
  {
    src: 'women/ring/decorated_ring.glb',
    name: 'Floral Decorated Band Ring',
    description: 'An ornate band ring adorned with floral and vine motifs across the entire surface. A romantic piece that pairs beautifully with traditional Nepali attire. Crafted in 22K gold.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'traditional', subStyle: null }, occasion: 'festival',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 5500, jartiAmount: 0, isTraditional: true,
  },
  {
    src: 'women/ring/denali_nate.glb',
    name: 'Denali Solitaire Ring',
    description: 'A breathtaking solitaire ring with a sculpted cathedral setting that elevates the centre stone to maximum brilliance. Named after the great mountain, this ring is as commanding as its namesake.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 6500, jartiAmount: 0, stoneCharge: 4000,
  },
  {
    src: 'women/ring/denali_radiantbnd.glb',
    name: 'Denali Radiant Band Ring',
    description: 'A radiant-cut inspired band ring featuring edge detailing that captures and reflects light brilliantly. A luxurious everyday ring from the Denali collection. Available in gold and rose gold.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'daily',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 1.5, maxWeightTola: 3, makingChargePerTola: 5000, jartiAmount: 0,
  },
  {
    src: 'women/ring/diamond_ring_-_day_1_3dinktober2019-ring.glb',
    name: 'Classic Diamond Solitaire Ring',
    description: 'A striking solitaire ring featuring a prominent diamond-cut centre stone in a classic prong setting. The polished gold band lets the stone take centre stage. A quintessential bridal ring.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 2, maxWeightTola: 4.5, makingChargePerTola: 6000, jartiAmount: 0, stoneCharge: 5000,
  },
  {
    src: 'women/ring/diamondring.glb',
    name: 'Diamond Halo Ring',
    description: 'A glamorous diamond halo ring where the centre stone is surrounded by a glittering halo of smaller diamonds. Maximises sparkle and perceived stone size. The ultimate bridal ring.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 2, maxWeightTola: 4.5, makingChargePerTola: 7000, jartiAmount: 0, stoneCharge: 8000,
  },
  {
    src: 'women/ring/hand_ring.glb',
    name: 'Hand Chain Ring Bracelet',
    description: 'An elegant hand-chain ring bracelet that drapes across the back of the hand, connecting a finger ring to a wrist bracelet with a delicate gold chain. Perfect for bridal ceremonies.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 2.5, maxWeightTola: 5, makingChargePerTola: 5000, jartiAmount: 0,
  },
  {
    src: 'women/ring/pendergrafts_2.glb',
    name: 'Pendergraft Halo Engagement Ring',
    description: 'A sophisticated halo engagement ring with a split shank band that adds visual width and elegance. The double halo setting creates an exceptional display of sparkle. A modern classic for the discerning bride.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 7000, jartiAmount: 0, stoneCharge: 6000,
  },
  {
    src: 'women/ring/source/DOJI RING FINAL.glb',
    name: 'Doji Diamond Ring',
    description: 'The signature Doji ring — an iconic piece featuring a bold diamond-shaped bezel setting with elegant filigree side details. A statement ring that captures light magnificently from every angle.',
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'casual', subStyle: 'minimalist' }, occasion: 'gifting',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['22K', '18K'] },
    minWeightTola: 1.5, maxWeightTola: 3.5, makingChargePerTola: 5500, jartiAmount: 0, stoneCharge: 2000,
  },
  {
    src: 'women/ring/the_ring_1_carat.glb',
    name: '1 Carat Solitaire Ring',
    description: "The quintessential 1-carat diamond solitaire ring, set in an elegant four-prong gold setting that maximises the stone's brilliance. A timeless symbol of love and commitment.",
    category: 'ring', gender: 'female', ageGroup: 'adult',
    style: { type: 'wedding', subStyle: null }, occasion: 'wedding',
    metalOptions: ['gold', 'roseGold'],
    purityOptions: { gold: ['18K'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 7000, jartiAmount: 0, stoneCharge: 10000,
  },

  // ── WOMEN — YOUNGSTARS ────────────────────────────────────────────────────
  {
    src: 'women/youngstars/memento_mori_ring.glb',
    name: 'Memento Mori Skull Ring',
    description: 'A hauntingly beautiful memento mori skull ring for young women who embrace gothic aesthetics. Intricately detailed skull and floral motifs combine life and death in one piece.',
    category: 'ring', gender: 'female', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'gothic' }, occasion: 'casual',
    metalOptions: ['silver'],
    purityOptions: { silver: ['925'] },
    minWeightTola: 1.5, maxWeightTola: 3.5, makingChargePerTola: 4500, jartiAmount: 0,
  },
  {
    src: 'women/youngstars/necklace_c.glb',
    name: 'Layered Chain Pendant Necklace',
    description: 'A trendy multi-layered chain necklace with a decorative pendant centrepiece. The graduated chain lengths create an effortlessly stylish layered look. Perfect for the young fashion-conscious woman.',
    category: 'necklace', gender: 'female', ageGroup: 'youth',
    style: { type: 'youth', subStyle: 'streetwear' }, occasion: 'casual',
    metalOptions: ['gold', 'silver', 'roseGold'],
    purityOptions: { gold: ['18K'], silver: ['925'] },
    minWeightTola: 2, maxWeightTola: 4, makingChargePerTola: 3200, jartiAmount: 0,
  },
]

// ── Seed runner ───────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URL)
  console.log('Connected to MongoDB')

  let created = 0, skipped = 0, errors = 0

  for (const p of PRODUCTS) {
    const srcPath  = path.join(SRC, p.src)
    const filename = `${Date.now()}-${safe(path.basename(p.src))}`
    const destPath = path.join(DEST, filename)

    // Copy file
    if (!fs.existsSync(srcPath)) {
      console.warn(`  SKIP (not found): ${p.src}`)
      skipped++
      continue
    }
    try {
      fs.copyFileSync(srcPath, destPath)
    } catch (e) {
      console.error(`  ERROR copying ${p.src}: ${e.message}`)
      errors++
      continue
    }

    // Build document (omit undefined optional fields)
    const doc = {
      name:               p.name,
      description:        p.description,
      category:           p.category,
      style:              p.style,
      gender:             p.gender,
      ageGroup:           p.ageGroup,
      metalOptions:       p.metalOptions,
      purityOptions:      p.purityOptions,
      minWeightTola:      p.minWeightTola,
      maxWeightTola:      p.maxWeightTola,
      makingChargePerTola:p.makingChargePerTola,
      jartiAmount:        p.jartiAmount,
      model3D:            `/uploads/models/${filename}`,
      images:             [],
      inStock:            true,
      customizable:       true,
      hallmark:           false,
      pickupAvailable:    true,
      measurementType:    'none',
    }
    if (p.occasion)      doc.occasion      = p.occasion
    if (p.stoneCharge)   doc.stoneCharge   = p.stoneCharge
    if (p.isTraditional) doc.isTraditional = p.isTraditional

    try {
      await Product.create(doc)
      console.log(`  ✓ ${p.name}`)
      created++
    } catch (e) {
      console.error(`  ERROR inserting "${p.name}": ${e.message}`)
      errors++
    }

    // Small delay to keep Date.now() filenames unique
    await new Promise(r => setTimeout(r, 5))
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped, ${errors} errors`)
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
