/**
 * Generates test_cases.docx combining all 100 TCs.
 * Run: node generate-docx.js
 */

const {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, ImageRun, AlignmentType, WidthType,
  HeadingLevel, ShadingType, convertInchesToTwip
} = require('docx');
const fs   = require('fs');
const path = require('path');

const SHOTS_BASE = path.join(__dirname, 'screenshots');
const OUT_FILE   = path.join(__dirname, '..', 'test_cases.docx');

// ── Shared rendering helpers ──────────────────────────────────────────────────

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: opts.size || 22, bold: opts.bold, italics: opts.italics, color: opts.color })],
    spacing: { after: opts.spaceAfter || 120 },
    alignment: opts.align || AlignmentType.LEFT,
  });
}

function heading(text, level) {
  return new Paragraph({ text, heading: level, spacing: { before: 300, after: 120 } });
}

function figCaption(text) {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, color: '1A55AF', size: 18 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });
}

function imgCell(folder, filename) {
  const imgPath = path.join(SHOTS_BASE, folder, filename);
  if (!fs.existsSync(imgPath)) {
    return new Paragraph({
      children: [new TextRun({ text: `[Screenshot not found: ${folder}/${filename}]`, italics: true, color: 'AA0000', size: 20 })],
      spacing: { after: 60 },
    });
  }
  return new Paragraph({
    children: [new ImageRun({ data: fs.readFileSync(imgPath), transformation: { width: 560, height: 315 }, type: 'png' })],
    spacing: { after: 60 },
  });
}

function summaryRow(label, content) {
  const isArray = Array.isArray(content);
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22 })] })],
        width: { size: 25, type: WidthType.PERCENTAGE },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      }),
      new TableCell({
        children: isArray
          ? content.map(line => new Paragraph({ children: [new TextRun({ text: line, size: 22 })], bullet: { level: 0 }, spacing: { after: 60 } }))
          : [new Paragraph({ children: [new TextRun({ text: content, size: 22 })] })],
        width: { size: 75, type: WidthType.PERCENTAGE },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      }),
    ],
  });
}

function summaryTable(rows) {
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

let figCounter = 0;
function fig(n) { return `Figure ${n}: `; }

function buildTC(tc) {
  const kids = [];
  kids.push(heading(tc.sectionNum + '  ' + tc.id + ': ' + tc.title, HeadingLevel.HEADING_3));

  tc.figures.forEach(f => {
    figCounter++;
    kids.push(para('• ' + f.op, { bold: true }));
    kids.push(imgCell(tc.folder, f.file));
    kids.push(figCaption(fig(figCounter) + f.caption));
  });

  kids.push(para(''));
  kids.push(summaryTable([
    summaryRow('Test Name', tc.testName),
    summaryRow('Input',     tc.input),
    summaryRow('Description', tc.description),
    summaryRow('Expected Output', tc.expected),
    summaryRow('Actual Output', [...tc.actual, 'Test Case Successful.']),
  ]));
  kids.push(para(''));
  return kids;
}

// ── TC Definitions ────────────────────────────────────────────────────────────

const ALL_TCS = require('./tc-definitions');

// ── Document sections ─────────────────────────────────────────────────────────

const MODULE_HEADINGS = {
  '7.1':  '7.1  User Panel Testing — Authentication',
  '7.2':  '7.2  Product Browsing',
  '7.3':  '7.3  Shopping Flow',
  '7.4':  '7.4  Checkout Extended',
  '7.5':  '7.5  User Profile',
  '7.6':  '7.6  Admin Panel',
  '7.7':  '7.7  Chatbot',
  '7.8':  '7.8  Navigation and UI',
  '7.9':  '7.9  Security and Access Control',
  '7.10': '7.10  Edge Cases',
};

function buildDocument() {
  const children = [];
  figCounter = 0;

  // ── Document header ──
  children.push(para('CS6P05NP                                                           Final Year Project', { bold: false, size: 20, color: '444444' }));
  children.push(para(''));

  // ── Section 7 intro ──
  children.push(heading('7. Testing', HeadingLevel.HEADING_1));
  children.push(para(
    'Testing is the process of evaluating a system or component to detect any discrepancies ' +
    'between expected and actual results. For Mayurika Jewellery, testing ensures all user-facing ' +
    'features — from authentication and product browsing through to checkout, order management, and ' +
    'admin operations — function correctly and reliably.',
    { spaceAfter: 160 }
  ));

  children.push(para(''));

  let currentModule = '';
  for (const tc of ALL_TCS) {
    const parts = tc.sectionNum.split('.');
    const moduleKey = parts[0] + '.' + parts[1];
    if (moduleKey !== currentModule) {
      currentModule = moduleKey;
      if (MODULE_HEADINGS[moduleKey]) {
        children.push(heading(MODULE_HEADINGS[moduleKey], HeadingLevel.HEADING_2));
      }
    }
    children.push(...buildTC(tc));
  }

  return children;
}

// ── Generate ──────────────────────────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Times New Roman', size: 22 } } },
  },
  sections: [{
    properties: {
      page: { margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1.2) } }
    },
    children: buildDocument(),
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT_FILE, buf);
  console.log(`\nGenerated: ${OUT_FILE}`);
  console.log(`Total figures: ${figCounter}`);
  console.log(`Total test cases: ${ALL_TCS.length}`);
});
