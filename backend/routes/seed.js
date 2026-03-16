import { Router } from 'express';
import { User, Document } from '../models/index.js';

const router = Router();

const PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const DOCX_URL = 'https://calibre-ebook.com/downloads/demos/demo.docx';
const FILE_URLS = [PDF_URL, DOCX_URL];

const DEPT_LIST = ['Battery Module', 'Battery Pack', 'Drive Unit', 'Energy', 'Mega Pack', 'Power Wall', 'PCS', 'Semi'];

const TYPE_SEED = {
  MN: {
    suffixes: ['Line Shutdown Notice', 'Material Change Alert', 'Shift Schedule Update', 'Equipment Installation', 'Ramp-Up Plan', 'Safety Protocol Update', 'Tooling Changeover Notice', 'Maintenance Window Alert'],
    baseTags: ['manufacturing', 'notice'],
    textSnippet: 'MANUFACTURING NOTICE\n\nEFFECTIVE DATE: March 2024\nPRIORITY: HIGH\n\n1. NOTICE SUMMARY\nThis manufacturing notice covers critical updates for the {dept} department.\n\n2. ACTION REQUIRED\n- Review all affected procedures\n- Update work instructions\n- Notify all shift supervisors\n- Complete training by effective date\n\n3. IMPACT ASSESSMENT\n- Production schedules may be adjusted\n- Resource allocation reviewed\n- Quality checkpoints updated\n\nAPPROVED BY: Manufacturing Engineering Director'
  },
  MI: {
    suffixes: ['Assembly Procedure', 'Installation Guide', 'Operation Manual', 'Calibration Steps', 'Testing Protocol', 'Setup Instructions', 'Maintenance Procedure', 'Changeover Guide'],
    baseTags: ['manufacturing', 'instructions'],
    textSnippet: 'MANUFACTURING INSTRUCTIONS\n\nRevision: 2.0\nScope: {dept} Department\n\n1. PURPOSE\nThis document provides step-by-step manufacturing instructions for the {dept} area.\n\n2. PROCEDURE\nStep 1: Verify all materials and tools are available\nStep 2: Confirm workstation setup per specifications\nStep 3: Follow assembly sequence as outlined\nStep 4: Perform in-process quality checks\nStep 5: Document completion in production log\n\n3. QUALITY CHECKS\n- All torque values logged electronically\n- Visual inspection at each stage\n- Final verification before sign-off\n\nAPPROVED BY: Manufacturing Engineering'
  },
  QI: {
    suffixes: ['Incoming Inspection', 'Weld Quality Check', 'Paint Inspection Standards', 'Audit Checklist', 'Validation Procedure', 'Dimensional Check', 'Functional Test', 'Material Verification'],
    baseTags: ['quality', 'inspection'],
    textSnippet: 'QUALITY INSTRUCTIONS\n\nRevision: 3.0\nScope: {dept} Department\n\n1. INSPECTION REQUIREMENTS\nThis quality instruction defines inspection criteria for the {dept} area.\n\n2. INSPECTION STEPS\n- Visual inspection against reference standard\n- Dimensional verification per drawing\n- Functional test per specification\n- Documentation in quality system\n\n3. ACCEPTANCE CRITERIA\n- All dimensions within tolerance\n- No visible defects on critical surfaces\n- Functional test passed\n- Traceability records complete\n\nAPPROVED BY: Quality Engineering Director'
  },
  QAN: {
    suffixes: ['Torque Non-Conformance', 'Material Deviation Alert', 'Defect Cluster Alert', 'Fastener Recall Notice', 'Calibration Error Report', 'Weld Defect Alert', 'Surface Finish Issue', 'Assembly Gap Alert'],
    baseTags: ['quality', 'alert'],
    textSnippet: 'QUALITY ALERT NOTICE\n\nALERT LEVEL: HIGH\nISSUED: March 2024\nDEPARTMENT: {dept}\n\n1. PROBLEM DESCRIPTION\nQuality issue identified in the {dept} department requiring immediate attention.\n\n2. AFFECTED SCOPE\n- Current production run\n- Inventory in process\n\n3. IMMEDIATE ACTIONS\n- Stop affected process\n- Quarantine suspect material\n- Notify quality engineering\n- Begin root cause analysis\n\n4. CONTAINMENT\n- 100% inspection of affected units\n- Rework or scrap as needed\n\nISSUED BY: Quality Engineering'
  },
  VA: {
    suffixes: ['Connector ID Guide', 'PPE Requirements', 'Torque Sequence Diagram', 'Fluid Fill Chart', 'Error Code Reference', 'Assembly Diagram', 'Routing Map', 'Inspection Points'],
    baseTags: ['visual', 'reference'],
    textSnippet: 'VISUAL AIDE\n\nVersion: 1.0\nArea: {dept}\n\nThis visual aide provides quick reference information for the {dept} department.\n\nKEY REFERENCE POINTS:\n- Follow color-coded indicators\n- Check reference standards before each shift\n- Report discrepancies immediately\n- Keep this guide posted at the workstation\n\nCONTACT: Area supervisor for questions\n\nAPPROVED BY: Engineering'
  },
  PCA: {
    suffixes: ['Weld Parameter Update', 'Line Speed Increase', 'Adhesive Introduction', 'Vision Inspection Deploy', 'Packaging Change', 'Robot Program Update', 'Fixture Modification', 'Material Substitution'],
    baseTags: ['process-change', 'approval'],
    textSnippet: 'PROCESS CHANGE APPROVAL\n\nSTATUS: APPROVED\nEFFECTIVE: March 2024\nDEPARTMENT: {dept}\n\n1. CHANGE DESCRIPTION\nApproved process change for the {dept} department.\n\n2. VALIDATION RESULTS\n- Production trial: PASSED\n- Quality metrics: Within specification\n- Safety review: No concerns\n\n3. IMPLEMENTATION\n- Update work instructions\n- Train affected operators\n- Monitor for 2 weeks post-implementation\n\nAPPROVED BY: Process Engineering, Quality, Manufacturing'
  }
};

// Generate 48 documents (6 types × 8 departments)
const SAMPLES = [];
for (const [type, data] of Object.entries(TYPE_SEED)) {
  DEPT_LIST.forEach((dept, i) => {
    const deptSlug = dept.toLowerCase().replace(/\s+/g, '-');
    SAMPLES.push({
      title: `${dept} - ${data.suffixes[i]}`,
      description: `${data.suffixes[i]} for the ${dept} department.`,
      documentType: type,
      category: dept,
      tags: [...data.baseTags, deptSlug],
      version: `${Math.floor(i / 3) + 1}.${i % 3}.0`,
      fileUrl: FILE_URLS[i % FILE_URLS.length],
      filePublicId: `seed_${type.toLowerCase()}_${deptSlug.replace(/-/g, '_')}_${String(i + 1).padStart(3, '0')}`,
      fileType: i % 2 === 0 ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 15000 + Math.floor(Math.random() * 30000),
      textContent: data.textSnippet.replace(/\{dept\}/g, dept)
    });
  });
}

// POST /api/seed - Admin-only endpoint to populate sample documents
router.post('/', async (req, res) => {
  try {
    let user = await User.findOne({ where: { role: 'admin' } });
    if (!user) {
      return res.status(400).json({ message: 'No admin user found. Register an admin first.' });
    }

    // Delete old seeded documents to replace with new ones
    const oldTitles = await Document.findAll({ attributes: ['title'] });
    const seedTitles = new Set(SAMPLES.map(s => s.title));
    const oldSeedDocs = oldTitles.filter(d => !seedTitles.has(d.title));

    // Remove documents that don't match new seed titles (old seed data)
    if (oldSeedDocs.length > 0) {
      await Document.destroy({ where: { title: oldSeedDocs.map(d => d.title) }, force: true });
    }

    let created = 0;
    let updated = 0;

    for (const sample of SAMPLES) {
      const existing = await Document.findOne({ where: { title: sample.title }, paranoid: false });
      if (existing) {
        await existing.update({ ...sample, createdBy: user.id });
        updated++;
      } else {
        await Document.create({ ...sample, createdBy: user.id });
        created++;
      }
    }

    res.json({
      success: true,
      message: `Seeding complete: ${created} created, ${updated} updated`,
      total: SAMPLES.length,
      created,
      updated
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Seeding failed: ' + error.message });
  }
});

export default router;
