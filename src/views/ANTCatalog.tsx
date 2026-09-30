import React, { useState } from 'react'

// ── Types ──
interface ANTTool {
  codename:   string
  name:       string
  status:     string
  tech:       string[]
  id:         string
  cls:        string
  overview:   string
  components: string[]
  features:   string[]
}

// ── Catalog data (from declassified source) ──
const TOOLS: ANTTool[] = [
  {
    codename: 'SSG11',
    name: 'Roblox Intelligence Reporting Suite',
    status: 'OPERATIONAL',
    tech: ['Node.js', 'Python'],
    id: 'RST-001',
    cls: 'TS//COMINT',
    overview: 'Automated dossier and group intelligence report generation. The SSG11 acquisition module ingests subject identifiers, feeding the make_docx and make_dossier_docx compilers for structured DOCX output. Group-level summaries rendered via an HTML report template.',
    components: ['ssg11.py', 'make_docx.js', 'make_dossier_docx.js', 'group_report_nsa.html'],
    features: ['Automated DOCX generation', 'HTML group reports', 'Dossier compilation', 'Multi-format output'],
  },
  {
    codename: 'WATCHMAN',
    name: 'General Purpose Reconnaissance Scanner',
    status: 'OPERATIONAL',
    tech: ['Python'],
    id: 'RST-002',
    cls: 'TS//COMINT',
    overview: 'General-purpose enumeration and data collection module. Adaptable scanning framework for target reconnaissance and structured information gathering. Single-file architecture enables rapid deployment across environments.',
    components: ['general_scanner.py'],
    features: ['Target enumeration', 'Data collection', 'Rapid deployment', 'Modular architecture'],
  },
  {
    codename: 'PHANTOM',
    name: 'Self-Logging Intelligence Suite',
    status: 'OPERATIONAL',
    tech: ['Python'],
    id: 'RST-005',
    cls: 'TS//COMINT',
    overview: 'Multi-variant self-logging and intelligence collection suite. Three distinct operational variants provide deployment flexibility across scenarios: CIA_IOC (baseline collection), Scarecrow_Alt (alternate deployment), ryk.nsa_Alt (secondary variant with modified operational parameters).',
    components: ['CIA_IOC.py', 'Scarecrow_Alt.py', 'ryk.nsa_Alt.py'],
    features: ['Multi-variant deployment', 'Self-logging capability', 'Alternate configurations', 'Modular collection'],
  },
  {
    codename: 'SENTRY',
    name: 'Discord Server Access Verification Portal',
    status: 'OPERATIONAL',
    tech: ['Python', 'FastAPI'],
    id: 'RST-006',
    cls: 'TS//COMINT',
    overview: 'Web-based portal for Discord server membership verification. Fully rewritten in FastAPI with async routes and SessionMiddleware. Discord OAuth 2.0 authenticates subjects and renders membership status via a dashboard. Sessions persisted to SQLite. ADMIN_PASSWORD loaded from environment via .env. Railway-native deployment via railway.json and uvicorn process server.',
    components: ['app.py', 'requirements.txt', 'Procfile', 'railway.json', '.env.example', 'templates/dashboard.html', 'templates/index.html', 'static/css/style.css'],
    features: ['Discord OAuth 2.0', 'FastAPI async backend', 'SQLite session store', 'Railway deployment', 'Env-based config', 'Access dashboard'],
  },
  {
    codename: 'XKEYSCORE',
    name: 'Comprehensive Signals Collection System',
    status: 'OPERATIONAL',
    tech: ['Node.js', 'Lua'],
    id: 'RST-007',
    cls: 'TS//COMINT',
    overview: "Named after NSA's global surveillance and analysis framework. Tri-component architecture: a Discord bot frontend handles command interface (discord-bot.js); a Node.js backend aggregates and relays (server.js); an embedded Lua probe captures at game-engine level. Includes compliance documentation for age-restricted deployments.",
    components: ['discord-bot.js', 'server.js', 'ChatLogger.lua', 'AGE_COMPLIANCE_GUIDE.md'],
    features: ['Discord bot interface', 'Node.js aggregation backend', 'Lua in-engine probe', 'Compliance documentation', 'Tri-component architecture'],
  },
]

// ── Tech filter chips ──
const FILTERS = ['ALL', 'Node.js', 'Python', 'FastAPI', 'Lua']

export default function ANTCatalog() {
  const [activeFilter, setActiveFilter] = useState('ALL')

  const filtered = activeFilter === 'ALL'
    ? TOOLS
    : TOOLS.filter(t => t.tech.some(tech => tech.toLowerCase().includes(activeFilter.toLowerCase())))

  return (
    <div className="flex flex-col min-h-full" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Classification banner ── */}
      <div style={{
        background: '#C9A227',
        color: '#000',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.22em',
        textAlign: 'center',
        padding: '5px 16px',
        textTransform: 'uppercase',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        TOP SECRET//COMMUNICATIONS INTELLIGENCE//NOFORN — HANDLE VIA ANT CHANNELS ONLY
      </div>

      {/* ── Page header ── */}
      <div style={{
        background: '#060810',
        borderBottom: '2px solid #C9A227',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src="/rblxnsanet/nsa-seal.png"
            alt="NSA"
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'contain', flexShrink: 0, border: '2px solid #C9A227' }}
          />
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.22em',
              color: '#C9A227',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}>
              National Security Agency // Tailored Access Operations
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 26,
              fontWeight: 700,
              color: '#e2e8f0',
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}>
              ANT PRODUCT CATALOG
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#94a3b8',
              marginTop: 4,
              letterSpacing: '0.04em',
            }}>
              Advanced Network Technology Division // Operational Tooling Registry
            </div>
          </div>
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: '#64748b',
          textAlign: 'right',
          lineHeight: 1.7,
        }}>
          <div>DOC ID: NSA-ANT-2024-R1</div>
          <div>CLASSIFICATION: TS//SI//NOFORN</div>
          <div style={{ color: '#C9A227', fontWeight: 700 }}>{TOOLS.length} SYSTEMS INDEXED</div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div style={{
        background: '#08091A',
        borderBottom: '1px solid #1e2540',
        padding: '10px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: '0.18em',
          color: '#475569',
          textTransform: 'uppercase',
          marginRight: 4,
        }}>
          FILTER BY TECH:
        </span>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '3px 10px',
              border: `1px solid ${activeFilter === f ? '#C9A227' : '#28304E'}`,
              background: activeFilter === f ? 'rgba(201,162,39,0.12)' : 'transparent',
              color: activeFilter === f ? '#C9A227' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s',
              borderRadius: 2,
            }}
          >
            {f}
          </button>
        ))}
        <span style={{
          marginLeft: 'auto',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: '#475569',
          letterSpacing: '0.1em',
        }}>
          SHOWING {filtered.length} OF {TOOLS.length} OPERATIONAL SYSTEMS
        </span>
      </div>

      {/* ── Catalog grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 18,
        padding: '24px 32px 40px',
        background: '#07090F',
        flex: 1,
      }}>
        {filtered.map(tool => (
          <ANTCard key={tool.id} tool={tool} />
        ))}
        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 0',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: '#334155',
            letterSpacing: '0.1em',
          }}>
            NO SYSTEMS MATCH FILTER CRITERIA
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ background: '#060810', borderTop: '2px solid #C9A227' }}>
        <div style={{
          background: '#C9A227',
          color: '#000',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textAlign: 'center',
          padding: '4px 16px',
          textTransform: 'uppercase',
        }}>
          TOP SECRET//COMMUNICATIONS INTELLIGENCE//NOFORN
        </div>
        <div style={{ padding: '14px 32px 18px' }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: '#475569',
            lineHeight: 1.8,
            letterSpacing: '0.04em',
            margin: 0,
          }}>
            <strong style={{ color: '#C9A227' }}>HANDLING:</strong> This document is classified TOP SECRET//COMINT//NOFORN.
            Access restricted to cleared personnel with need-to-know. <strong style={{ color: '#C9A227' }}>DECLASSIFY ON:</strong> 25 AUG 2046
          </p>
        </div>
      </div>
    </div>
  )
}

function ANTCard({ tool }: { tool: ANTTool }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article
      onClick={() => setExpanded(e => !e)}
      style={{
        background: '#0A0D1C',
        border: `1px solid ${expanded ? '#C9A227' : '#1e2540'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: expanded ? '0 0 24px rgba(201,162,39,0.12)' : '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {/* Card strip */}
      <div style={{
        background: '#C9A227',
        padding: '3px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: '#000',
          textTransform: 'uppercase',
        }}>
          {tool.cls}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: 'rgba(0,0,0,0.5)',
          letterSpacing: '0.08em',
        }}>
          {tool.id}
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Codename + name */}
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 28,
            color: '#e2e8f0',
            letterSpacing: '0.05em',
            lineHeight: 1,
          }}>
            {tool.codename}
          </div>
          <div style={{
            fontSize: 11,
            fontStyle: 'italic',
            color: '#64748b',
            lineHeight: 1.3,
            marginTop: 4,
          }}>
            {tool.name}
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '2px 8px',
            border: '1px solid #22c55e',
            color: '#22c55e',
            background: 'rgba(34,197,94,0.08)',
            fontWeight: 700,
          }}>
            ● {tool.status}
          </span>
          {tool.tech.map(t => (
            <span key={t} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '2px 8px',
              border: '1px solid #28304E',
              color: '#64748b',
              background: 'rgba(255,255,255,0.02)',
            }}>
              {t}
            </span>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #1e2540', margin: 0 }} />

        {/* Overview */}
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8.5,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: '#475569',
            marginBottom: 7,
          }}>
            Product Overview
          </div>
          <p style={{
            fontSize: 12,
            color: '#94a3b8',
            lineHeight: 1.65,
            margin: 0,
          }}>
            {tool.overview}
          </p>
        </div>

        {/* Components — only shown when expanded */}
        {expanded && (
          <>
            <div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8.5,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: '#475569',
                marginBottom: 7,
              }}>
                Components
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tool.components.map(c => (
                  <div key={c} style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.02em',
                    color: '#64748b',
                    background: 'rgba(255,255,255,0.02)',
                    borderLeft: '2px solid #28304E',
                    padding: '2px 8px',
                    lineHeight: 1.5,
                  }}>
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8.5,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: '#475569',
                marginBottom: 7,
              }}>
                Capabilities
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tool.features.map(f => (
                  <span key={f} style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    letterSpacing: '0.06em',
                    color: '#64748b',
                    border: '1px solid #1e2540',
                    padding: '2px 6px',
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Expand hint */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8,
          color: '#334155',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textAlign: 'right',
          marginTop: 'auto',
        }}>
          {expanded ? '▲ COLLAPSE' : '▼ EXPAND DETAIL'}
        </div>
      </div>

      {/* Card bottom bar */}
      <div style={{ background: '#C9A227', height: 4, flexShrink: 0 }} />
    </article>
  )
}
