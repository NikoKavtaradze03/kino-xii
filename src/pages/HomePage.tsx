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
      <div className="mt-8 flex flex-col gap-10 divide-y divide-raised pb-4 [&>*+*]:pt-10">
        <RecentlyViewedSection />
        <NowPlayingSection />
        <ComingSoonSection />
      </div>
    </>
  )
}
