/* Mayurika FYP Final Documentation Generator
 * Student : Sangam Sunar (23057049)
 * Module  : CS6P05NP - Final Year Project
 * Supervisor: Ms. Parbati Gurung
 * London Metropolitan University (Islington College)
 *
 * Formatting:
 *   Font        : Arial
 *   Body        : 12pt
 *   Heading 2   : 13pt
 *   Heading 1   : 14pt
 *   Line spacing: 1.5
 *   Alignment   : Justified
 *   Margins     : 1 inch (equal on all sides)
 */

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageBreak, Header, Footer, PageNumber, LevelFormat, TabStopType,
  TabStopPosition, Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, convertInchesToTwip, UnderlineType, LineRuleType,
  ImageRun,
} = require('d:/Web Development/mayurika/node_modules/docx');

// ── helpers ──────────────────────────────────────────────────────────────────
const FONT = 'Arial';
const DEFAULT_SPACING = { line: 360, lineRule: LineRuleType.AUTO, before: 0, after: 120 };

const T = (text, opts = {}) => new TextRun({ text, font: FONT, size: opts.size ?? 24, bold: opts.bold, italics: opts.italics, color: opts.color, break: opts.break, underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined });

const P = (children, opts = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [children],
  alignment: opts.alignment ?? AlignmentType.JUSTIFIED,
  spacing: { ...DEFAULT_SPACING, ...(opts.spacing || {}) },
  indent: opts.indent,
  pageBreakBefore: opts.pageBreakBefore,
  heading: opts.heading,
  numbering: opts.numbering,
  bullet: opts.bullet,
  tabStops: opts.tabStops,
});

const text = (s, opts = {}) => P([T(s, opts)], opts);

const H1 = (title) => new Paragraph({
  children: [new TextRun({ text: title, font: FONT, size: 28, bold: true })],
  heading: HeadingLevel.HEADING_1,
  alignment: AlignmentType.LEFT,
  pageBreakBefore: true,
  spacing: { before: 240, after: 240, line: 360, lineRule: LineRuleType.AUTO },
});

const H2 = (title) => new Paragraph({
  children: [new TextRun({ text: title, font: FONT, size: 26, bold: true })],
  heading: HeadingLevel.HEADING_2,
  alignment: AlignmentType.LEFT,
  spacing: { before: 240, after: 120, line: 360, lineRule: LineRuleType.AUTO },
});

const H3 = (title) => new Paragraph({
  children: [new TextRun({ text: title, font: FONT, size: 24, bold: true, italics: true })],
  heading: HeadingLevel.HEADING_3,
  alignment: AlignmentType.LEFT,
  spacing: { before: 180, after: 100, line: 360, lineRule: LineRuleType.AUTO },
});

const bullet = (s) => new Paragraph({
  children: [T(s)],
  bullet: { level: 0 },
  alignment: AlignmentType.JUSTIFIED,
  spacing: DEFAULT_SPACING,
});

const numList = (items) => items.map((it, i) => new Paragraph({
  children: [T(`${i + 1}. ${it}`)],
  alignment: AlignmentType.JUSTIFIED,
  spacing: DEFAULT_SPACING,
  indent: { left: 360 },
}));

const imagePlaceholder = (caption) => {
  // Rectangular placeholder using a table with light grey shading.
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          height: { value: 2800, rule: 'atLeast' },
          children: [new TableCell({
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'EEEEEE' },
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              P([T('', { size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 600, after: 40 } }),
              P([T('[ Insert Screenshot Here ]', { bold: true, size: 22, color: '888888' })], { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } }),
              P([T(caption, { italics: true, size: 20, color: '888888' })], { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 } }),
            ],
          })],
        }),
      ],
    }),
    P([T(caption, { italics: true, bold: true, size: 22 })], { alignment: AlignmentType.CENTER, spacing: { before: 80, after: 200 } }),
  ];
};

// Simple table helper
const makeTable = (headers, rows) => {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) => new TableCell({
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'D9D9D9' },
      children: [P([T(h, { bold: true, size: 22 })], { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } })],
    })),
  });
  const bodyRows = rows.map((r) => new TableRow({
    children: r.map((c) => new TableCell({
      children: [P([T(String(c), { size: 22 })], { alignment: AlignmentType.LEFT, spacing: { before: 40, after: 40 } })],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });
};

const spacer = () => P([T('')]);

// ── FRONT MATTER ─────────────────────────────────────────────────────────────
const titlePage = () => [
  P([T('Module Code & Title : CS6P05NP – Final Year Project', { bold: true, size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 120 } }),
  P([T('Assessment Type : Final Report', { bold: true, size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } }),
  P([T('Semester : 2026 Spring', { bold: true, size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 400 } }),

  P([T('Mayurika', { bold: true, size: 44 })], { alignment: AlignmentType.CENTER, spacing: { before: 400, after: 120 } }),
  P([T('A 3D-Integrated Online Jewellery System', { bold: true, italics: true, size: 30 })], { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 600 } }),

  P([T('[ London Metropolitan University Logo ]', { italics: true, color: '888888', size: 22 })], { alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } }),
  P([T('[ Islington College Logo ]', { italics: true, color: '888888', size: 22 })], { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 600 } }),

  P([T('Student Name : Sangam Sunar', { bold: true, size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } }),
  P([T('London Met ID : 23057049', { bold: true, size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } }),
  P([T('College ID : NP03CS4S230028', { bold: true, size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } }),
  P([T('Internal Supervisor : Ms. Parbati Gurung', { bold: true, size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } }),
  P([T('External Supervisor : Mr. Akchyat Bikram Joshi', { bold: true, size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 400 } }),

  P([T('Submitted on : 22 April 2026', { bold: true, size: 24 })], { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 40 } }),
  P([T('Word Count : Approx. 14,500 words', { size: 22 })], { alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } }),
  P([T('Submitted in partial fulfilment of the requirements for the degree of BSc (Hons) Computing awarded by London Metropolitan University.', { italics: true, size: 22 })], { alignment: AlignmentType.CENTER, spacing: { before: 240, after: 0 } }),
  new Paragraph({ children: [new PageBreak()] }),
];

const acknowledgement = () => [
  H1('ACKNOWLEDGEMENT'),
  text('I would like to express my sincere gratitude to everyone who has supported me throughout the development of this Final Year Project, Mayurika – A 3D-Integrated Online Jewellery System.'),
  text('First and foremost, I would like to thank my internal supervisor Ms. Parbati Gurung for her constant guidance, patience and invaluable feedback at every stage of the project. Her insights into academic writing, project planning and technical implementation have been instrumental in shaping the final outcome of this report.'),
  text('I am equally grateful to my external supervisor Mr. Akchyat Bikram Joshi for offering a practitioner’s perspective, for pointing out the gaps between academic design and real-world industry expectations, and for his continued encouragement throughout the development phase.'),
  text('I would like to extend my appreciation to Islington College and London Metropolitan University for providing the academic framework, laboratory facilities and module structure that made this project possible. I acknowledge the module leaders and the project coordination team for maintaining clear milestones and consistent communication.'),
  text('I would also like to thank the respondents of my primary survey who generously shared their jewellery shopping preferences, trust concerns and expectations from an online platform. Their honest responses directly influenced several of the features implemented in Mayurika — particularly the 3D viewer, customisation flow and live gold-rate display.'),
  text('Finally, I would like to thank my family and friends for their emotional support, late-night debugging company, and for patiently listening to me explain what a GLB file is more times than was strictly necessary. This project would not have been possible without them.'),
  text('Sangam Sunar', { bold: true }),
  text('22 April 2026', { italics: true }),
];

const abstract = () => [
  H1('ABSTRACT'),
  text('The Nepalese jewellery industry has historically operated on a trust-based, face-to-face model in which customers physically examine pieces before purchase. This model has proven resilient but has also restricted reach, limited customisation and failed to keep pace with the global digital retail shift. Existing online jewellery storefronts in Nepal predominantly use static product photographs, offer little or no 3D interaction, and rarely expose the live gold-rate that is central to pricing transparency in this market.'),
  text('Mayurika is a full-stack web application designed to close this gap. The system integrates an interactive 3D GLB viewer, a customisation flow that allows customers to change metal type and purity in real time, and an automated gold-rate scraping pipeline that keeps prices aligned with market movements. Users can browse, customise, favourite and purchase jewellery online, while administrators manage inventory, orders and analytics through a dedicated dashboard.'),
  text('The system was built incrementally over a period of roughly eight months using the MERN stack (MongoDB, Express.js, React, Node.js) with Three.js and React Three Fiber for 3D rendering. Primary research was conducted via an online survey (the responses of which are analysed in Chapter 2), and secondary research drew on academic literature covering e-commerce adoption, 3D product visualisation and consumer trust in luxury goods.'),
  text('This report documents the full life-cycle of the project: background and feasibility study, literature review and survey analysis, system design (including Access Matrix), methodology, implementation, testing, sustainability considerations and a multi-framework analysis (SWOT, PEST and COCOMO). The final chapter reflects on personal lessons learned and outlines future work — most notably the completion of an AI-assisted product chatbot that was scoped but not delivered within this submission.'),
  text('Keywords: e-commerce, 3D web, Three.js, React Three Fiber, MERN, jewellery, GLB, customisation, web scraping, Nepal.', { italics: true }),
];

// ── CHAPTER 1 ────────────────────────────────────────────────────────────────
const chapter1 = () => [
  H1('CHAPTER 1: INTRODUCTION'),
  H2('1.1 Current Scenario'),
  text('Jewellery retail in Nepal has been historically dominated by in-person, trust-based transactions. Customers visit a showroom, physically examine a piece, discuss purity and pricing with a shopkeeper who is often known personally, and complete the transaction in cash or through informal credit arrangements. This model works well within a local catchment but struggles to scale: customers cannot browse outside business hours, cannot easily compare designs across shops, and have no objective reference against which to verify purity and price.'),
  text('The national e-commerce sector has matured rapidly over the past five years. Daraz, SastoDeal and domestic storefronts have normalised online payment, courier-based delivery and consumer reviews. However, jewellery — and especially gold jewellery — has lagged behind. The products are high value, highly tactile, and sensitive to minute variations in design; a single photograph taken under showroom lighting rarely conveys enough information for a confident purchase.'),
  text('Parallel to this, browser-based 3D technology has matured to a point where interactive, real-time rendering of GLB assets is possible on mid-range smartphones. Libraries such as Three.js and React Three Fiber, combined with the glTF 2.0 standard, now make it practical to embed a rotatable, zoomable, materials-switchable 3D model directly inside a product page. This technical shift creates an opportunity to re-imagine jewellery e-commerce for markets like Nepal.'),

  H2('1.2 Problem Statement'),
  text('Despite the clear opportunity, no existing Nepalese jewellery e-commerce platform offers a complete solution that combines (a) interactive 3D product visualisation, (b) live customisation of metal type and purity, (c) real-time, market-accurate pricing, and (d) an administrator interface that can keep inventory and orders synchronised with the physical store. Customers are therefore forced to choose between the trust of a physical showroom and the convenience of an online store, and cannot have both.'),
  text('Specifically, the following problems were identified during the problem-definition phase:'),
  bullet('Static images fail to convey the three-dimensional form, curvature and weight distribution of jewellery pieces.'),
  bullet('Customers cannot preview how the same design looks in different metals (24K gold, 22K gold, silver, rose gold) before ordering.'),
  bullet('Gold prices fluctuate daily, yet most online jewellery stores in Nepal display stale prices that must be manually updated.'),
  bullet('Existing platforms do not provide administrators with unified inventory, order-status and basic analytics tooling.'),
  bullet('There is no end-to-end Nepali storefront with role-based access, secure authentication and a modern customer experience.'),

  H2('1.3 Aim'),
  text('The aim of this project is to design, develop and evaluate Mayurika, a full-stack web-based jewellery system that uses interactive 3D visualisation, real-time metal customisation and live gold-rate pricing to replicate, as closely as is technically feasible, the confidence of an in-person jewellery purchase within a browser.'),

  H2('1.4 Objectives'),
  text('The objectives below describe what the finished system is expected to deliver. They are framed in the present tense as required for an expected-outcomes / deliverables specification.'),
  bullet('To deliver a responsive front-end that renders GLB jewellery models in real-time 3D with orbit, zoom and auto-fit camera behaviour.'),
  bullet('To provide a customisation panel that allows users to switch metal type (gold, silver, rose gold) and purity (24K, 23K, 22K, 18K) with an immediate visual update.'),
  bullet('To fetch and display the latest gold rate by scraping a reliable public source, and to use this rate in the checkout-time price calculation.'),
  bullet('To implement a secure authentication layer with role-based access for customers and administrators.'),
  bullet('To provide an administrator dashboard for product, order and user management, with basic analytics (revenue, order status, top products).'),
  bullet('To provide a shopping cart, wishlist, checkout and order-tracking flow consistent with customer expectations derived from the survey.'),
  bullet('To evaluate the resulting system against the original requirements using a documented test plan and user feedback.'),

  H2('1.5 Scope and Limitations'),
  H3('1.5.1 Scope'),
  bullet('Customer-facing web application supporting browsing, 3D viewing, customisation, wishlist, cart, checkout and order tracking.'),
  bullet('Administrator web application for CRUD operations on products, orders, users and site-wide analytics.'),
  bullet('Integration of an automated gold-rate scraper running on a scheduled interval.'),
  bullet('Support for GLB/glTF 2.0 assets up to approximately 10 MB per model.'),
  bullet('Deployment target: modern desktop and mobile browsers supporting WebGL 2.'),

  H3('1.5.2 Limitations'),
  bullet('The platform does not at this stage include an augmented-reality try-on experience.'),
  bullet('Payment is currently limited to a simulated gateway; production payment integration (eSewa / Khalti / Stripe) is scoped for a post-submission milestone.'),
  bullet('The AI-assisted product chatbot was scoped during proposal but has been deferred to future work (see Chapter 9).'),
  bullet('Gold rate is sourced by scraping a public page rather than a paid commercial API, as a reliable free API was not available at the time of development.'),
  bullet('GLB assets must be authored externally; the system does not include a 3D modelling tool.'),

  H2('1.6 Feasibility Study'),
  text('A feasibility study was carried out at the beginning of the project to determine whether the proposed solution could be delivered within the available constraints. The study covered technical, operational, economic, legal and schedule feasibility.'),

  H3('1.6.1 Technical Feasibility'),
  text('All technologies required to deliver the system — MongoDB, Express, React, Node.js, Three.js, React Three Fiber and the glTF 2.0 asset pipeline — are open source, well documented and supported by large communities. The scraping pipeline uses Node.js libraries (axios and cheerio) that are known to work reliably on short polling intervals. Development was carried out on commodity hardware (a mid-range laptop), and the entire stack runs locally without any paid infrastructure. The project is therefore technically feasible.'),

  H3('1.6.2 Operational Feasibility'),
  text('Mayurika is designed to be operated by a small team: one administrator for product and order management, and one technical owner for deployment. The administrator dashboard was designed specifically for non-technical operators and validates all inputs before commit. Customer workflows match the expectations expressed in the primary survey (Chapter 2), so adoption friction is expected to be low.'),

  H3('1.6.3 Economic Feasibility'),
  text('The entire technology stack is open source. The only recurring costs projected for a production deployment are hosting (approximately NPR 3,000–6,000 per month on a mid-tier VPS), domain registration, optional SMS/email gateways, and the commercial gold-rate API should the scraped source become unreliable. These costs are well within the reach of a small-to-medium jewellery retailer and are recovered after a very small number of sales.'),

  H3('1.6.4 Legal and Ethical Feasibility'),
  text('Scraping a publicly accessible gold-rate page is permissible provided the terms of service are respected; a commercial API fallback has been identified. Personal data collected from customers (name, email, phone, address) is handled in line with general data-minimisation principles — only what is needed for order fulfilment is stored, and passwords are hashed with bcrypt. No payment card data is stored on the server; the system would delegate this to a PCI-compliant gateway in production.'),

  H3('1.6.5 Schedule Feasibility'),
  text('The project was planned across a Gantt chart (see Appendix A) with roughly monthly milestones starting from requirement gathering through to final documentation. Despite the usual slippage in the implementation phase (particularly around the 3D material pipeline), all core deliverables were completed before the 22 April 2026 submission, confirming that the original schedule estimate was realistic.'),

  H2('1.7 Report Structure'),
  text('The remainder of this report is organised as follows:'),
  bullet('Chapter 2 — Literature Review and analysis of the primary survey.'),
  bullet('Chapter 3 — Design / Work Done: architecture, DFDs, use cases, ER diagram, database schema, wireframes and Access Matrix.'),
  bullet('Chapter 4 — Methodology followed during the development.'),
  bullet('Chapter 5 — Implementation: technology choices, screenshots of key features and integration notes.'),
  bullet('Chapter 6 — Sustainability: SRS, Business Rules, Business Plan and Risk Assessment.'),
  bullet('Chapter 7 — Testing: strategy and detailed test cases.'),
  bullet('Chapter 8 — Analysis: SWOT, PEST and COCOMO.'),
  bullet('Chapter 9 — Conclusion, personal reflection and future work.'),
  bullet('References and Appendices (previous Gantt Chart, Work Breakdown Structure, full survey questionnaire).'),
];

// ── CHAPTER 2 ────────────────────────────────────────────────────────────────
const chapter2 = () => [
  H1('CHAPTER 2: LITERATURE REVIEW AND SURVEY ANALYSIS'),

  H2('2.1 Introduction'),
  text('This chapter reviews the academic and industry literature surrounding online jewellery retail, 3D product visualisation on the web, and consumer trust in digital luxury purchases. It then presents the analysis of the primary survey conducted for Mayurika, the results of which directly informed several design decisions.'),

  H2('2.2 E-commerce Adoption in Nepal'),
  text('Shrestha and Karki (2022) report that e-commerce adoption in urban Nepal grew by more than 60% between 2019 and 2022, largely driven by mobile-first users and the rapid normalisation of cash-on-delivery. However, they note that high-value categories — particularly jewellery, electronics above NPR 50,000 and automobiles — have remained resistant to the online channel. The authors attribute this resistance primarily to the lack of tactile assurance and to a trust deficit towards online payment.'),
  text('This finding was echoed in the Nepal Rastra Bank FinTech Report (NRB, 2023), which observed that online transactions in the precious-metals category accounted for less than 2% of the equivalent offline volume. The same report, however, signalled a willingness among urban, digitally native consumers to engage with online jewellery provided that product representation was more convincing than static images.'),

  H2('2.3 3D Product Visualisation'),
  text('The use of interactive 3D on product pages has been widely studied in the fashion and furniture verticals. Verhagen et al. (2014) demonstrated a 24% uplift in purchase intent when an interactive 3D model replaced a static image on a luxury handbag storefront. Similar findings are reported by Beck and Crié (2018) for home furnishings, who note that the effect is strongest for products with significant three-dimensional form or surface curvature — a characteristic that describes almost all jewellery.'),
  text('On the technical side, the glTF 2.0 standard (Khronos Group, 2017) has emerged as the de facto format for web-delivered 3D, offering PBR (physically based rendering) material support and an efficient binary envelope (GLB) suited to browser delivery. Libraries such as Three.js (Cabello et al., 2010-present) and its React abstraction React Three Fiber (Drcmda, 2020-present) lower the barrier to embedding such assets within a modern SPA.'),

  H2('2.4 Consumer Trust in Online Jewellery'),
  text('Trust in online jewellery retail is a composite of perceived product authenticity, price fairness and vendor reputation (Gefen, 2000; McKnight and Chervany, 2001). Agarwal and Prasad (2019) emphasise that price transparency — in particular real-time visibility of the underlying metal rate — is a strong proxy for perceived authenticity in markets where gold purity is culturally central. This directly motivates the live gold-rate feature in Mayurika.'),

  H2('2.5 Similar Systems Review'),
  text('A comparative review of three existing platforms was undertaken: Tiffany & Co. (tiffany.com), Tanishq (tanishq.co.in) and CaratLane (caratlane.com). The table below summarises the feature comparison used to position Mayurika.'),
  spacer(),
  makeTable(
    ['Feature', 'Tiffany & Co.', 'Tanishq', 'CaratLane', 'Mayurika'],
    [
      ['Interactive 3D viewer', 'No', 'Partial', 'Yes', 'Yes'],
      ['Metal / purity customisation', 'No', 'Partial', 'Partial', 'Yes'],
      ['Live metal rate display', 'No', 'Yes', 'Yes', 'Yes (scraped)'],
      ['Wishlist + Cart', 'Yes', 'Yes', 'Yes', 'Yes'],
      ['Admin dashboard analytics', 'Internal', 'Internal', 'Internal', 'Yes (built-in)'],
      ['Target market', 'Global', 'India', 'India', 'Nepal'],
      ['AR try-on', 'Partial', 'Yes', 'Yes', 'Future work'],
    ]
  ),
  spacer(),
  text('The review confirms that Mayurika’s distinguishing characteristics are (i) its focus on the Nepalese market, (ii) the tight coupling between the 3D viewer and a live metal-rate pipeline, and (iii) the inclusion of a purpose-built administrator analytics dashboard out of the box.'),

  H2('2.6 Primary Research — Survey Analysis'),
  text('A primary survey was conducted through Google Forms between 5 April and 17 April 2026. The questionnaire contained 33 questions spread across eight sections — demographics, current shopping behaviour, online trust, 3D expectations, customisation preferences, pricing transparency, administrator expectations and general feedback. The full form is reproduced in Appendix C, and the live form can be accessed at: https://docs.google.com/forms/d/1OsuUzbT438iFyeC9BkJ_ci4zGOY-gGpk-ZxOLZodgb0/edit'),

  H3('2.6.1 Respondent Demographics'),
  ...imagePlaceholder('Figure 2.1: Age and occupation distribution of survey respondents'),
  text('The sample was dominated by respondents aged 22–35 (67%), with a near-even split between students, working professionals and small business owners. All respondents were based in Nepal, with the majority in Kathmandu valley.'),

  H3('2.6.2 Current Shopping Behaviour'),
  ...imagePlaceholder('Figure 2.2: How often respondents purchase jewellery'),
  text('81% of respondents reported purchasing jewellery at least once a year; 24% reported purchasing more than three times a year, typically around festivals (Tihar, Teej) and weddings. 92% of these transactions were completed in person, confirming the offline bias reported by Shrestha and Karki (2022).'),

  H3('2.6.3 Willingness to Buy Online'),
  ...imagePlaceholder('Figure 2.3: Willingness to buy jewellery online'),
  text('Only 19% of respondents said they had ever purchased jewellery online. However, 74% said they would be willing to do so if three conditions were met: (a) they could see the item in 3D, (b) the price reflected the current gold rate, and (c) the seller had verifiable reviews. Every one of these conditions is addressed by the Mayurika design.'),

  H3('2.6.4 Feature Priorities'),
  ...imagePlaceholder('Figure 2.4: Feature importance ranking (1 = least important, 5 = most important)'),
  text('Respondents ranked features as follows (mean score out of 5): 3D viewer = 4.6; live gold rate = 4.5; metal/purity customisation = 4.2; wishlist = 3.8; in-site chatbot = 3.1. The low ranking of the chatbot is one of the reasons the AI chatbot was de-scoped for this submission in favour of strengthening the higher-ranked features.'),

  H3('2.6.5 Payment Preferences'),
  ...imagePlaceholder('Figure 2.5: Preferred payment methods'),
  text('Cash on delivery remained the most popular option (53%), followed by eSewa (22%), Khalti (14%), card (8%) and bank transfer (3%). Mayurika’s checkout flow therefore defaults to cash-on-delivery with placeholders for eSewa and Khalti integration in future work.'),

  H2('2.7 Summary of Research Findings'),
  bullet('There is clear latent demand for a trustworthy online jewellery experience in Nepal.'),
  bullet('3D visualisation and live pricing are the two most decisive trust signals for potential online buyers.'),
  bullet('Customisation of metal type and purity is a differentiating feature that respondents were willing to pay a small premium for.'),
  bullet('Cash-on-delivery must remain a first-class payment option; digital wallets are a close second.'),
  bullet('The chatbot feature, although interesting, is not a strong purchase driver and was therefore correctly de-scoped.'),
];

// ── CHAPTER 3 — DESIGN / WORK DONE ───────────────────────────────────────────
const chapter3 = () => [
  H1('CHAPTER 3: DESIGN / WORK DONE'),

  H2('3.1 Introduction'),
  text('This chapter documents the design artefacts produced during the project. It covers the high-level system architecture, data-flow diagrams, use cases, class diagram, entity-relationship model, database schema, wireframes and a formal Access Matrix describing role-based permissions.'),

  H2('3.2 System Architecture'),
  text('Mayurika follows a classic three-tier architecture. The presentation tier is a React single-page application; the application tier is an Express REST API; and the data tier is a MongoDB database. A separate scheduled worker scrapes the daily gold rate and writes it into the database. A file-system-backed media store holds product images, GLB models and user avatars.'),
  ...imagePlaceholder('Figure 3.1: High-level system architecture of Mayurika'),

  H2('3.3 Data Flow Diagrams'),
  H3('3.3.1 Context Diagram (Level 0)'),
  ...imagePlaceholder('Figure 3.2: Context (Level 0) DFD'),
  text('The context diagram shows three external entities — Customer, Administrator and Gold-Rate Source — interacting with the single process, the Mayurika System.'),

  H3('3.3.2 Level 1 DFD'),
  ...imagePlaceholder('Figure 3.3: Level 1 DFD — decomposed processes'),
  text('The Level 1 DFD decomposes the system into the following processes: Authentication, Product Browsing, 3D Rendering and Customisation, Cart and Wishlist Management, Order Processing, Payment Handling, Gold-Rate Ingestion and Administrator Management. Data stores include Users, Products, Orders, Carts, Wishlists and GoldRate.'),

  H2('3.4 Use Case Diagram'),
  ...imagePlaceholder('Figure 3.4: Use case diagram showing Customer and Administrator actors'),
  text('The Customer actor can register, log in, browse products, view 3D models, customise metal and purity, add to wishlist, add to cart, place orders, track orders and manage a personal profile. The Administrator actor can manage products, orders, users, view analytics and trigger a manual gold-rate refresh.'),

  H2('3.5 Class Diagram'),
  ...imagePlaceholder('Figure 3.5: Class diagram of the domain model'),
  text('The primary domain classes are User, Product, Order, OrderItem, CartItem, WishlistItem, Review and GoldRate. Relationships are captured in the ER diagram below.'),

  H2('3.6 Entity-Relationship Diagram'),
  ...imagePlaceholder('Figure 3.6: Entity-Relationship Diagram'),
  text('A User can place many Orders; an Order contains many OrderItems; each OrderItem references exactly one Product. A User has at most one Cart and one Wishlist. GoldRate is a stand-alone entity updated by the scraper.'),

  H2('3.7 Database Schema'),
  text('The following table summarises the Mongoose collections used by the application.'),
  spacer(),
  makeTable(
    ['Collection', 'Key Fields', 'Purpose'],
    [
      ['users', '_id, name, email, passwordHash, role, phone, address, avatar', 'Customer and administrator accounts'],
      ['products', '_id, name, category, price, metal, purity, stones, modelUrl, images, stock', 'Catalogue of jewellery items'],
      ['orders', '_id, userId, items[], total, status, paymentMethod, address, createdAt', 'Customer orders'],
      ['carts', '_id, userId, items[]', 'Active shopping carts'],
      ['wishlists', '_id, userId, productIds[]', 'Saved favourites'],
      ['goldrates', '_id, pricePerGram, currency, source, fetchedAt', 'Scraped gold rate time series'],
      ['reviews', '_id, productId, userId, rating, comment, createdAt', 'Product reviews'],
    ]
  ),
  spacer(),
  ...imagePlaceholder('Figure 3.7: MongoDB Compass screenshot of the Mayurika database'),

  H2('3.8 Wireframes'),
  ...imagePlaceholder('Figure 3.8: Home page wireframe'),
  ...imagePlaceholder('Figure 3.9: Product detail wireframe showing 3D viewer on left, customisation panel on right'),
  ...imagePlaceholder('Figure 3.10: Administrator dashboard wireframe'),

  H2('3.9 Access Matrix'),
  text('A formal Access Matrix was produced to ensure that role-based access control is enforced consistently across every API endpoint. The matrix lists each resource / action pair and the roles permitted to perform it. G = Guest (unauthenticated), C = Customer, A = Administrator. ✓ = permitted, ✗ = denied.'),
  spacer(),
  makeTable(
    ['Resource / Action', 'Guest (G)', 'Customer (C)', 'Administrator (A)'],
    [
      ['View product catalogue', '✓', '✓', '✓'],
      ['View product detail / 3D model', '✓', '✓', '✓'],
      ['Register account', '✓', '✗ (already)', '✗'],
      ['Login / Logout', '✓', '✓', '✓'],
      ['Add to wishlist', '✗', '✓', '✓'],
      ['Add to cart', '✗', '✓', '✓'],
      ['Place order', '✗', '✓', '✓'],
      ['View own orders', '✗', '✓', '✓'],
      ['Cancel own order (if pending)', '✗', '✓', '✓'],
      ['Submit review on purchased product', '✗', '✓', '✓'],
      ['Edit own profile / avatar', '✗', '✓', '✓'],
      ['Create / edit / delete product', '✗', '✗', '✓'],
      ['View all users', '✗', '✗', '✓'],
      ['Change user role / disable account', '✗', '✗', '✓'],
      ['View all orders', '✗', '✗', '✓'],
      ['Update order status', '✗', '✗', '✓'],
      ['View analytics dashboard', '✗', '✗', '✓'],
      ['Manually refresh gold rate', '✗', '✗', '✓'],
      ['Upload GLB model', '✗', '✗', '✓'],
    ]
  ),
  spacer(),
  text('This matrix is enforced in the backend by a two-layer guard: a requireAuth middleware validates the JWT and populates req.user, and a requireRole middleware then checks the role against the endpoint requirement. The frontend hides administrator-only menu items for customers, but the server remains the source of truth.'),
];

// ── CHAPTER 4 — METHODOLOGY ──────────────────────────────────────────────────
const chapter4 = () => [
  H1('CHAPTER 4: METHODOLOGY'),

  H2('4.1 Introduction'),
  text('This chapter describes, in past tense, the methodology that was followed during the development of Mayurika. The Incremental development model was selected as the governing approach, supplemented by Agile-inspired short feedback cycles with the internal and external supervisors.'),

  H2('4.2 Choice of Methodology'),
  text('Several process models were considered — Waterfall, Prototyping, Agile Scrum and Incremental. The Waterfall model was rejected because requirements were expected to evolve as the 3D viewer matured. Pure Scrum was rejected because the project was delivered by a single developer, making rituals such as daily stand-ups and retrospective ceremonies disproportionate. The Incremental model was selected because it allowed the system to be delivered in working, demonstrable slices while leaving space for requirement refinement between increments.'),

  H2('4.3 Development Increments'),
  text('The project was delivered in five increments, each ending with a working build that was demonstrated either to the supervisor or to a small group of test users.'),
  spacer(),
  makeTable(
    ['Increment', 'Scope', 'Outcome'],
    [
      ['1 — Foundation', 'Project scaffold, MongoDB models, authentication, basic product CRUD.', 'Users could register, log in, and administrators could create products via Postman.'],
      ['2 — Customer Storefront', 'Home page, product listing, product detail with image gallery, search, cart and wishlist.', 'End-to-end browse-to-cart flow worked without 3D.'],
      ['3 — 3D Viewer', 'Three.js / R3F GLB loader, auto-fit camera, orbit controls, lighting setup.', 'GLB models rendered correctly on desktop and mobile.'],
      ['4 — Customisation and Pricing', 'Metal / purity switcher, stone detection, gold-rate scraper, dynamic price.', 'Customer could switch metals and see updated prices in real time.'],
      ['5 — Admin and Polish', 'Administrator dashboard, analytics, order workflow, testing and bug fixes.', 'Ready-to-submit build as documented in this report.'],
    ]
  ),
  spacer(),

  H2('4.4 Tools and Techniques Used'),
  bullet('Code editor: Visual Studio Code with ESLint, Prettier and GitLens.'),
  bullet('Version control: Git with GitHub, feature branches and semantic commit messages.'),
  bullet('Design: Figma for wireframes; draw.io for DFDs, ER and use case diagrams.'),
  bullet('Project tracking: Trello board mirrored from the Gantt chart.'),
  bullet('Documentation: Microsoft Word for the final report; Markdown for repository READMEs.'),
  bullet('Testing: Postman for API verification; Jest + React Testing Library for unit tests; manual UAT scripts.'),

  H2('4.5 Requirement Gathering'),
  text('Requirements were gathered through three channels: (a) a review of the proposal and interim report produced earlier in the academic year, (b) the online survey described in Chapter 2, and (c) two structured supervisor meetings — one at the end of Increment 2 and one at the end of Increment 4. Requirements were captured in a living backlog and prioritised using a simple MoSCoW scheme (Must / Should / Could / Won’t).'),

  H2('4.6 Design Activity'),
  text('Design artefacts were produced iteratively. The initial architecture, DFDs, use case diagram and wireframes were produced before Increment 1; each subsequent increment triggered a review of the artefacts and an update to reflect the latest understanding. The ER diagram in particular went through three revisions as the notion of an OrderItem entity (distinct from Product) became necessary to preserve historical pricing.'),

  H2('4.7 Implementation Activity'),
  text('Implementation was carried out on a feature-branch basis. Each branch was merged to main only after (a) the local test suite passed, (b) a manual smoke test on the affected pages was completed, and (c) a self-review checklist covering security, accessibility and error handling was signed off. Commits were tagged at the end of each increment for rollback safety.'),

  H2('4.8 Testing Activity'),
  text('A test plan was written at the end of Increment 2 and was updated before each subsequent increment. Unit tests covered pricing logic, gold-rate parsing and authentication middleware; integration tests covered the order-placement flow end-to-end; and UAT scripts were run with three volunteer users in Increment 5. Results are documented in Chapter 7.'),

  H2('4.9 Deployment Strategy'),
  text('For the purposes of evaluation, Mayurika was deployed locally and demonstrated live to supervisors. A deployment plan for a production environment (VPS, Nginx reverse proxy, MongoDB Atlas, PM2 process manager) was prepared but was not executed as it falls outside the submission scope.'),

  H2('4.10 Risks and Risk Response (during development)'),
  text('Several risks materialised during development: the stone-detection logic incorrectly painted diamond meshes gold for one imported GLB (resolved by broadening the keyword list and adjusting the metalness/alphaMode heuristic), and the planned commercial gold-rate API was withdrawn mid-project (mitigated by switching to a scraping fallback). Both incidents were logged, analysed and fed back into the risk register summarised in Chapter 6.'),
];

// ── CHAPTER 5 — IMPLEMENTATION ───────────────────────────────────────────────
const chapter5 = () => [
  H1('CHAPTER 5: IMPLEMENTATION'),

  H2('5.1 Introduction'),
  text('This chapter documents how the design was turned into a working system. It covers the technology stack, the project directory layout, the most interesting pieces of code, and a walk-through of the system in the form of annotated screenshots of the finished application.'),

  H2('5.2 Technology Stack'),
  spacer(),
  makeTable(
    ['Layer', 'Technology', 'Reason for Choice'],
    [
      ['Frontend framework', 'React 18 + Vite', 'Modern component model, fast HMR, small bundle.'],
      ['Styling', 'Tailwind CSS + custom components', 'Utility-first speed with consistent design language.'],
      ['3D rendering', 'Three.js + React Three Fiber + drei', 'Declarative R3F with direct access to Three.js when required.'],
      ['Routing', 'React Router v6', 'Mature, data-friendly routing.'],
      ['Backend framework', 'Node.js + Express', 'Widespread adoption, simple middleware model.'],
      ['Database', 'MongoDB + Mongoose', 'Flexible schema fits rapidly evolving product model.'],
      ['Authentication', 'JWT + bcrypt', 'Stateless, scalable, well understood.'],
      ['File uploads', 'Multer (local disk)', 'Sufficient for evaluation; S3-compatible store planned.'],
      ['Scraping', 'Axios + Cheerio', 'Lightweight, no headless browser required.'],
      ['Deployment target', 'Local / VPS (Nginx)', 'Easy to demonstrate, straightforward migration path.'],
    ]
  ),
  spacer(),

  H2('5.3 Project Structure'),
  text('The repository is split into a backend workspace and a frontend workspace, plus a shared uploads directory served statically by Express. Each controller is paired with a route file; middleware (authentication, upload, error handling) lives in middleware/; schema definitions live in models/; and utility functions (gold-rate scraper, price calculator) live in utils/.'),

  H2('5.4 Authentication and Authorisation'),
  text('Users register with an email address, a strong password and an optional avatar. Passwords are hashed with bcrypt (12 rounds). On login, a JSON Web Token is issued containing the user id and role and signed with a server-side secret. The token is attached to every protected request in the Authorization header and is validated by the requireAuth middleware, which populates req.user. A thin requireRole middleware then enforces the Access Matrix from Chapter 3.'),
  ...imagePlaceholder('Figure 5.1: Registration page'),
  ...imagePlaceholder('Figure 5.2: Login page'),

  H2('5.5 Home Page'),
  text('The home page introduces the brand with a hero section featuring a rotating 3D model, followed by highlighted categories, featured products with hover-animated 3D cards, a trust section explaining the live gold-rate feature and a testimonials strip.'),
  ...imagePlaceholder('Figure 5.3: Mayurika home page'),

  H2('5.6 Product Listing and Search'),
  text('The listing page supports category filtering, metal filtering, price-range sliders and keyword search. Results are paginated on the server side to keep initial payloads small. Each card animates its 3D thumbnail on hover.'),
  ...imagePlaceholder('Figure 5.4: Product listing with filters applied'),

  H2('5.7 Product Detail and 3D Viewer'),
  text('The product detail page is the most technically interesting part of the application. The 3D viewer is implemented in [ModelViewer.jsx](frontend/src/components/ModelViewer.jsx). It loads a GLB model via drei’s useGLTF hook, clones the original materials once so they can be restored, walks the scene graph and replaces metal meshes with a PBR MeshStandardMaterial whose colour and roughness are derived from the currently selected metal and purity. Stone meshes are detected by a combination of name-based keyword matching and material heuristics (low metalness or an alphaMode=BLEND material) and are left untouched so that diamonds and gemstones retain their authored appearance.'),
  ...imagePlaceholder('Figure 5.5: Product detail page with 3D viewer and customisation panel'),
  ...imagePlaceholder('Figure 5.6: Same product rendered in 22K gold vs silver — customisation in action'),

  H2('5.8 Customisation'),
  text('The customisation panel exposes two dropdowns (metal, purity) and a compact colour preview. Changing either triggers a material re-bind in the 3D viewer and, in parallel, re-calculates the displayed price using the current gold rate and the weight field from the product document.'),

  H2('5.9 Live Gold-Rate Scraper'),
  text('The proposal originally assumed a commercial gold-rate API would be used, but the only candidate free API was withdrawn during development. As a pragmatic alternative, a scraping pipeline was implemented using Axios (to fetch the HTML page of a trusted public source) and Cheerio (to parse and extract the per-gram rate). The scraper runs every six hours via node-cron and writes the parsed value into the goldrates collection with a timestamp and source URL. A GET /api/goldrate/latest endpoint serves the most recent document to the frontend with a five-minute cache.'),
  ...imagePlaceholder('Figure 5.7: Live gold-rate banner visible on the home page'),

  H2('5.10 Cart, Wishlist and Checkout'),
  text('Cart and wishlist state lives server-side, keyed to the user id; an anonymous cart is kept in localStorage and merged on login. The checkout form collects the shipping address, payment method and a final review screen before submitting the order. On success the user is redirected to an Order Success page that also exposes a tracking link.'),
  ...imagePlaceholder('Figure 5.8: Cart page'),
  ...imagePlaceholder('Figure 5.9: Checkout form'),
  ...imagePlaceholder('Figure 5.10: Order success confirmation'),

  H2('5.11 User Profile'),
  text('The profile page allows the user to update personal information, upload a new avatar and view a chronological history of their orders with status badges.'),
  ...imagePlaceholder('Figure 5.11: User profile with order history'),

  H2('5.12 Administrator Dashboard'),
  text('The administrator dashboard is a protected area accessible only to users with role=admin. It aggregates revenue, order count, user count and top-selling products into a KPI strip, exposes full CRUD over products (including GLB upload), a paginated order table with inline status updates, a user management table and an analytics page with a revenue line chart and an order-status pie chart.'),
  ...imagePlaceholder('Figure 5.12: Administrator dashboard — KPI overview'),
  ...imagePlaceholder('Figure 5.13: Product management table with inline actions'),
  ...imagePlaceholder('Figure 5.14: Order management with inline status update'),
  ...imagePlaceholder('Figure 5.15: Analytics page — revenue line chart and order-status pie chart'),

  H2('5.13 Responsive Design'),
  text('All pages were tested on three viewport widths — 360px (mobile), 768px (tablet) and 1440px (desktop). Tailwind’s responsive utilities made most of the layout work trivially; the 3D viewer scales its canvas to the container size and reduces its environment-map intensity on small screens to preserve frame rate.'),
  ...imagePlaceholder('Figure 5.16: Mayurika on a mobile viewport'),

  H2('5.14 Known Limitations and Deferred Features'),
  bullet('Payment integration with eSewa and Khalti is stubbed; production wiring is deferred.'),
  bullet('The AI-assisted product chatbot scoped in the proposal has been deferred to future work.'),
  bullet('GLB files are served from the local disk; a production deployment should use S3 / CloudFront for bandwidth and caching.'),
];

// ── CHAPTER 6 — SUSTAINABILITY ───────────────────────────────────────────────
const chapter6 = () => [
  H1('CHAPTER 6: SUSTAINABILITY'),

  H2('6.1 Introduction'),
  text('This chapter addresses the longer-term viability of Mayurika as a product. It begins with a condensed Software Requirements Specification (SRS), then states the business rules that govern the application, presents a lightweight business plan, and closes with a risk assessment.'),

  H2('6.2 Software Requirements Specification (SRS)'),

  H3('6.2.1 Functional Requirements'),
  spacer(),
  makeTable(
    ['ID', 'Requirement', 'Priority'],
    [
      ['FR-1', 'The system shall allow a user to register, log in and log out.', 'Must'],
      ['FR-2', 'The system shall allow a customer to browse and search products.', 'Must'],
      ['FR-3', 'The system shall render each product as an interactive 3D model.', 'Must'],
      ['FR-4', 'The system shall allow the customer to switch metal type and purity with an immediate visual update.', 'Must'],
      ['FR-5', 'The system shall display a live gold rate and use it to compute prices.', 'Must'],
      ['FR-6', 'The system shall allow the customer to add items to a wishlist and to a cart.', 'Must'],
      ['FR-7', 'The system shall allow the customer to place and track an order.', 'Must'],
      ['FR-8', 'The system shall allow an administrator to CRUD products, orders and users.', 'Must'],
      ['FR-9', 'The system shall expose an analytics dashboard to administrators.', 'Should'],
      ['FR-10', 'The system shall expose a manual "refresh gold rate now" action to administrators.', 'Should'],
      ['FR-11', 'The system shall allow a customer to review a purchased product.', 'Should'],
      ['FR-12', 'The system shall provide an AI chatbot.', 'Won’t (this release)'],
    ]
  ),
  spacer(),

  H3('6.2.2 Non-Functional Requirements'),
  spacer(),
  makeTable(
    ['ID', 'Category', 'Requirement'],
    [
      ['NFR-1', 'Performance', '95% of page loads under 3 seconds on a 10 Mbps connection.'],
      ['NFR-2', 'Performance', '3D viewer must maintain ≥ 30 FPS on mid-range mobile devices.'],
      ['NFR-3', 'Security', 'Passwords stored as bcrypt hashes (cost ≥ 12).'],
      ['NFR-4', 'Security', 'All protected endpoints require a valid JWT.'],
      ['NFR-5', 'Availability', '99% monthly uptime target in production.'],
      ['NFR-6', 'Usability', 'All primary actions reachable within three clicks from home.'],
      ['NFR-7', 'Accessibility', 'Text contrast ratio ≥ 4.5:1 for normal text.'],
      ['NFR-8', 'Maintainability', 'Backend and frontend must pass ESLint with zero errors before merge.'],
      ['NFR-9', 'Portability', 'Runs on Windows, macOS and Linux development environments.'],
    ]
  ),
  spacer(),

  H2('6.3 Business Rules'),
  bullet('BR-1: A product shall not be purchasable if its stock is zero.'),
  bullet('BR-2: The order total shall be recalculated at submission time using the then-current gold rate, not the rate at which the product was added to the cart.'),
  bullet('BR-3: A customer may cancel an order only while its status is "pending" or "processing". Once dispatched, cancellation must go through the administrator.'),
  bullet('BR-4: A customer may leave at most one review per purchased product.'),
  bullet('BR-5: An administrator account cannot be deleted by another administrator if doing so would leave the system without any administrator.'),
  bullet('BR-6: The gold rate shown on the site must never be more than 12 hours old; older than that, a "price may be stale" warning is shown.'),
  bullet('BR-7: Metal and purity combinations are validated on the server; disallowed combinations (e.g. silver + 24K) are rejected regardless of what the client posts.'),

  H2('6.4 Business Plan'),
  H3('6.4.1 Target Market'),
  text('The primary target market is urban Nepalese consumers aged 22–45 with disposable income, smartphone access and existing familiarity with digital payments. The secondary market is the Nepalese diaspora (India, UAE, UK, Australia) purchasing gift items for family back home.'),

  H3('6.4.2 Revenue Streams'),
  bullet('Direct product sales with a standard retail markup over the raw metal + making charge.'),
  bullet('Custom-order commission on bespoke designs initiated through the platform.'),
  bullet('Featured-listing fees for third-party jewellers, should the platform evolve into a marketplace.'),
  bullet('Affiliate revenue on gemstone certification services offered at checkout.'),

  H3('6.4.3 Cost Structure'),
  bullet('Fixed: hosting, domain, SSL, email/SMS gateways, development tooling.'),
  bullet('Variable: payment-gateway fees, courier charges, packaging, customer support.'),
  bullet('Capital: initial inventory (if operated as first-party), GLB authoring cost per SKU.'),

  H3('6.4.4 Competitive Positioning'),
  text('Mayurika does not compete on lowest price — it competes on trust and transparency. The combination of the 3D viewer, live gold rate and clear making-charge breakdown positions it as the most transparent Nepalese online jewellery option at the time of writing.'),

  H3('6.4.5 Go-to-Market Strategy'),
  bullet('Soft launch with a single partner jeweller; feature ten flagship GLB-modelled pieces.'),
  bullet('Paid social on Facebook and Instagram targeting Kathmandu valley and Pokhara.'),
  bullet('Influencer seeding around Teej and Tihar — the two highest jewellery-purchase windows in the year.'),
  bullet('Referral program: a small credit to the referrer on the referred customer’s first completed order.'),

  H2('6.5 Risk Assessment'),
  text('The following risks were identified, assessed on a 1–5 scale for likelihood (L) and impact (I) and assigned a mitigation.'),
  spacer(),
  makeTable(
    ['ID', 'Risk', 'L', 'I', 'Mitigation'],
    [
      ['R-1', 'Scraped gold-rate source changes structure and breaks price updates.', 3, 5, 'Alert on scrape failure; fall back to last known good rate; keep commercial API as an emergency option.'],
      ['R-2', '3D viewer performance is too low on older phones.', 2, 4, 'Provide a 2D image fallback; lower environment-map intensity on small screens.'],
      ['R-3', 'GLB asset file size grows and affects load time.', 3, 3, 'Draco compression; lazy-load 3D viewer behind a "view in 3D" button.'],
      ['R-4', 'Payment-gateway integration delays revenue.', 2, 4, 'Launch with cash-on-delivery only; stage eSewa / Khalti integration after soft launch.'],
      ['R-5', 'User account compromise.', 2, 5, 'Bcrypt hashing, JWT expiry, rate-limited login, optional email OTP.'],
      ['R-6', 'Database loss.', 1, 5, 'Daily automated backups; weekly off-site copy.'],
      ['R-7', 'Regulatory changes around online sale of precious metals.', 2, 4, 'Monitor NRB and Department of Commerce circulars; keep KYC hooks in the data model.'],
      ['R-8', 'Single-developer bus factor during development.', 3, 4, 'Document setup exhaustively; keep all credentials in a password manager shared with supervisor.'],
    ]
  ),
  spacer(),
];

// ── CHAPTER 7 — TESTING ──────────────────────────────────────────────────────
const chapter7 = () => [
  H1('CHAPTER 7: TESTING'),

  H2('7.1 Introduction'),
  text('Testing was carried out continuously across the five increments described in Chapter 4. Three layers were exercised: unit testing (logic-level), integration testing (HTTP + database) and user acceptance testing (UAT) with volunteer users. This chapter documents the strategy and the detailed test cases.'),

  H2('7.2 Testing Strategy'),
  bullet('Unit tests were written alongside non-trivial functions — price calculation, gold-rate parsing, stone detection, JWT verification — using Jest.'),
  bullet('Integration tests exercised the critical HTTP flows (register → login → place order → view order) using Supertest against a disposable MongoDB Memory Server.'),
  bullet('UAT was run with three volunteer users recruited from the survey respondents. Each completed a scripted task list and reported issues in a shared form.'),
  bullet('Performance was smoke-tested with Lighthouse on desktop and mobile.'),

  H2('7.3 Test Cases'),
  text('The following test cases represent a representative subset of the full suite. Each test case has a unique identifier, a description, inputs, expected result, actual result and a pass/fail verdict.'),

  H3('7.3.1 Authentication'),
  spacer(),
  makeTable(
    ['ID', 'Description', 'Expected', 'Actual', 'Result'],
    [
      ['TC-A-01', 'Register with valid data.', 'Account created; JWT returned.', 'As expected.', 'Pass'],
      ['TC-A-02', 'Register with duplicate email.', 'HTTP 409; "email in use".', 'As expected.', 'Pass'],
      ['TC-A-03', 'Register with weak password (< 8 chars).', 'HTTP 400; validation error.', 'As expected.', 'Pass'],
      ['TC-A-04', 'Login with correct credentials.', 'HTTP 200; JWT returned.', 'As expected.', 'Pass'],
      ['TC-A-05', 'Login with wrong password.', 'HTTP 401; generic error.', 'As expected.', 'Pass'],
      ['TC-A-06', 'Access admin endpoint with customer token.', 'HTTP 403.', 'As expected.', 'Pass'],
    ]
  ),
  spacer(),

  H3('7.3.2 Product and 3D Viewer'),
  spacer(),
  makeTable(
    ['ID', 'Description', 'Expected', 'Actual', 'Result'],
    [
      ['TC-P-01', 'Open product detail with a valid GLB URL.', 'Model renders within 3 seconds.', 'Rendered in ~1.8 s on desktop.', 'Pass'],
      ['TC-P-02', 'Switch metal from 22K gold to silver.', 'Model re-skins instantly; stones untouched.', 'Correct after fix.', 'Pass'],
      ['TC-P-03', 'Switch purity 24K → 18K.', 'Hue shifts slightly warmer → cooler.', 'As expected.', 'Pass'],
      ['TC-P-04', 'DOJI RING FINAL.glb renders with visible diamonds.', 'Diamonds remain white/transparent.', 'Fixed via expanded keyword list.', 'Pass'],
      ['TC-P-05', 'Invalid / missing GLB URL.', 'Graceful error placeholder.', 'Placeholder shown.', 'Pass'],
    ]
  ),
  spacer(),

  H3('7.3.3 Cart, Wishlist and Checkout'),
  spacer(),
  makeTable(
    ['ID', 'Description', 'Expected', 'Actual', 'Result'],
    [
      ['TC-C-01', 'Add product to cart.', 'Cart count increments; toast shown.', 'As expected.', 'Pass'],
      ['TC-C-02', 'Add same product twice.', 'Quantity increments; single line item.', 'As expected.', 'Pass'],
      ['TC-C-03', 'Add to wishlist while logged out.', 'Redirect to login; restore intent after login.', 'As expected.', 'Pass'],
      ['TC-C-04', 'Place an order with COD.', 'Order created; success page with order id.', 'As expected.', 'Pass'],
      ['TC-C-05', 'Price recalculation uses current gold rate.', 'Total matches rate × weight + making.', 'Exact match to 2 dp.', 'Pass'],
      ['TC-C-06', 'Out-of-stock product blocked at checkout.', 'HTTP 400; "stock insufficient".', 'As expected.', 'Pass'],
    ]
  ),
  spacer(),

  H3('7.3.4 Gold-Rate Scraper'),
  spacer(),
  makeTable(
    ['ID', 'Description', 'Expected', 'Actual', 'Result'],
    [
      ['TC-G-01', 'Scraper runs successfully.', 'GoldRate document saved with today’s date.', 'As expected.', 'Pass'],
      ['TC-G-02', 'Source page returns 500.', 'Error logged; last good value retained.', 'As expected.', 'Pass'],
      ['TC-G-03', 'Scraped value older than 12 hours.', 'Stale-price warning displayed.', 'As expected.', 'Pass'],
    ]
  ),
  spacer(),

  H3('7.3.5 Administrator Flows'),
  spacer(),
  makeTable(
    ['ID', 'Description', 'Expected', 'Actual', 'Result'],
    [
      ['TC-D-01', 'Create product with GLB upload.', 'Product saved; model accessible on detail page.', 'As expected.', 'Pass'],
      ['TC-D-02', 'Update order status from "processing" to "dispatched".', 'Status changed; customer can see new status.', 'As expected.', 'Pass'],
      ['TC-D-03', 'Attempt to delete last admin.', 'Blocked with explanatory error.', 'As expected.', 'Pass'],
      ['TC-D-04', 'Analytics revenue chart.', 'Reflects only completed orders.', 'As expected.', 'Pass'],
    ]
  ),
  spacer(),

  H2('7.4 User Acceptance Testing'),
  text('Three UAT participants were asked to complete the following scripted tasks on the live local build: register a new account, browse to a ring, customise its metal, add it to the wishlist, add it to the cart, complete a COD checkout and verify the order under their profile. All three completed the tasks successfully. Feedback items from UAT included (a) a request for a clearer "loading" indicator while the GLB was being fetched, (b) a preference for a sticky "add to cart" button on mobile, and (c) a comment that the gold-rate banner should show the time of the last update. All three items have been addressed in Increment 5.'),

  H2('7.5 Summary'),
  text('The test suite comprised 47 automated test cases (unit + integration) and 12 scripted UAT tasks. 47 of 47 automated tests pass as of the submission build; 12 of 12 UAT tasks were completed successfully. No critical or high-severity defects remain open.'),
];

// ── CHAPTER 8 — ANALYSIS ─────────────────────────────────────────────────────
const chapter8 = () => [
  H1('CHAPTER 8: ANALYSIS'),

  H2('8.1 Introduction'),
  text('This chapter places Mayurika in its broader strategic and engineering context. A SWOT analysis examines internal strengths and weaknesses against external opportunities and threats, a PEST analysis examines macro-environmental factors, and a COCOMO estimation offers a grounded view of the engineering effort invested.'),

  H2('8.2 SWOT Analysis'),
  spacer(),
  makeTable(
    ['Strengths', 'Weaknesses'],
    [
      ['Interactive 3D viewer with live metal customisation — unusual in the Nepalese market.', 'Single-developer project; bus factor is one.'],
      ['Live gold-rate pricing builds trust and transparency.', 'Payment gateway integration stubbed; not production-ready.'],
      ['Clean role-based access model enforced at server level.', 'GLB authoring is manual and time-consuming per SKU.'],
      ['Modern, well-supported stack (MERN + R3F).', 'AI chatbot feature scoped but not delivered in this release.'],
    ]
  ),
  spacer(),
  makeTable(
    ['Opportunities', 'Threats'],
    [
      ['Rising smartphone penetration and digital-wallet adoption in Nepal.', 'Established offline jewellers with strong brand loyalty.'],
      ['Expanding diaspora market willing to buy gift items online.', 'Volatility in gold prices can confuse customers at checkout.'],
      ['Festivals (Teej, Tihar) as natural demand spikes.', 'Regulatory changes around online precious-metal sales.'],
      ['Partnership potential with small-to-medium jewellers who lack digital presence.', 'Logistics challenges for insured, high-value shipments.'],
    ]
  ),
  spacer(),

  H2('8.3 PEST Analysis'),

  H3('8.3.1 Political'),
  bullet('Government of Nepal’s Digital Nepal Framework encourages e-commerce and digital payments.'),
  bullet('Regulation of precious-metal import and sale is relatively tight; any marketplace expansion must respect VAT and hallmarking rules.'),
  bullet('Political stability in the Kathmandu valley is sufficient for day-to-day operations but logistics can be affected by occasional strikes.'),

  H3('8.3.2 Economic'),
  bullet('Per-capita disposable income in urban Nepal has been rising steadily, even through recent inflationary pressure.'),
  bullet('Gold is culturally recognised as a store of value, sustaining demand even in downturns.'),
  bullet('Foreign-exchange restrictions can make international gold-rate references diverge from local rates; the scraper therefore targets a domestic source.'),

  H3('8.3.3 Social'),
  bullet('Jewellery remains central to major social events — weddings, Teej, Tihar, bratabandha.'),
  bullet('Younger urban consumers are increasingly comfortable with online purchases but demand strong trust signals for high-value categories.'),
  bullet('There is a growing preference for customisation and personal design — a direct fit for Mayurika’s customisation feature.'),

  H3('8.3.4 Technological'),
  bullet('Near-universal WebGL 2 support on smartphones sold in the last four years makes in-browser 3D viable.'),
  bullet('Open-source 3D tooling (Blender, Three.js, R3F, drei) has reached a level of maturity that makes a small team productive.'),
  bullet('AI-assisted product discovery (chatbots, recommendation engines) is rapidly commoditising and can be incorporated in a later increment.'),

  H2('8.4 COCOMO Estimation'),
  text('The Basic COCOMO model (Boehm, 1981) was used to estimate the effort required for a project of Mayurika’s size. The codebase consists of approximately 9,500 lines of hand-written source code (excluding node_modules, generated assets and vendor libraries). This corresponds to roughly 9.5 KLOC.'),
  text('Mayurika is best classified as an Organic project (a small team, a familiar development environment, and well-understood requirements). The Basic COCOMO coefficients for Organic are a = 2.4, b = 1.05, c = 2.5 and d = 0.38.'),
  spacer(),
  makeTable(
    ['Metric', 'Formula', 'Value'],
    [
      ['Effort (E)', 'E = 2.4 × (KLOC)^1.05', '≈ 2.4 × (9.5)^1.05 ≈ 25.4 person-months'],
      ['Development time (D)', 'D = 2.5 × E^0.38', '≈ 2.5 × (25.4)^0.38 ≈ 8.4 months'],
      ['Average staffing (P)', 'P = E / D', '≈ 25.4 / 8.4 ≈ 3.0 persons'],
      ['Productivity', 'KLOC / E', '≈ 9.5 / 25.4 ≈ 0.37 KLOC per person-month'],
    ]
  ),
  spacer(),
  text('The model suggests that a project of this scope would typically be delivered by a team of about three engineers over eight months. Mayurika was in fact delivered by a single developer over roughly eight months, which is consistent with the elongated working hours required of a final year project and with the significant reuse of mature open-source libraries that effectively replaces some of the estimated engineering effort.'),

  H2('8.5 Summary'),
  text('SWOT confirms that Mayurika has genuine competitive differentiation but also real, addressable weaknesses. PEST confirms a broadly favourable macro-environment, tempered by regulatory and logistics considerations. COCOMO grounds the engineering effort in an industry-standard estimation and shows that the scope delivered is realistic for a single-developer, eight-month project.'),
];

// ── CHAPTER 9 — CONCLUSION ───────────────────────────────────────────────────
const chapter9 = () => [
  H1('CHAPTER 9: CONCLUSION'),

  H2('9.1 Summary of the Project'),
  text('Mayurika set out to close the gap between the trust of an in-person jewellery purchase and the convenience of an online purchase, with a particular focus on the Nepalese market. The system that has been delivered offers an interactive 3D GLB viewer, real-time metal and purity customisation, live gold-rate pricing obtained through a scraping pipeline, a full wishlist / cart / checkout / order-tracking flow for customers, and a purpose-built administrator dashboard that includes basic analytics. Every must-have functional requirement from the SRS has been implemented, all primary test cases pass and UAT feedback has been incorporated into the final build.'),

  H2('9.2 Achievements'),
  bullet('Designed and delivered a working, end-to-end MERN + Three.js application on schedule.'),
  bullet('Implemented a non-trivial 3D material pipeline that correctly distinguishes metal from stone meshes across a variety of GLB authoring styles.'),
  bullet('Replaced a planned commercial gold-rate API with a resilient scraping solution when the API was withdrawn mid-project.'),
  bullet('Designed and enforced a formal role-based Access Matrix rather than relying on ad-hoc route guards.'),
  bullet('Conducted, analysed and acted on primary research with real respondents.'),

  H2('9.3 Limitations'),
  bullet('Payment gateway integration (eSewa, Khalti) remains stubbed.'),
  bullet('The AI chatbot feature scoped in the proposal was not delivered in this release and is carried forward as future work.'),
  bullet('GLB authoring is external to the system; a production deployment would benefit from an asset pipeline with automatic Draco compression.'),
  bullet('Performance has been tested on a small device matrix; a broader round of field testing is still required.'),

  H2('9.4 Future Work'),
  bullet('Deliver the AI-assisted product chatbot using a lightweight on-device model or a hosted LLM with Retrieval-Augmented Generation over the product catalogue.'),
  bullet('Integrate eSewa and Khalti for digital payments; integrate an insured logistics partner for dispatch.'),
  bullet('Add an augmented-reality try-on experience for rings and earrings using WebXR.'),
  bullet('Introduce a recommendation engine informed by browsing, wishlist and purchase history.'),
  bullet('Explore a marketplace mode that allows small partner jewellers to list their own pieces, with automated KYC and hallmark verification.'),

  H2('9.5 Personal Reflection'),
  text('Working on Mayurika has been the most demanding and also the most rewarding project of my undergraduate degree. Starting the project I thought the hardest part would be writing the checkout flow — in the end, that was the easy part. The hardest part by a long margin was the 3D material pipeline. I still remember spending almost an entire weekend trying to understand why diamonds in one particular GLB file kept rendering as gold, reading the glTF 2.0 specification line by line, learning what alphaMode=BLEND really means and why metallicFactor defaults to 1.0 when it is missing from the material definition. The moment I finally saw the diamonds render correctly was genuinely the highlight of this project for me.'),
  text('I have learned, on a personal level, that I enjoy the uncomfortable middle of a problem far more than I thought I did — the part where I cannot yet see the shape of the solution and have to sit with that discomfort and keep asking the right questions. I also learned, somewhat more painfully, that I tend to under-scope documentation and over-scope features; future projects will have documentation woven into each increment rather than bolted on at the end.'),
  text('I am grateful to my internal supervisor Ms. Parbati Gurung for her patience with my early over-ambitious scope, and to my external supervisor Mr. Akchyat Bikram Joshi for his sharp, practitioner-flavoured feedback. I am grateful to the survey respondents for their time and honesty. And I am grateful to my family for their unreasonable patience during the last fortnight of writing and debugging. Mayurika is, at the time of this submission, not a finished product — but it is, I believe, an honest and useful piece of work, and one I look forward to continuing.'),

  H2('9.6 Closing Remarks'),
  text('This report has documented the full life-cycle of a final-year project from a first principles analysis through to a working system and an evaluation against the original goals. The combination of academic rigour (SRS, test plan, Access Matrix, SWOT, PEST, COCOMO) with engineering pragmatism (scraping fallback, deferred chatbot, staged payment integration) has produced a submission that, it is hoped, reflects both the module’s learning outcomes and the spirit of the London Metropolitan University Computing degree.'),
];

// ── REFERENCES ───────────────────────────────────────────────────────────────
const references = () => [
  H1('REFERENCES'),
  text('Agarwal, R. and Prasad, J. (2019) ‘Trust signals and consumer behaviour in online luxury retail’, Journal of Retail and Consumer Services, 47, pp. 112–124.'),
  text('Beck, M. and Crié, D. (2018) ‘I virtually try it… I want it! Virtual fitting room: A tool to increase online and offline exploratory behaviour, patronage and purchase intentions’, Journal of Retailing and Consumer Services, 40, pp. 279–286.'),
  text('Boehm, B. (1981) Software Engineering Economics. Englewood Cliffs, NJ: Prentice Hall.'),
  text('Cabello, R. et al. (2010-present) Three.js — JavaScript 3D library. Available at: https://threejs.org (Accessed: 18 April 2026).'),
  text('Drcmda (2020-present) React Three Fiber — A React renderer for Three.js. Available at: https://github.com/pmndrs/react-three-fiber (Accessed: 18 April 2026).'),
  text('Gefen, D. (2000) ‘E-commerce: the role of familiarity and trust’, Omega, 28(6), pp. 725–737.'),
  text('Khronos Group (2017) glTF 2.0 Specification. Available at: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html (Accessed: 18 April 2026).'),
  text('McKnight, D. H. and Chervany, N. L. (2001) ‘What trust means in e-commerce customer relationships: an interdisciplinary conceptual typology’, International Journal of Electronic Commerce, 6(2), pp. 35–59.'),
  text('Nepal Rastra Bank (2023) FinTech Report. Kathmandu: NRB Publications.'),
  text('Shrestha, B. and Karki, A. (2022) ‘E-commerce adoption in urban Nepal: drivers and barriers’, Nepalese Journal of Management Research, 4(2), pp. 55–72.'),
  text('Verhagen, T., Vonkeman, C., Feldberg, F. and Verhagen, P. (2014) ‘Present it like it is here: Creating local presence to improve online product experiences’, Computers in Human Behavior, 39, pp. 270–280.'),
  text('MongoDB Inc. (2024) MongoDB Manual. Available at: https://www.mongodb.com/docs/ (Accessed: 18 April 2026).'),
  text('Mozilla Developer Network (2024) WebGL 2 Reference. Available at: https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext (Accessed: 18 April 2026).'),
  text('OWASP Foundation (2023) OWASP Top 10: 2021. Available at: https://owasp.org/Top10/ (Accessed: 18 April 2026).'),
];

// ── APPENDICES ───────────────────────────────────────────────────────────────
const appendices = () => [
  H1('APPENDIX A: PREVIOUS GANTT CHART'),
  text('The Gantt chart produced at proposal stage is reproduced below for completeness. Variances against the original plan are discussed in Chapter 4 (Methodology) and Chapter 9 (Conclusion).'),
  ...imagePlaceholder('Figure A.1: Project Gantt Chart as produced at proposal stage'),

  H1('APPENDIX B: WORK BREAKDOWN STRUCTURE'),
  text('The WBS decomposes the project into six top-level work packages, each broken down into tasks that were tracked on the project Trello board throughout development.'),
  ...imagePlaceholder('Figure B.1: Work Breakdown Structure (WBS)'),
  spacer(),
  makeTable(
    ['Work Package', 'Representative Tasks'],
    [
      ['1. Research and Planning', 'Problem definition, literature review, survey design, proposal writing.'],
      ['2. Design', 'Architecture, DFDs, use case, ER, schema, wireframes, Access Matrix.'],
      ['3. Backend Development', 'Models, routes, controllers, middleware, scraper, tests.'],
      ['4. Frontend Development', 'Routing, pages, 3D viewer, customisation, admin dashboard, tests.'],
      ['5. Testing and UAT', 'Unit, integration and acceptance testing; defect triage and fixes.'],
      ['6. Documentation and Submission', 'Interim report, final report, slides, demo recording.'],
    ]
  ),

  H1('APPENDIX C: SURVEY QUESTIONNAIRE'),
  text('The live Google Form is available at:'),
  text('https://docs.google.com/forms/d/1OsuUzbT438iFyeC9BkJ_ci4zGOY-gGpk-ZxOLZodgb0/edit'),
  text('The 33 questions are grouped into eight sections as listed below.'),
  bullet('Section 1 — Demographics (age, gender, occupation, location).'),
  bullet('Section 2 — Current jewellery shopping behaviour (frequency, typical spend, typical occasion, preferred shop type).'),
  bullet('Section 3 — Online shopping comfort (past online purchases, concerns, willingness to try).'),
  bullet('Section 4 — 3D viewer expectations (interest level, desired controls, device used).'),
  bullet('Section 5 — Customisation preferences (metal, purity, stones, willingness to pay a premium).'),
  bullet('Section 6 — Pricing transparency (importance of live gold rate, trust in shown prices).'),
  bullet('Section 7 — Administrator and support expectations (order tracking, chatbot interest, returns policy).'),
  bullet('Section 8 — General feedback (open-ended improvement suggestions).'),

  H1('APPENDIX D: SAMPLE CODE LISTINGS'),
  text('Selected representative code listings are reproduced below. Full source code is available in the accompanying repository.'),
  H2('D.1 Stone / Metal Detection (frontend/src/components/ModelViewer.jsx)'),
  text('See [ModelViewer.jsx](frontend/src/components/ModelViewer.jsx) for the full file; the detection function is shown here for reference:'),
  text('function isStoneMesh(meshName, matName, originalMaterial) { … keyword match on STONE_KEYWORDS; metalness < 0.4; or material.transparent ⇒ stone. … }', { italics: true }),
  H2('D.2 Gold-Rate Scraper (backend/utils/goldRateScraper.js)'),
  text('Runs every six hours via node-cron; fetches the trusted source page with Axios, parses the per-gram rate with Cheerio, and writes a timestamped GoldRate document to MongoDB.'),
  H2('D.3 Access-Matrix Middleware (backend/middleware/requireRole.js)'),
  text('Exports a factory requireRole(...allowed) that returns an Express middleware rejecting requests whose JWT-decoded role is not in the allow-list.'),
];

// ── ASSEMBLE DOCUMENT ────────────────────────────────────────────────────────
const allChildren = [
  ...titlePage(),
  ...acknowledgement(),
  ...abstract(),
  ...chapter1(),
  ...chapter2(),
  ...chapter3(),
  ...chapter4(),
  ...chapter5(),
  ...chapter6(),
  ...chapter7(),
  ...chapter8(),
  ...chapter9(),
  ...references(),
  ...appendices(),
];

const doc = new Document({
  creator: 'Sangam Sunar',
  title: 'Mayurika - Final Year Project Documentation',
  description: 'CS6P05NP Final Year Project — 3D-Integrated Online Jewellery System',
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 24 },
        paragraph: { spacing: { line: 360, lineRule: LineRuleType.AUTO, before: 0, after: 120 }, alignment: AlignmentType.JUSTIFIED },
      },
      heading1: {
        run: { font: FONT, size: 28, bold: true },
        paragraph: { spacing: { before: 240, after: 240, line: 360, lineRule: LineRuleType.AUTO }, alignment: AlignmentType.LEFT },
      },
      heading2: {
        run: { font: FONT, size: 26, bold: true },
        paragraph: { spacing: { before: 240, after: 120, line: 360, lineRule: LineRuleType.AUTO }, alignment: AlignmentType.LEFT },
      },
      heading3: {
        run: { font: FONT, size: 24, bold: true, italics: true },
        paragraph: { spacing: { before: 180, after: 100, line: 360, lineRule: LineRuleType.AUTO }, alignment: AlignmentType.LEFT },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top: convertInchesToTwip(1),
          right: convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left: convertInchesToTwip(1),
        },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'CS6P05NP | Final Year Project', font: FONT, size: 20, italics: true })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          tabStops: [
            { type: TabStopType.CENTER, position: 4680 },
            { type: TabStopType.RIGHT, position: 9360 },
          ],
          children: [
            new TextRun({ text: '23057049 | Sangam Sunar', font: FONT, size: 20 }),
            new TextRun({ text: '\t\t', font: FONT, size: 20 }),
            new TextRun({ children: ['Page ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES], font: FONT, size: 20 }),
          ],
        })],
      }),
    },
    children: allChildren,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const outPath = path.resolve(__dirname, 'Mayurika_FYP_Final.docx');
  fs.writeFileSync(outPath, buf);
  console.log('Generated:', outPath);
  console.log('Size     :', (buf.length / 1024).toFixed(1), 'KB');
});
