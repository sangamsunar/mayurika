import CategoryPage from '../components/CategoryPage'

const CATEGORIES = ['all', 'ring', 'necklace', 'bracelet', 'chain', 'set']

/* Replace URL with your own photo when ready */
const HERO_IMAGE = '/unisex-banner.jpg'

export default function Unisex() {
  return (
    <CategoryPage
      gender="unisex"
      title="Unisex"
      subtitle="Jewellery designed for everyone — beyond tradition, beyond expectation."
      categories={CATEGORIES}
      heroImage={HERO_IMAGE}
      accentColor="#2DD4BF"
    />
  )
}
