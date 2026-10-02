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
      {/* Every section after the first gets a divider above it: 40px gap, line, 40px padding.
          36px at the bottom: Figma's Coming Soon section has 20px of room under its cards, then
          16px to the footer. */}
      <div className="mt-8 flex flex-col gap-10 pb-9 [&>*+*]:border-t [&>*+*]:border-raised [&>*+*]:pt-10">
        <RecentlyViewedSection />
        <NowPlayingSection />
        <ComingSoonSection />
      </div>
    </>
  )
}
