export interface CharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface Charity {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  mission: string;
  description: string;
  impactMetrics: {
    label: string;
    value: string;
  }[];
  heroImage: string;
  logo: string;
  isFeatured: boolean;
  events: CharityEvent[];
}

export const CHARITIES: Charity[] = [
  {
    id: "charity-1",
    slug: "youth-horizon-initiative",
    name: "Youth Horizon Initiative",
    category: "Education & Youth Empowerment",
    tagline: "Unlocking potential through mentorship, academic access, and life skills for underserved youth.",
    mission: "To break systemic cycles of educational inequality by providing long-term academic mentorship, digital literacy tools, and youth leadership retreats.",
    description: "Founded in 2018, the Youth Horizon Initiative pairs secondary school students from historically disadvantaged communities with dedicated professional mentors. Through after-school STEM academies, creative arts cohorts, and collegiate pathway counseling, we equip the next generation with the confidence and technical competencies required to thrive in a rapidly changing economy.",
    impactMetrics: [
      { label: "Students Mentored", value: "4,200+" },
      { label: "College Transition Rate", value: "94%" },
      { label: "Active Regional Chapters", value: "18" },
    ],
    heroImage: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    logo: "YHI",
    isFeatured: true,
    events: [
      {
        id: "evt-1",
        title: "Annual Community Golf Day & Mentorship Cup",
        date: "October 18, 2026",
        location: "Metropolitan Country Links",
        description: "An annual charity golf day uniting business leaders, civic champions, and student fellows to raise scholarship funding and career connections.",
      },
      {
        id: "evt-2",
        title: "Winter Youth Tech Sprint",
        date: "December 5, 2026",
        location: "Urban Innovation Hub",
        description: "A 48-hour youth hackathon connecting high school apprentices with enterprise software mentors.",
      },
    ],
  },
  {
    id: "charity-2",
    slug: "clean-water-allies",
    name: "Clean Water Allies",
    category: "Global Health & Water Security",
    tagline: "Sustainable clean drinking water infrastructure and sanitation for remote villages.",
    mission: "Deploying solar-powered purification wells and community-managed water infrastructure across drought-vulnerable rural settlements.",
    description: "Clean Water Allies partners directly with indigenous village councils to design, drill, and sustain gravity-fed water purification infrastructure. By training local civil maintenance teams and establishing women-led water governance boards, we guarantee that clean drinking water remains permanently reliable and cost-free for families.",
    impactMetrics: [
      { label: "Wells Installed", value: "320+" },
      { label: "Lives Impacted", value: "185,000+" },
      { label: "Clean Water Uptime", value: "99.2%" },
    ],
    heroImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80",
    logo: "CWA",
    isFeatured: true,
    events: [
      {
        id: "evt-3",
        title: "Spring Water Security Scramble",
        date: "November 12, 2026",
        location: "Pine Crest Championship Course",
        description: "A 4-player team charity golf tournament funding three permanent solar well systems in sub-Saharan districts.",
      },
    ],
  },
  {
    id: "charity-3",
    slug: "veterans-forward-project",
    name: "Veterans Forward Project",
    category: "Veteran Support & Mental Health",
    tagline: "Comprehensive career transition, trauma recovery, and peer support for military veterans.",
    mission: "Providing compassionate, clinical mental health resources, adaptive sports recreation, and executive employment placement for military veterans.",
    description: "Veterans Forward Project bridges the gap between active duty military service and civilian prosperity. We offer specialized PTSD clinical therapy retreats, corporate career apprenticeships, and adaptive physical fitness programs that rebuild camaraderie, purpose, and financial independence for returning service members.",
    impactMetrics: [
      { label: "Veterans Re-Employed", value: "2,850+" },
      { label: "Therapy Hours Provided", value: "48,000+" },
      { label: "Peer Cohorts Nationwide", value: "42" },
    ],
    heroImage: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80",
    logo: "VFP",
    isFeatured: true,
    events: [
      {
        id: "evt-4",
        title: "Honor & Service Memorial Golf Day",
        date: "November 28, 2026",
        location: "Bayside Heritage Greens",
        description: "A prestigious 18-hole charity event pairing wounded veterans with community sponsors to fund ongoing mental wellness programs.",
      },
    ],
  },
  {
    id: "charity-4",
    slug: "shelter-and-dignity-coalition",
    name: "Shelter & Dignity Coalition",
    category: "Housing & Community Resiliency",
    tagline: "Permanent supportive housing and rapid crisis response for vulnerable families.",
    mission: "Transforming vacant urban properties into dignified, supportive permanent housing communities paired with holistic social services.",
    description: "The Shelter & Dignity Coalition believes that stable housing is the foundation of human survival and dignity. We provide emergency transitional shelter, construct micro-home villages for unhoused families, and provide on-site vocational training, childcare, and addiction counseling to ensure long-term stability.",
    impactMetrics: [
      { label: "Families Housed", value: "1,450" },
      { label: "Meals Distributed", value: "320,000+" },
      { label: "Housing Retention Rate", value: "91%" },
    ],
    heroImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    logo: "SDC",
    isFeatured: false,
    events: [
      {
        id: "evt-5",
        title: "Fairways for Families Charity Pro-Am",
        date: "December 14, 2026",
        location: "Oakridge Country Club",
        description: "A competitive pro-am tournament raising funds for emergency winter heating and transitional family apartments.",
      },
    ],
  },
];
