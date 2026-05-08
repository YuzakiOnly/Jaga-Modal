import CtaSection from "@/components/home/cta-section";
import EarlyAccessSection from "@/components/home/early-access-section";
import FeaturesSection from "@/components/home/features-section";
import HeroSection from "@/components/home/Hero-section";
import MarqueeTicker from "@/components/home/marquee-ticker";
import PricingSection from "@/components/home/pricing-section";
import StatsBar from "@/components/home/stats-bar";
import TeamSection from "@/components/home/team-section";
import WhyUsSection from "@/components/home/why-us-section";
import GuestLayout from "@/layouts/GuestLayout";

export default function Home() {
    return (
        <GuestLayout>
            <HeroSection />
            <MarqueeTicker />
            <StatsBar />

            <hr className="h-px border-0 bg-linear-to-r from-transparent via-warm-50 to-transparent" />
            <FeaturesSection />

            <hr className="h-px border-0 bg-linear-to-r from-transparent via-warm-50 to-transparent" />
            <WhyUsSection />

            <hr className="h-px border-0 bg-linear-to-r from-transparent via-warm-50 to-transparent" />
            <EarlyAccessSection />

            <hr className="h-px border-0 bg-linear-to-r from-transparent via-warm-50 to-transparent" />
            <TeamSection />

            <hr className="h-px border-0 bg-linear-to-r from-transparent via-warm-50 to-transparent" />
            <PricingSection />

            <CtaSection />
        </GuestLayout>
    );
}
