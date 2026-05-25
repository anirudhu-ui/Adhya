import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Search, MessageSquare, Trash2, ChevronRight, X, Clock } from "lucide-react";
import { api } from "../services/api";

function formatRelativeTime(isoStr) {
  if (!isoStr) return "";
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function ChatDetailPanel({ session, onClose }) {
  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(panelRef.current, { x: "100%", opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" });
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const close = () => {
    gsap.to(panelRef.current, {
      x: "100%", opacity: 0, duration: 0.25, ease: "power2.in",
      onComplete: onClose,
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", justifyContent: "flex-end",
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
    }} onClick={(e) => e.target === e.currentTarget && close()}>
      <div ref={panelRef} style={{
        width: "min(520px, 100vw)",
        height: "100%",
        background: "var(--color-surface-raised)",
        borderLeft: "1px solid var(--color-border)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Panel header */}
        <div style={{
          padding: "var(--space-2) var(--space-3)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)", marginBottom: 2 }}>
              {session.title}
            </h3>
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              {session.msg_count} messages · {formatRelativeTime(session.updated_at)}
            </p>
          </div>
          <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-2) var(--space-3)", display: "flex", flexDirection: "column", gap: 12 }}>
          {(session.messages || []).map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "82%",
                padding: "10px 14px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user" ? "var(--color-surface-overlay)" : "transparent",
                border: msg.role === "user" ? "none" : "1px solid var(--color-border)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "50vh", gap: 12, color: "var(--color-text-muted)", textAlign: "center",
    }}>
      <MessageSquare size={36} strokeWidth={1} />
      <p style={{ fontSize: "var(--font-size-md)" }}>No saved chats yet</p>
      <p style={{ fontSize: "var(--font-size-sm)" }}>Your conversations from the AI Advisor will appear here.</p>
    </div>
  );
}

export default function RecentChatsPage() {

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const headerRef = useRef(null);
  const listRef = useRef(null);

  const loadSessions = useCallback(async () => {
    try {
      const data = await api.listChats();
      setSessions(data.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  useEffect(() => {
    if (loading) return;
    const tl = gsap.timeline();
    tl.fromTo(headerRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    if (listRef.current?.children.length) {
      tl.fromTo(listRef.current.children, { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out",
      }, "-=0.2");
    }
  }, [loading]);

  const openSession = useCallback(async (session) => {
    if (session.messages) { setActiveSession(session); return; }
    try {
      const full = await api.getChat(session.session_id);
      setActiveSession(full);
    } catch {
      setActiveSession(session);
    }
  }, []);

  const deleteSession = useCallback(async (e, sessionId) => {
    e.stopPropagation();
    setDeleting(sessionId);
    try {
      await api.deleteChat(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  }, []);

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "var(--space-5) var(--space-4)", maxWidth: 720, position: "relative" }}>
      <div ref={headerRef} style={{ marginBottom: "var(--space-4)", opacity: 0 }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Recent Chats
        </h2>
        <p style={{ fontSize: "var(--font-size-md)", color: "var(--color-text-muted)" }}>
          {sessions.length} saved conversation{sessions.length !== 1 ? "s" : ""}
        </p>

        {/* Search */}
        <div style={{ position: "relative", marginTop: "var(--space-2)" }}>
          <Search size={14} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              color: "var(--color-text-primary)",
              fontSize: "var(--font-size-sm)",
              fontFamily: "var(--font-primary)",
              outline: "none",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-border-focus)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
        </div>
      </div>

      {loading && (
        <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>Loading chats…</div>
      )}

      {!loading && sessions.length === 0 && <EmptyState />}

      {!loading && sessions.length > 0 && (
        <div ref={listRef} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((s) => (
            <div
              key={s.session_id}
              onClick={() => openSession(s)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px",
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
                transition: "border-color var(--motion-instant), background var(--motion-instant)",
                opacity: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border-hover)";
                e.currentTarget.style.background = "var(--color-surface-overlay)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.background = "var(--color-surface-raised)";
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: "var(--radius-md)",
                background: "var(--color-surface-overlay)",
                border: "1px solid var(--color-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <MessageSquare size={16} color="var(--color-text-muted)" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)",
                  color: "var(--color-text-primary)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  marginBottom: 3,
                }}>
                  {s.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={10} />
                    {formatRelativeTime(s.updated_at)}
                  </span>
                  <span>·</span>
                  <span>{s.msg_count} messages</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={(e) => deleteSession(e, s.session_id)}
                  disabled={deleting === s.session_id}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--color-text-muted)", padding: 4,
                    opacity: deleting === s.session_id ? 0.4 : 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-error)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                  aria-label="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={14} color="var(--color-text-muted)" />
              </div>
            </div>
          ))}

          {filtered.length === 0 && search && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", textAlign: "center", padding: "var(--space-4)" }}>
              No chats matching "{search}"
            </p>
          )}
        </div>
      )}

      {activeSession && (
        <ChatDetailPanel session={activeSession} onClose={() => setActiveSession(null)} />
      )}
    </div>
  );
}