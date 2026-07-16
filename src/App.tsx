import {
  Activity,
  ArrowDown,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  Clock3,
  Compass,
  Dumbbell,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy,
  UploadCloud,
  UserRound,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Speaker = "student" | "cognito";
type ConversationMessage = { speaker: Speaker; text: string; final?: boolean };
type PlanKey = "learn" | "practise" | "perform" | "recover";
type ConversationKey = "canonical" | "time" | "difficulty" | "recall";

const canonicalOpening = "I study a lot, but during exams I forget everything.";
const conversations: Record<ConversationKey, ConversationMessage[]> = {
  canonical: [
    { speaker: "student", text: canonicalOpening },
    { speaker: "cognito", text: "When you forget, what usually happens first—does your mind go blank, do you rush, or do you start worrying about the result?" },
    { speaker: "student", text: "I see everyone else writing and panic." },
    { speaker: "cognito", text: "Whose expectations feel strongest at that moment—your own, your parents’, your teachers’, or other students’?" },
    { speaker: "student", text: "Mostly mine and my parents’." },
    { speaker: "cognito", text: "When you practise the same questions at home without a timer, how do you usually perform?" },
    { speaker: "cognito", text: "Your answers suggest that you may understand more than you can currently demonstrate under pressure. Let’s add one of your recent exam papers or result reports so we can check.", final: true },
  ],
  time: [
    { speaker: "student", text: "I know the content, but I always run out of time." },
    { speaker: "cognito", text: "When time starts feeling tight, what changes first—do you rush, keep checking the clock, or get stuck on one answer?" },
    { speaker: "student", text: "I check the clock, then rush the rest." },
    { speaker: "cognito", text: "When you do the same questions at home without a timer, do you usually finish them?" },
    { speaker: "student", text: "Yes. I finish them and get most right." },
    { speaker: "cognito", text: "That difference matters. We can check whether the missing marks come from knowledge, pacing, or the pressure that starts when time feels scarce.", final: true },
  ],
  difficulty: [
    { speaker: "student", text: "One difficult question ruins the rest of the exam for me." },
    { speaker: "cognito", text: "When that question appears, what do you usually do—keep trying, panic, or start thinking about the mark you might lose?" },
    { speaker: "student", text: "I keep trying because I feel like I should know it." },
    { speaker: "cognito", text: "What happens to the next few questions after that?" },
    { speaker: "student", text: "I’m behind, and I stop trusting every answer." },
    { speaker: "cognito", text: "This may be less about one hard question and more about how long its pressure follows you. Let’s check that pattern against a recent result.", final: true },
  ],
  recall: [
    { speaker: "student", text: "I study for hours, but I cannot remember what I learned." },
    { speaker: "cognito", text: "When you try to remember, is the information missing straight away, or does it disappear once you feel tested?" },
    { speaker: "student", text: "At home I can recognise it, but in a test my mind goes blank." },
    { speaker: "cognito", text: "Do you usually practise bringing ideas back without notes before you see them in a test?" },
    { speaker: "student", text: "Not really. I mostly reread and highlight." },
    { speaker: "cognito", text: "That gives us a useful starting point: build recall when calm, then practise retrieving it under gentle pressure. Let’s add some evidence to shape the path.", final: true },
  ],
};

const alternativeOpenings: Array<{ key: Exclude<ConversationKey, "canonical">; label: string }> = [
  { key: "time", label: "I know the content, but I always run out of time." },
  { key: "difficulty", label: "One difficult question ruins the rest of the exam for me." },
  { key: "recall", label: "I study for hours, but I cannot remember what I learned." },
];

const evidenceOptions = [
  ["Exam or assessment paper", FileText],
  ["Marks or topic breakdown", CircleGauge],
  ["Teacher feedback", MessageCircle],
  ["School report", GraduationCap],
  ["Practice-test result", Timer],
  ["Award or achievement", Award],
] as const;

const pressureSources = [
  ["Self-expectation", "High", 92],
  ["Parent expectations", "High", 84],
  ["Peer comparison", "Moderate", 58],
  ["Teacher expectations", "Low", 24],
  ["University uncertainty", "Moderate", 52],
] as const;

const planData: Record<
  PlanKey,
  { number: string; label: string; question: string; color: string; icon: typeof BookOpen; items: string[] }
> = {
  learn: {
    number: "01",
    label: "Learn",
    question: "What does Maya need to understand?",
    color: "indigo",
    icon: BookOpen,
    items: [
      "Review electromagnetic induction concept recognition",
      "Revisit two relevant sections of Cognito notes",
      "Watch one short concept explanation",
      "Complete three recognition-only questions",
    ],
  },
  practise: {
    number: "02",
    label: "Practise",
    question: "How should Maya build reliable recall?",
    color: "sky",
    icon: Dumbbell,
    items: [
      "Begin with untimed recall",
      "Explain the principle without notes",
      "Complete three unfamiliar question variations",
      "Review mistakes immediately",
      "Repeat after two days",
    ],
  },
  perform: {
    number: "03",
    label: "Perform",
    question: "How should knowledge transfer into test conditions?",
    color: "coral",
    icon: Zap,
    items: [
      "Start with a gentle timer",
      "Practise one ten-minute question block",
      "Increase to a 25-minute mini-exam",
      "Use a pre-decided question-skipping rule",
      "Continue after one deliberately difficult question",
    ],
  },
  recover: {
    number: "04",
    label: "Recover",
    question: "What should Maya do when pressure disrupts performance?",
    color: "mint",
    icon: RefreshCw,
    items: [
      "Recognise the first physical signal",
      "Stop for a brief reset and use the practised breathing rhythm",
      "Name the experience as pressure rather than failure",
      "Answer the smallest available part",
      "Mark and return when necessary",
      "Reset before beginning the next question",
    ],
  },
};

const week = [
  ["MON", "Understand", "Learn the concept and complete untimed recall.", "indigo"],
  ["TUE", "Recall", "Complete three recognition questions without notes.", "sky"],
  ["WED", "Transfer", "Complete one gently timed problem set.", "mint"],
  ["THU", "Simulate", "Complete a 25-minute test and practise Exam Reset once.", "coral"],
  ["FRI", "Compare", "Repeat the skill and compare Preparation with Test Mode.", "lavender"],
] as const;

const resetSteps = [
  { name: "Pause", duration: 5, copy: "Put your pen down for a moment.", icon: Pause },
  { name: "Ground", duration: 7, copy: "Place both feet on the floor and release your shoulders.", icon: Compass },
  {
    name: "Breathe",
    duration: 24,
    copy: "Breathe in gently for three seconds. Breathe out gently for three seconds. Repeat without forcing the breath.",
    icon: Wind,
  },
  { name: "Name it", duration: 6, copy: "This is pressure—not proof that I do not know the answer.", icon: Brain },
  { name: "Shrink", duration: 7, copy: "Find the smallest part of the question you can answer.", icon: Lightbulb },
  { name: "Choose", duration: 6, copy: "Continue now, or mark the question and return later.", icon: CheckCircle2 },
  { name: "Come back", duration: 5, copy: "Begin the next action without carrying the previous question forward.", icon: ArrowRight },
] as const;

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-heading ${align === "center" ? "center" : ""}`}>
      <div className="eyebrow"><Sparkles size={14} /> {eyebrow}</div>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  testId,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  testId?: string;
  disabled?: boolean;
}) {
  return (
    <button className="primary-button" onClick={onClick} data-testid={testId} disabled={disabled}>
      <span>{children}</span><ArrowRight size={18} />
    </button>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function App() {
  const [conversationKey, setConversationKey] = useState<ConversationKey>("canonical");
  const [conversationStep, setConversationStep] = useState(1);
  const conversation = useMemo(() => conversations[conversationKey], [conversationKey]);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceReady, setEvidenceReady] = useState(false);
  const [dropLabel, setDropLabel] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const [activePlan, setActivePlan] = useState<PlanKey>("learn");
  const [resetActive, setResetActive] = useState(false);
  const [resetPaused, setResetPaused] = useState(false);
  const [resetElapsed, setResetElapsed] = useState(0);
  const [sharing, setSharing] = useState("Private to me");

  useEffect(() => {
    if (conversationStep >= conversation.length) return;
    const timer = window.setTimeout(() => setConversationStep((step) => step + 1), conversationStep === 1 ? 650 : 900);
    return () => window.clearTimeout(timer);
  }, [conversationStep, conversation.length]);

  useEffect(() => {
    if (!resetActive || resetPaused) return;
    const timer = window.setInterval(() => {
      setResetElapsed((elapsed) => {
        if (elapsed >= 59) {
          window.clearInterval(timer);
          setResetActive(false);
          return 60;
        }
        return elapsed + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resetActive, resetPaused]);

  const currentResetIndex = useMemo(() => {
    let total = 0;
    for (let index = 0; index < resetSteps.length; index += 1) {
      total += resetSteps[index].duration;
      if (resetElapsed < total) return index;
    }
    return resetSteps.length - 1;
  }, [resetElapsed]);

  const currentReset = resetSteps[currentResetIndex];
  const CurrentResetIcon = currentReset.icon;

  const replayConversation = (nextKey: ConversationKey = conversationKey) => {
    setConversationKey(nextKey);
    setConversationStep(0);
    window.setTimeout(() => setConversationStep(1), 80);
    window.setTimeout(() => conversationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  };

  const loadEvidence = () => {
    setEvidenceLoading(true);
    setEvidenceReady(false);
    window.setTimeout(() => {
      setEvidenceLoading(false);
      setEvidenceReady(true);
      window.setTimeout(() => scrollToId("understands"), 100);
    }, 900);
  };

  const startReset = () => {
    setResetElapsed(0);
    setResetPaused(false);
    setResetActive(true);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Cognito Performance Path home">
          <span className="brand-mark"><Brain size={22} /></span>
          <span>Cognito <b>Performance Path</b></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#plan">Your path</a>
          <a href="#exam-reset">Exam Reset</a>
        </nav>
        <button className="header-action" onClick={() => replayConversation("canonical")}>Start the demo <ArrowRight size={16} /></button>
      </header>

      <section className="hero" id="top">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-copy">
          <div className="concept-label"><span /> Independent product concept <i>•</i> Fictional student data</div>
          <h1>You may understand more than your <span>exam result shows.</span></h1>
          <p>
            Tell Cognito what studying and tests feel like for you. Cognito asks the next useful question, checks your experience against school evidence and creates a personal path forward.
          </p>
          <div className="hero-actions">
            <PrimaryButton onClick={() => replayConversation("canonical")} testId="start-conversation">Start with your own words</PrimaryButton>
            <button className="text-button" onClick={() => scrollToId("how-it-works")}>See how it works <ArrowDown size={16} /></button>
          </div>
          <div className="hero-promise">
            <div className="promise-icon"><HeartHandshake size={20} /></div>
            <p><strong>Do not tell students to calm down.</strong><br />Train them how to come back.</p>
          </div>
        </div>

        <div className="conversation-shell" ref={conversationRef} aria-live="polite">
          <div className="conversation-top">
            <div className="cognito-avatar"><Sparkles size={18} /></div>
            <div><strong>Conversation with Cognito</strong><span>Private • Maya’s view</span></div>
            <button onClick={() => replayConversation()} aria-label="Replay conversation" data-testid="replay-conversation"><RotateCcw size={17} /></button>
          </div>
          <div className="conversation-body">
            {conversation.slice(0, conversationStep).map((message, index) => (
              <div className={`message-row ${message.speaker} ${message.final ? "final" : ""}`} key={`${message.text}-${index}`}>
                <span className="speaker-label">{message.speaker === "student" ? "Maya" : "Cognito"}</span>
                <div className="message-bubble">{message.text}</div>
              </div>
            ))}
            {conversationStep < conversation.length && (
              <div className="typing" aria-label="Cognito is typing"><i /><i /><i /></div>
            )}
          </div>
          <div className="conversation-note"><LockKeyhole size={14} /> Your words stay private until you choose to share.</div>
        </div>

        <div className="opening-examples">
          <span>Or start with:</span>
          {alternativeOpenings.map(({ key, label }) => (
            <button key={key} onClick={() => replayConversation(key)}>“{label}”</button>
          ))}
        </div>
      </section>

      <section className="evidence-section page-section" id="how-it-works">
        <div className="section-grid">
          <div>
            <SectionHeading
              eyebrow="Step 2 • Add school evidence"
              title="Now let’s check your experience against the evidence."
              body="Add anything that helps Cognito understand both your difficulties and your strengths."
            />
            <div className="evidence-types">
              {evidenceOptions.map(([label, Icon]) => (
                <div className="evidence-type" key={label}><span><Icon size={18} /></span>{label}</div>
              ))}
            </div>
            <div className="simulation-warning"><ShieldCheck size={17} /><span><strong>Visual demonstration only.</strong> No document is truly analysed and no file leaves this browser session.</span></div>
          </div>

          <div className="upload-panel">
            <div
              className="drop-zone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setDropLabel(event.dataTransfer.files[0]?.name ?? "Sample document");
              }}
            >
              <div className="upload-icon"><UploadCloud size={26} /></div>
              <strong>{dropLabel || "Drop a school document here"}</strong>
              <span>{dropLabel ? "Ready for the simulated demo" : "or choose the fictional sample below"}</span>
              {dropLabel && <button onClick={() => setDropLabel("")} aria-label="Remove selected demonstration file"><X size={15} /> Remove</button>}
            </div>
            <div className="or-divider"><span>DEMO OPTION</span></div>
            <PrimaryButton onClick={loadEvidence} testId="use-fictional-exam" disabled={evidenceLoading}>
              {evidenceLoading ? "Simulating analysis…" : "Use fictional Physics exam"}
            </PrimaryButton>
            <p className="microcopy">Fictional Maya • Year 12 Physics • No real student records</p>
          </div>
        </div>

        {evidenceReady && (
          <div className="fictional-evidence reveal" data-testid="fictional-evidence">
            <div className="evidence-banner"><FileCheck2 size={18} /><strong>Fictional evidence loaded</strong><span>Simulated analysis • Demonstration data only</span></div>
            <div className="student-summary">
              <div className="maya-avatar">M</div>
              <div><span>STUDENT</span><h3>Maya</h3><p>Year 12 Physics</p></div>
              <div className="summary-score coral"><span>RECENT EXAM</span><strong>57%</strong></div>
              <div className="summary-score mint"><span>UNTIMED PRACTICE</span><strong>82%</strong></div>
              <div className="award-chip"><Trophy size={18} /><span>Year 11 Science<br /><strong>Achievement Award</strong></span></div>
            </div>
            <div className="evidence-detail-grid">
              <div className="teacher-comment">
                <span className="card-kicker"><MessageCircle size={15} /> Teacher comment</span>
                <blockquote>“Maya demonstrates strong conceptual understanding during lessons but loses marks through rushed working and incomplete multi-step responses.”</blockquote>
              </div>
              <div className="exam-patterns">
                <span className="card-kicker"><Activity size={15} /> Exam patterns</span>
                <ul>
                  <li><Check size={15} /> Formula selection correct in most untimed practice</li>
                  <li><X size={15} /> Three avoidable calculation errors</li>
                  <li><RotateCcw size={15} /> Seven questions revisited repeatedly</li>
                  <li><Clock3 size={15} /> Accuracy dropped sharply after minute 31</li>
                  <li><FileText size={15} /> Two questions left incomplete</li>
                  <li><Brain size={15} /> Strong conceptual multiple choice; weak timed extended responses</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="understands page-section" id="understands">
        <SectionHeading
          eyebrow="Step 3 • Understand carefully"
          title="Three signals. Kept visibly separate."
          body="Cognito listens to the student, checks the evidence, then makes a careful working hypothesis—not a diagnosis."
          align="center"
        />
        <div className="signal-flow">
          <article className="signal-card said">
            <div className="signal-number">01</div><div className="signal-icon"><MessageCircle size={20} /></div>
            <span>WHAT YOU SAID</span><blockquote>“I see everyone else writing and panic.”</blockquote>
          </article>
          <ChevronRight className="flow-arrow" />
          <article className="signal-card shows">
            <div className="signal-number">02</div><div className="signal-icon"><FileCheck2 size={20} /></div>
            <span>WHAT THE EVIDENCE SHOWS</span><p>Maya performs strongly during untimed practice, but accuracy and completion fall during timed extended responses.</p>
          </article>
          <ChevronRight className="flow-arrow" />
          <article className="signal-card infers">
            <div className="signal-number">03</div><div className="signal-icon"><Sparkles size={20} /></div>
            <span>WHAT COGNITO CAREFULLY INFERS</span><p>Maya may have a smaller knowledge gap than her mark suggests. The largest difficulty appears after pressure begins.</p>
            <small><ShieldCheck size={13} /> A working hypothesis—not a diagnosis.</small>
          </article>
        </div>
        <div className="primary-insight">
          <div className="insight-mark"><Lightbulb size={28} /></div>
          <div><span>PRIMARY INSIGHT</span><h3>Your understanding appears stronger than your exam result.</h3><p>Most marks were not lost because you knew nothing. They were lost after pressure changed the way you read, recalled and responded.</p></div>
        </div>
      </section>

      <section className="mode-section page-section" id="modes">
        <SectionHeading
          eyebrow="Step 4 • Find the gap"
          title="The same student. Two different conditions."
          body="Cognito compares what Maya can demonstrate while calm with what she can currently demonstrate under test pressure."
          align="center"
        />
        <div className="mode-comparison">
          <article className="mode-card preparation">
            <div className="mode-top"><span className="mode-icon"><BookOpen size={23} /></span><div><small>CALM + UNTILTED</small><h3>Preparation Mode</h3></div><span className="status-dot">Comfortable</span></div>
            <div className="mode-score"><strong>82%</strong><span>Accuracy</span></div>
            <div className="confidence"><div><span>Confidence</span><b>8/10</b></div><div className="confidence-track"><i style={{ width: "80%" }} /></div></div>
            <div className="mode-stat"><Clock3 size={18} /><span>Average response time</span><strong>18 sec</strong></div>
            <ul><li><Check /> Untimed</li><li><Check /> Notes available</li><li><Check /> Comfortable environment</li><li><Check /> Able to pause</li><li><Check /> No one watching</li></ul>
          </article>

          <div className="gap-card">
            <span className="gap-line" />
            <div className="gap-ring"><small>THE GAP</small><strong>25</strong><span>percentage<br />points</span></div>
            <h3>Preparation-to-Performance Gap</h3>
            <p>The distance between what Maya can demonstrate while calm and under test pressure.</p>
          </div>

          <article className="mode-card test">
            <div className="mode-top"><span className="mode-icon"><Timer size={23} /></span><div><small>TIMED + EVALUATED</small><h3>Test Mode</h3></div><span className="status-dot">Pressured</span></div>
            <div className="mode-score"><strong>57%</strong><span>Accuracy</span></div>
            <div className="confidence"><div><span>Confidence</span><b>3/10</b></div><div className="confidence-track"><i style={{ width: "30%" }} /></div></div>
            <div className="mode-stat"><Clock3 size={18} /><span>Average response time</span><strong>42 sec</strong></div>
            <ul><li><X /> Timed</li><li><X /> No notes</li><li><Eye /> Being evaluated</li><li><Eye /> Other students visible</li><li><Zap /> Marks feel important</li></ul>
          </article>
        </div>
        <div className="gap-types">
          {([
            ["Knowledge gap", BookOpen, false],
            ["Pressure gap", Activity, true],
            ["Time-pressure gap", Timer, false],
            ["Fatigue gap", Brain, false],
          ] as const).map(([label, Icon, active]) => (
            <div className={active ? "active" : ""} key={String(label)}><Icon size={18} /><span>{label as string}</span>{active && <b><Check size={13} /> DETECTED</b>}</div>
          ))}
          <p>Pattern detected for this fictional demonstration. Not a medical finding.</p>
        </div>
        <div className="center-action"><PrimaryButton onClick={() => { setProfileReady(true); window.setTimeout(() => scrollToId("pressure"), 100); }} testId="build-profile">Build my profile</PrimaryButton></div>
      </section>

      <section className="pressure-section page-section" id="pressure">
        <div className="section-grid pressure-intro">
          <SectionHeading
            eyebrow="Step 5 • Pressure profile"
            title="Understand the pressure the student carries into the exam."
            body="The private conversation looks for the moment pressure begins, what feeds it, and what helps the student find their next action."
          />
          <div className="question-stack">
            <div className="mini-avatar"><Sparkles size={16} /></div>
            <p>“What thought usually appears immediately before your mind goes blank?”</p>
            <p>“Does pressure make you work harder, rush, avoid studying or shut down?”</p>
            <p>“What kind of support makes you feel calmer—and what makes pressure worse?”</p>
          </div>
        </div>

        <div className={`profile-board ${profileReady ? "ready" : "muted"}`} data-testid="pressure-profile">
          {!profileReady && <div className="profile-lock"><LockKeyhole size={24} /><strong>Build the profile to reveal Maya’s fictional pattern</strong></div>}
          <div className="profile-header"><div><span>FICTIONAL PROFILE</span><h3>Maya’s Pressure & Performance Profile</h3></div><div><ShieldCheck size={16} /> Self-reported—not clinically assessed</div></div>
          <div className="profile-grid">
            <article className="pressure-bars">
              <h4>Main pressure sources</h4>
              {pressureSources.map(([label, level, width]) => (
                <div className="pressure-row" key={label}>
                  <div><span>{label}</span><b>{level}</b></div>
                  <div className={`pressure-track ${level.toLowerCase()}`}><i style={{ width: `${width}%` }} /></div>
                </div>
              ))}
            </article>
            <article className="pressure-feels">
              <h4>What pressure feels like</h4>
              <div className="feels-grid">
                {["Notices others writing quickly", "Checks the clock repeatedly", "Breathing becomes shallow", "Stops trusting her first answer", "Re-reads questions", "Carries panic forward"].map((item, index) => (
                  <div key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</div>
                ))}
              </div>
            </article>
            <article className="trigger-card">
              <span className="card-kicker"><Zap size={15} /> Common trigger</span>
              <p>Seeing another student turn a page while she is still working on an earlier question.</p>
              <div className="recovery-time"><Clock3 size={24} /><div><span>CURRENT RECOVERY PATTERN</span><strong>8–10 minutes</strong><small>before concentration begins returning</small></div></div>
            </article>
            <article className="helps-card helps">
              <span className="card-kicker"><CheckCircle2 size={15} /> What helps</span>
              <ul><li>A clear next action</li><li>Permission to leave and return</li><li>A familiar breathing rhythm</li><li>Short realistic simulations</li><li>Process-focused feedback</li></ul>
            </article>
            <article className="helps-card worsens">
              <span className="card-kicker"><X size={15} /> What increases pressure</span>
              <ul><li>Reminders about required marks</li><li>Comparing results with classmates</li><li>Last-minute cramming</li><li>Being told to “just calm down”</li></ul>
            </article>
          </div>
        </div>
      </section>

      <section className="plan-section page-section" id="plan">
        <SectionHeading
          eyebrow="Step 6 • Personalised path"
          title="One plan for learning, performance and recovery."
          body="The path connects what Maya needs to know with how she will recall it, perform under time, and return after pressure begins."
          align="center"
        />
        {!planReady ? (
          <div className="plan-cta">
            <div className="path-preview" aria-hidden="true">
              {Object.values(planData).map(({ number, label, icon: Icon }) => <div key={label}><span><Icon size={20} /></span><b>{number}</b><strong>{label}</strong></div>)}
            </div>
            <PrimaryButton onClick={() => setPlanReady(true)} testId="show-plan">Show my plan</PrimaryButton>
          </div>
        ) : (
          <div className="plan-workspace reveal" data-testid="personal-plan">
            <div className="plan-tabs" role="tablist" aria-label="Personal plan stages">
              {(Object.keys(planData) as PlanKey[]).map((key) => {
                const item = planData[key];
                const Icon = item.icon;
                return (
                  <button key={key} role="tab" aria-selected={activePlan === key} className={activePlan === key ? `active ${item.color}` : ""} onClick={() => setActivePlan(key)} data-testid={`plan-tab-${key}`}>
                    <span><Icon size={19} /></span><small>{item.number}</small><strong>{item.label}</strong>
                  </button>
                );
              })}
            </div>
            <div className={`plan-detail ${planData[activePlan].color}`}>
              <div className="plan-detail-copy"><span>{planData[activePlan].number} • {planData[activePlan].label.toUpperCase()}</span><h3>{planData[activePlan].question}</h3><p>Built for Maya from her conversation, fictional evidence and performance profile.</p></div>
              <ol>{planData[activePlan].items.map((item, index) => <li key={item}><span>{index + 1}</span>{item}<Check size={16} /></li>)}</ol>
            </div>
            <div className="week-plan">
              <div className="week-heading"><div><span>THIS WEEK</span><h3>A gentle five-day transfer plan</h3></div><div><Sparkles size={15} /> Adapts with Maya</div></div>
              <div className="week-grid">
                {week.map(([day, title, text, color]) => <article className={color} key={day}><span>{day}</span><div className="day-icon"><Check size={16} /></div><h4>{title}</h4><p>{text}</p></article>)}
              </div>
              <p className="changing-plan">The plan changes as the student changes.</p>
            </div>
          </div>
        )}
      </section>

      <section className="reset-section page-section" id="exam-reset">
        <div className="reset-copy">
          <SectionHeading
            eyebrow="Step 7 • Exam Reset"
            title="Do not tell students to calm down. Train them how to come back."
            body="Exam Reset is practised during preparation, so the student does not meet it for the first time during the real exam."
          />
          <div className="reset-goal"><TargetIcon /><p><span>THE GOAL</span>The student may still feel pressure, but pressure no longer controls the rest of the exam.</p></div>
          <PrimaryButton onClick={startReset} testId="practice-reset">Practise a 60-second reset</PrimaryButton>
          <small className="boundary-note"><ShieldCheck size={14} /> A performance routine, not medical advice. It does not promise to eliminate anxiety.</small>
        </div>

        <div className={`reset-player ${resetActive || resetElapsed > 0 ? "active" : ""}`} data-testid="reset-player">
          <div className="reset-player-top"><div><span>EXAM RESET</span><strong>{resetElapsed >= 60 ? "Reset complete" : resetActive ? "Practice in progress" : "Ready when you are"}</strong></div><div className="reset-time">{String(Math.max(0, 60 - resetElapsed)).padStart(2, "0")}<small>SEC</small></div></div>
          <div className="reset-visual">
            <div className={`breathing-orbit ${currentReset.name === "Breathe" && resetActive && !resetPaused ? "breathing" : ""}`}>
              <div className="breathing-core"><CurrentResetIcon size={30} /><span>{currentReset.name === "Breathe" ? "In • Out" : currentReset.name}</span></div>
            </div>
            <div className="current-instruction"><span>STEP {currentResetIndex + 1} OF 7</span><h3>{currentReset.name}</h3><p>{currentReset.copy}</p></div>
          </div>
          <div className="reset-progress"><i style={{ width: `${(resetElapsed / 60) * 100}%` }} /></div>
          <div className="reset-steps">
            {resetSteps.map((step, index) => <div className={index === currentResetIndex ? "current" : index < currentResetIndex ? "done" : ""} key={step.name}><span>{index < currentResetIndex ? <Check size={12} /> : index + 1}</span><small>{step.name}</small></div>)}
          </div>
          <div className="player-controls">
            <button onClick={() => resetActive ? setResetPaused((value) => !value) : setResetActive(true)} aria-label={resetPaused || !resetActive ? "Resume reset" : "Pause reset"} disabled={resetElapsed >= 60}>{resetPaused || !resetActive ? <Play size={17} /> : <Pause size={17} />}{resetPaused || !resetActive ? "Resume" : "Pause"}</button>
            <button onClick={startReset}><RotateCcw size={16} /> Restart</button>
          </div>
        </div>

        <div className="reset-progress-demo">
          <div className="demo-label"><Sparkles size={15} /> FICTIONAL DEMONSTRATION</div>
          <div><span>Previous recovery time</span><strong>9 min</strong></div><ArrowRight />
          <div className="improved"><span>Current recovery time</span><strong>2 min</strong></div>
          <div className="affected"><span>Later questions affected</span><p><s>6</s><ArrowRight size={14} /><strong>1</strong></p></div>
        </div>
      </section>

      <section className="privacy-section page-section" id="privacy">
        <div className="privacy-wrap">
          <div>
            <SectionHeading
              eyebrow="Step 8 • Privacy & human support"
              title="The student must feel safe enough to tell the truth."
              body="Information about pressure from parents, teachers or peers cannot automatically be shown to those people. The student chooses what moves beyond this space."
            />
            <blockquote><LockKeyhole size={22} /> “Cognito should help the student—not turn private honesty into another source of pressure.”</blockquote>
          </div>
          <div className="sharing-card">
            <div className="sharing-title"><span><ShieldCheck size={20} /></span><div><strong>Choose what to share</strong><small>Maya is in control</small></div></div>
            {[
              ["Private to me", "Nothing leaves this view", LockKeyhole],
              ["Share an action summary with my tutor", "Only practical learning actions", UserRound],
              ["Share with a wellbeing professional", "A support summary you approve", HeartHandshake],
              ["Help me discuss this with my parent or guardian", "Conversation support, in your words", MessageCircle],
            ].map(([label, help, Icon]) => (
              <button className={sharing === label ? "selected" : ""} key={label as string} onClick={() => setSharing(label as string)}>
                <span className="radio">{sharing === label && <Check size={12} />}</span><Icon size={18} /><span><strong>{label as string}</strong><small>{help as string}</small></span>
              </button>
            ))}
          </div>
        </div>
        <div className="boundaries">
          {[
            [ShieldCheck, "No diagnosis", "This concept does not diagnose anxiety."],
            [HeartHandshake, "Human support matters", "It does not replace a psychologist, counsellor or wellbeing professional."],
            [Activity, "Escalate serious distress", "Serious distress must be referred to qualified human support."],
            [UserRound, "Student-controlled", "Students control what is shared wherever legally and practically possible."],
            [LockKeyhole, "Collect less", "Only information needed to support learning should be collected."],
            [Compass, "Session-only demo", "All fictional information stays only in this browser session."],
          ].map(([Icon, title, text]) => <div key={title as string}><span><Icon size={18} /></span><p><strong>{title as string}</strong>{text as string}</p></div>)}
        </div>
      </section>

      <section className="final-section page-section">
        <div className="final-glow" />
        <div className="final-copy">
          <span className="final-mark"><Brain size={28} /></span>
          <h2>Bring the same capable student who studied at home into the exam room.</h2>
          <p>Cognito listens to the student, checks the evidence and creates one path across understanding, recall, test performance and recovery.</p>
        </div>
        <div className="transformation">
          {[
            [MessageCircle, "Student", "conversation"],
            [FileCheck2, "School", "evidence"],
            [Activity, "Pressure", "profile"],
            [CircleGauge, "Preparation + Test", "comparison"],
          ].map(([Icon, top, bottom], index) => <div className="transform-item" key={top as string}><span><Icon size={21} /></span><strong>{top as string}<small>{bottom as string}</small></strong>{index < 3 && <b>+</b>}</div>)}
          <ArrowRight className="transform-arrow" />
          <div className="transform-result"><Sparkles size={23} /><strong>A personal learning and performance path</strong></div>
        </div>
        <p className="final-line">Cognito trains the knowledge—<span>and the mind that must retrieve it.</span></p>
        <button className="final-button" onClick={() => replayConversation("canonical")}>Experience the path again <RotateCcw size={17} /></button>
      </section>

      <footer>
        <div className="brand footer-brand"><span className="brand-mark"><Brain size={20} /></span><span>Cognito <b>Performance Path</b></span></div>
        <p>Understand the knowledge. Understand the pressure. Train the student who must carry both into the exam.</p>
        <small>Independent and unofficial product concept. Created using fictional student information for demonstration purposes. Not affiliated with or endorsed by Cognito Tuition.</small>
      </footer>
    </main>
  );
}

function TargetIcon() {
  return <span className="target-icon"><Compass size={22} /></span>;
}

export default App;
