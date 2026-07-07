import React from "react";
import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";

const BRAND_RED = "#dc2626";
const DARK      = "#111827";
const MID       = "#374151";
const LIGHT     = "#6b7280";
const RULE      = "#e5e7eb";
const GREEN     = "#16a34a";
const AMBER     = "#d97706";

const s = StyleSheet.create({
  page:          { fontFamily: "Helvetica", fontSize: 8.5, color: MID, paddingTop: 46, paddingBottom: 56, paddingHorizontal: 40 },
  header:        { marginBottom: 16, paddingBottom: 12, borderBottom: `2 solid ${BRAND_RED}`, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  brandScan:     { fontSize: 19, fontFamily: "Helvetica-Bold", color: DARK },
  brandVault:    { fontSize: 19, fontFamily: "Helvetica-Bold", color: BRAND_RED },
  headerSub:     { fontSize: 7.5, color: LIGHT },
  headerRight:   { textAlign: "right" },
  docTitle:      { fontSize: 14, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "center", marginBottom: 3 },
  docSubtitle:   { fontSize: 9, color: LIGHT, textAlign: "center", marginBottom: 14 },

  sectionNumber: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BRAND_RED, marginTop: 14, marginBottom: 6 },
  body:          { lineHeight: 1.55, marginBottom: 4 },
  bold:          { fontFamily: "Helvetica-Bold", color: DARK },

  // Detail grid
  infoBox:       { border: `1 solid ${RULE}`, borderRadius: 4, marginBottom: 6 },
  infoRow:       { flexDirection: "row", borderBottom: `1 solid ${RULE}` },
  infoRowLast:   { flexDirection: "row" },
  infoLabel:     { width: "24%", backgroundColor: "#f9fafb", padding: 5, fontFamily: "Helvetica-Bold", color: DARK, fontSize: 8 },
  infoVal:       { width: "26%", padding: 5, fontSize: 8, color: MID },

  // Risk matrix legend
  legendRow:     { flexDirection: "row", gap: 8, marginBottom: 8, marginTop: 2 },
  legendItem:    { flexDirection: "row", alignItems: "center", gap: 4 },
  legendSwatch:  { width: 10, height: 10, borderRadius: 2 },
  legendText:    { fontSize: 7.5, color: MID },

  // Hazard table
  tHead:         { flexDirection: "row", backgroundColor: BRAND_RED },
  tHeadCell:     { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 7, padding: 4 },
  tRow:          { flexDirection: "row", borderBottom: `1 solid ${RULE}` },
  tRowAlt:       { flexDirection: "row", borderBottom: `1 solid ${RULE}`, backgroundColor: "#f9fafb" },
  tCell:         { fontSize: 7, padding: 4, color: MID, lineHeight: 1.4 },
  tCellBold:     { fontSize: 7, padding: 4, color: DARK, fontFamily: "Helvetica-Bold", lineHeight: 1.4 },
  riskChip:      { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "center", borderRadius: 2, paddingVertical: 2 },

  // column widths
  cHazard:  { width: "15%" },
  cWho:     { width: "12%" },
  cControl: { width: "34%" },
  cL:       { width: "5%", textAlign: "center" },
  cS:       { width: "5%", textAlign: "center" },
  cRisk:    { width: "8%", textAlign: "center" },
  cAdd:     { width: "21%" },

  listItem:      { flexDirection: "row", marginBottom: 3, lineHeight: 1.5 },
  listBullet:    { width: 12, fontFamily: "Helvetica-Bold", color: BRAND_RED },
  listText:      { flex: 1, lineHeight: 1.5 },

  sigRow:        { flexDirection: "row", gap: 24, marginTop: 20 },
  sigBox:        { flex: 1 },
  sigLabel:      { fontSize: 8, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  sigLine:       { borderBottom: `1 solid ${DARK}`, marginBottom: 4, paddingBottom: 12 },
  sigSub:        { fontSize: 7.5, color: LIGHT },

  footer:        { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTop: `1 solid ${RULE}`, paddingTop: 6 },
  footerText:    { fontSize: 7.5, color: LIGHT },
});

export interface RiskAssessmentPDFProps {
  id:              string;
  clientName:      string;
  clientAddress:   string;
  careHomeName:    string;
  careHomeAddress: string;
  assessorName:    string;
  startDate:       string;
  createdAt:       string;
}

interface Hazard {
  hazard:   string;
  who:      string;
  controls: string[];
  L:        number;
  S:        number;
  add:      string;
}

function riskColour(v: number): string {
  if (v >= 15) return BRAND_RED;
  if (v >= 8)  return AMBER;
  return GREEN;
}
function riskLabel(v: number): string {
  if (v >= 15) return "HIGH";
  if (v >= 8)  return "MED";
  return "LOW";
}

const HAZARDS: Hazard[] = [
  {
    hazard: "Infection Prevention & Control",
    who: "Residents, care staff, ScanVault engineers",
    controls: [
      "Comply with the care home's infection control policy at all times.",
      "Hand hygiene on entry/exit and between areas; use of hand sanitiser stations.",
      "Do not attend site if displaying symptoms of infectious illness.",
      "Follow any outbreak restrictions (e.g. COVID-19, influenza, norovirus) and PPE requirements advised by the home.",
    ],
    L: 2, S: 4, add: "Wear PPE (gloves/mask/apron) where directed. Maintain distance from residents in isolation.",
  },
  {
    hazard: "Safeguarding of Vulnerable Adults",
    who: "Residents (vulnerable adults)",
    controls: [
      "All engineers briefed on safeguarding responsibilities before commencement.",
      "No lone contact with residents; work conducted in designated work areas only.",
      "Report any safeguarding concern immediately to the care home manager.",
      "Treat all residents and their records with dignity, respect and confidentiality.",
    ],
    L: 1, S: 5, add: "Adhere to the home's safeguarding policy. Named home contact available throughout.",
  },
  {
    hazard: "Manual Handling (archive boxes)",
    who: "ScanVault engineers, care staff",
    controls: [
      "Assess load weight before lifting; boxes kept to a manageable weight (<15kg).",
      "Use correct lifting technique; team-lift heavier loads.",
      "Use a trolley/sack truck where boxes must be moved any distance.",
      "Clear transport routes planned in advance.",
    ],
    L: 3, S: 3, add: "Provide/agree use of a trolley on site. Avoid twisting; take regular breaks.",
  },
  {
    hazard: "Slips, Trips & Falls",
    who: "Residents, care staff, engineers",
    controls: [
      "Keep work area tidy; boxes and equipment stored neatly against walls.",
      "Cables routed away from walkways and taped/covered where crossing is unavoidable.",
      "Report and avoid wet or freshly cleaned floors.",
      "Never obstruct corridors, doorways or resident walking routes.",
    ],
    L: 2, S: 3, add: "Use cable covers. Cordon work area if needed. Maintain clear resident access at all times.",
  },
  {
    hazard: "Fire Safety & Evacuation",
    who: "Residents, staff, engineers",
    controls: [
      "Receive fire evacuation briefing and locate exits/assembly point on arrival.",
      "Never block or wedge fire doors or exit routes with boxes or equipment.",
      "Do not overload electrical sockets.",
      "On alarm, cease work and follow staff instructions / evacuation procedure.",
    ],
    L: 1, S: 5, add: "Confirm assembly point with home. Keep escape routes clear throughout.",
  },
  {
    hazard: "Electrical Equipment (scanners, laptops, leads)",
    who: "Engineers, staff, residents",
    controls: [
      "All portable electrical equipment PAT tested and visually inspected before use.",
      "No damaged leads or plugs used; faulty equipment removed from use.",
      "Extension leads fully unwound; sockets not overloaded.",
      "Equipment positioned to avoid trailing leads.",
    ],
    L: 1, S: 4, add: "Provide PAT certificates on request. RCD-protected supply where available.",
  },
  {
    hazard: "Working Near Residents (dementia, mobility aids, wheelchairs)",
    who: "Residents, engineers",
    controls: [
      "Work in areas away from resident living/communal spaces where possible.",
      "Be aware of residents with mobility aids; give right of way.",
      "Remain calm and courteous; do not engage in personal care.",
      "Equipment never left where a resident could access or trip on it.",
    ],
    L: 2, S: 3, add: "Care staff to advise of any residents requiring particular awareness.",
  },
  {
    hazard: "Sharps / Cuts (staples & paper fixings)",
    who: "Engineers",
    controls: [
      "Use proper staple removers; do not pull staples by hand.",
      "Removed staples/clips collected into a lidded container and disposed of safely.",
      "First aid kit accessible; report and treat any cuts immediately.",
    ],
    L: 2, S: 2, add: "Provide sharps-safe container. Cut-resistant finger guards available if required.",
  },
  {
    hazard: "Display Screen Equipment / Repetitive Tasks",
    who: "Engineers",
    controls: [
      "Set up a suitable workstation with adequate lighting and seating.",
      "Take regular breaks from scanning/screen work.",
      "Vary tasks to avoid prolonged repetitive movements.",
    ],
    L: 2, S: 2, add: "Adjustable seating requested from home where available.",
  },
  {
    hazard: "Hazardous Substances (COSHH)",
    who: "Engineers, staff",
    controls: [
      "Minimal substances used on site (e.g. screen/cleaning wipes, toner).",
      "Toner cartridges handled per manufacturer guidance; no dust dispersal.",
      "No cleaning chemicals stored or used near residents.",
    ],
    L: 1, S: 2, add: "COSHH data sheets available on request.",
  },
  {
    hazard: "Lone Working",
    who: "Engineers",
    controls: [
      "Sign in and out via the care home's visitor system.",
      "Named site contact aware of engineer's presence and location.",
      "Mobile phone carried at all times; check-in procedure agreed.",
    ],
    L: 2, S: 3, add: "Engineers work in pairs where practicable on larger sites.",
  },
  {
    hazard: "Confidentiality & Data Protection (UK GDPR)",
    who: "Residents (data subjects), Client",
    controls: [
      "Records treated as Special Category Data; handled only as needed for scanning/QA.",
      "Documents never left unattended or accessible to unauthorised persons.",
      "No photographs of residents or records taken on personal devices.",
      "Data processed on site only; secure deletion of local copies after upload.",
    ],
    L: 2, S: 4, add: "Data Processing Agreement in place. Confidentiality maintained indefinitely.",
  },
  {
    hazard: "Violence / Aggression / Challenging Behaviour",
    who: "Engineers, staff",
    controls: [
      "Work away from residents who may display distress or challenging behaviour.",
      "Do not attempt to manage resident behaviour; summon care staff.",
      "Remain calm; withdraw from any situation of risk and alert staff.",
    ],
    L: 1, S: 3, add: "Care staff to advise of areas to avoid. De-escalation left to trained home staff.",
  },
];

function ListBlock({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((t, i) => (
        <View key={i} style={s.listItem}>
          <Text style={s.listBullet}>•</Text>
          <Text style={s.listText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

function InfoRow({ label1, val1, label2, val2, last }: { label1: string; val1: string; label2: string; val2: string; last?: boolean }) {
  return (
    <View style={last ? s.infoRowLast : s.infoRow}>
      <Text style={s.infoLabel}>{label1}</Text>
      <Text style={s.infoVal}>{val1}</Text>
      <Text style={[s.infoLabel, { borderLeft: `1 solid ${RULE}` }]}>{label2}</Text>
      <Text style={s.infoVal}>{val2}</Text>
    </View>
  );
}

export function RiskAssessmentPDF(p: RiskAssessmentPDFProps) {
  const created  = p.createdAt ? new Date(p.createdAt) : new Date();
  const dateFmt  = created.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const review   = new Date(created.getTime()); review.setFullYear(review.getFullYear() + 1);
  const reviewFmt = review.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const startFmt = p.startDate ? new Date(p.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "To be agreed";
  const siteName = p.careHomeName || p.clientName;
  const siteAddr = p.careHomeAddress || p.clientAddress || "To be confirmed";
  const ref      = p.id.slice(-8).toUpperCase();

  return (
    <Document title={`Risk Assessment — ${siteName}`} author="ScanVault" creator="ScanVault" producer="ScanVault">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text><Text style={s.brandScan}>Scan</Text><Text style={s.brandVault}>Vault</Text></Text>
            <Text style={s.headerSub}>Company Registration No. 17229057{"\n"}kevin@scanvault.co.uk  |  scanvault.co.uk</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerSub}>RA Reference: RA-{ref}{"\n"}Date: {dateFmt}</Text>
          </View>
        </View>

        <Text style={s.docTitle}>SITE-SPECIFIC RISK ASSESSMENT</Text>
        <Text style={s.docSubtitle}>On-Site Document Scanning &amp; Archiving in a Care Home Environment</Text>

        {/* Assessment details */}
        <View style={s.infoBox}>
          <InfoRow label1="Care Home / Site" val1={siteName} label2="Client / Operator" val2={p.clientName} />
          <InfoRow label1="Site Address" val1={siteAddr} label2="Activity Assessed" val2="On-site scanning, document preparation & archiving" />
          <InfoRow label1="Assessor" val1={p.assessorName || "Kevin Quirk"} label2="Assessment Date" val2={dateFmt} />
          <InfoRow label1="Work Start Date" val1={startFmt} label2="Review Date" val2={reviewFmt} last />
        </View>

        <Text style={s.body}>
          This risk assessment identifies the significant hazards associated with ScanVault carrying out on-site document
          scanning and archiving works within a care home environment, and the control measures in place to reduce the
          risk to persons affected. It must be read and signed by both ScanVault and a representative of the care home
          prior to commencement of works, in accordance with the Management of Health and Safety at Work Regulations 1999.
        </Text>

        {/* Risk matrix legend */}
        <Text style={s.sectionNumber}>RISK RATING = LIKELIHOOD (L, 1–5) × SEVERITY (S, 1–5)</Text>
        <View style={s.legendRow}>
          <View style={s.legendItem}><View style={[s.legendSwatch, { backgroundColor: GREEN }]} /><Text style={s.legendText}>Low (1–7): acceptable, monitor</Text></View>
          <View style={s.legendItem}><View style={[s.legendSwatch, { backgroundColor: AMBER }]} /><Text style={s.legendText}>Medium (8–14): additional controls required</Text></View>
          <View style={s.legendItem}><View style={[s.legendSwatch, { backgroundColor: BRAND_RED }]} /><Text style={s.legendText}>High (15–25): stop / immediate action</Text></View>
        </View>

        {/* Hazard table */}
        <View style={s.tHead}>
          <Text style={[s.tHeadCell, s.cHazard]}>Hazard</Text>
          <Text style={[s.tHeadCell, s.cWho]}>Who is at risk</Text>
          <Text style={[s.tHeadCell, s.cControl]}>Existing control measures</Text>
          <Text style={[s.tHeadCell, s.cL]}>L</Text>
          <Text style={[s.tHeadCell, s.cS]}>S</Text>
          <Text style={[s.tHeadCell, s.cRisk]}>Risk</Text>
          <Text style={[s.tHeadCell, s.cAdd]}>Additional controls</Text>
        </View>
        {HAZARDS.map((h, i) => {
          const risk = h.L * h.S;
          return (
            <View key={i} style={i % 2 ? s.tRowAlt : s.tRow} wrap={false}>
              <Text style={[s.tCellBold, s.cHazard]}>{h.hazard}</Text>
              <Text style={[s.tCell, s.cWho]}>{h.who}</Text>
              <View style={s.cControl}>
                <View style={{ padding: 4 }}>
                  {h.controls.map((c, j) => (
                    <View key={j} style={{ flexDirection: "row", marginBottom: 1.5 }}>
                      <Text style={{ fontSize: 7, color: BRAND_RED, width: 7 }}>•</Text>
                      <Text style={{ fontSize: 7, color: MID, flex: 1, lineHeight: 1.35 }}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={[s.tCell, s.cL, { textAlign: "center" }]}>{h.L}</Text>
              <Text style={[s.tCell, s.cS, { textAlign: "center" }]}>{h.S}</Text>
              <View style={[s.cRisk, { padding: 3, justifyContent: "center" }]}>
                <Text style={[s.riskChip, { backgroundColor: riskColour(risk) }]}>{risk} {riskLabel(risk)}</Text>
              </View>
              <Text style={[s.tCell, s.cAdd]}>{h.add}</Text>
            </View>
          );
        })}

        {/* Safe system of work */}
        <Text style={s.sectionNumber}>SAFE SYSTEM OF WORK / METHOD STATEMENT</Text>
        <ListBlock items={[
          "On arrival, report to reception, sign in via the visitor system and receive a site induction covering fire exits, assembly point, welfare facilities and any resident-specific precautions.",
          "Wear photographic company ID and lanyard, plus any PPE required by the home, at all times.",
          "Set up a designated work area agreed with the home, away from resident living and communal areas where possible.",
          "Keep all boxes, cables and equipment tidy and clear of walkways, fire exits and resident routes throughout.",
          "Handle all records as confidential Special Category Data; never leave documents unattended.",
          "Take regular breaks and use correct manual handling techniques for archive boxes.",
          "In the event of a fire alarm or emergency, cease work immediately and follow the instructions of care home staff.",
          "Report any accident, near miss, safeguarding or security concern to the care home manager and record it before leaving site.",
          "On completion, remove all equipment and waste, restore the area, and sign out.",
        ]} />

        {/* Emergency & compliance */}
        <Text style={s.sectionNumber}>EMERGENCY ARRANGEMENTS &amp; COMPLIANCE</Text>
        <ListBlock items={[
          "First Aid: ScanVault engineers carry a personal first aid kit; the care home's first aiders and emergency procedures take precedence on site.",
          "Accident Reporting: Any injury or dangerous occurrence recorded in the home's accident book and reported to ScanVault management; RIDDOR-reportable incidents notified to the HSE.",
          "Insurance: ScanVault holds Public Liability and Professional Indemnity insurance; certificates available on request.",
          "Personnel: All engineers are briefed on safeguarding and infection control prior to attendance.",
          "This assessment is reviewed annually, or sooner following any incident, near miss, or significant change to the site or activity.",
        ]} />

        {/* Declaration */}
        <Text style={s.sectionNumber}>DECLARATION</Text>
        <Text style={[s.body, { marginBottom: 10 }]}>
          The undersigned confirm that this risk assessment has been read, understood and agreed. ScanVault will carry out
          the works in accordance with the control measures above, and the care home has advised ScanVault of any additional
          site-specific hazards or precautions.
        </Text>
        <View style={s.sigRow}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>ScanVault — Assessor</Text>
            <View style={s.sigLine} />
            <Text style={s.sigSub}>Name: {p.assessorName || "Kevin Quirk"}</Text>
            <Text style={s.sigSub}>Title: Director</Text>
            <Text style={s.sigSub}>Signature / Date: ____________________</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>{siteName.toUpperCase()} — Representative</Text>
            <View style={s.sigLine} />
            <Text style={s.sigSub}>Name: ____________________</Text>
            <Text style={s.sigSub}>Title: ____________________</Text>
            <Text style={s.sigSub}>Signature / Date: ____________________</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>ScanVault — Risk Assessment — RA-{ref} — CONFIDENTIAL</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
