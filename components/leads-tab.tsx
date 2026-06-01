"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail, Phone, Building2, Clock, CheckCircle2, XCircle,
  MessageSquare, FileText, ChevronLeft, ChevronRight, Calendar,
  TrendingUp, Users, MailCheck, Reply,
} from "lucide-react";
import { ReplyModal } from "@/components/reply-modal";

interface Lead {
  id: string;
  type: "CONTACT" | "QUOTE";
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  service: string | null;
  message: string | null;
  emailSent: boolean;
  respondedAt: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function LeadCalendar({ leads }: { leads: Lead[] }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7; // Monday-first

  const contactDays = new Set<string>();
  const quoteDays = new Set<string>();
  const responseDays = new Set<string>();

  leads.forEach((l) => {
    const d = new Date(l.createdAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate().toString();
      if (l.type === "CONTACT") contactDays.add(key);
      else quoteDays.add(key);
    }
    if (l.respondedAt) {
      const r = new Date(l.respondedAt);
      if (r.getFullYear() === year && r.getMonth() === month) {
        responseDays.add(r.getDate().toString());
      }
    }
  });

  const getLeadsForDay = (day: number) => {
    const contacts = leads.filter((l) => {
      const d = new Date(l.createdAt);
      return l.type === "CONTACT" && d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
    const quotes = leads.filter((l) => {
      const d = new Date(l.createdAt);
      return l.type === "QUOTE" && d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
    const responses = leads.filter((l) => {
      if (!l.respondedAt) return false;
      const r = new Date(l.respondedAt);
      return r.getFullYear() === year && r.getMonth() === month && r.getDate() === day;
    });
    return { contacts, quotes, responses };
  };

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <button
          onClick={() => { setViewDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-800 text-sm">{monthName}</span>
        </div>
        <button
          onClick={() => { setViewDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const key = day.toString();
            const isContact = contactDays.has(key);
            const isQuote = quoteDays.has(key);
            const isResponse = responseDays.has(key);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasEvent = isContact || isQuote || isResponse;

            const isSelected = selectedDay === day;

            return (
              <div
                key={i}
                onClick={() => hasEvent ? setSelectedDay(isSelected ? null : day) : undefined}
                className={`
                  relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-lg min-h-[48px]
                  transition-colors
                  ${isSelected ? "bg-gray-900 ring-2 ring-gray-700" : isToday ? "bg-gray-100 ring-1 ring-gray-300" : "hover:bg-gray-50"}
                  ${hasEvent ? "cursor-pointer" : ""}
                `}
              >
                <span className={`text-xs font-medium mb-1 ${isSelected ? "text-white" : isToday ? "text-scanvault-black" : "text-gray-600"}`}>
                  {day}
                </span>
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {isContact && <span className="w-2 h-2 rounded-full bg-red-500" />}
                  {isQuote   && <span className="w-2 h-2 rounded-full bg-orange-400" />}
                  {isResponse && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day detail panel */}
        {selectedDay !== null && (() => {
          const { contacts, quotes, responses } = getLeadsForDay(selectedDay);
          const dateLabel = new Date(year, month, selectedDay).toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
          return (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-800 text-xs">{dateLabel}</span>
                <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 text-xs underline">Close</button>
              </div>
              {contacts.length > 0 && (
                <div className="mb-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Contact {contacts.length === 1 ? "Enquiry" : `Enquiries (${contacts.length})`}
                  </p>
                  {contacts.map((l) => (
                    <div key={l.id} className="ml-3.5 mb-1 text-xs text-gray-700">
                      <span className="font-medium">{l.name}</span>
                      <span className="text-gray-400 ml-1">&bull; {l.email}</span>
                      {l.subject && <span className="text-gray-400 ml-1">&bull; &ldquo;{l.subject}&rdquo;</span>}
                    </div>
                  ))}
                </div>
              )}
              {quotes.length > 0 && (
                <div className="mb-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Quote {quotes.length === 1 ? "Request" : `Requests (${quotes.length})`}
                  </p>
                  {quotes.map((l) => (
                    <div key={l.id} className="ml-3.5 mb-1 text-xs text-gray-700">
                      <span className="font-medium">{l.name}</span>
                      <span className="text-gray-400 ml-1">&bull; {l.email}</span>
                      {l.service && <span className="text-gray-400 ml-1">&bull; {l.service}</span>}
                    </div>
                  ))}
                </div>
              )}
              {responses.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {responses.length === 1 ? "Response Sent" : `Responses Sent (${responses.length})`}
                  </p>
                  {responses.map((l) => (
                    <div key={l.id} className="ml-3.5 mb-1 text-xs text-gray-700">
                      <span className="font-medium">{l.name}</span>
                      <span className="text-gray-400 ml-1">&bull; {l.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Legend */}
        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span className="text-xs text-gray-500">Contact enquiry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
            <span className="text-xs text-gray-500">Quote request</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs text-gray-500">Response sent</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "CONTACT" | "QUOTE">("ALL");
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [replyLead, setReplyLead] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) setLeads(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleReplySent = (id: string) => {
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, respondedAt: new Date().toISOString() } : l));
  };

  const markResponded = async (id: string) => {
    setMarkingId(id);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respondedAt: new Date().toISOString() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      }
    } finally {
      setMarkingId(null);
    }
  };

  const filtered = leads.filter((l) => filter === "ALL" || l.type === filter);
  const unresponded = leads.filter((l) => !l.respondedAt).length;
  const emailsSent = leads.filter((l) => l.emailSent).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-scanvault-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {replyLead && (
        <ReplyModal
          lead={replyLead}
          onClose={() => setReplyLead(null)}
          onSent={handleReplySent}
        />
      )}
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: leads.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Awaiting Response", value: unresponded, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Welcome Emails Sent", value: emailsSent, icon: MailCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Response Rate", value: leads.length ? `${Math.round(((leads.length - unresponded) / leads.length) * 100)}%` : "—", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leads table — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            {(["ALL", "CONTACT", "QUOTE"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-scanvault-red text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "ALL" ? "All" : f === "CONTACT" ? "Contact Enquiries" : "Quote Requests"}
                <span className="ml-1.5 opacity-70">
                  ({f === "ALL" ? leads.length : leads.filter((l) => l.type === f).length})
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card className="border border-gray-100">
              <CardContent className="py-16 text-center text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No leads yet</p>
                <p className="text-sm mt-1">Submissions from the contact and quote forms will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((lead) => (
                <Card
                  key={lead.id}
                  className={`border shadow-sm transition-all ${
                    lead.respondedAt ? "border-gray-100 opacity-80" : "border-l-4 border-l-scanvault-red border-gray-100"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            lead.type === "CONTACT"
                              ? "bg-red-50 text-red-700"
                              : "bg-orange-50 text-orange-700"
                          }`}>
                            {lead.type === "CONTACT"
                              ? <><MessageSquare className="w-3 h-3" /> Contact</>
                              : <><FileText className="w-3 h-3" /> Quote</>
                            }
                          </span>
                          <span className="font-semibold text-gray-900 truncate">{lead.name}</span>
                          {lead.emailSent
                            ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><MailCheck className="w-3 h-3" /> Email sent</span>
                            : <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> No email</span>
                          }
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <a href={`mailto:${lead.email}`} className="hover:text-scanvault-red truncate">{lead.email}</a>
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              {lead.phone}
                            </span>
                          )}
                          {lead.company && (
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              {lead.company}
                            </span>
                          )}
                          {(lead.subject || lead.service) && (
                            <span className="flex items-center gap-1.5 truncate sm:col-span-2">
                              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{lead.subject || lead.service}</span>
                            </span>
                          )}
                        </div>

                        {lead.message && (
                          <p className="text-xs text-gray-500 italic truncate border-t border-gray-50 pt-1 mt-1">
                            &ldquo;{lead.message}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {timeAgo(lead.createdAt)}
                        </span>

                        <Button
                          size="sm"
                          onClick={() => setReplyLead(lead)}
                          className="text-xs h-7 px-3 bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-1"
                        >
                          <Reply className="w-3 h-3" /> Reply
                        </Button>
                        {lead.respondedAt ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Responded {timeAgo(lead.respondedAt)}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => markResponded(lead.id)}
                            disabled={markingId === lead.id}
                            className="text-xs h-7 px-3 bg-gray-100 hover:bg-gray-200 text-gray-600"
                          >
                            {markingId === lead.id ? "Saving…" : "Mark Responded"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Calendar — 1 col */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-scanvault-red" />
            Activity Calendar
          </h3>
          <LeadCalendar leads={leads} />
        </div>
      </div>
    </div>
  );
}
