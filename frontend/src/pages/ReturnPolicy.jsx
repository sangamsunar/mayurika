import { Link } from 'react-router-dom'

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-8 py-10 text-center">
        <h1 className="text-3xl font-bold tracking-widest uppercase">Return & Refund Policy</h1>
        <p className="text-gray-400 text-sm mt-2">Last updated: April 2026</p>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-12 space-y-10">

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="font-semibold text-yellow-800 mb-1">⚠️ Important Note</p>
          <p className="text-sm text-yellow-700 leading-relaxed">
            Because all Maryurika jewellery is <strong>made to order</strong> based on your selected metal, purity, and measurements, we follow a specific return policy. Please read carefully before placing your order.
          </p>
        </div>

        {[
          {
            title: '1. Made-to-Order Policy',
            content: `All jewellery at Maryurika is crafted specifically for you after your order is placed. Because of this, we do not accept returns or exchanges simply due to a change of mind. Once an order enters the "Being Made" status, it cannot be cancelled.`
          },
          {
            title: '2. When We Accept Returns',
            items: [
              'The piece delivered is significantly different from what was ordered (wrong metal, purity, or design)',
              'The piece has a manufacturing defect confirmed by our team',
              'The hallmark certification does not match the ordered purity',
              'The piece is damaged upon delivery (must be reported within 24 hours with photo evidence)',
            ]
          },
          {
            title: '3. How to Request a Return',
            content: `To request a return, contact us on WhatsApp within 24 hours of delivery with:`,
            items: [
              'Your Order ID',
              'Clear photos of the issue',
              'A brief description of the problem',
            ],
            after: `Our team will review your request within 2 business days. If approved, we will arrange collection of the piece and either remake it or process a refund.`
          },
          {
            title: '4. Refund Process',
            items: [
              'Approved refunds are processed within 7–10 business days',
              'Online payments (eSewa/Stripe) are refunded to the original payment method',
              'COD advance payments are refunded via bank transfer or eSewa',
              'The gold/silver value is refunded based on the rate at the time of order, not the current rate',
            ]
          },
          {
            title: '5. Non-Refundable Items',
            items: [
              'Making charge (Jarti/labour) is non-refundable in all cases',
              'Delivery charges are non-refundable unless the return is due to our error',
              'Custom-designed pieces requested via WhatsApp are non-refundable',
            ]
          },
          {
            title: '6. Size Issues',
            content: `We strongly recommend using our size measurement guide before ordering. If you receive a piece that does not fit due to incorrect measurements you provided, we can resize it at a nominal charge. Resizing requests must be made within 7 days of delivery.`
          },
          {
            title: '7. Cancellation Policy',
            content: `Orders can be cancelled only before they enter the "Being Made" status. To cancel, contact us immediately on WhatsApp. If cancelled before production begins, we will refund the full advance payment. Once production has started, no cancellation is possible.`
          },
          {
            title: '8. Contact Us',
            content: `For all return, refund, or cancellation requests, please reach out via WhatsApp for the fastest response. You can also email us at info@maryurika.com.`
          },
        ].map(section => (
          <div key={section.title} className="bg-white rounded-xl border p-6 space-y-3">
            <h2 className="text-lg font-bold">{section.title}</h2>
            {section.content && <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>}
            {section.items && (
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-black mt-0.5 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {section.after && <p className="text-gray-600 text-sm leading-relaxed">{section.after}</p>}
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-black text-white rounded-xl p-6 text-center">
          <h2 className="font-bold text-lg mb-2">Have a question about your order?</h2>
          <p className="text-gray-400 text-sm mb-5">We're here to help. Reach out on WhatsApp for the fastest response.</p>
          <a href="https://wa.me/9779702296671" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-600 transition">
            💬 Contact on WhatsApp
          </a>
        </div>

        <p className="text-center text-xs text-gray-400">
          <Link to="/" className="hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  )
}