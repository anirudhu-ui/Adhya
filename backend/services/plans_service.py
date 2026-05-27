"""
plans_service.py
Real curated Indian insurance plans database.
Groq selects + personalises based on user profile.
No web scraping needed — plans are real with verified URLs.
"""
import json
import logging
import os
from groq import Groq

logger = logging.getLogger(__name__)

# ─── Curated real Indian insurance plans ────────────────────────────────────
PLAN_DATABASE = [
    # ── TERM LIFE ────────────────────────────────────────────────────────────
    {
        "id": "lic-jeevan-amar",
        "name": "LIC Jeevan Amar",
        "provider": "LIC",
        "provider_logo": "lic",
        "category": "Term Life",
        "coverage": 10000000,          # 1 Cr
        "monthly_premium": 750,
        "recommended_for": "Salaried individuals 25–45, families with dependents",
        "highlights": [
            "Pure term plan with no maturity benefit",
            "Sum assured up to ₹25 Cr",
            "Death benefit: lump sum or monthly income",
            "Accidental death benefit rider available",
        ],
        "learn_more_url": "https://licindia.in/lic-s-new-jeevan-amar-955-uin-512n350v02",
        "tags": ["term", "life", "low_risk", "family", "salaried"],
        "min_age": 18, "max_age": 65,
        "min_income": 300000,
    },
    {
        "id": "hdfc-click2protect",
        "name": "HDFC Life Click 2 Protect Super",
        "provider": "HDFC Life",
        "provider_logo": "hdfc",
        "category": "Term Life",
        "coverage": 20000000,          # 2 Cr
        "monthly_premium": 1100,
        "recommended_for": "Young professionals 22–40, high-income families",
        "highlights": [
            "3-in-1: Life, Income & Return of Premium options",
            "Coverage up to age 85",
            "Critical illness benefit rider",
            "Waiver of premium on disability",
        ],
        "learn_more_url": "https://www.hdfclife.com/term-insurance-plans/click-2-protect-super",
        "tags": ["term", "life", "medium_risk", "young", "professional"],
        "min_age": 18, "max_age": 65,
        "min_income": 500000,
    },
    {
        "id": "sbi-eShield-next",
        "name": "SBI Life eShield Next",
        "provider": "SBI Life",
        "provider_logo": "sbi",
        "category": "Term Life",
        "coverage": 15000000,          # 1.5 Cr
        "monthly_premium": 850,
        "recommended_for": "Budget-conscious families, existing SBI customers",
        "highlights": [
            "Increasing cover option (5% pa) to beat inflation",
            "No medical exam up to ₹1 Cr sum assured",
            "Terminal illness benefit included",
            "Online purchase — instant policy",
        ],
        "learn_more_url": "https://www.sbilife.co.in/online-insurance-plans/eshield-next",
        "tags": ["term", "life", "low_risk", "family", "budget"],
        "min_age": 18, "max_age": 65,
        "min_income": 200000,
    },
    {
        "id": "icici-iprotect-smart",
        "name": "ICICI Prudential iProtect Smart",
        "provider": "ICICI Prudential",
        "provider_logo": "icici",
        "category": "Term + CI",
        "coverage": 20000000,          # 2 Cr
        "monthly_premium": 1200,
        "recommended_for": "Professionals 28–45 with high income, chronic disease history",
        "highlights": [
            "34 critical illnesses covered",
            "Accidental total permanent disability cover",
            "Return of premium option available",
            "Cover up to age 99 (whole life option)",
        ],
        "learn_more_url": "https://www.iciciprulife.com/term-insurance-plans/iprotect-smart-term-plan.html",
        "tags": ["term", "critical_illness", "high_income", "professional"],
        "min_age": 20, "max_age": 65,
        "min_income": 600000,
    },
    {
        "id": "max-smart-secure",
        "name": "Max Life Smart Secure Plus",
        "provider": "Max Life",
        "provider_logo": "max",
        "category": "Term Life",
        "coverage": 10000000,          # 1 Cr
        "monthly_premium": 900,
        "recommended_for": "Self-employed, business owners, individuals 30–55",
        "highlights": [
            "Highest claim settlement ratio (99.51%)",
            "Joint life cover option for couples",
            "Accidental cover up to ₹2 Cr",
            "Premium break facility after 5 years",
        ],
        "learn_more_url": "https://www.maxlifeinsurance.com/term-insurance-plans",
        "tags": ["term", "life", "self_employed", "couples", "high_csr"],
        "min_age": 18, "max_age": 65,
        "min_income": 300000,
    },
    {
        "id": "tata-sampurna-raksha",
        "name": "Tata AIA Sampoorna Raksha Supreme",
        "provider": "Tata AIA",
        "provider_logo": "tata",
        "category": "Term Life",
        "coverage": 20000000,          # 2 Cr
        "monthly_premium": 1050,
        "recommended_for": "NRIs, high net-worth individuals, tech professionals",
        "highlights": [
            "Whole life cover up to age 100",
            "Increasing cover by 5% every year",
            "Premium waiver on 64 critical illnesses",
            "Available for NRIs",
        ],
        "learn_more_url": "https://www.tataaia.com/life-insurance-plans/term-insurance.html",
        "tags": ["term", "life", "nri", "high_income", "whole_life"],
        "min_age": 18, "max_age": 65,
        "min_income": 700000,
    },

    # ── HEALTH ───────────────────────────────────────────────────────────────
    {
        "id": "star-comprehensive",
        "name": "Star Health Comprehensive",
        "provider": "Star Health",
        "provider_logo": "star",
        "category": "Health",
        "coverage": 2500000,           # 25 L
        "monthly_premium": 1200,
        "recommended_for": "Families with children, individuals 25–55",
        "highlights": [
            "Cashless treatment at 14,000+ hospitals",
            "No co-payment up to age 60",
            "Maternity + newborn cover included",
            "OPD and dental cover as add-ons",
        ],
        "learn_more_url": "https://www.starhealth.in/health-insurance-plans",
        "tags": ["health", "family", "maternity", "medium_risk"],
        "min_age": 0, "max_age": 65,
        "min_income": 0,
    },
    {
        "id": "niva-bupa-reassure",
        "name": "Niva Bupa ReAssure 2.0",
        "provider": "Niva Bupa",
        "provider_logo": "niva",
        "category": "Health",
        "coverage": 5000000,           # 50 L
        "monthly_premium": 1600,
        "recommended_for": "Individuals 30–50, senior family members, chronic conditions",
        "highlights": [
            "Unlimited restoration of sum insured",
            "Lock the clock — premium freezes at entry age",
            "AYUSH treatment covered",
            "No room rent capping",
        ],
        "learn_more_url": "https://www.nivabupa.com/health-insurance-plans/reassure.html",
        "tags": ["health", "senior", "chronic", "unlimited_restore"],
        "min_age": 0, "max_age": 65,
        "min_income": 0,
    },
    {
        "id": "hdfc-optima-secure",
        "name": "HDFC ERGO Optima Secure",
        "provider": "HDFC ERGO",
        "provider_logo": "hdfc",
        "category": "Health",
        "coverage": 5000000,           # 50 L
        "monthly_premium": 1900,
        "recommended_for": "HNIs, families needing high cover, pre-existing conditions",
        "highlights": [
            "4x cover in year 1 itself (Secure Benefit)",
            "Zero waiting period for accidents",
            "Unlimited e-consultations",
            "No sub-limits on room rent or ICU",
        ],
        "learn_more_url": "https://www.hdfcergo.com/health-insurance/optima-secure",
        "tags": ["health", "high_cover", "family", "high_income"],
        "min_age": 0, "max_age": 65,
        "min_income": 0,
    },
    {
        "id": "bajaj-health-guard",
        "name": "Bajaj Allianz Health Guard",
        "provider": "Bajaj Allianz",
        "provider_logo": "bajaj",
        "category": "Health",
        "coverage": 1500000,           # 15 L
        "monthly_premium": 700,
        "recommended_for": "Young singles 18–35, low-budget starters",
        "highlights": [
            "Affordable entry-level health plan",
            "Day-care procedures covered (586 listed)",
            "Cumulative bonus 10% pa up to 100%",
            "Health check-up every 4 years",
        ],
        "learn_more_url": "https://www.bajajallianz.com/health-insurance-plans.html",
        "tags": ["health", "budget", "young", "single"],
        "min_age": 18, "max_age": 65,
        "min_income": 0,
    },

    # ── ULIP / INVESTMENT ────────────────────────────────────────────────────
    {
        "id": "hdfc-sanchay-plus",
        "name": "HDFC Life Sanchay Plus",
        "provider": "HDFC Life",
        "provider_logo": "hdfc",
        "category": "Guaranteed Return",
        "coverage": 5000000,           # 50 L
        "monthly_premium": 5000,
        "recommended_for": "Risk-averse investors 30–55, retirement planning",
        "highlights": [
            "Guaranteed income up to 25 years post-policy term",
            "Multiple income options: immediate, deferred",
            "Tax-free returns under Section 10(10D)",
            "Life cover throughout policy term",
        ],
        "learn_more_url": "https://www.hdfclife.com/savings-plans",
        "tags": ["investment", "guaranteed", "low_risk", "retirement", "tax_saving"],
        "min_age": 30, "max_age": 60,
        "min_income": 600000,
    },
    {
        "id": "lic-new-endowment",
        "name": "LIC New Endowment Plan",
        "provider": "LIC",
        "provider_logo": "lic",
        "category": "Endowment",
        "coverage": 2000000,           # 20 L
        "monthly_premium": 3200,
        "recommended_for": "Conservative savers, government employees, tier-2/3 cities",
        "highlights": [
            "Guaranteed maturity + loyalty additions",
            "Loan facility after 3 years",
            "Tax benefit under 80C and 10(10D)",
            "Optional Accidental Death & Disability rider",
        ],
        "learn_more_url": "https://licindia.in/products/insurance-plan",
        "tags": ["endowment", "savings", "low_risk", "government_employee", "tier2"],
        "min_age": 8, "max_age": 55,
        "min_income": 150000,
    },
]

# ─── Groq client (lazy) ──────────────────────────────────────────────────────
_groq_client = None

def _get_groq():
    global _groq_client
    if _groq_client is None:
        _groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    return _groq_client


# ─── Public entry point ──────────────────────────────────────────────────────
def fetch_personalized_plans(profile: dict) -> list:
    """
    Select and rank up to 4 plans from PLAN_DATABASE that best fit the
    given user profile. Groq does the reasoning; it only picks IDs from
    the database — no hallucination possible.
    """
    if not profile:
        # No profile → return 4 diverse defaults
        default_ids = [
            "lic-jeevan-amar",
            "star-comprehensive",
            "hdfc-click2protect",
            "niva-bupa-reassure",
        ]
        plans = [p for p in PLAN_DATABASE if p["id"] in default_ids]
        return [_format_plan(p, None) for p in plans]

    try:
        return _groq_select_plans(profile)
    except Exception as e:
        logger.warning("Groq plan selection failed, using defaults: %s", e)
        return _default_plans()


def _groq_select_plans(profile: dict) -> list:
    """Ask Groq to pick the best 4 plan IDs for this profile."""
    plan_index = [
        {
            "id": p["id"],
            "name": p["name"],
            "provider": p["provider"],
            "category": p["category"],
            "coverage_lac": p["coverage"] // 100000,
            "monthly_premium": p["monthly_premium"],
            "tags": p["tags"],
            "recommended_for": p["recommended_for"],
            "min_income": p["min_income"],
            "min_age": p["min_age"],
            "max_age": p["max_age"],
        }
        for p in PLAN_DATABASE
    ]

    age        = profile.get("age", "unknown")
    income     = profile.get("annualIncome", "unknown")
    dependents = profile.get("dependents", 0)
    existing   = profile.get("existingPolicies", "none")
    risk       = profile.get("riskAppetite", "medium")

    system = (
        "You are an expert Indian insurance advisor. "
        "Given a user profile and a list of available plans, "
        "select exactly 4 plan IDs from the list that best suit the user. "
        "Return ONLY a valid JSON object in this exact format, no markdown:\n"
        '{"selections": [{"id": "<plan_id>", "why": "<1 sentence reason>"}, ...]}'
    )

    user_msg = (
        f"User profile:\n"
        f"  Age: {age}\n"
        f"  Annual income: ₹{income}\n"
        f"  Dependents: {dependents}\n"
        f"  Existing policies: {existing}\n"
        f"  Risk appetite: {risk}\n\n"
        f"Available plans:\n{json.dumps(plan_index, indent=2)}\n\n"
        "Pick the 4 most suitable plan IDs. Consider:\n"
        "- Age eligibility\n"
        "- Income vs premium affordability\n"
        "- Number of dependents (term/health priority)\n"
        "- Risk appetite (low = LIC/endowment/health; high = ULIP/investment)\n"
        "- Avoid duplicating categories already covered by existing policies\n"
        "Return ONLY the JSON object."
    )

    client = _get_groq()
    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_msg},
        ],
        max_tokens=400,
        temperature=0.2,
    )

    raw = resp.choices[0].message.content.strip()
    # Strip any accidental markdown fences
    raw = raw.replace("```json", "").replace("```", "").strip()
    parsed = json.loads(raw)

    selections = parsed.get("selections", [])
    why_map = {s["id"]: s.get("why", "") for s in selections}
    selected_ids = [s["id"] for s in selections]

    result = []
    for pid in selected_ids:
        plan = next((p for p in PLAN_DATABASE if p["id"] == pid), None)
        if plan:
            result.append(_format_plan(plan, why_map.get(pid, "")))

    # Safety: if Groq returned fewer than 4, pad with defaults
    if len(result) < 4:
        for p in PLAN_DATABASE:
            if p["id"] not in selected_ids and len(result) < 4:
                result.append(_format_plan(p, None))

    return result[:4]


def _format_plan(plan: dict, why: str | None) -> dict:
    return {
        "id": plan["id"],
        "name": plan["name"],
        "provider": plan["provider"],
        "provider_logo": plan["provider_logo"],
        "category": plan["category"],
        "coverage": plan["coverage"],
        "monthly_premium": plan["monthly_premium"],
        "recommended_for": plan["recommended_for"],
        "highlights": plan["highlights"],
        "why_recommended": why or "",
        "learn_more_url": plan["learn_more_url"],
    }


def _default_plans() -> list:
    defaults = [
        "lic-jeevan-amar",
        "star-comprehensive",
        "hdfc-click2protect",
        "niva-bupa-reassure",
    ]
    return [
        _format_plan(p, None)
        for p in PLAN_DATABASE
        if p["id"] in defaults
    ]