import { Link } from 'react-router-dom'

export default function About() {
    return (
        <div className="min-h-screen">

            {/* Hero */}
            <section className="bg-black text-white py-24 px-8 text-center">
                <p className="text-xs tracking-[0.4em] text-yellow-400 uppercase mb-4">Our Story</p>
                <h1 className="text-5xl font-bold tracking-widest mb-6">MARYURIKA</h1>
                <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
                    Born in the heart of Kathmandu, Maryurika is where ancient Nepali jewellery traditions meet modern design and technology.
                </p>
            </section>

            {/* Story */}
            <section className="py-20 px-8 max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Crafted with Purpose</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Maryurika was founded with a single belief — that jewellery is not just an accessory, it is a story. Every piece we craft carries the weight of generations of Nepali artisanship, passed down through families in Patan, Bhaktapur, and Kathmandu.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We started as a small workshop in Kathmandu, working with local goldsmiths who had honed their craft over decades. Today, we bring that same craftsmanship to you — enhanced with 3D visualization so you can see every detail before your piece is made.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            From traditional Tilhari and Churra worn at Nepali weddings, to bold gothic and cybersilian pieces for the youth — we believe every person deserves jewellery that tells their unique story.
                        </p>
                    </div>
                    <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center text-6xl">
                        🪔
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-20 px-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">What We Stand For</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🏅',
                                title: 'Purity & Trust',
                                desc: 'Every piece is hallmark certified by the Government of Nepal. We never compromise on the purity of our metals — what we say is what you get.'
                            },
                            {
                                icon: '🔨',
                                title: 'Craftsmanship First',
                                desc: 'Our artisans are master craftsmen from Patan and Bhaktapur — the historic heart of Nepali metalwork. Each piece is made by hand with decades of expertise.'
                            },
                            {
                                icon: '🌱',
                                title: 'Supporting Local',
                                desc: 'By choosing Maryurika, you support local Nepali artisans, their families, and the preservation of ancient jewellery-making traditions.'
                            },
                            {
                                icon: '🔮',
                                title: 'Innovation',
                                desc: 'We are the first jewellery brand in Nepal to offer interactive 3D previews of every piece. See your jewellery from every angle before it is made.'
                            },
                            {
                                icon: '💬',
                                title: 'Personal Service',
                                desc: 'We are a small team that cares deeply. Every custom order is a personal conversation. We listen, we design, we deliver.'
                            },
                            {
                                icon: '🇳🇵',
                                title: 'Proudly Nepali',
                                desc: 'From the metals we source to the hands that craft them — everything about Maryurika is rooted in Nepal.'
                            },
                        ].map(val => (
                            <div key={val.title} className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="text-3xl mb-4">{val.icon}</div>
                                <h3 className="font-bold mb-2">{val.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team / Craft */}
            <section className="py-20 px-8 max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">The Craft Behind Every Piece</h2>
                <p className="text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                    Jewellery making in Nepal is a sacred tradition. Our craftsmen follow processes passed down through generations — from wax carving and casting, to stone setting and polishing. Every piece takes days to complete.
                </p>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { step: '01', title: 'Design', desc: 'Customer selects design, metal, purity and weight' },
                        { step: '02', title: 'Crafting', desc: 'Master artisans hand-craft your piece in our workshop' },
                        { step: '03', title: 'Delivery', desc: 'Hallmark certified piece delivered to your door' },
                    ].map(s => (
                        <div key={s.step} className="bg-gray-50 rounded-xl p-6">
                            <p className="text-3xl font-bold text-gray-200 mb-3">{s.step}</p>
                            <h3 className="font-bold mb-2">{s.title}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Store location */}
            <section className="bg-black text-white py-16 px-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Visit Our Store</h2>
                <p className="text-gray-400 mb-6">Come see us in person. Try on pieces, meet our craftsmen, and experience Maryurika up close.</p>
                <a href="https://maps.app.goo.gl/yrSCeXrXMU2mAK387" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition">
                    📍 Get Directions
                </a>
                <p className="text-gray-500 text-sm mt-4">Kathmandu, Nepal · Open Sunday–Friday, 10AM–7PM</p>
            </section>

            {/* CTA */}
            <section className="py-16 px-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Start Your Journey</h2>
                <p className="text-gray-500 mb-8">Find your perfect piece or tell us your dream design.</p>
                <div className="flex gap-4 justify-center">
                    <Link to="/search" className="bg-black text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-gray-800 transition">Shop Collection</Link>
                    <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
                        className="border border-gray-300 text-gray-600 px-8 py-3 rounded-lg font-semibold text-sm hover:border-gray-500 transition">
                        Custom Order
                    </a>
                </div>
            </section>

        </div>
    )
}