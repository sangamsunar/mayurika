/**
 * Logbook generator — LogBooks 15, 16, 17
 * Run: node generate_logbooks.js
 * Output: logbooks_15_to_17.docx
 */

const fs   = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, convertInchesToTwip,
  LineRuleType, ShadingType,
} = require('./backend/node_modules/docx')

const FONT = 'Courier New'
const BODY = 22   // 11pt in half-points
const SPACING = { line: 300, lineRule: LineRuleType.AUTO, before: 0, after: 60 }

// ── helpers ───────────────────────────────────────────────────────────────────
const run = (text, opts = {}) =>
  new TextRun({ text, font: FONT, size: BODY, bold: opts.bold, italics: opts.italics })

const para = (children, opts = {}) =>
  new Paragraph({
    children: Array.isArray(children) ? children : [children],
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: { ...SPACING, ...(opts.spacing || {}) },
    indent: opts.indent,
  })

const bold  = (t) => run(t, { bold: true })
const plain = (t) => run(t)

const line  = (...runs) => para(runs)
const empty = ()        => para([run('')])

const bullet = (text) =>
  para([run(`  \u2022  ${text}`)], { indent: { left: 200 } })

// Two-column row (label | value) side by side using tab stop
const twoCol = (left, right) =>
  para([bold(left), run('    '), plain(right)])

// Dotted separator line
const dotLine = () =>
  para([run('.' .repeat(65))], { spacing: { ...SPACING, before: 120 } })

// ── Solid border for the outer box ───────────────────────────────────────────
const BOX_BORDER = { style: BorderStyle.SINGLE, size: 12, color: '000000' }

function logbookPage(lb) {
  const inner = [
    // Title
    para([bold(`LogBook : ${lb.number}`)], {
      align: AlignmentType.CENTER,
      spacing: { ...SPACING, before: 80, after: 80 },
    }),

    // Meeting / Increment
    line(bold('Meeting No: '), plain(`${lb.meeting}`)),
    line(bold('Increment: '), plain(lb.increment)),
    empty(),

    // Date row
    para(
      [
        bold('Date: '), plain(lb.date),
        run('                    '),          // spacer
        bold('Last Visit Date: '), plain(lb.lastVisit),
      ]
    ),

    // Time row
    para(
      [
        bold('Start Time: '), plain(lb.startTime),
        run('               '),
        bold('Finish Time: '), plain(lb.finishTime),
      ]
    ),
    empty(),

    // Items Discussed
    line(bold('Items Discussed:')),
    empty(),
    ...lb.discussed.map(bullet),
    empty(),

    // Achievements
    line(bold('Achievements:')),
    empty(),
    ...lb.achievements.map(bullet),
    empty(),

    // Problems
    line(bold('Problems (if any):')),
    empty(),
    ...lb.problems.map(bullet),
    empty(),

    // Tasks
    line(bold('Tasks for Next Meeting:')),
    empty(),
    ...lb.tasks.map(bullet),
    empty(),
    empty(),

    // Signatures
    dotLine(),
    para(
      [
        bold('Sangam Sunar'),
        run('                                             '),
        bold('Ms. Prativa Neupane'),
      ],
      { spacing: { ...SPACING, before: 40, after: 20 } }
    ),
    para(
      [
        run(''),
        run('                                                          '),
        bold('1st Supervisor'),
      ]
    ),
    empty(),
  ]

  // Wrap in a full-width single-cell table to get the box border
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top:    BOX_BORDER,
              bottom: BOX_BORDER,
              left:   BOX_BORDER,
              right:  BOX_BORDER,
            },
            margins: {
              top:    convertInchesToTwip(0.15),
              bottom: convertInchesToTwip(0.15),
              left:   convertInchesToTwip(0.25),
              right:  convertInchesToTwip(0.25),
            },
            children: inner,
          }),
        ],
      }),
    ],
  })
}

// ── Logbook data ──────────────────────────────────────────────────────────────
const LOGBOOKS = [
  {
    number:    15,
    meeting:   15,
    increment: '6 \u2014  Static Pages, Footer & Initial Testing (Completion)',
    date:      '2026/02/16',
    lastVisit: '2026/02/09',
    startTime: '10:00 am',
    finishTime:'10:30 am',
    discussed: [
      'Reviewed Increment 6 progress: Footer, Men/Women pages, and initial testing from previous session.',
      'Discussed Khalti payment gateway integration as an additional digital wallet option.',
      'Reviewed remaining mobile layout issues and UI inconsistencies identified during testing.',
      'Reviewed Increment 6 deliverable: complete static pages, category pages, and payment flows.',
    ],
    achievements: [
      'Integrated Khalti payment gateway with server-side verification alongside eSewa and Stripe.',
      'Built Unisex category page filtering products by gender with skeleton loading state.',
      'Fixed eSewa callback race condition using polling retry logic before finalising order status.',
      'Resolved mobile layout issues across Cart, Checkout, and ProductDetail pages.',
      'Confirmed all core user flows: registration, OTP email, login, cart, checkout, and order tracking.',
    ],
    problems: [
      'Khalti v2 API required an HMAC verification step absent from the public guide; resolved by referencing the Khalti developer portal examples.',
    ],
    tasks: [
      'Increment 6 delivered. Begin Increment 7: UI Dark Theme and Visual Design Overhaul.',
      'Apply a peacock-inspired dark colour palette across all customer-facing pages.',
      'Add hero background images to Women, Men, Unisex, and About pages.',
    ],
  },

  {
    number:    16,
    meeting:   16,
    increment: '7 \u2014  UI Dark Theme & Visual Design Overhaul (Completion)',
    date:      '2026/03/09',
    lastVisit: '2026/02/16',
    startTime: '10:00 am',
    finishTime:'10:35 am',
    discussed: [
      'Reviewed Increment 7 progress: peacock colour system and Tailwind CSS v4 theme token strategy.',
      'Discussed hero image approach using layered gradient overlays for text legibility over photos.',
      'Discussed Admin Dashboard conversion to match the dark client-facing design language.',
      'Reviewed Increment 7 deliverable: complete visual redesign of all customer and admin pages.',
    ],
    achievements: [
      'Defined peacock colour palette — Gold, Teal, Plum, Rose, Blue — as Tailwind v4 @theme tokens.',
      'Applied multi-layer dark surface system (Void #04040A through card layers) across all pages.',
      'Added glass morphism utilities (.glass, .glass-gold, .glass-teal), gradient text, and glow effects.',
      'Built full-bleed hero sections for Women, Men, Unisex, and About pages with gradient overlays.',
      'Rebuilt Home page hero with ambient glows, dot-grid overlay, and five accent-coloured category cards.',
      'Converted Admin Dashboard to dark theme with gold tab underlines and glass-style form inputs.',
      'Removed rose gold from all frontend components and the backend Product model.',
    ],
    problems: [
      'Tailwind v4 arbitrary value syntax triggered linter warnings; fixed by switching to canonical theme class names.',
      'Gradient overlays required z-index ordering to stay above images but below interactive controls.',
    ],
    tasks: [
      'Increment 7 delivered. Begin Increment 8: AI Chatbot and Advanced Analytics Dashboard.',
      'Integrate Groq LLM API to power the Mayu jewellery assistant chatbot.',
      'Redesign Analytics page with date-range filtering, expanded charts, and dark tooltip styling.',
    ],
  },

  {
    number:    17,
    meeting:   17,
    increment: '8 \u2014  AI Chatbot & Advanced Analytics Dashboard (Completion)',
    date:      '2026/04/06',
    lastVisit: '2026/03/09',
    startTime: '10:00 am',
    finishTime:'10:35 am',
    discussed: [
      'Reviewed Increment 8 progress: Mayu chatbot backend and expanded analytics endpoint design.',
      'Discussed Groq API as a cost-free LLM backend for natural-language product assistance.',
      'Discussed analytics redesign: date-range presets, KPI cards, and dark chart tooltip fix.',
      'Reviewed Increment 8 deliverable: working AI chatbot and fully redesigned analytics dashboard.',
    ],
    achievements: [
      'Integrated Groq LLM (llama-3.1-8b-instant) for conversational jewellery assistance branded as Mayu.',
      'Built keyword intent extraction detecting category, metal, occasion, gender, and price hints.',
      'Implemented Chat model storing session history in MongoDB; last six messages sent as LLM context.',
      'Added rule-based fallback responses for gold rate, delivery, and returns when Groq is unavailable.',
      'Expanded analytics endpoint with date-range filtering, period comparison, category revenue, purity and metal breakdown, customer registration trend, and fulfillment statistics.',
      'Rebuilt Analytics dashboard: 4-column grid, 8 KPI cards with trend badges, area chart, donut and bar charts; fixed white tooltip background with a custom dark contentStyle.',
      'Fixed 3D model card rotation by passing the mouse ref object into useFrame instead of a stale snapshot; added auto-rotation and smooth fade-in on load.',
    ],
    problems: [
      'RadarChart was meaningless with only one metal type after rose gold removal; replaced with a horizontal bar chart and per-metal stat cards.',
      'Groq API rate-limit (HTTP 429) under burst requests; handled with a user-friendly retry message.',
    ],
    tasks: [
      'Increment 8 delivered. Conduct final system review and complete FYP documentation.',
      'Review all features against the original project objectives from the proposal.',
      'Finalise FYP report and submit by the 22 April 2026 deadline.',
    ],
  },
]

// ── Build document ────────────────────────────────────────────────────────────
const children = []
LOGBOOKS.forEach((lb, idx) => {
  children.push(logbookPage(lb))
  // Page break between logbooks (not after the last one)
  if (idx < LOGBOOKS.length - 1) {
    children.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })], pageBreakBefore: true }))
  }
})

const doc = new Document({
  creator: 'Sangam Sunar',
  title:   'Logbooks 15–17',
  sections: [{
    properties: {
      page: {
        margin: {
          top:    convertInchesToTwip(1),
          bottom: convertInchesToTwip(1),
          left:   convertInchesToTwip(1),
          right:  convertInchesToTwip(1),
        },
      },
    },
    children,
  }],
})

Packer.toBuffer(doc).then((buf) => {
  const out = path.resolve(__dirname, 'logbooks_15_to_17_v2.docx')
  fs.writeFileSync(out, buf)
  console.log('Generated:', out)
  console.log('Size     :', (buf.length / 1024).toFixed(1), 'KB')
})
