import { RiTwitterXFill } from 'react-icons/ri'
import { GiPerspectiveDiceSixFacesOne } from 'react-icons/gi'
import LiquidSilk from './LiquidSilk'
import './App.css'

const projects = [
  {
    title: 'Neglect',
    description: 'Solana trading terminal and real-time data API for DeFi applications.',
    fullDescription: 'Low-latency Solana trading terminal and real-time data API for DeFi applications.',
    url: 'https://neglect.trade/',
    logo: '/neglect-logo.svg',
    logoClass: 'rounded',
  },
  {
    title: 'VibeKit',
    description: 'AI-powered IDE for iOS and web with persistent memory for every project.',
    url: 'https://vibekit.bot/',
    logo: '/vibekit-logo.png',
    logoClass: 'rounded',
  }
]

function App() {
  return (
    <>
      <div className="bg-overlay">
        <LiquidSilk speed={0.4} scale={1} color="#B3B3B3" noiseIntensity={1.5} rotation={1.2} />
      </div>
      <div className="page">
        <header className="header">
          <h1 className="logo"><GiPerspectiveDiceSixFacesOne className="logo-icon" /> SITX Labs</h1>
          <div className="header-links">
            <a href="https://x.com/sitxlabs" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
              <RiTwitterXFill />
            </a>
          </div>
        </header>

        <section className="hero">
          <h2 className="headline">Solana Innovation & Tech Experiments</h2>
          <p className="subheadline">A startup lab exploring the intersection of Solana and AI.</p>
        </section>

        <section className="projects">
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.title} className="project-tile-wrapper">
                <div className="project-tile-glow" />
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-tile"
                >
                  <div className="project-inner">
                    <img
                      src={project.logo}
                      alt={project.title}
                      className={`project-logo ${project.logoClass || ''}`}
                    />
                    <div className="project-info">
                      <div className="project-title">{project.title}</div>
                      <div className="project-description">
                      {project.fullDescription && <span className="desktop-only">{project.fullDescription}</span>}
                      {project.fullDescription && <span className="mobile-only">{project.description}</span>}
                      {!project.fullDescription && project.description}
                    </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} SITX Labs</p>
        </footer>
      </div>
    </>
  )
}

export default App
