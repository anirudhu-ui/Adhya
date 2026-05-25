import LandingLoader from "../components/layout/LandingLoader";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Mic2, User, Shield, Lock, Sparkles, TrendingUp, CheckCircle2, ArrowRight, MessageSquare, FileText, Users, Clock } from "lucide-react";
import "../styles/landing.css";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

function CountUp({ end, duration = 2.5 }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const numericEnd = parseInt(end.replace(/\D/g, ''));

  useEffect(() => {
    if (hasAnimated) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(numericEnd * easeOut));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(numericEnd);
        setHasAnimated(true);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [numericEnd, duration, hasAnimated]);

  if (end.includes('k')) return <>{count}k+</>;
  if (end.includes('/')) return <>24/7</>;
  return <>{count}%</>;
}

function MagneticButton({ children, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const containerRef = useRef(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  return (
  <LandingLoader>
    <div ref={containerRef} className="landing-wrapper">
      <motion.div
        className="cursor-glow"
        style={{
          left: cursorX,
          top: cursorY,
        }}
      />
      <motion.div
        className="acc"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "left" }}
      ></motion.div>

      {/* NAV */}
      <motion.nav
        className="nav"
        initial={{ y: -100, opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <div className="logo">
          <motion.span
            className="logo-dot"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 12 }}
          >
            •
          </motion.span>
          <motion.span
            className="logo-b"
            initial={{ opacity: 1, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >Adhya
          </motion.span>
        </div>
        <motion.div
          className="nav-links"
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.8
              }
            }
          }}
        >
          <motion.a
            href="#about"
            variants={{
              initial: { opacity: 1, y: -20 },
              animate: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.05, color: "var(--ink)" }}
            transition={{ duration: 0.2 }}
          >
            ABOUT
          </motion.a>
          <motion.a
            href="#features"
            variants={{
              initial: { opacity: 1, y: -20 },
              animate: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.05, color: "var(--ink)" }}
            transition={{ duration: 0.2 }}
          >
            FEATURES
          </motion.a>
          <motion.a
            href="#stories"
            variants={{
              initial: { opacity: 1, y: -20 },
              animate: { opacity: 1, y: 0 }
            }}
            whileHover={{ scale: 1.05, color: "var(--ink)" }}
            transition={{ duration: 0.2 }}
          >
            STORIES
          </motion.a>
        </motion.div>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <motion.div
            className="nav-cta"
            initial={{ opacity: 1, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            whileHover={{ scale: 1.05, borderColor: "var(--ink)" }}
            whileTap={{ scale: 0.98 }}
          >
            SIGN IN →
          </motion.div>
        </Link>
      </motion.nav>

      {/* HERO */}
      <motion.div className="hero" style={{ y: heroY }}>
        <motion.div
          className="hero-photo"
          initial={{ scale: 1.3, opacity: 1 }}
          animate={{ scale: 1.06, opacity: 1 }}
          style={{ scale: heroScale }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        ></motion.div>
        <motion.div
          className="hero-vig"
          style={{ opacity: heroOpacity }}
        ></motion.div>

        <motion.div
          className="hero-eyebrow"
          initial={{ opacity: 1, y: -30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            INSURANCE INTELLIGENCE SYSTEM
          </motion.span>
        </motion.div>

        <motion.div
          className="hero-hl"
          style={{ opacity: heroOpacity }}
        >
          <motion.span
            className="hl-top"
            initial={{ opacity: 1, x: -100, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            INSURANCE
          </motion.span>
          <motion.span
            className="hl-mid"
            initial={{ opacity: 1, scale: 0.5, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Decisions,
            <motion.span
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{
                background: "linear-gradient(90deg, rgba(255,250,240,0.68), var(--gold), rgba(255,250,240,0.68))",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
            </motion.span>
          </motion.span>
          <motion.span
            className="hl-btm"
            initial={{ opacity: 1, x: 100, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            CLARIFIED.
          </motion.span>
        </motion.div>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 1, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 1.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ opacity: heroOpacity }}
        >
          One advisor. Voice, profile, coverage — all in one conversation.
        </motion.p>

        <motion.div
          className="hero-btns"
          initial={{ opacity: 1, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ opacity: heroOpacity }}
        >
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <MagneticButton className="btn-g">
              <motion.span
                whileHover={{ letterSpacing: "1em" }}
                transition={{ duration: 0.3 }}
                style={{ display: "block" }}
              >
                INITIALIZE Adhya
              </motion.span>
            </MagneticButton>
          </Link>
          <a href="#about" style={{ textDecoration: "none" }}>
            <MagneticButton className="btn-o">
              <motion.span
                whileHover={{ letterSpacing: "0.8em" }}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                SEE HOW IT WORKS
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={12} />
                </motion.span>
              </motion.span>
            </MagneticButton>
          </a>
        </motion.div>

        <motion.div
          className="scroll-lbl"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.span
            className="scroll-ln"
            animate={{
              scaleX: [1, 1.5, 1],
              opacity: [0.25, 1, 0.25]
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          ></motion.span>
          <motion.span
            animate={{ y: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            SCROLL
          </motion.span>
        </motion.div>

        <motion.div
          className="credit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          INSURANCE ADVISOR · INDIA
        </motion.div>
      </motion.div>

      {/* MARQUEE */}
      <div className="mq">
        <div className="mq-track">
          <span>VOICE GUIDANCE <span>·</span></span>
          <span>PLAN COMPARISON <span>·</span></span>
          <span>PROFILE-AWARE <span>·</span></span>
          <span>COVERAGE CLARITY <span>·</span></span>
          <span>PRIVACY-FIRST <span>·</span></span>
          <span>Adhya<span>·</span></span>
          <span>VOICE GUIDANCE <span>·</span></span>
          <span>PLAN COMPARISON <span>·</span></span>
          <span>PROFILE-AWARE <span>·</span></span>
          <span>COVERAGE CLARITY <span>·</span></span>
          <span>PRIVACY-FIRST <span>·</span></span>
          <span>Adhya<span>·</span></span>
          <span>VOICE GUIDANCE <span>·</span></span>
          <span>PLAN COMPARISON <span>·</span></span>
          <span>PROFILE-AWARE <span>·</span></span>
          <span>COVERAGE CLARITY <span>·</span></span>
          <span>PRIVACY-FIRST <span>·</span></span>
          <span>Adhya<span>·</span></span>
        </div>
      </div>

      {/* ABOUT */}
      <motion.div
        className="about"
        id="about"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <motion.div className="about-l" variants={fadeInUp}>
          <span className="label">// GOOD MORNING</span>
          <h2 className="sec-title">
            Your entire insurance life,<br />
            <em>briefed in one conversation.</em>
          </h2>
        </motion.div>
        <motion.div className="about-r" variants={fadeInUp}>
          <p>Insurance pages often make people choose before they understand. Adhya changes the order: ask first, compare second, decide with a human-quality checklist.</p>
          <p>The app already supports authenticated profiles, plan browsing, and an advisor that can work through voice or text.</p>
          <div className="about-meta">TASKS · COVERAGE · CLMS · </div>
        </motion.div>
      </motion.div>

      {/* STATS */}
      <motion.div
        className="stats"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.5 }}
        variants={staggerContainer}
      >
        <div className="stats-grid">
          {[
            { Icon: Users, end: "10k+", label: "Users Trust Adhya" },
            { Icon: Clock, end: "24/7", label: " Support Available" },
            { Icon: Shield, end: "100%", label: "Privacy Protected" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="stat"
              variants={{
                initial: { opacity: 0, y: 50, scale: 0.8 },
                animate: { opacity: 1, y: 0, scale: 1 }
              }}
              whileHover={{
                y: -10,
                scale: 1.05,
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }}
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <stat.Icon size={24} strokeWidth={1.5} color="var(--gold)" />
              </motion.div>
              <motion.strong
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 + 0.3 }}
              >
                <CountUp end={stat.end} />
              </motion.strong>
              <span>{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FEATURES */}
      <motion.div
        className="feat"
        id="features"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div className="feat-hd" variants={fadeInUp}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles size={10} style={{ display: "inline", marginRight: "6px" }} />
            WHAT IT DOES
          </motion.span>
          <h2 className="sec-title">
            Guidance that feels personal<br />
            <em>before it feels technical.</em>
          </h2>
        </motion.div>
        <div className="feat-grid">
          {[
            { Icon: Mic2, title: "Voice-first guidance", desc: "Ask questions out loud and keep the flow conversational when the decision is messy." },
            { Icon: User, title: "Profile-aware advice", desc: "Recommendations account for age, dependents, income, city, and current policy context." },
            { Icon: Shield, title: "Coverage clarity", desc: "Compare deductibles, riders, exclusions, and premium ranges without spreadsheet fatigue." },
            { Icon: Lock, title: "Privacy-minded flow", desc: "Firebase auth, tokenized API calls, validation, and rate limits guard the product surface." }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="fc"
              variants={{
                initial: { opacity: 0, y: 60, scale: 0.9 },
                animate: { opacity: 1, y: 0, scale: 1 }
              }}
              whileHover={{
                y: -12,
                scale: 1.02,
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }}
            >
              <motion.div
                className="fc-ico"
                whileHover={{
                  scale: 1.15,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.6 }
                }}
              >
                <feature.Icon size={18} strokeWidth={1.5} />
              </motion.div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <motion.div
                className="fc-shine"
                initial={{ x: "-100%" }}
                whileHover={{ x: "200%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* JOURNEY */}
      <motion.div
        className="journey"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div className="journey-hd" variants={fadeInUp}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <TrendingUp size={10} style={{ display: "inline", marginRight: "6px" }} />
            HOW IT WORKS
          </motion.span>
          <h2 className="sec-title">
            From a vague worry<br />
            <em>to a sharper decision.</em>
          </h2>
        </motion.div>
        <div className="jtrack">
          {[
            { num: "01", Icon: MessageSquare, label: "Ask", title: "Speak naturally", desc: "Start with a real-life question about health, life, claims, riders, or family coverage." },
            { num: "02", Icon: FileText, label: "Understand", title: "See the tradeoffs", desc: "Adhya turns confusing policy language into crisp comparisons and next-best questions." },
            { num: "03", Icon: CheckCircle2, label: "Choose", title: "Move with confidence", desc: "Shortlist plans, tune coverage, and prepare for a licensed advisor conversation." }
          ].map((step, idx) => (
            <motion.div
              key={idx}
              className="jc"
              variants={{
                initial: { opacity: 0, x: -50, rotateY: -15 },
                animate: { opacity: 1, x: 0, rotateY: 0 }
              }}
              transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { duration: 0.4 }
              }}
            >
              <motion.div
                className="jnum"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.055 }}
                transition={{ duration: 0.8 }}
              >
                {step.num}
              </motion.div>
              <motion.div
                className="jico"
                whileHover={{
                  scale: 1.25,
                  rotate: [0, -10, 10, -10, 0],
                  transition: { duration: 0.7, ease: "easeInOut" }
                }}
              >
                <step.Icon size={18} strokeWidth={1.5} />
              </motion.div>
              <p className="jlbl">{step.label}</p>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              <motion.div
                className="jc-progress"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 + 0.5, duration: 1, ease: "easeOut" }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CASES */}
      <motion.div
        className="cases"
        id="stories"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div className="cases-hd" variants={fadeInUp}>
          <div>
            <motion.span
              className="eyebrow"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <FileText size={10} style={{ display: "inline", marginRight: "6px" }} />
              CASE STUDIES
            </motion.span>
            <h2 className="sec-title">
              Real decisions people made<br />
              <em>with Adhya.</em>
            </h2>
          </div>
          <p className="cases-intro">Each conversation started with a messy real-life question. Adhya helped turn it into a clear, confident next step.</p>
        </motion.div>
        <div className="cgrid">
          {[
            { type: "YOUNG FAMILY", metric: "3 plans", title: "Balancing health coverage and term life", desc: "Compared premiums, dependents, and critical illness needs in one guided chat." },
            { type: "SELF-EMPLOYED", metric: "₹2Cr", title: "Making deductible choices less vague", desc: "Mapped coverage priorities to cash-flow comfort and emergency care scenarios." },
            { type: "EXECUTIVE", metric: "5Cr+", title: "Global coverage without overbuying", desc: "Separated must-have riders from nice-to-have add-ons before a final advisor review." }
          ].map((caseStudy, idx) => (
            <motion.div
              key={idx}
              className="cc"
              variants={{
                initial: { opacity: 0, y: 60, rotateX: -10 },
                animate: { opacity: 1, y: 0, rotateX: 0 }
              }}
              transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{
                y: -15,
                scale: 1.02,
                transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
              }}
            >
              <div className="cc-top">
                <span>{caseStudy.type}</span>
                <motion.strong
                  whileHover={{ scale: 1.1, color: "var(--ink)" }}
                  transition={{ duration: 0.3 }}
                >
                  {caseStudy.metric}
                </motion.strong>
              </div>
              <h3>{caseStudy.title}</h3>
              <p>{caseStudy.desc}</p>
              <motion.div
                className="cc-chk"
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: idx * 0.2 + 0.6,
                  type: "spring",
                  stiffness: 200,
                  damping: 12
                }}
              >
                <CheckCircle2 size={16} strokeWidth={2} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FINAL */}
      <motion.div
        className="final"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.4 }}
        variants={staggerContainer}
      >
        <motion.div
          className="final-glow"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="eyebrow"
          variants={fadeInUp}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Sparkles size={10} style={{ display: "inline", marginRight: "6px" }} />
          READY WHEN YOU ARE
        </motion.span>
        <motion.div
          className="final-title"
          variants={{
            initial: { opacity: 0, y: 40, filter: "blur(20px)" },
            animate: { opacity: 1, y: 0, filter: "blur(0px)" }
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Make the next insurance<br />
          <em>conversation a better one.</em>
        </motion.div>
        <motion.div
          style={{ display: 'flex', gap: '12px', justifyContent: 'center', position: 'relative', zIndex: 2 }}
          variants={fadeInUp}
        >
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <MagneticButton className="btn-g btn-g-large">
              <motion.span
                whileHover={{ letterSpacing: "1em" }}
                transition={{ duration: 0.3 }}
                style={{ display: "block" }}
              >
                GET STARTED
              </motion.span>
            </MagneticButton>
          </Link>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <MagneticButton className="btn-o btn-o-large">
              <motion.span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                SIGN IN
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={14} />
                </motion.span>
              </motion.span>
            </MagneticButton>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="foot"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <span>© 2026 Adhya — INSURANCE ADVISOR</span>
        <span> By ~ Anirudh Upadhyay & D. Adhyumna Chowdary </span>
        <span>HYDERABAD · INDIA</span>
        <Link to="/privacy" style={{ color: "inherit", opacity: 0.5, fontSize: "10px", letterSpacing: "0.1em", textDecoration: "none" }}>
          PRIVACY POLICY
        </Link>
      </motion.div>

    </div>
     </LandingLoader>
  );
}
