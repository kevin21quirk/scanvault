import React from "react";
import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";

const BRAND_RED = "#dc2626";
const DARK      = "#111827";
const MID       = "#374151";
const LIGHT     = "#6b7280";
const RULE      = "#e5e7eb";

const s = StyleSheet.create({
  page:          { fontFamily: "Helvetica", fontSize: 9.5, color: MID, paddingTop: 50, paddingBottom: 60, paddingHorizontal: 50 },
  header:        { marginBottom: 24, paddingBottom: 14, borderBottom: `2 solid ${BRAND_RED}`, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  brandScan:     { fontSize: 20, fontFamily: "Helvetica-Bold", color: DARK },
  brandVault:    { fontSize: 20, fontFamily: "Helvetica-Bold", color: BRAND_RED },
  headerRight:   { textAlign: "right" },
  headerSub:     { fontSize: 7.5, color: LIGHT },
  docTitle:      { fontSize: 13, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "center", marginBottom: 4 },
  docSubtitle:   { fontSize: 9, color: LIGHT, textAlign: "center", marginBottom: 20 },
  partiesRow:    { flexDirection: "row", gap: 20, marginBottom: 20 },
  partyBox:      { flex: 1, backgroundColor: "#f9fafb", padding: 10, borderRadius: 4, border: `1 solid ${RULE}` },
  partyLabel:    { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: BRAND_RED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  partyName:     { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  partyDetail:   { fontSize: 8.5, color: MID, lineHeight: 1.5 },
  sectionNumber: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BRAND_RED, marginTop: 16, marginBottom: 6 },
  clauseNum:     { fontFamily: "Helvetica-Bold", color: DARK },
  body:          { lineHeight: 1.65, marginBottom: 4 },
  indent:        { marginLeft: 14, lineHeight: 1.65, marginBottom: 3 },
  rule:          { borderBottom: `1 solid ${RULE}`, marginVertical: 12 },
  priceBox:      { backgroundColor: "#fef2f2", padding: 10, borderRadius: 4, borderLeft: `3 solid ${BRAND_RED}`, marginBottom: 10 },
  priceTitle:    { fontSize: 9, fontFamily: "Helvetica-Bold", color: BRAND_RED, marginBottom: 3 },
  priceVal:      { fontSize: 13, fontFamily: "Helvetica-Bold", color: DARK },
  priceSub:      { fontSize: 8, color: LIGHT, marginTop: 2 },
  sigRow:        { flexDirection: "row", gap: 30, marginTop: 30 },
  sigBox:        { flex: 1 },
  sigLabel:      { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  sigLine:       { borderBottom: `1 solid ${DARK}`, marginBottom: 4, paddingBottom: 12 },
  sigSub:        { fontSize: 7.5, color: LIGHT },
  footer:        { position: "absolute", bottom: 28, left: 50, right: 50, flexDirection: "row", justifyContent: "space-between", borderTop: `1 solid ${RULE}`, paddingTop: 6 },
  footerText:    { fontSize: 7.5, color: LIGHT },
});

export interface ContractPDFProps {
  id:             string;
  title:          string;
  clientName:     string;
  clientAddress:  string;
  clientContact:  string;
  clientEmail:    string;
  pricePerBox:    number;
  estimatedBoxes: number | null;
  startDate:      string;
  createdAt:      string;
  notes:          string;
}

function Clause({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={s.body}>
        <Text style={s.clauseNum}>{num}  </Text>{children}
      </Text>
    </View>
  );
}

function SubClause({ letter, children }: { letter: string; children: React.ReactNode }) {
  return (
    <Text style={s.indent}>
      ({letter})  {children}
    </Text>
  );
}

export function ContractPDF(p: ContractPDFProps) {
  const created   = p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const startFmt  = p.startDate  ? new Date(p.startDate).toLocaleDateString("en-GB",  { day: "numeric", month: "long", year: "numeric" }) : "To be agreed";
  const estimated = p.estimatedBoxes ? `${p.estimatedBoxes} boxes (estimated)` : "To be confirmed";
  const totalEst  = p.estimatedBoxes ? `£${(p.estimatedBoxes * p.pricePerBox).toLocaleString("en-GB")}` : "To be confirmed";

  return (
    <Document title={p.title} author="ScanVault" creator="ScanVault" producer="ScanVault">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text><Text style={s.brandScan}>Scan</Text><Text style={s.brandVault}>Vault</Text></Text>
            <Text style={s.headerSub}>Company Registration No. 17229057{"\n"}kevin@scanvault.co.uk  |  scanvault.co.uk</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerSub}>Agreement Reference: {p.id.slice(-8).toUpperCase()}{"\n"}Dated: {created}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={s.docTitle}>DOCUMENT SCANNING AND ARCHIVING SERVICES AGREEMENT</Text>
        <Text style={s.docSubtitle}>Care Home Archive Management — Confidential</Text>

        {/* Parties */}
        <View style={s.partiesRow}>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Service Provider</Text>
            <Text style={s.partyName}>ScanVault</Text>
            <Text style={s.partyDetail}>
              Company Reg. No. 17229057{"\n"}
              kevin@scanvault.co.uk{"\n"}
              scanvault.co.uk{"\n"}
              England and Wales
            </Text>
          </View>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Client</Text>
            <Text style={s.partyName}>{p.clientName}</Text>
            <Text style={s.partyDetail}>
              {p.clientAddress || "Address to be provided"}{"\n"}
              {p.clientContact ? `Contact: ${p.clientContact}` : ""}{"\n"}
              {p.clientEmail || ""}
            </Text>
          </View>
        </View>

        <Text style={s.body}>
          This Document Scanning and Archiving Services Agreement ("Agreement") is entered into as of <Text style={s.clauseNum}>{created}</Text> between ScanVault ("Service Provider") and <Text style={s.clauseNum}>{p.clientName}</Text> ("The Client"). Both parties agree to be bound by the terms set out below.
        </Text>

        {/* Section 1 */}
        <Text style={s.sectionNumber}>1.  DEFINITIONS</Text>
        <Clause num="1.1">"Archive Box" means a standard archive box (approximately 30cm × 40cm × 26cm or equivalent) containing documents submitted for scanning.</Clause>
        <Clause num="1.2">"Certificate of Destruction" means the official certificate issued by Shred-IT confirming the secure and compliant destruction of physical documents.</Clause>
        <Clause num="1.3">"Digital Records" means the scanned digital copies of the Client's physical documents produced during the Services.</Clause>
        <Clause num="1.4">"SharePoint" means the Microsoft SharePoint environment designated by the Client to receive Digital Records.</Clause>
        <Clause num="1.5">"Shred-IT" means the third-party secure destruction provider who will attend the Client's premises directly and collect physical documents in a locked vehicle for secure, certified destruction. ScanVault does not transport physical documents at any point.</Clause>
        <Clause num="1.6">"Special Category Data" has the meaning given in Article 9 of the UK General Data Protection Regulation (UK GDPR).</Clause>

        {/* Section 2 */}
        <Text style={s.sectionNumber}>2.  SCOPE OF SERVICES</Text>
        <Text style={s.body}>ScanVault agrees to provide the following services ("Services") to the Client:</Text>

        <Clause num="2.1">Pre-Work Site Visit and Risk Assessment — A site visit will be conducted prior to commencement. A written risk assessment will be prepared and agreed and signed by both parties before any work begins.</Clause>
        <Clause num="2.2">Document Preparation — De-stapling and removal of all metal and paper fixings; organisation and sequencing of documents as specified by the Client; preparation of documents to a scannable standard.</Clause>
        <Clause num="2.3">High-Resolution Scanning — All documents will be scanned on-site at the Client's premises at a minimum of 300 DPI (colour or greyscale as appropriate). Default document naming conventions will be applied to all scanned files. Quality assurance checks will be performed to confirm legibility and completeness of every page. No Microsoft Power Automate or AI Builder processing is required or included within this Agreement.</Clause>
        <Clause num="2.4">Digital Delivery via SharePoint — All Digital Records will be uploaded directly to the Client's Microsoft SharePoint environment via the agreed SharePoint location configured on each on-site scanner. Written confirmation of successful upload will be provided upon completion.</Clause>
        <Clause num="2.5">Technical SharePoint Configuration — The following agreed technical configuration will apply:</Clause>
        <SubClause letter="a">An Admin folder will be created within SharePoint for each care home location to store all digital records produced under this Agreement.</SubClause>
        <SubClause letter="b">Euro Digital will configure the SharePoint destination location on each location-based scanner prior to scanning commencing.</SubClause>
        <SubClause letter="c">Documents will be scanned under the Archive account, which will be set up by H2O. This account will have a direct link to the Admin share folder in the relevant SharePoint location.</SubClause>
        <SubClause letter="d">Default scanning document names will be used throughout. No custom naming, Power Automate workflows, or AI Builder processes are required.</SubClause>
        <Clause num="2.6">Secure Destruction via Shred-IT — Upon completion of scanning and written confirmation of successful digital delivery, ScanVault will arrange for Shred-IT to attend the Client's premises directly. Shred-IT will collect all physical documents and archive boxes/bags from the premises in a locked, secure vehicle for confidential destruction. ScanVault does not remove or transport any physical documents from the Client's premises at any point. The Client will receive a Certificate of Destruction from Shred-IT confirming secure and compliant disposal of all collected materials.</Clause>

        <View style={s.rule} />

        {/* Section 3 */}
        <Text style={s.sectionNumber}>3.  SAFEGUARDING, DATA PROTECTION AND CONFIDENTIALITY</Text>
        <Clause num="3.1">UK GDPR Compliance — ScanVault operates in full compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. All personal data processed during the Services will be handled lawfully, fairly, and transparently, and only to the extent necessary to deliver the Services.</Clause>
        <Clause num="3.2">Care Home Patient Safeguarding and Special Category Data — Recognising that the Client operates care home facilities regulated by the Care Quality Commission (CQC), and that records processed under this Agreement may relate to vulnerable adults, ScanVault acknowledges the heightened duty of care and commits to:</Clause>
        <SubClause letter="a">Treating all resident and patient data as Special Category Data under Article 9 of the UK GDPR, including health records, care plans, medication records, and other personal care documentation.</SubClause>
        <SubClause letter="b">Implementing appropriate technical and organisational security measures to protect the confidentiality, integrity, and availability of all records at all times whilst on the Client's premises.</SubClause>
        <SubClause letter="c">Ensuring all ScanVault personnel conduct themselves in a manner consistent with the safeguarding of vulnerable adults whilst working on the Client's premises, and adhering to any safeguarding policies brought to their attention by the Client.</SubClause>
        <SubClause letter="d">Treating all resident care records, medical documentation, care plans, and personal information with the utmost respect and discretion, recognising the sensitivity and dignity of the individuals to whom such records relate.</SubClause>
        <SubClause letter="e">Not accessing, reading, copying, or otherwise using the content of any patient or resident records beyond the minimum extent strictly necessary for the purpose of scanning and quality assurance.</SubClause>
        <SubClause letter="f">Processing data solely for the purpose of delivering the Services and for no other purpose whatsoever.</SubClause>
        <Clause num="3.3">CQC Record-Keeping Compliance — ScanVault will ensure all Digital Records produced are complete, legible, and organised in a manner that supports the Client's ongoing regulatory obligations to the CQC, including compliance with the Health and Social Care Act 2008 (Regulated Activities) Regulations 2014.</Clause>
        <Clause num="3.4">Data Processing Agreement — For the purposes of UK GDPR, this Agreement constitutes a Data Processing Agreement between the Client (as Data Controller) and ScanVault (as Data Processor). ScanVault will not sub-process any personal data except as necessary to engage Shred-IT for the purpose of secure destruction.</Clause>
        <Clause num="3.5">Confidentiality — Both parties agree to maintain strict confidentiality in respect of all information, records, and data encountered during the performance of this Agreement. This obligation shall survive the termination of this Agreement indefinitely.</Clause>
        <Clause num="3.6">Data Breach — In the event of a suspected or confirmed data breach, ScanVault will notify the Client without undue delay and in any event within 72 hours of becoming aware, and will cooperate fully with any investigation.</Clause>

        <View style={s.rule} />

        {/* Section 4 */}
        <Text style={s.sectionNumber}>4.  DOCUMENT HANDLING AND CHAIN OF CUSTODY</Text>
        <Clause num="4.1">On-Site Working — All scanning and document preparation activities are carried out entirely at the Client's premises. Physical documents will not be removed from the Client's premises by ScanVault at any point during the provision of the Services.</Clause>
        <Clause num="4.2">Document Access Record — Upon commencing work, ScanVault will prepare a written record of the number and condition of archive boxes/bags to be processed. This will be signed by a representative of both parties.</Clause>
        <Clause num="4.3">Handling Standards — All documents will be handled with care at all times. ScanVault will not leave documents unattended or accessible to unauthorised persons whilst on the Client's premises.</Clause>
        <Clause num="4.4">Custody Log — ScanVault will maintain a full log of all archive boxes processed, from initial access through scanning and quality assurance until handover to Shred-IT. This log will be made available to the Client upon request.</Clause>
        <Clause num="4.5">Shred-IT Handover — Following written confirmation of successful digital delivery, ScanVault will arrange for Shred-IT to attend the premises. At the point of Shred-IT collection, responsibility for the physical documents transfers from the Client to Shred-IT. Any documents the Client wishes to retain must be clearly identified to ScanVault before scanning commences.</Clause>

        <View style={s.rule} />

        {/* Section 5 — Pricing */}
        <Text style={s.sectionNumber}>5.  PRICING AND PAYMENT</Text>
        <View style={s.priceBox}>
          <Text style={s.priceTitle}>AGREED RATE</Text>
          <Text style={s.priceVal}>£{p.pricePerBox.toFixed(2)} per Archive Box</Text>
          <Text style={s.priceSub}>Estimated volume: {estimated}   |   Estimated total: {totalEst}</Text>
        </View>
        <Clause num="5.1">The agreed price for the Services is <Text style={s.clauseNum}>£{p.pricePerBox.toFixed(2)} (£{p.pricePerBox.toLocaleString("en-GB", { minimumFractionDigits: 2 })} per Archive Box)</Text>. The final invoice will reflect the actual number of boxes processed.</Clause>
        <Clause num="5.2">Volume — An estimated number of boxes will be agreed in writing prior to commencement. Any material variation (greater than 10%) in actual volume will be notified to the Client before work proceeds.</Clause>
        <Clause num="5.3">Invoicing — ScanVault will issue an invoice upon completion of the Services. Payment is due within 30 days of the invoice date.</Clause>
        <Clause num="5.4">Payment Method — Payment is accepted by bank transfer to the details provided on the invoice.</Clause>
        <Clause num="5.5">Late Payment — Overdue invoices may attract statutory interest under the Late Payment of Commercial Debts (Interest) Act 1998.</Clause>
        <Clause num="5.6">Additional Services — Any services outside the scope of this Agreement will be quoted and agreed in writing before being carried out. The agreed day rate is £{p.pricePerBox.toFixed(2)} per archive box unless otherwise stated.</Clause>

        <View style={s.rule} />

        {/* Section 6 */}
        <Text style={s.sectionNumber}>6.  CLIENT OBLIGATIONS</Text>
        <Text style={s.body}>The Client agrees to:</Text>
        <Clause num="6.1">Provide reasonable access to the premises for ScanVault personnel to carry out scanning activities at agreed times, and for Shred-IT to attend the premises for collection of physical documents post-scanning.</Clause>
        <Clause num="6.2">Ensure archive boxes are clearly labelled and accessible prior to collection.</Clause>
        <Clause num="6.3">Provide valid SharePoint access credentials to ScanVault in advance of the digital upload stage.</Clause>
        <Clause num="6.4">Nominate a named point of contact for the duration of the project who has authority to make decisions on the Client's behalf.</Clause>
        <Clause num="6.5">Notify ScanVault in writing of any documents or boxes that are to be excluded from the destruction process before collection takes place.</Clause>
        <Clause num="6.6">Ensure that ScanVault has the necessary authorisation to process the personal data contained within the archive boxes.</Clause>

        <View style={s.rule} />

        {/* Section 7 */}
        <Text style={s.sectionNumber}>7.  INTELLECTUAL PROPERTY AND OWNERSHIP</Text>
        <Clause num="7.1">All Digital Records produced from the scanning of the Client's physical documents remain the exclusive property of the Client. ScanVault acquires no rights, title, or interest in any document, record, or data belonging to the Client.</Clause>
        <Clause num="7.2">ScanVault will not retain copies of any Digital Records beyond the period necessary to complete the upload and quality assurance process, after which all local copies will be securely deleted.</Clause>

        <View style={s.rule} />

        {/* Section 8 */}
        <Text style={s.sectionNumber}>8.  LIABILITY AND INSURANCE</Text>
        <Clause num="8.1">ScanVault will exercise reasonable professional skill and care in the provision of all Services.</Clause>
        <Clause num="8.2">ScanVault's aggregate liability to the Client for any loss or damage arising from or in connection with the Services shall not exceed the total value of the contract as invoiced.</Clause>
        <Clause num="8.3">ScanVault accepts no liability for damage to documents that were already in a deteriorated, fragile, or poor condition prior to collection, provided that such condition is noted on the collection receipt.</Clause>
        <Clause num="8.4">Both parties agree to maintain appropriate business liability insurance throughout the duration of this Agreement. Evidence of such insurance will be provided upon request.</Clause>
        <Clause num="8.5">Neither party shall be liable for any indirect, consequential, or special loss arising under or in connection with this Agreement.</Clause>

        <View style={s.rule} />

        {/* Section 9 */}
        <Text style={s.sectionNumber}>9.  COMMENCEMENT AND DURATION</Text>
        <Clause num="9.1">Work is scheduled to commence on or around <Text style={s.clauseNum}>{startFmt}</Text>, subject to satisfactory completion of the pre-work risk assessment and agreement by both parties.</Clause>
        <Clause num="9.2">The Agreement will remain in force until all Services have been completed, the Certificate of Destruction has been received, and the final invoice has been settled in full.</Clause>

        <View style={s.rule} />

        {/* Section 10 */}
        <Text style={s.sectionNumber}>10.  TERMINATION</Text>
        <Clause num="10.1">Either party may terminate this Agreement with 14 days' written notice, provided work has not yet commenced.</Clause>
        <Clause num="10.2">Once work has commenced, termination by the Client will be subject to payment for all work completed to the date of termination, calculated on a pro-rata per-box basis.</Clause>
        <Clause num="10.3">ScanVault may suspend or immediately terminate this Agreement in the event of non-payment of an overdue invoice, subject to 7 days' written notice.</Clause>

        <View style={s.rule} />

        {/* Section 11 */}
        <Text style={s.sectionNumber}>11.  GOVERNING LAW AND DISPUTES</Text>
        <Clause num="11.1">This Agreement shall be governed by and construed in accordance with the laws of England and Wales.</Clause>
        <Clause num="11.2">In the event of any dispute, the parties agree to first attempt resolution through good-faith negotiation. If unresolved within 30 days, either party may refer the matter to mediation before commencing legal proceedings.</Clause>
        <Clause num="11.3">The parties submit to the exclusive jurisdiction of the courts of England and Wales.</Clause>

        <View style={s.rule} />

        {/* Section 12 */}
        <Text style={s.sectionNumber}>12.  GENERAL</Text>
        <Clause num="12.1">Entire Agreement — This document constitutes the entire agreement between the parties in respect of the subject matter herein and supersedes all prior negotiations, representations, or understandings.</Clause>
        <Clause num="12.2">Variation — Any variation to this Agreement must be agreed in writing and signed by both parties.</Clause>
        <Clause num="12.3">Severability — If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</Clause>
        <Clause num="12.4">Force Majeure — Neither party shall be liable for any failure to perform its obligations where such failure is caused by events outside its reasonable control.</Clause>
        {p.notes ? <Clause num="12.5">Additional Notes — {p.notes}</Clause> : null}

        <View style={s.rule} />

        {/* Signatures */}
        <Text style={s.sectionNumber}>13.  SIGNATURES</Text>
        <Text style={[s.body, { marginBottom: 16 }]}>
          By signing below, each party confirms that it has read, understood, and agrees to be bound by this Agreement.
        </Text>

        <View style={s.sigRow}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>FOR AND ON BEHALF OF SCANVAULT (Service Provider)</Text>
            <View style={s.sigLine} />
            <Text style={s.sigSub}>Name: Kevin Quirk</Text>
            <Text style={s.sigSub}>Title: Director</Text>
            <Text style={s.sigSub}>Date: ____________________</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>FOR AND ON BEHALF OF {p.clientName.toUpperCase()} (Client)</Text>
            <View style={s.sigLine} />
            <Text style={s.sigSub}>Name: ____________________</Text>
            <Text style={s.sigSub}>Title: ____________________</Text>
            <Text style={s.sigSub}>Date: ____________________</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>ScanVault — Company Reg. 17229057 — scanvault.co.uk — CONFIDENTIAL</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
