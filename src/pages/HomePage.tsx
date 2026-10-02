import { FeaturedHero } from '@/features/catalogue/components/HeroCarousel'
import {
  ComingSoonSection,
  NowPlayingSection,
  RecentlyViewedSection,
} from '@/features/catalogue/components/HomeSections'

export function HomePage() {
  return (
    <>
      <h1 className="sr-only">Kino XII</h1>
      <FeaturedHero />
      {/* Every section after the first gets a divider above it: 40px gap, line, 40px padding. */}
      <div className="mt-8 flex flex-col gap-10 pb-4 [&>*+*]:border-t [&>*+*]:border-raised [&>*+*]:pt-10">
        <RecentlyViewedSection />
        <NowPlayingSection />
        <ComingSoonSection />
      </div>
    </>
  )
}
