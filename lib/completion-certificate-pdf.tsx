import React from "react";
import {
  Document, Page, Text, View, StyleSheet,
} from "@react-pdf/renderer";

export interface WorkItem {
  description: string;
  quantity: string;
  unit: string;
}

const BRAND_RED = "#dc2626";
const DARK      = "#111827";
const MID       = "#374151";
const LIGHT     = "#6b7280";
const RULE      = "#e5e7eb";
const GREEN     = "#15803d";
const GREEN_BG  = "#f0fdf4";
const GREEN_BOR = "#16a34a";

const s = StyleSheet.create({
  page:         { fontFamily: "Helvetica", fontSize: 9.5, color: MID, paddingTop: 50, paddingBottom: 60, paddingHorizontal: 50 },
  header:       { marginBottom: 24, paddingBottom: 14, borderBottom: `2 solid ${BRAND_RED}`, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  brandScan:    { fontSize: 20, fontFamily: "Helvetica-Bold", color: DARK },
  brandVault:   { fontSize: 20, fontFamily: "Helvetica-Bold", color: BRAND_RED },
  headerSub:    { fontSize: 7.5, color: LIGHT },
  headerRight:  { textAlign: "right" },

  certBadge:    { alignItems: "center", marginBottom: 20 },
  certTitle:    { fontSize: 22, fontFamily: "Helvetica-Bold", color: DARK, textAlign: "center", letterSpacing: 1 },
  certSub:      { fontSize: 10, color: LIGHT, textAlign: "center", marginTop: 3 },
  certBorder:   { border: `2 solid ${GREEN_BOR}`, borderRadius: 6, padding: 16, marginVertical: 14, backgroundColor: GREEN_BG },
  certStmt:     { fontSize: 11, fontFamily: "Helvetica-Bold", color: GREEN, textAlign: "center", lineHeight: 1.6 },

  partiesRow:   { flexDirection: "row", gap: 16, marginBottom: 16 },
  partyBox:     { flex: 1, backgroundColor: "#f9fafb", padding: 10, borderRadius: 4, border: `1 solid ${RULE}` },
  partyLabel:   { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: BRAND_RED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  partyName:    { fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  partyDetail:  { fontSize: 8.5, color: MID, lineHeight: 1.5 },

  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: BRAND_RED, marginTop: 14, marginBottom: 6 },
  body:         { lineHeight: 1.65, marginBottom: 4 },
  bold:         { fontFamily: "Helvetica-Bold", color: DARK },
  rule:         { borderBottom: `1 solid ${RULE}`, marginVertical: 10 },

  infoBox:      { border: `1 solid ${RULE}`, borderRadius: 4, marginBottom: 12 },
  infoRow:      { flexDirection: "row", borderBottom: `1 solid ${RULE}` },
  infoRowLast:  { flexDirection: "row" },
  infoLabel:    { width: "32%", backgroundColor: "#f9fafb", padding: 6, fontFamily: "Helvetica-Bold", color: DARK, fontSize: 8.5 },
  infoVal:      { width: "68%", padding: 6, fontSize: 8.5, color: MID },

  worksBox:     { backgroundColor: "#f9fafb", padding: 10, borderRadius: 4, border: `1 solid ${RULE}`, marginBottom: 10 },
  worksTitle:   { fontSize: 9, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 4 },
  worksText:    { fontSize: 8.5, color: MID, lineHeight: 1.65 },

  tHead:        { flexDirection: "row", backgroundColor: BRAND_RED, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  tHeadCell:    { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 8, padding: 5 },
  tRow:         { flexDirection: "row", borderBottom: `1 solid ${RULE}` },
  tRowAlt:      { flexDirection: "row", borderBottom: `1 solid ${RULE}`, backgroundColor: "#f9fafb" },
  tCell:        { fontSize: 8.5, padding: 5, color: MID },
  tCellBold:    { fontSize: 8.5, padding: 5, color: DARK, fontFamily: "Helvetica-Bold" },
  tFoot:        { flexDirection: "row", backgroundColor: "#fef2f2", borderTop: `2 solid ${BRAND_RED}` },
  tFootCell:    { fontSize: 8.5, padding: 5, fontFamily: "Helvetica-Bold", color: DARK },
  cDesc:        { width: "60%" },
  cQty:         { width: "20%", textAlign: "center" },
  cUnit:        { width: "20%", textAlign: "center" },

  sigRow:       { flexDirection: "row", gap: 30, marginTop: 30 },
  sigBox:       { flex: 1 },
  sigLabel:     { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  sigLine:      { borderBottom: `1 solid ${DARK}`, marginBottom: 4, paddingBottom: 14 },
  sigSub:       { fontSize: 7.5, color: LIGHT },

  footer:       { position: "absolute", bottom: 28, left: 50, right: 50, flexDirection: "row", justifyContent: "space-between", borderTop: `1 solid ${RULE}`, paddingTop: 6 },
  footerText:   { fontSize: 7.5, color: LIGHT },
});

export interface CompletionCertificatePDFProps {
  certificateNumber: string;
  clientName:        string;
  clientAddress:     string;
  clientContact:     string;
  clientEmail:       string;
  careHomeName:      string;
  careHomeAddress:   string;
  worksDescription:  string;
  workItems:         WorkItem[];
  completionDate:    string;
  assessorName:      string;
  notes:             string;
  createdAt:         string;
}

function fmt(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function CompletionCertificatePDF(props: CompletionCertificatePDFProps) {
  const {
    certificateNumber, clientName, clientAddress, clientContact, clientEmail,
    careHomeName, careHomeAddress, worksDescription, workItems,
    completionDate, assessorName, notes, createdAt,
  } = props;

  const siteName = careHomeName || clientName;

  const certStatement = `This is to certify that Scan Vault Ltd has successfully completed all archiving, digitisation, and document management works at ${siteName}${careHomeAddress ? `, ${careHomeAddress}` : ""} on behalf of ${clientName}. All works have been carried out to the agreed specification and in accordance with GDPR and data protection requirements.`;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text><Text style={s.brandScan}>Scan</Text><Text style={s.brandVault}>Vault</Text></Text>
            <Text style={s.headerSub}>Archiving & Digitisation Services</Text>
            <Text style={s.headerSub}>info@scanvaultltd.co.uk  |  www.scanvaultltd.co.uk</Text>
            <Text style={s.headerSub}>Company Reg: 17229057</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={[s.headerSub, { fontFamily: "Helvetica-Bold", color: DARK }]}>Certificate No.</Text>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: BRAND_RED }}>{certificateNumber}</Text>
            <Text style={s.headerSub}>Issued: {fmt(createdAt)}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={s.certBadge}>
          <Text style={s.certTitle}>CERTIFICATE OF COMPLETION</Text>
          <Text style={s.certSub}>Archiving & Digitisation Works</Text>
        </View>

        {/* Certification statement */}
        <View style={s.certBorder}>
          <Text style={s.certStmt}>{certStatement}</Text>
        </View>

        {/* Parties */}
        <View style={s.partiesRow}>
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Client</Text>
            <Text style={s.partyName}>{clientName}</Text>
            {clientAddress ? <Text style={s.partyDetail}>{clientAddress}</Text> : null}
            {clientContact ? <Text style={s.partyDetail}>{clientContact}</Text> : null}
            {clientEmail   ? <Text style={s.partyDetail}>{clientEmail}</Text>   : null}
          </View>
          {careHomeName ? (
            <View style={s.partyBox}>
              <Text style={s.partyLabel}>Site / Care Home</Text>
              <Text style={s.partyName}>{careHomeName}</Text>
              {careHomeAddress ? <Text style={s.partyDetail}>{careHomeAddress}</Text> : null}
            </View>
          ) : null}
          <View style={s.partyBox}>
            <Text style={s.partyLabel}>Service Provider</Text>
            <Text style={s.partyName}>Scan Vault Ltd</Text>
            <Text style={s.partyDetail}>info@scanvaultltd.co.uk</Text>
            <Text style={s.partyDetail}>www.scanvaultltd.co.uk</Text>
            <Text style={s.partyDetail}>Company Reg: 17229057</Text>
          </View>
        </View>

        {/* Key Details */}
        <Text style={s.sectionTitle}>Completion Details</Text>
        <View style={s.infoBox}>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Date of Completion</Text>
            <Text style={s.infoVal}>{fmt(completionDate)}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Assessor / Supervisor</Text>
            <Text style={s.infoVal}>{assessorName || "Kevin Quirk"}</Text>
          </View>
          <View style={s.infoRowLast}>
            <Text style={s.infoLabel}>Certificate Number</Text>
            <Text style={s.infoVal}>{certificateNumber}</Text>
          </View>
        </View>

        {/* Works Completed — structured table */}
        <Text style={s.sectionTitle}>Works Carried Out at {siteName}</Text>
        {workItems && workItems.length > 0 ? (
          <View style={{ border: `1 solid ${RULE}`, borderRadius: 4, marginBottom: 10 }}>
            <View style={s.tHead}>
              <Text style={[s.tHeadCell, s.cDesc]}>Description of Work</Text>
              <Text style={[s.tHeadCell, s.cQty]}>Amount / Size</Text>
              <Text style={[s.tHeadCell, s.cUnit]}>Unit</Text>
            </View>
            {workItems.map((item, i) => (
              <View key={i} style={i % 2 === 0 ? s.tRow : s.tRowAlt}>
                <Text style={[s.tCell, s.cDesc]}>{item.description}</Text>
                <Text style={[s.tCellBold, s.cQty]}>{item.quantity}</Text>
                <Text style={[s.tCell, s.cUnit]}>{item.unit}</Text>
              </View>
            ))}
            <View style={s.tFoot}>
              <Text style={[s.tFootCell, s.cDesc]}>Total Line Items</Text>
              <Text style={[s.tFootCell, s.cQty]}>{workItems.length}</Text>
              <Text style={[s.tFootCell, s.cUnit]}> </Text>
            </View>
          </View>
        ) : null}

        {/* Optional free-text overview */}
        {worksDescription ? (
          <>
            <Text style={s.sectionTitle}>Additional Works Description</Text>
            <View style={s.worksBox}>
              <Text style={s.worksText}>{worksDescription}</Text>
            </View>
          </>
        ) : null}

        {/* Notes */}
        {notes ? (
          <>
            <Text style={s.sectionTitle}>Notes</Text>
            <Text style={s.body}>{notes}</Text>
          </>
        ) : null}

        <View style={s.rule} />

        {/* Signatures */}
        <View style={s.sigRow}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Authorised by (Scan Vault Ltd)</Text>
            <View style={s.sigLine} />
            <Text style={s.sigSub}>{assessorName || "Kevin Quirk"}  –  Scan Vault Ltd</Text>
            <Text style={s.sigSub}>Date: ____________________</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Received by (Client)</Text>
            <View style={s.sigLine} />
            <Text style={s.sigSub}>{clientName}</Text>
            <Text style={s.sigSub}>Date: ____________________</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Scan Vault Ltd  ·  Company Reg: 17229057  ·  info@scanvaultltd.co.uk</Text>
          <Text style={s.footerText}>Certificate {certificateNumber}</Text>
        </View>

      </Page>
    </Document>
  );
}
