import HomeLayout from "@/components/layout/home-layout";
import Hero from "@/components/home/hero";
import ProductPreview from "@/components/home/product-preview";
import HowItWorks from "@/components/home/how-it-works";
import Features from "@/components/home/features";

export default function Home() {
  return (
    <HomeLayout>
      <Hero />
      <ProductPreview />
      <HowItWorks />
      <Features />
    </HomeLayout>
  );
}
