import { useState, useEffect } from 'react'
import { RiTwitterXFill, RiTelegram2Fill, RiGithubFill, RiInstagramFill, RiLinkedinFill, RiMapPinFill, RiGraduationCapFill } from 'react-icons/ri'
import { TbBriefcaseFilled } from 'react-icons/tb'
import { FaFilePdf } from 'react-icons/fa6'
import { IoDocument } from 'react-icons/io5'
import './App.css'

const GITHUB_USERNAME = '609NFT'
const CONTRIBUTION_COLORS = [
  'transparent',
  '#4a3a5c',
  '#7a5f99',
  '#a687c4',
  '#C6AEDD'
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function Skeleton({ className }) {
  return <div className={`skeleton ${className || ''}`} />
}

function GitHubChartSkeleton() {
  return (
    <div className="github-chart-link">
      <div className="github-chart-container">
        <div className="github-month-labels">
          <div className="github-day-labels-spacer" />
          <div className="github-months-row">
            {MONTHS.map((month, i) => (
              <span key={i} className="github-month-label skeleton-text" style={{ '--weeks': 4 }}>
                {month}
              </span>
            ))}
          </div>
        </div>
        <div className="github-chart-row">
          <div className="github-day-labels">
            <span></span>
            <span className="skeleton-text">Mon</span>
            <span></span>
            <span className="skeleton-text">Wed</span>
            <span></span>
            <span className="skeleton-text">Fri</span>
            <span></span>
          </div>
          <div className="github-chart">
            {Array.from({ length: 53 }).map((_, weekIndex) => (
              <div key={weekIndex} className="github-week">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="github-day skeleton" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSkeleton() {
  return (
    <section className="hero">
      <Skeleton className="skeleton-profile" />
      <Skeleton className="skeleton-name" />
      <div className="social-links">
        <Skeleton className="skeleton-icon" />
        <Skeleton className="skeleton-icon" />
        <Skeleton className="skeleton-icon" />
        <Skeleton className="skeleton-icon" />
        <Skeleton className="skeleton-icon" />
      </div>
      <Skeleton className="skeleton-bio" />
      <div className="skeleton-info-row">
        <Skeleton className="skeleton-info-item" />
        <Skeleton className="skeleton-info-item" />
        <Skeleton className="skeleton-info-item" />
      </div>
      <GitHubChartSkeleton />
      <Skeleton className="skeleton-button" />
    </section>
  )
}

const CACHE_KEY = 'github_contributions'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

function GitHubChart() {
  const [contributions, setContributions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContributions() {
      setLoading(true)
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY)
      const cacheIsValid = cached && (Date.now() - JSON.parse(cached).timestamp < CACHE_DURATION)

      if (cacheIsValid) {
        // Load cached data after skeleton shows
        await new Promise(resolve => setTimeout(resolve, 300))
        const { data } = JSON.parse(cached)
        setContributions(data)
        setLoading(false)
        return
      }

      // Fetch fresh data
      try {
        const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`)
        const data = await response.json()
        const contributions = data.contributions || []

        // Cache the data
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: contributions,
          timestamp: Date.now()
        }))

        setContributions(contributions)
      } catch (error) {
        console.error('Failed to fetch contributions:', error)
        // If fetch fails, use cached data even if expired
        if (cached) {
          const { data } = JSON.parse(cached)
          setContributions(data)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchContributions()
  }, [])

  if (loading) {
    return <GitHubChartSkeleton />
  }

  const weeks = []
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7))
  }

  // Get month labels - track all occurrences then pick the one with more weeks
  const monthOccurrences = {}
  let lastMonth = null

  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0]
    if (firstDay) {
      const date = new Date(firstDay.date)
      const month = date.getMonth()
      const year = date.getFullYear()
      const monthKey = `${month}-${year}`

      if (month !== lastMonth) {
        // Save the previous month's end position
        if (lastMonth !== null) {
          const prevKey = Object.keys(monthOccurrences).find(k =>
            monthOccurrences[k].endPosition === undefined && k.startsWith(`${lastMonth}-`)
          )
          if (prevKey) {
            monthOccurrences[prevKey].endPosition = weekIndex
          }
        }

        // Start tracking new month
        if (!monthOccurrences[monthKey]) {
          monthOccurrences[monthKey] = { month, position: weekIndex, endPosition: undefined }
        }
        lastMonth = month
      }
    }
  })

  // Close the last month
  const lastKey = Object.keys(monthOccurrences).find(k => monthOccurrences[k].endPosition === undefined)
  if (lastKey) {
    monthOccurrences[lastKey].endPosition = weeks.length
  }

  // For each month (0-11), pick the occurrence with more weeks
  const monthLabels = []
  const bestOccurrence = {}

  Object.entries(monthOccurrences).forEach(([, data]) => {
    const month = data.month
    const weekCount = data.endPosition - data.position

    if (!bestOccurrence[month] || weekCount > bestOccurrence[month].weekCount) {
      bestOccurrence[month] = { ...data, weekCount }
    }
  })

  // Convert to sorted array by position
  Object.values(bestOccurrence)
    .sort((a, b) => a.position - b.position)
    .forEach(data => {
      monthLabels.push({ month: MONTHS[data.month], position: data.position })
    })

  return (
    <a
      href={`https://github.com/${GITHUB_USERNAME}`}
      target="_blank"
      rel="noopener noreferrer"
      className="github-chart-link"
    >
      <div className="github-chart-container">
        <div className="github-month-labels">
          <div className="github-day-labels-spacer" />
          <div className="github-months-row">
            {monthLabels.map((label, index) => {
              const nextPosition = monthLabels[index + 1]?.position || weeks.length
              const width = nextPosition - label.position
              return (
                <span
                  key={index}
                  className="github-month-label"
                  style={{ '--weeks': width }}
                >
                  {label.month}
                </span>
              )
            })}
          </div>
        </div>
        <div className="github-chart-row">
          <div className="github-day-labels">
            <span></span>
            <span>Mon</span>
            <span></span>
            <span>Wed</span>
            <span></span>
            <span>Fri</span>
            <span></span>
          </div>
          <div className="github-chart">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="github-week">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="github-day"
                    style={{ backgroundColor: CONTRIBUTION_COLORS[day.level] || CONTRIBUTION_COLORS[0] }}
                    title={`${day.date}: ${day.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </a>
  )
}

const projects = [
  {
    title: 'Rentsway',
    description: 'Property management platform for landlord-tenant communication and payments.',
    image: '/rentsway/rent7.png',
    modal: {
      headline: 'Rentsway was a property management platform aimed at improving the notoriously poor communication between landlords and tenants.',
      body: 'The idea was to make it easier to manage rental payments, maintenance requests, lease information, and general communication — all in one place. The platform digitized administrative work, enabled remote property management, and centralized everything across desktop and mobile.',
      body2: 'Ultimately, the project never gained traction and was shelved. It was a valuable learning experience in product development, user research, and the realities of building for a fragmented market.',
      images: [
        '/rentsway/rent10.jpeg',
        '/rentsway/rent5.jpeg',
        '/rentsway/rent2.jpeg',
        '/rentsway/rent1.jpeg',
        '/rentsway/rent3.jpeg',
        '/rentsway/rent8.jpeg',
        '/rentsway/rent.jpeg',
        '/rentsway/rent6.jpeg',
        '/rentsway/rent9.jpeg',
      ],
      portraitImages: ['/rentsway/rent2.jpeg'],
      pdf: '/rentsway/Rentsway_BP.pdf'
    }
  },
  {
    title: 'The Pare Movement',
    description: 'Sustainable personal care brand fighting throwaway culture and industry toxicity.',
    image: '/pare/Group4.png',
    modal: {
      headline: 'The Pare Movement was a personal care brand focused on spreading awareness of throwaway culture and toxicity in the industry.',
      body: 'With the majority of waste originating from single-use packaging, The Pare Movement aimed to identify harmful consumer products in the personal care industry and produce them in a safe and sustainable way. The goal was to simplify the effort needed to reduce your carbon footprint by becoming a one-stop-shop for healthy, sustainable products you could trust.',
      body2: 'Every order funded the planting of one tree and donated $1 to Ocean Conservancy, with all delivery and returns handled by a 100% carbon-neutral shipping company. The project ultimately didn\'t take off, but it was a meaningful exploration of sustainable commerce and mission-driven branding.',
      images: [
        '/pare/IMG_5750.jpg',
        '/pare/IMG_5811.jpg',
        '/pare/test.png',
        '/pare/new.png',
        '/pare/IMG_5832.jpg',
      ],
      portraitImages: [],
      portraitRightImages: ['/pare/new.png'],
      instagram: 'https://www.instagram.com/theparemovement/',
    }
  },
  {
    title: 'Neglect',
    description: 'Low-latency Solana trading terminal and real-time data API for DeFi applications.',
    url: 'https://neglect.trade/',
    logo: '/neglect-logo.svg',
    bgColor: '#000000'
  },
  {
    title: 'VibeKit',
    description: 'AI-powered IDE for iOS and web with persistent memory for every project.',
    url: 'https://vibekit.bot/',
    logo: '/vibekit-logo.png',
    logoClass: 'large',
    bgColor: '#000000'
  }
]

function SocialLinks() {
  return (
    <div className="social-links">
      <a href="https://x.com/609NFT" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
        <RiTwitterXFill />
      </a>
      <a href="https://t.me/NFT609" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
        <RiTelegram2Fill />
      </a>
      <a href="/Boisjoli, Brian Resume.pdf" target="_blank" rel="noopener noreferrer" aria-label="Resume">
        <IoDocument />
      </a>
      <a href="https://github.com/609NFT" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <RiGithubFill />
      </a>
      <a href="https://www.linkedin.com/in/brianboisjoli/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <RiLinkedinFill />
      </a>
    </div>
  )
}

function Header({ onHomeClick }) {
  return (
    <header className="header">
      <div className="home-link" onClick={onHomeClick}>
        <img src="/walk.JPG" alt="Profile Picture" className="profile-picture" />
        <p className="name">Brian Boisjoli</p>
      </div>
      <SocialLinks />
    </header>
  )
}

function Hero({ onViewProjects }) {
  return (
    <section className="hero">
      <a href="https://solscan.io/token/5ouKFJKtZ8FHQ9qXWV3JbsvLGZhJQYB5T9VC7gCmFVQt" target="_blank" rel="noopener noreferrer">
        <img src="/walk.JPG" alt="Profile Picture" className="profile-picture" />
      </a>
      <p className="name">Brian Boisjoli</p>
      <SocialLinks />
      <p className="bio">Product leader and builder with a passion for DeFi, entrepreneurship, and community-driven technology.</p>
      <div className="info-row">
        <span><RiMapPinFill /> Encinitas, CA</span>
        <a href="https://www.uvm.edu/" target="_blank" rel="noopener noreferrer" className="info-link"><RiGraduationCapFill /> BS, Computer Science</a>
        <a href="https://amind.ai/?lang=en" target="_blank" rel="noopener noreferrer" className="info-link"><TbBriefcaseFilled /> Head of Product</a>
      </div>
      <GitHubChart />
      <button className="view-projects" onClick={onViewProjects}>
        View Projects
      </button>
    </section>
  )
}

function ProjectModal({ project, onClose }) {
  const { modal } = project

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-title-row">
          <h2 className="modal-title">{project.title}</h2>
          {modal.pdf && (
            <a href={modal.pdf} target="_blank" rel="noopener noreferrer" className="modal-instagram-link" aria-label="Business Plan PDF">
              <FaFilePdf />
            </a>
          )}
          {modal.instagram && (
            <a href={modal.instagram} target="_blank" rel="noopener noreferrer" className="modal-instagram-link" aria-label="Instagram">
              <RiInstagramFill />
            </a>
          )}
        </div>
        <p className="modal-headline">{modal.headline}</p>
        <p className="modal-body">{modal.body}</p>
        {modal.body2 && <p className="modal-body">{modal.body2}</p>}
        <div className="modal-gallery">
          {modal.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${project.title} screenshot ${i + 1}`}
              className={`modal-gallery-image${modal.portraitImages?.includes(src) ? ' portrait' : ''}${modal.portraitRightImages?.includes(src) ? ' portrait-right' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProjectCover({ project }) {
  if (project.logo) {
    return (
      <div className="project-image project-logo-cover" style={{ backgroundColor: project.bgColor }}>
        <img src={project.logo} alt={project.title} className={`project-logo ${project.logoClass || ''}`} />
      </div>
    )
  }
  return <img className="project-image" src={project.image} alt={project.title} />
}

function Projects() {
  const [activeProject, setActiveProject] = useState(null)

  return (
    <section className="projects">
      <div className="projects-grid">
        {projects.map((project) => {
          if (project.modal) {
            return (
              <div
                key={project.title}
                className="project-tile"
                onClick={() => setActiveProject(project)}
                style={{ cursor: 'pointer' }}
              >
                <ProjectCover project={project} />
                <div className="project-info">
                  <div className="project-title">{project.title}</div>
                  <div className="project-description">{project.description}</div>
                </div>
              </div>
            )
          }
          return (
            <a
              key={project.title}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-tile"
            >
              <ProjectCover project={project} />
              <div className="project-info">
                <div className="project-title">{project.title}</div>
                <div className="project-description">{project.description}</div>
              </div>
            </a>
          )
        })}
      </div>
      {activeProject && (
        <ProjectModal project={activeProject} onClose={() => setActiveProject(null)} />
      )}
    </section>
  )
}

function App() {
  const [showProjects, setShowProjects] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate initial load / wait for assets
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div
        className="bg-overlay"
        style={{ backgroundImage: `url('/cube_mono.webp')` }}
      />
      {loading ? (
        <HeroSkeleton />
      ) : (
        <>
          {showProjects && <Header onHomeClick={() => setShowProjects(false)} />}
          {!showProjects ? (
            <Hero onViewProjects={() => setShowProjects(true)} />
          ) : (
            <Projects />
          )}
        </>
      )}
    </>
  )
}

export default App
