import CategoryPage from '../components/CategoryPage'

const CATEGORIES = ['all', 'ring', 'necklace', 'bracelet', 'earring', 'anklet', 'tayo', 'tilhari', 'churra', 'pote', 'kantha', 'set']

/* Replace URL with your own photo when ready */
const HERO_IMAGE = 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1920&q=80'

export default function Women() {
  return (
    <CategoryPage
      gender="female"
      title="Women"
      subtitle="From timeless traditional to contemporary — jewellery crafted for every occasion."
      categories={CATEGORIES}
      heroImage={HERO_IMAGE}
      accentColor="#F472B6"
    />
  )
}
