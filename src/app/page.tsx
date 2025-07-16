"use client";



import HeroSection from '../components/HeroSection';
import GamesCarousel from '../components/GamesCarousel';
import MachinesCarousel from '../components/MachinesCarousel';
import HowItWorksSection from '../components/HowItWorksSection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';




// Interfaces for our data
export default function HomePage() {

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
        <HeroSection />
        <HowItWorksSection />
        <GamesCarousel />
        <MachinesCarousel />
        <FAQSection />
        <ContactSection />
      </main>
    </>
  );
}
