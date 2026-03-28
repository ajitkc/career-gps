import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import JourneyRoad from "@/components/JourneyRoad";
import CareerCards from "@/components/CareerCards";
import BurnoutTraffic from "@/components/BurnoutTraffic";
import RoadmapPreview from "@/components/RoadmapPreview";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <JourneyRoad />
        <CareerCards />
        <BurnoutTraffic />
        <RoadmapPreview />
        <CTASection />
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 bg-surface-container-low border-t border-outline-variant/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-on-surface/40 font-label">
            &copy; 2025 Career GPS. Navigating the Future.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {["Privacy", "Terms", "Support", "LinkedIn", "Twitter"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs tracking-widest uppercase text-on-surface/40 hover:text-primary transition-colors font-label"
                >
                  {link}
                </a>
              )
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
