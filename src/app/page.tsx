import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import JourneyRoad from "@/components/JourneyRoad";
import CareerCards from "@/components/CareerCards";
import BurnoutTraffic from "@/components/BurnoutTraffic";
import RoadmapPreview from "@/components/RoadmapPreview";
import CTASection from "@/components/CTASection";
import HighwaySection from "@/components/HighwaySection";
import Logo from "@/components/ui/logo";
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HighwaySection />
        <ProblemSection />
        <JourneyRoad />
        <CareerCards />
        <BurnoutTraffic />
        <RoadmapPreview />
        <CTASection />
      </main>

      {/* Footer — glassmorphic */}
      <footer
        role="contentinfo"
        className="w-full py-12 px-8 bg-surface/50 backdrop-blur-xl border-t border-outline-variant/10"
      >
        <div className="flex flex-col gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Logo className="h-6 w-auto opacity-60" />
            <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-8">
            {["Privacy", "Terms", "Support", "LinkedIn", "Twitter"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs tracking-widest uppercase text-on-surface/40 hover:text-primary transition-colors font-label focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                >
                  {link}
                </a>
              )
            )}
          </nav>
          </div>
          <div className="border-t border-outline-variant/10 pt-6 text-center">
            <p className="text-xs tracking-widest uppercase text-on-surface/30 font-label">
              &copy; 2026 CareerGPS. Navigating the Future.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
