import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type Locale = 'en' | 'fr'

const dictionary = {
  en: {
    // Primary navigation
    home: 'Home',
    journal: 'Journal',
    academy: 'Academy',
    discovery: 'Discovery',
    opportunities: 'Opportunities',
    research: 'Research',
    more: 'More',

    // Research workspace
    passport: 'Research Passport',
    incubator: 'Research Incubator',
    collaboration: 'Collaboration Network',
    sandbox: 'Research Sandbox',
    events: 'Events & Training',
    analytics: 'Research Analytics',
    ethics: 'Ethics & Compliance',
    medtechAi: 'MedTech AI research assistance',
    about: 'About RSRE',

    // Account
    signIn: 'Sign in',
    createAccount: 'Create account',
    dashboard: 'My Dashboard',
    controlCenter: 'Control Center',
    build: 'Build',
    logout: 'Logout',
    notifications: 'Notifications',
    profile: 'Profile',

    // Header / shared chrome
    supportRsre: 'Support RSRE',
    rwandaRooted: 'Rwanda-rooted research ecosystem',
    researchSupportDiscovery: 'Research support · discovery · collaboration · publication',
    researchWorkspace: 'Research workspace',
    researchWorkspaceDescription: 'Tools for building a research journey',
    moreResources: 'More platform resources',
    searchResearch: 'Search research',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    language: 'Language',
    english: 'English',
    french: 'French',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',

    // Footer
    aboutTheEcosystem: 'About the ecosystem',
    explore: 'Explore',
    contact: 'Contact',
    general: 'General',
    editorial: 'Editorial',
    phone: 'Phone',
    supportTheEcosystem: 'Support the ecosystem',
    helpKeepResearchAccessOpen: 'Help keep research access open.',
    exploreOpportunities: 'Explore opportunities',
    contactRsre: 'Contact RSRE',
    researchIntegrity: 'Research integrity · privacy · human governance',
    builtForResearchers:
      'Built for researchers, students and research communities in Rwanda and beyond.',
    rwandaResearchEcosystem: 'Rwanda-rooted research ecosystem',

    // Homepage / shared calls to action
    searchResearchAction: 'Search research',
    startLearning: 'Start learning',
    buildAProject: 'Build a project',
    exploreDiscovery: 'Explore Discovery',
    viewJournal: 'View journal',
    browseAll: 'Browse all',
    viewOpportunity: 'View opportunity',
    readArticle: 'Read article',
    researchPassport: 'Research Passport',

    // Common status / utility text
    loading: 'Loading...',
    comingSoon: 'Coming soon',
    thankYouForYourPatience: 'Thank you for your patience.',
  },

  fr: {
    // Navigation
    home: 'Accueil',
    journal: 'Revue',
    academy: 'Académie',
    discovery: 'Découverte',
    opportunities: 'Opportunités',
    research: 'Recherche',
    more: 'Plus',

    // Research workspace
    passport: 'Passeport de recherche',
    incubator: 'Incubateur de recherche',
    collaboration: 'Réseau de collaboration',
    sandbox: 'Espace de recherche',
    events: 'Événements et formations',
    analytics: 'Analytique de recherche',
    ethics: 'Éthique et conformité',
    medtechAi: 'Assistance de recherche MedTech AI',
    about: 'À propos de RSRE',

    // Account
    signIn: 'Se connecter',
    createAccount: 'Créer un compte',
    dashboard: 'Mon tableau de bord',
    controlCenter: 'Centre de contrôle',
    build: 'Construire',
    logout: 'Déconnexion',
    notifications: 'Notifications',
    profile: 'Profil',

    // Header / shared chrome
    supportRsre: 'Soutenir RSRE',
    rwandaRooted: 'Écosystème de recherche ancré au Rwanda',
    researchSupportDiscovery:
      'Soutien à la recherche · découverte · collaboration · publication',
    researchWorkspace: 'Espace de recherche',
    researchWorkspaceDescription:
      'Des outils pour construire votre parcours de recherche',
    moreResources: 'Autres ressources de la plateforme',
    searchResearch: 'Rechercher des travaux',
    switchToLight: 'Passer au mode clair',
    switchToDark: 'Passer au mode sombre',
    language: 'Langue',
    english: 'Anglais',
    french: 'Français',
    openNavigation: 'Ouvrir la navigation',
    closeNavigation: 'Fermer la navigation',

    // Footer
    aboutTheEcosystem: 'À propos de l’écosystème',
    explore: 'Explorer',
    contact: 'Contact',
    general: 'Général',
    editorial: 'Éditorial',
    phone: 'Téléphone',
    supportTheEcosystem: 'Soutenir l’écosystème',
    helpKeepResearchAccessOpen:
      'Aidez-nous à garder l’accès à la recherche ouvert.',
    exploreOpportunities: 'Explorer les opportunités',
    contactRsre: 'Contacter RSRE',
    researchIntegrity: 'Intégrité de la recherche · vie privée · gouvernance humaine',
    builtForResearchers:
      'Conçu pour les chercheurs, les étudiants et les communautés de recherche au Rwanda et au-delà.',
    rwandaResearchEcosystem:
      'Écosystème de recherche ancré au Rwanda',

    // Homepage / shared calls to action
    searchResearchAction: 'Rechercher des travaux',
    startLearning: 'Commencer à apprendre',
    buildAProject: 'Construire un projet',
    exploreDiscovery: 'Explorer la découverte',
    viewJournal: 'Voir la revue',
    browseAll: 'Tout parcourir',
    viewOpportunity: 'Voir l’opportunité',
    readArticle: 'Lire l’article',
    researchPassport: 'Passeport de recherche',

    // Common status / utility
    loading: 'Chargement...',
    comingSoon: 'Bientôt disponible',
    thankYouForYourPatience: 'Merci pour votre patience.',
  },
} as const

type DictKey = keyof typeof dictionary.en

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: DictKey) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => dictionary.en[key],
})

export function LanguageProvider({
  children,
}: {
  children: ReactNode
}) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('rsre-locale')
        : null

    if (saved === 'en' || saved === 'fr') {
      setLocaleState(saved)
    }
  }, [])

  function setLocale(next: Locale) {
    setLocaleState(next)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('rsre-locale', next)
    }
  }

  function t(key: DictKey) {
    return dictionary[locale][key] || dictionary.en[key]
  }

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}