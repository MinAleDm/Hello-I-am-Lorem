import type { OutputFormat, SessionTemplate } from "@/shared/types/focus-board";

function outputFormat(value: OutputFormat) {
  return value;
}

export const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    id: "product-strategy",
    label: "Product strategy",
    eyebrow: "Direction setting",
    description:
      "Work through a positioning or roadmap choice with evidence, tradeoffs, and a recommendation.",
    session: {
      title: "Position the next FocusBoard release",
      decisionQuestion:
        "Should the next release prioritize team collaboration, solo decision quality, or AI review workflows?",
      priorities: [
        "Sharpen product differentiation within one quarter",
        "Keep the first-use experience focused and easy to explain",
        "Protect the calm, premium feel of the product",
      ],
      constraints: [
        "One frontend engineer and one designer for six weeks",
        "No backend scope in this release window",
        "Must demo clearly in a portfolio and founder conversation",
      ],
      outputFormat: outputFormat("Recommendation brief"),
      template: "product-strategy",
    },
    artifacts: {
      summary:
        "The strongest path is to deepen solo decision quality first. It keeps the product story sharp, showcases explainable UX clearly, and avoids premature collaboration complexity.",
      insights: [
        {
          id: "insight-1",
          title: "Differentiation is clearest in a focused solo workflow",
          body:
            "The product becomes easier to understand when it promises a calm path from messy question to decision, rather than a broad collaboration layer.",
          weight: "Signal",
        },
        {
          id: "insight-2",
          title: "Collaboration is attractive but broadens the surface too early",
          body:
            "Shared boards, comments, and permissions expand scope quickly and make the first release feel less opinionated.",
          weight: "Constraint",
        },
        {
          id: "insight-3",
          title: "AI review workflows are useful when framed as a review aid, not a chat product",
          body:
            "There is room to support long-answer review and comparison, but it should reinforce structured decision-making rather than become the main narrative.",
          weight: "Pattern",
        },
      ],
      criteria: [
        {
          id: "clarity",
          label: "Story clarity",
          weight: "High",
          description: "How easy the direction is to explain and demo.",
        },
        {
          id: "scope",
          label: "Delivery fit",
          weight: "High",
          description: "How realistic the direction is for the current build window.",
        },
        {
          id: "reuse",
          label: "Platform leverage",
          weight: "Medium",
          description: "How much of the system can be reused in future directions.",
        },
      ],
      options: [
        {
          id: "solo",
          label: "Double down on solo decision support",
          summary:
            "Refine the workspace, summary flow, and explainable suggestions for one-person decision sessions.",
          verdict: "Best balance of clarity and execution confidence.",
          pros: [
            "Sharp product story",
            "Great portfolio narrative around explainable UX",
            "Smallest implementation surface",
          ],
          cons: [
            "Less collaborative upside in the short term",
            "Needs strong content and workflow polish to feel substantial",
          ],
          scores: {
            clarity: 5,
            scope: 5,
            reuse: 4,
          },
        },
        {
          id: "team",
          label: "Add lightweight team collaboration",
          summary:
            "Introduce comments, shared views, and discussion moments around options and rationale.",
          verdict: "Interesting later, but too broad right now.",
          pros: ["Higher perceived product breadth", "Supports multi-stakeholder decisions"],
          cons: [
            "Pulls the project toward dashboard complexity",
            "Adds state and interaction overhead quickly",
          ],
          scores: {
            clarity: 3,
            scope: 2,
            reuse: 5,
          },
        },
        {
          id: "review",
          label: "Focus on AI answer review workflows",
          summary:
            "Make the workspace best-in-class for reviewing a long AI output, extracting insights, and choosing a response.",
          verdict: "Strong niche angle, but slightly narrower audience story.",
          pros: ["Very current use case", "Demonstrates structured review mechanics"],
          cons: [
            "Can be misread as a chat-adjacent product",
            "Needs careful framing to avoid fake AI claims",
          ],
          scores: {
            clarity: 4,
            scope: 4,
            reuse: 4,
          },
        },
      ],
      tradeoffs: [
        {
          id: "tradeoff-1",
          title: "Breadth vs. legibility",
          summary:
            "Broader workflows may look more ambitious, but a tighter narrative makes the product easier to trust.",
        },
        {
          id: "tradeoff-2",
          title: "Novelty vs. stability",
          summary:
            "The product should feel adaptive, but not volatile. Stable assistance is more credible than cleverness.",
        },
      ],
      risks: [
        {
          id: "risk-1",
          title: "The solo workflow could feel too narrow",
          mitigation:
            "Counter with strong seeded examples and a polished summary/export state that shows real utility.",
        },
        {
          id: "risk-2",
          title: "Adaptive suggestions could still feel gimmicky",
          mitigation:
            "Keep actions reversible, low-impact, and always explained in human language.",
        },
      ],
      recommendation:
        "Ship the solo decision-support direction first, then layer AI-review and collaboration extensions as clearly framed follow-on paths.",
      notes:
        "The product feels strongest when the promise is crisp: turn a messy strategic question into a confident decision without adding noise.",
      shortlistedOptions: ["solo", "review"],
      finalDecision: "Prioritize the solo decision-support release.",
      rationale:
        "It creates the clearest portfolio narrative, showcases explainable UX, and fits the current implementation budget without losing ambition.",
      nextStep: "Translate the recommendation into a launch story and a two-iteration roadmap.",
    },
  },
  {
    id: "career-decision",
    label: "Career decision",
    eyebrow: "Personal strategy",
    description:
      "Compare paths with explicit criteria, tradeoffs, and a final recommendation you can stand behind.",
    session: {
      title: "Choose the next staff-level role",
      decisionQuestion:
        "Should I join a growth-stage startup, stay independent as a consultant, or pursue a design engineering lead role?",
      priorities: [
        "Keep a strong builder-to-strategy balance",
        "Preserve room for deep craft work",
        "Choose a path that compounds reputation over two years",
      ],
      constraints: [
        "Need financial stability within the next quarter",
        "Prefer remote-friendly teams",
        "Do not want to spend most of the week in pure people management",
      ],
      outputFormat: outputFormat("Decision memo"),
      template: "career-decision",
    },
    artifacts: {
      summary:
        "A design engineering lead role appears strongest because it keeps strategic leverage high without giving up hands-on product work.",
      insights: [
        {
          id: "career-insight-1",
          title: "Identity fit matters as much as compensation",
          body:
            "The long-term signal comes from work that reinforces a clear reputation: product-minded frontend leadership with execution depth.",
          weight: "Signal",
        },
        {
          id: "career-insight-2",
          title: "Independent consulting offers freedom but higher context switching",
          body:
            "It improves autonomy, yet makes it harder to compound within one coherent product narrative.",
          weight: "Pattern",
        },
        {
          id: "career-insight-3",
          title: "Growth-stage startups are compelling when scope is explicit",
          body:
            "The best version of that path looks close to the lead role option, but with more variability in actual expectations.",
          weight: "Constraint",
        },
      ],
      criteria: [
        {
          id: "craft",
          label: "Hands-on craft",
          weight: "High",
          description: "How much the role preserves direct building time.",
        },
        {
          id: "trajectory",
          label: "Long-term trajectory",
          weight: "High",
          description: "How strongly the role compounds narrative and credibility.",
        },
        {
          id: "stability",
          label: "Near-term stability",
          weight: "Medium",
          description: "How reliable the path feels over the next few quarters.",
        },
      ],
      options: [
        {
          id: "lead-role",
          label: "Design engineering lead role",
          summary:
            "Own product experience quality end to end while staying hands-on in the system.",
          verdict: "Best alignment with current strengths and trajectory.",
          pros: ["Balances leadership and craft", "Builds a strong market narrative"],
          cons: ["May still include some coordination overhead"],
          scores: {
            craft: 5,
            trajectory: 5,
            stability: 4,
          },
        },
        {
          id: "startup",
          label: "Growth-stage startup staff IC",
          summary:
            "Join a product team with leverage, ambiguity, and meaningful shipping responsibility.",
          verdict: "Good upside, but fit depends heavily on team maturity.",
          pros: ["Strong product scope", "Clear execution visibility"],
          cons: ["Role shape may drift in practice", "Potentially heavier firefighting"],
          scores: {
            craft: 4,
            trajectory: 4,
            stability: 3,
          },
        },
        {
          id: "consulting",
          label: "Independent consulting practice",
          summary:
            "Package product engineering and UX strategy into focused advisory-plus-build engagements.",
          verdict: "Flexible, but currently less stable.",
          pros: ["High autonomy", "Can curate projects intentionally"],
          cons: ["Revenue volatility", "More context switching than desired"],
          scores: {
            craft: 4,
            trajectory: 4,
            stability: 2,
          },
        },
      ],
      tradeoffs: [
        {
          id: "career-tradeoff-1",
          title: "Autonomy vs. compounding",
          summary:
            "The independent path offers more freedom, but roles inside a product can compound signal faster.",
        },
      ],
      risks: [
        {
          id: "career-risk-1",
          title: "A lead title could mask reduced building time",
          mitigation:
            "Clarify expectations around coding, prototyping, and system ownership during interviews.",
        },
      ],
      recommendation:
        "Prioritize design engineering lead roles with a visible product surface and a clear expectation of hands-on execution.",
      notes:
        "The ideal next move should keep me close to product taste, not just process.",
      shortlistedOptions: ["lead-role", "startup"],
      finalDecision: "Target design engineering lead roles first.",
      rationale:
        "That path best protects craft, senior-level leverage, and a coherent narrative for the next chapter.",
      nextStep: "Refine role filter criteria and prepare a focused portfolio narrative.",
    },
  },
  {
    id: "ux-review",
    label: "UX review",
    eyebrow: "Experience quality",
    description:
      "Review a redesign direction with calmer structure, criteria, and practical recommendation support.",
    session: {
      title: "Choose the dashboard redesign direction",
      decisionQuestion:
        "Should the new dashboard emphasize speed, executive clarity, or guided workflow depth?",
      priorities: [
        "Reduce first-session overwhelm",
        "Keep high-signal information visible",
        "Improve presentation quality for stakeholder reviews",
      ],
      constraints: [
        "Must work on 13-inch laptop screens",
        "No major backend schema changes this quarter",
        "Existing users are sensitive to disruptive navigation changes",
      ],
      outputFormat: outputFormat("Executive summary"),
      template: "ux-review",
    },
    artifacts: {
      summary:
        "The executive clarity direction is the best default because it simplifies orientation without sacrificing room for deeper workflow layers.",
      insights: [
        {
          id: "ux-insight-1",
          title: "Speed-first designs tend to hide important context too early",
          body:
            "Fast surfaces are appealing, but users still need enough rationale and supporting detail to trust their next move.",
          weight: "Pattern",
        },
        {
          id: "ux-insight-2",
          title: "Executive clarity creates a strong first impression and review story",
          body:
            "It makes the interface easier to explain and gives leadership a clearer picture of why each section exists.",
          weight: "Signal",
        },
      ],
      criteria: [
        {
          id: "orientation",
          label: "Orientation",
          weight: "High",
          description: "How quickly the layout explains itself to a new user.",
        },
        {
          id: "depth",
          label: "Depth",
          weight: "Medium",
          description: "How well the design supports follow-up work after the first scan.",
        },
        {
          id: "disruption",
          label: "Migration risk",
          weight: "High",
          description: "How disruptive the direction is for current users.",
        },
      ],
      options: [
        {
          id: "clarity",
          label: "Executive clarity",
          summary: "Lead with hierarchy, explanation, and obvious next steps.",
          verdict: "Best overall default.",
          pros: ["Strong orientation", "Easy to present", "Low migration risk"],
          cons: ["Slightly less kinetic on first impression"],
          scores: {
            orientation: 5,
            depth: 4,
            disruption: 5,
          },
        },
        {
          id: "speed",
          label: "Speed-first compact design",
          summary: "Minimize chrome and maximize dense information access.",
          verdict: "Useful for experts, not ideal as the default.",
          pros: ["Fast for power users", "Higher information density"],
          cons: ["Higher cognitive load", "Weaker onboarding story"],
          scores: {
            orientation: 3,
            depth: 4,
            disruption: 3,
          },
        },
      ],
      tradeoffs: [
        {
          id: "ux-tradeoff-1",
          title: "Immediate efficiency vs. calm orientation",
          summary:
            "The most efficient layout for experts is not always the one that creates the strongest first-use confidence.",
        },
      ],
      risks: [
        {
          id: "ux-risk-1",
          title: "The clarity direction could feel conservative",
          mitigation:
            "Use more deliberate motion, stronger typography, and higher quality content rather than more layout novelty.",
        },
      ],
      recommendation:
        "Ship the executive clarity direction as the default and borrow a few compact affordances for advanced users.",
      notes:
        "This decision is mostly about orientation quality, not decorative polish.",
      shortlistedOptions: ["clarity"],
      finalDecision: "Move forward with the executive clarity direction.",
      rationale:
        "It gives the team the best blend of calm, confidence, and presentation readiness.",
      nextStep: "Translate the direction into a section hierarchy and migration plan.",
    },
  },
  {
    id: "compare-options",
    label: "Compare options",
    eyebrow: "Side-by-side analysis",
    description:
      "Evaluate a finite set of options with scoring, tradeoffs, and a shortlist before committing.",
    session: {
      title: "Pick the onboarding experiment to run next",
      decisionQuestion:
        "Which experiment should the team run next to improve qualified activation: guided setup, social proof, or role-based templates?",
      priorities: [
        "Reach a measurable activation lift within one cycle",
        "Keep engineering effort modest",
        "Improve clarity without adding unnecessary steps",
      ],
      constraints: [
        "Only one experiment can ship this month",
        "Instrumentation is available but backend changes are expensive",
      ],
      outputFormat: outputFormat("Comparison table"),
      template: "compare-options",
    },
    artifacts: {
      summary:
        "Role-based templates stand out because they sharpen first-use relevance while staying lightweight to implement.",
      insights: [
        {
          id: "compare-insight-1",
          title: "Guided setup adds clarity but also friction",
          body:
            "It helps orientation, yet every extra step makes initial momentum more fragile.",
          weight: "Pattern",
        },
        {
          id: "compare-insight-2",
          title: "Role-based templates create relevance immediately",
          body:
            "Templates give users a concrete starting point without forcing them through a long setup flow.",
          weight: "Signal",
        },
      ],
      criteria: [
        {
          id: "impact",
          label: "Expected impact",
          weight: "High",
          description: "Likelihood of moving activation meaningfully.",
        },
        {
          id: "effort",
          label: "Implementation effort",
          weight: "High",
          description: "Fit with current frontend-heavy constraints.",
        },
        {
          id: "clarity",
          label: "User clarity",
          weight: "Medium",
          description: "How directly the change helps users understand what to do next.",
        },
      ],
      options: [
        {
          id: "templates",
          label: "Role-based templates",
          summary: "Pre-structure the first session around the user's role and goal.",
          verdict: "Best overall tradeoff.",
          pros: ["High relevance", "Low backend cost", "Good demo story"],
          cons: ["Needs strong template quality to feel thoughtful"],
          scores: {
            impact: 4,
            effort: 5,
            clarity: 5,
          },
        },
        {
          id: "guided-setup",
          label: "Guided setup flow",
          summary: "Step users through configuration before they reach the main product.",
          verdict: "Useful, but slightly heavier.",
          pros: ["Very explicit orientation", "Easy to reason about"],
          cons: ["Adds steps", "Could feel slower"],
          scores: {
            impact: 4,
            effort: 3,
            clarity: 4,
          },
        },
        {
          id: "social-proof",
          label: "Social proof and examples",
          summary: "Add stronger examples and credibility cues around the initial prompt.",
          verdict: "Helpful support, but weaker than structural guidance.",
          pros: ["Very light implementation", "Improves confidence quickly"],
          cons: ["Less direct effect on action quality"],
          scores: {
            impact: 3,
            effort: 5,
            clarity: 3,
          },
        },
      ],
      tradeoffs: [
        {
          id: "compare-tradeoff-1",
          title: "Explicit guidance vs. speed to first value",
          summary:
            "The best onboarding move should clarify next steps without slowing the first meaningful action.",
        },
      ],
      risks: [
        {
          id: "compare-risk-1",
          title: "Templates could feel overly prescriptive",
          mitigation:
            "Make them editable from the start and explain them as accelerators, not defaults users are stuck with.",
        },
      ],
      recommendation:
        "Run the role-based template experiment first and keep social proof improvements as supporting polish.",
      notes:
        "The strongest experiments usually remove blank-page friction without introducing a long setup ritual.",
      shortlistedOptions: ["templates", "guided-setup"],
      finalDecision: "Run the role-based template experiment next.",
      rationale:
        "It offers the best mix of impact, clarity, and implementation practicality.",
      nextStep: "Draft the template set and success metric definition for the experiment review.",
    },
  },
  {
    id: "open-exploration",
    label: "Open exploration",
    eyebrow: "Loose framing",
    description:
      "Start from a broad question and give it enough structure to reveal a direction without over-constraining it.",
    session: {
      title: "Shape the next portfolio case study",
      decisionQuestion:
        "What kind of frontend case study would best demonstrate product thinking, interaction design, and engineering depth?",
      priorities: [
        "Show strong product judgment",
        "Make the implementation believable and practical",
        "Create a story that is easy for reviewers to grasp quickly",
      ],
      constraints: [
        "Must stay frontend-only",
        "Should be possible to explain in under two minutes",
        "Avoid gimmicky interaction patterns",
      ],
      outputFormat: outputFormat("Talking points"),
      template: "open-exploration",
    },
    artifacts: {
      summary:
        "A focused decision-support product is the strongest case study direction because it naturally combines UX, product framing, and interaction logic.",
      insights: [
        {
          id: "exploration-insight-1",
          title: "Reviewers understand purposeful tools faster than abstract concepts",
          body:
            "A concrete product with a clear user outcome communicates capability better than a purely visual experiment.",
          weight: "Signal",
        },
        {
          id: "exploration-insight-2",
          title: "Frontend depth shows up in interaction modeling, not just polish",
          body:
            "The most credible projects pair calm design with meaningful state, behavior, and thoughtful decisions.",
          weight: "Pattern",
        },
      ],
      criteria: [
        {
          id: "credibility",
          label: "Credibility",
          weight: "High",
          description: "How believable the project feels as a real product idea.",
        },
        {
          id: "range",
          label: "Skill range",
          weight: "High",
          description: "How well the project demonstrates UX, product, and engineering depth.",
        },
        {
          id: "story",
          label: "Case-study story",
          weight: "Medium",
          description: "How easy it is to explain the product and its implementation choices.",
        },
      ],
      options: [
        {
          id: "decision-workspace",
          label: "Decision-support workspace",
          summary: "Help users move from a messy question to a structured recommendation.",
          verdict: "Strongest overall case-study concept.",
          pros: ["Product-led", "Good interaction depth", "Clear user value"],
          cons: ["Needs thoughtful content to avoid feeling abstract"],
          scores: {
            credibility: 5,
            range: 5,
            story: 5,
          },
        },
        {
          id: "analytics-ui",
          label: "Operational analytics UI",
          summary: "Design a calm analytics product focused on review workflows.",
          verdict: "Useful, but more dashboard-adjacent.",
          pros: ["Easy to ground in familiar patterns", "Good information design angle"],
          cons: ["Less differentiated narrative"],
          scores: {
            credibility: 4,
            range: 4,
            story: 3,
          },
        },
      ],
      tradeoffs: [
        {
          id: "exploration-tradeoff-1",
          title: "Familiarity vs. distinctiveness",
          summary:
            "A more familiar product is easier to parse, but a sharper concept is more memorable in a portfolio review.",
        },
      ],
      risks: [
        {
          id: "exploration-risk-1",
          title: "The project could feel over-designed for its use case",
          mitigation:
            "Keep the visual system calm and let product logic, content, and explainability carry the differentiation.",
        },
      ],
      recommendation:
        "Build the decision-support workspace and use adaptive suggestions as assistive, human-scale behaviors.",
      notes:
        "The best portfolio projects feel like a product somebody could actually want, not a concept exercise.",
      shortlistedOptions: ["decision-workspace"],
      finalDecision: "Create the decision-support workspace case study.",
      rationale:
        "It gives the broadest coverage of product thinking, interaction logic, and frontend architecture without losing credibility.",
      nextStep: "Turn the concept into a named product with a strong README and believable seed scenarios.",
    },
  },
];

export const TEMPLATE_MAP = Object.fromEntries(
  SESSION_TEMPLATES.map((template) => [template.id, template]),
) as Record<SessionTemplate["id"], SessionTemplate>;

export const OUTPUT_FORMATS: OutputFormat[] = [
  "Decision memo",
  "Comparison table",
  "Recommendation brief",
  "Executive summary",
  "Talking points",
];
