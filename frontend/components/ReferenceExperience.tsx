"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Clock3,
  CreditCard,
  Database,
  Download,
  FileChartColumn,
  FileClock,
  Gauge,
  Layers3,
  Menu,
  Network,
  Play,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Table2,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";

type View = "home" | "demo";
type ResultTab = "schema" | "radius" | "safer";

const IMPACT_ROWS = [
  { label: "users", value: "12,481", tone: "red" },
  { label: "orders", value: "21,003", tone: "orange" },
  { label: "payments", value: "18,201", tone: "amber" },
  { label: "invoices", value: "5,102", tone: "amber" },
  { label: "sessions", value: "9,682", tone: "amber" },
  { label: "subscriptions", value: "347", tone: "amber" },
] as const;

const PROCESS_STEPS = [
  [Bot, "AI Agent Generates SQL", "Agent creates a query from the requested outcome."],
  [Shield, "Intercepted by BlastShield", "Potentially destructive actions are caught."],
  [Database, "Safe Sandbox Simulation", "The query runs on an isolated data snapshot."],
  [Network, "Analyze Blast Radius", "Dependencies and cascading impact are mapped."],
  [UserCheck, "Human Approval", "Your team reviews evidence and chooses the path."],
  [ShieldCheck, "Safe Execution", "Only the approved action reaches production."],
] as const;

const SIMULATION_LOGS = [
  "Request received from agent",
  "Generated SQL detected: DELETE",
  "Fetching database schema...",
  "Creating isolated sandbox...",
  "Cloning data snapshot...",
  "Executing SQL in sandbox...",
  "Analyzing cascading dependencies...",
  "Calculating blast radius...",
  "Estimating business impact...",
  "Generating safer alternatives...",
] as const;

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <button type="button" className={`brand ${dark ? "brand--dark" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <span className="brand__mark"><Shield size={19} strokeWidth={2.4} /></span>
      <span>BlastShield<span>AI</span></span>
    </button>
  );
}

function ProductNav({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (id: string) => {
    setMenuOpen(false);
    if (view === "demo") onNavigate("home");
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  return (
    <header className="product-nav-wrap">
      <div className="product-nav">
        <Brand />
        <nav className={`product-nav__links ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
          <button type="button" className="is-active" onClick={() => onNavigate("home")}>Home</button>
          <button type="button" onClick={() => go("how-it-works")}>How It Works</button>
          <button type="button" onClick={() => go("features")}>Features</button>
          <button type="button" onClick={() => go("for-agents")}>For Agents</button>
          <button type="button" onClick={() => go("docs")}>Docs</button>
        </nav>
        <button className="nav-cta" type="button" onClick={() => onNavigate("demo")}>
          Try Demo<ArrowRight size={16} />
        </button>
        <button className="mobile-menu" type="button" aria-label="Toggle menu" onClick={() => setMenuOpen((value) => !value)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

function ProductBanner({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      className={`hero-art__image ${compact ? "hero-art__image--compact" : ""}`}
      src="/assets/blastshield-hero-v2.png"
      alt="AI agent, BlastShield protection, and a production database"
      width={1536}
      height={1024}
      priority={!compact}
    />
  );
}

function HeroArt() {
  return (
    <div className="hero-art" aria-label="AI agent protecting a production database">
      <div className="hero-art__aurora" />
      <div className="sql-float glass-card">
        <span><AlertTriangle size={11} /> high impact query</span>
        <code><b>DELETE FROM</b> users<br /><b>WHERE</b> last_login &lt;<br />NOW() - INTERVAL &apos;2 years&apos;;</code>
      </div>
      <ProductBanner />
      <div className="impact-float glass-card">
        <small>Total Impact</small><strong>66,816</strong><span>Rows across 6 tables</span>
      </div>
      <div className="risk-float glass-card"><small>Risk Level</small><b>HIGH</b><i><span /><span /><span /><span /><span /></i></div>
      <div className="confidence-float glass-card"><small>Confidence Score</small><strong>98%</strong></div>
      <div className="downtime-float glass-card"><small>Estimated Downtime</small><strong>12–18 min</strong></div>
      <div className="hero-flow">
        {["AI Proposal", "BlastShield Analysis", "Human Approval", "Execute Safely"].map((label, index) => (
          <div key={label}><b>{index + 1}</b><span>{label}</span></div>
        ))}
      </div>
    </div>
  );
}

function LandingPage({ onDemo }: { onDemo: () => void }) {
  return (
    <div className="landing-shell">
      <ProductNav view="home" onNavigate={(view) => view === "demo" && onDemo()} />
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={13} /> Pre-execution impact analysis for AI agents</span>
            <h1>Stop Destructive SQL<br /><em>Before</em> It Hits Production.</h1>
            <p>BlastShield simulates, analyses and explains the impact of dangerous database actions before they reach production.</p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={onDemo}>See BlastShield in Action <Play size={16} fill="currentColor" /></button>
              <button className="secondary-button" type="button" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How It Works <ArrowRight size={16} /></button>
            </div>
            <div className="hero-trust"><span><ShieldCheck size={14} /> Built for TrueForge Agents</span><i />PostgreSQL<i />MCP Enabled</div>
          </div>
          <HeroArt />
        </section>

        <section className="trusted-ribbon" aria-label="Trusted companies">
          <small>Trusted by engineering teams at</small>
          <div>{["TrueForge", "DataNova", "QuerySmith", "StackLabs", "ByteFlow", "CoreOps"].map((company, index) => <span key={company}>{index % 2 ? <Database size={17} /> : <Shield size={17} />}{company}</span>)}</div>
        </section>

        <section className="editorial-section process-section" id="how-it-works">
          <div className="section-intro"><span className="eyebrow">How it works</span><h2>Intelligence Between<br />Intent and Impact</h2><p>BlastShield adds a critical layer of intelligence between AI agents and your production database.</p></div>
          <div className="process-grid">
            {PROCESS_STEPS.map(([Icon, title, desc], index) => (
              <article className="process-card" key={title}>
                <b>{index + 1}</b><span><Icon /></span><h3>{title}</h3><p>{desc}</p>{index < 5 && <ArrowRight className="process-arrow" />}
              </article>
            ))}
          </div>
        </section>

        <section className="editorial-section example-section" id="features">
          <div className="section-intro"><span className="eyebrow">Real example</span><h2>A Small Query.<br />A Big Impact.</h2><p>Deleting “inactive users” looks simple. But the ripple effect is anything but.</p><button className="secondary-button" type="button" onClick={onDemo}>Explore Demo Database <ArrowRight size={15} /></button></div>
          <ImpactNetwork />
          <aside className="blast-summary"><span className="eyebrow">Total blast radius</span><strong>66,816</strong><p>Rows Across 6 Tables</p><div className="summary-rule" /><label>Risk Level <b>HIGH</b></label><div className="risk-bar"><i /><i /><i /><i /><i /></div><small>High probability of significant business impact.</small><button className="secondary-button" type="button" onClick={onDemo}>View Detailed Report <ArrowRight size={15} /></button></aside>
        </section>

        <section className="editorial-section risk-section">
          <div className="section-intro"><span className="eyebrow">Interactive risk analysis</span><h2>Understand Every Consequence</h2><p>We don’t just show numbers. We explain what will be affected, why it matters, and how risky it really is.</p></div>
          <div className="risk-content">
            <div className="metrics-row">
              {[[Table2,"Tables Impacted","6 / 18"],[Layers3,"Rows Affected","66,816"],[Shield,"Data Criticality","High"],[Gauge,"Confidence Score","98%"],[Clock3,"Est. Downtime","12–18 min"],[AlertTriangle,"Business Impact","Severe"]].map(([Icon,label,value]) => {
                const MetricIcon = Icon as typeof Table2;
                return <article key={String(label)}><MetricIcon /><small>{String(label)}</small><strong>{String(value)}</strong></article>;
              })}
            </div>
            <div className="risk-detail-grid">
              <article><span className="eyebrow">Why this is high risk</span><ul><li>Deleting users cascades to 6 dependent tables</li><li>66k+ rows will be permanently removed</li><li>Financial records and subscriptions are affected</li><li>Recovery requires complex manual reconstruction</li></ul></article>
              <article><span className="eyebrow">Risk over time</span><RiskLineChart /></article>
            </div>
          </div>
        </section>

        <section className="editorial-section safer-section">
          <div className="section-intro"><span className="eyebrow">Original vs safer SQL</span><h2>From Risky to Safe,<br />With One Click.</h2><p>BlastShield not only detects risk, it helps you choose a better path forward.</p><ul className="benefit-list"><li><Check />Preserves audit history</li><li><Check />Maintains referential integrity</li><li><Check />Allows staged execution</li><li><Check />Zero data loss</li></ul></div>
          <SqlCompare onDemo={onDemo} />
        </section>

        <section className="editorial-section approval-section" id="for-agents">
          <div className="section-intro"><span className="eyebrow">Human approval</span><h2>You’re Always<br />in Control</h2><p>BlastShield never executes destructive actions without your explicit approval.</p></div>
          <div className="approval-track">
            {[[FileChartColumn,"Review Analysis","Study impact, risk and recommendations."],[CircleUserRound,"Choose Action","Execute original, use safer version, modify or cancel."],[ShieldCheck,"Approve & Execute","BlastShield revalidates before safe execution."],[FileClock,"Audit Logged","Everything is logged for transparency."]].map(([Icon,title,copy], index) => {
              const TrackIcon = Icon as typeof FileChartColumn;
              return <article key={String(title)}><span><TrackIcon /></span><div><b>{String(title)}</b><p>{String(copy)}</p></div>{index < 3 && <ArrowRight />}</article>;
            })}
          </div>
        </section>

        <section className="testimonial-section"><blockquote>“BlastShield gives our team the confidence to let AI agents operate without risking our data. It’s the missing safety layer we always needed.”<cite>— Arjun Patel, Head of Engineering, StackLabs</cite></blockquote><div><span><Zap />5 Min Setup</span><span><CreditCard />No Credit Card</span><span><CheckCircle2 />Cancel Anytime</span></div></section>

        <section className="final-cta">
          <div><h2>Protect Your Data.<br /><em>Empower Your Agents.</em></h2><p>Give your AI agents the freedom to act — with the guardrails to keep your data, users, and business safe.</p><div><button className="primary-button" type="button" onClick={onDemo}>Try BlastShield Demo <ArrowRight size={16} /></button><button className="dark-outline" type="button">Talk to an Expert</button></div></div>
          <Image src="/assets/cta-shield-database-v3.png" alt="Protected database" width={1536} height={1024} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ImpactNetwork() {
  const nodes = [
    ["subscriptions","347","tl"],["orders","21,003","tr"],["users","12,481","center"],["sessions","9,682","bl"],["payments","18,201","mr"],["invoices","5,102","br"],
  ];
  return <div className="impact-network"><svg viewBox="0 0 520 290" aria-hidden="true"><path d="M260 145 L93 55 M260 145 L426 55 M260 145 L425 145 M260 145 L93 235 M260 145 L426 235" /></svg>{nodes.map(([label,value,pos]) => <article className={`network-node network-node--${pos}`} key={label}><Database /><span>{label}</span><strong>{value}</strong></article>)}</div>;
}

function RiskLineChart() {
  return <svg className="risk-line-chart" viewBox="0 0 470 130" role="img" aria-label="Risk rises from medium now to high after 24 hours"><defs><linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff4862" stopOpacity=".24"/><stop offset="1" stopColor="#ff4862" stopOpacity="0"/></linearGradient></defs><path className="grid" d="M35 20H435M35 55H435M35 90H435"/><path className="area" d="M35 90 L95 90 L145 68 L190 52 L235 61 L275 40 L330 49 L370 25 L435 17 L435 105 L35 105Z"/><path className="line" d="M35 90 L95 90 L145 68 L190 52 L235 61 L275 40 L330 49 L370 25 L435 17"/>{[[35,90],[95,90],[145,68],[190,52],[235,61],[275,40],[330,49],[370,25],[435,17]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="4"/>)}<text x="35" y="125">Now</text><text x="165" y="125">+15m</text><text x="295" y="125">+1h</text><text x="410" y="125">+24h</text></svg>;
}

function SqlCompare({ onDemo }: { onDemo: () => void }) {
  return <div className="sql-compare"><article className="sql-card sql-card--danger"><header><b>Original (Dangerous)</b><span>HIGH RISK</span></header><code><em>DELETE FROM</em> users<br />WHERE last_login &lt; NOW() - INTERVAL &apos;2 years&apos;;</code><footer>Impact: <b>66,816 rows across 6 tables</b><AlertTriangle /></footer></article><article className="sql-card sql-card--safe"><header><b>Safer Alternative (Recommended)</b><span>LOW RISK</span></header><code><em>UPDATE</em> users<br /><em>SET</em> status = &apos;inactive&apos;<br /><em>WHERE</em> last_login &lt; NOW() - INTERVAL &apos;2 years&apos;<br />&nbsp; AND status = &apos;active&apos;;</code><footer>Impact: <b>0 rows deleted · Preserves history</b><CheckCircle2 /></footer></article><aside><Image src="/assets/cta-shield-database-v3.png" alt="Safer database alternative" width={1536} height={1024}/><p>Choose the safer path.</p><button type="button" onClick={onDemo}>Use This Alternative <ArrowRight size={14}/></button></aside></div>;
}

function Footer() {
  return <footer className="site-footer" id="docs"><div className="footer-brand"><Brand dark /><p>Pre-execution impact analysis for AI agents and production databases.</p><span>◉ &nbsp; in &nbsp; 𝕏 &nbsp; ◈</span></div>{[["Product","Features","How It Works","For Agents","Roadmap","Pricing"],["Resources","Docs","Guides","Blog","Security","Changelog"],["Company","About","Careers","Privacy","Terms"]].map(([heading,...links]) => <div key={heading}><b>{heading}</b>{links.map((link) => <a href="#" key={link}>{link}</a>)}</div>)}<div className="newsletter"><b>Stay Updated</b><p>Get the latest updates on BlastShieldAI.</p><label><input aria-label="Email address" placeholder="Enter your email"/><button type="button"><ArrowRight /></button></label></div><small>© 2026 BlastShieldAI. All rights reserved.</small></footer>;
}

const SIDEBAR_GROUPS = [
  ["ANALYSIS", [[Sparkles,"New Analysis"],[Activity,"All Analyses"],[FileChartColumn,"Risk Reports"]]],
  ["MONITORING", [[Gauge,"Activities"],[FileClock,"Audit Logs"],[Bell,"Alerts"]]],
  ["SYSTEM", [[Database,"Databases"],[Users,"Agents"],[Settings,"Settings"]]],
] as const;

function DemoSidebar() {
  const [active, setActive] = useState("New Analysis");
  return <aside className="demo-sidebar"><button className="live-demo" type="button"><Zap />Live Demo<ChevronDown /></button>{SIDEBAR_GROUPS.map(([group,items]) => <div className="side-group" key={group}><small>{group}</small>{items.map(([Icon,label]) => <button key={label} type="button" className={active === label ? "is-active" : ""} onClick={() => setActive(label)}><Icon />{label}</button>)}</div>)}<button type="button" className="profile-button"><span>SJ</span><b>Sarah Johnson<small>Admin</small></b><ChevronDown /></button></aside>;
}

function PromptPanel({ prompt, setPrompt, onRun, running }: { prompt: string; setPrompt: (value: string) => void; onRun: () => void; running: boolean }) {
  const presets = ["Delete inactive users", "Remove old sessions", "Clean up test data", "Cancel expired subscriptions"];
  return <section className="demo-card prompt-panel"><div className="step-heading"><span>1</span><div><h2>Add Your Prompt</h2><p>Describe what you want the AI agent to do.</p></div></div><div className="db-selector"><Database /><span><small>Database</small>Acme Production (PostgreSQL)</span><ChevronDown /></div><div className="sql-preview"><code><b>DELETE</b> FROM users<br/><b>WHERE</b> last_login &lt;<br/>NOW() - INTERVAL &apos;2 years&apos;;</code><AlertTriangle /></div><div className="prompt-input"><div className="prompt-tabs"><button className="is-active" type="button">Natural Language</button><button type="button">Write SQL</button></div><label><span className="sr-only">Analysis prompt</span><textarea value={prompt} maxLength={500} onChange={(event) => setPrompt(event.target.value)} /><small>{prompt.length}/500</small></label></div><div className="prompt-art"><ProductBanner compact /></div><div className="prompt-presets"><span>Example prompts:</span>{presets.map((preset) => <button type="button" onClick={() => setPrompt(`${preset} older than 2 years.`)} key={preset}>{preset}</button>)}</div><button type="button" className="run-analysis" onClick={onRun} disabled={running}>{running ? "Analyzing..." : "Run Analysis"}<ArrowRight /></button></section>;
}

function SimulationPanel({ running, progress }: { running: boolean; progress: number }) {
  const checks = ["Parsing request","Generating SQL","Inspecting schema","Creating sandbox","Running simulation","Calculating blast radius","Scoring risk","Generating alternatives"];
  return <section className="simulation-panel"><div className="step-heading step-heading--dark"><span>2</span><div><h2>BlastShield Analysis in Progress</h2><p>Please wait while we simulate and analyze the impact.</p></div></div><time>00:00:{String(running ? Math.max(1, progress) : 8).padStart(2,"0")}</time><div className="simulation-checks">{checks.map((item,index) => <div className={index < Math.min(checks.length, Math.ceil(progress / 1.25)) ? "is-done" : index === Math.ceil(progress / 1.25) ? "is-current" : ""} key={item}><span>{index < Math.ceil(progress / 1.25) ? <Check /> : null}</span>{item}</div>)}</div><div className="terminal-log">{SIMULATION_LOGS.map((log,index) => <p className={index === SIMULATION_LOGS.length - 1 ? "is-accent" : ""} key={log}><time>10:21:{35 + index * 3}</time>{log}</p>)}</div><Image src="/assets/simulation-hologram-v2.png" alt="Holographic analysis interface" width={1536} height={1152} /></section>;
}

function SchemaGraph() {
  const nodes = [["users","12,481","root"],["subscriptions","347","subscriptions"],["orders","21,003","orders"],["invoices","5,102","invoices"],["sessions","9,682","sessions"],["payments","18,201","payments"]];
  return <div className="schema-graph"><header><b>Database Schema Impact</b><span><button className="is-active" type="button">Graph View</button><button type="button">Table View</button></span></header><div className="graph-legend"><span><i className="red"/>Directly Affected</span><span><i className="amber"/>Indirectly Affected</span><span><i className="purple"/>Not Affected</span></div><div className="graph-canvas"><svg viewBox="0 0 700 430" aria-hidden="true"><defs><marker id="arrowRed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#ff314b"/></marker><marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#ff9f1c"/></marker></defs><path className="direct" d="M350 95 L118 230"/><path d="M350 95 L265 230 M350 95 L435 230 M350 95 L580 230 M265 300 L350 365"/></svg>{nodes.map(([label,value,pos]) => <article className={`schema-node schema-node--${pos}`} key={label}><Database/><small>{label}</small><strong>{value}</strong><span>rows affected</span></article>)}</div><footer><span>– – – &nbsp; Cascading (ON DELETE CASCADE)</span></footer></div>;
}

function ImpactSummary() {
  return <aside className="impact-summary"><header><h3>Impact Summary</h3><span>HIGH RISK</span></header><small>Total Impact</small><strong>66,816</strong><p>rows across 6 tables</p><div className="impact-list">{IMPACT_ROWS.map((row) => <div key={row.label}><span><i className={row.tone}/>{row.label}</span><b>{row.value}</b></div>)}</div><div className="impact-score"><label>Risk Level <b>HIGH</b></label><div className="risk-bar"><i/><i/><i/><i/><i/></div><label>Confidence Score <b>98%</b></label><div className="confidence-bar"><i/></div><label>Estimated Downtime <b>12–18 min</b></label><label>Business Impact <b>Severe</b></label></div><div className="simulation-note"><ShieldCheck/> <span><b>This is a simulated analysis.</b>No real data has been changed.</span></div></aside>;
}

function ResultPanel({ onToast }: { onToast: (message: string) => void }) {
  const [tab, setTab] = useState<ResultTab>("schema");
  return <section className="demo-card result-panel" id="analysis-results"><div className="step-heading"><span>3</span><div><h2>Analysis Complete <CheckCircle2 /></h2><p>Review the impact and decide the safest path forward.</p></div></div><button type="button" className="download-report" onClick={() => onToast("Report prepared for secure download")}><Download/>Download Report</button><div className="result-tabs">{[["schema","Schema Impact"],["radius","Blast Radius"],["safer","Safer Alternatives"]].map(([id,label]) => <button type="button" key={id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id as ResultTab)}>{label}</button>)}</div><div className="result-content">{tab === "schema" && <SchemaGraph/>}{tab === "radius" && <BlastRadiusDetail/>}{tab === "safer" && <SaferAlternatives onToast={onToast}/>}<ImpactSummary/></div></section>;
}

function BlastRadiusDetail() {
  return <div className="radius-detail"><span className="eyebrow">Cascade depth: 2 levels</span><h3>66,816 rows enter the blast radius.</h3><p>The destructive operation starts at users and propagates through five dependent tables. Payments carry the deepest cascade and the highest recovery cost.</p><RiskLineChart/><div><span>Direct deletion <b>12,481 rows</b></span><span>First-level cascade <b>36,134 rows</b></span><span>Second-level cascade <b>18,201 rows</b></span></div></div>;
}

function SaferAlternatives({ onToast }: { onToast: (message: string) => void }) {
  return <div className="safer-detail"><div><span className="eyebrow">Recommended alternative</span><h3>Soft-delete inactive users.</h3><p>Preserve customer history and financial records while removing inactive accounts from active workflows.</p><code><b>UPDATE</b> users<br/><b>SET</b> status = &apos;inactive&apos;<br/><b>WHERE</b> last_login &lt; NOW() - INTERVAL &apos;2 years&apos;<br/>&nbsp;&nbsp;AND status = &apos;active&apos;;</code><button type="button" className="primary-button" onClick={() => onToast("Safer alternative selected for approval")}>Use Safer Alternative <ArrowRight/></button></div><ul><li><Check/>0 rows permanently deleted</li><li><Check/>Preserves audit history</li><li><Check/>No cascade impact</li><li><Check/>Fully reversible</li></ul></div>;
}

function DemoPage({ onHome }: { onHome: () => void }) {
  const [prompt,setPrompt] = useState("Delete inactive customers older than 2 years.");
  const [running,setRunning] = useState(false);
  const [progress,setProgress] = useState(5);
  const [toast,setToast] = useState("");
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setProgress((value) => {
      if (value >= 10) { window.clearInterval(timer); setRunning(false); window.setTimeout(() => document.getElementById("analysis-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150); return 10; }
      return value + 1;
    }), 220);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2600); return () => window.clearTimeout(timer); }, [toast]);
  const runAnalysis = () => {
    setProgress(1);
    setRunning(true);
  };
  return <div className="demo-shell"><ProductNav view="demo" onNavigate={(view) => view === "home" && onHome()}/><div className="demo-layout"><DemoSidebar/><main className="demo-main"><PromptPanel prompt={prompt} setPrompt={setPrompt} running={running} onRun={runAnalysis}/><SimulationPanel running={running} progress={progress}/><ResultPanel onToast={setToast}/></main></div>{toast && <div className="toast"><CheckCircle2/>{toast}</div>}</div>;
}

export function ReferenceExperience({ initialView = "home" }: { initialView?: View }) {
  const [view,setView] = useState<View>(initialView);
  const navigate = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return view === "home" ? <LandingPage onDemo={() => navigate("demo")}/> : <DemoPage onHome={() => navigate("home")}/>;
}
