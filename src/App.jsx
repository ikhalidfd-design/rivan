import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import VideoShowcase from './components/VideoShowcase'
import Services from './components/Services'
import HowItWorks from './components/HowItWorks'
import WhyRuwaq from './components/WhyRuwaq'
import Cinematic from './components/Cinematic'
import OwnerExperience from './components/OwnerExperience'
import Platforms from './components/Platforms'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'

export default function App() {
  return (
    <div className="grain min-h-screen bg-offwhite">
      <Navbar />
      <main>
        <Hero />
        <About />
        <VideoShowcase />
        <Services />
        <HowItWorks />
        <WhyRuwaq />
        <Cinematic />
        <OwnerExperience />
        <Platforms />
        <FAQ />
        <CTA />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  )
}
