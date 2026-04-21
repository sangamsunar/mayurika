import CategoryPage from '../components/CategoryPage'

const CATEGORIES = ['all', 'ring', 'bracelet', 'chain', 'necklace', 'cufflink', 'set']

/* Replace URL with your own photo when ready */
const HERO_IMAGE = '/man-banner.jpg'

export default function Men() {
  return (
    <CategoryPage
      gender="male"
      title="Men"
      subtitle="Handcrafted jewellery for every man — from bold statement rings to refined chains."
      categories={CATEGORIES}
      heroImage={HERO_IMAGE}
      accentColor="#60A5FA"
    />
  )
}
