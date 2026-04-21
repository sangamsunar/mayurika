import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { XIcon, DiamondIcon, StarIcon } from './Icons'

const getSessionId = () => {
  let id = sessionStorage.getItem('chat_session_id')
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem('chat_session_id', id)
  }
  return id
}

function TypingDots() {
  return (
    <div className="flex items-end gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]"
          style={{ animation: `chatbotBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
    </div>
  )
}

function ProductCard({ product, onNavigate }) {
  const imgUrl = product.images?.[0] ? `http://localhost:8000${product.images[0]}` : null
  return (
    <button onClick={() => onNavigate(product._id)}
      className="flex-shrink-0 w-36 rounded-xl overflow-hidden glass-sm hover:border-[#C9A96E]/30 hover:-translate-y-0.5 transition-all duration-200 text-left">
      <div className="h-24 bg-white/[0.02] flex items-center justify-center overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none' }} />
        ) : (
          <DiamondIcon size={24} className="text-white/20" />
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[11px] font-semibold text-ink line-clamp-2 leading-tight">{product.name}</p>
        <p className="text-[10px] text-[#C9A96E] capitalize mt-0.5 tracking-wider">{product.category}</p>
        {product.rating > 0 && (
          <p className="flex items-center gap-1 text-[10px] text-[#C9A96E] mt-0.5">
            <StarIcon size={10} filled /> {product.rating.toFixed(1)}
          </p>
        )}
      </div>
    </button>
  )
}

function MessageBubble({ msg, onNavigate }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1.5`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
        ${isUser
          ? 'bg-[#C9A96E] text-[#07070A] rounded-br-sm font-medium'
          : 'glass-sm text-ink rounded-bl-sm'}`}>
        {msg.content}
      </div>
      {!isUser && msg.products?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {msg.products.map(p => (
            <ProductCard key={p._id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const sessionId = useRef(getSessionId())

  useEffect(() => {
    if (!open || messages.length > 0) return
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(`/api/chatbot/history/${sessionId.current}`)
        if (data.messages?.length > 0) setMessages(data.messages)
        else setMessages([{ role: 'assistant', content: "Namaste. I'm Mayu, your personal jewellery concierge. Ask me about rings, necklaces, gold rates, or custom pieces — I'm here to guide you.", products: [] }])
      } catch {
        setMessages([{ role: 'assistant', content: "Namaste. I'm Mayu. How can I help you find the perfect jewellery today?", products: [] }])
      }
    }
    fetchHistory()
  }, [open])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
  useEffect(() => { if (open) { setHasUnread(false); setTimeout(() => inputRef.current?.focus(), 300) } }, [open])

  const handleNavigate = useCallback((productId) => {
    setOpen(false)
    navigate(`/product/${productId}`)
  }, [navigate])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text, products: [] }])
    setInput('')
    setLoading(true)
    try {
      const { data } = await axios.post('/api/chatbot/chat', { message: text, sessionId: sessionId.current })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, products: data.products || [] }])
      if (!open) setHasUnread(true)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: err.response?.data?.error || 'Something went wrong. Please try again.', products: [] }])
    } finally { setLoading(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const suggestions = ['Show me gold rings', 'Wedding jewellery', 'Current gold rate', 'Silver necklaces']

  return (
    <>
      <style>{`
        @keyframes chatbotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes chatbotPop {
          0% { transform: scale(0.5) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes chatbotFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .chat-window-enter { animation: chatbotPop 0.35s cubic-bezier(0.175,0.885,0.32,1.1) forwards; transform-origin: bottom right; }
        .chat-msg-enter { animation: chatbotFadeIn 0.25s ease forwards; }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.2); border-radius: 2px; }
      `}</style>

      {open && (
        <div className="chat-window-enter fixed bottom-24 right-6 z-[9998] flex flex-col rounded-2xl overflow-hidden"
          style={{ width: 380, height: 600, background: 'rgba(15, 15, 18, 0.92)', backdropFilter: 'blur(24px) saturate(1.4)', border: '1px solid rgba(201,169,110,0.15)' }}>

          <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0 border-b border-white/[0.06]"
            style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.1) 0%, rgba(201,169,110,0.02) 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #F5D98C 0%, #C9A96E 50%, #8B6F47 100%)',
                padding: 2,
                boxShadow: '0 0 12px rgba(201,169,110,0.4)'
              }}>
                <img src="/mayu-avatar.jpg" alt="Mayu" className="w-full h-full object-cover rounded-full" style={{ objectPosition: 'center 20%' }} />
              </div>
              <div>
                <p className="font-display text-[#E8D4A0] font-semibold text-sm leading-tight">Mayu</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <p className="text-ink-dim text-[10px] tracking-wider uppercase">Concierge</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full glass-sm hover:bg-white/[0.05] flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
              aria-label="Close chat">
              <XIcon size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className="chat-msg-enter">
                <MessageBubble msg={msg} onNavigate={handleNavigate} />
              </div>
            ))}
            {loading && (
              <div className="flex items-start">
                <div className="glass-sm rounded-2xl rounded-bl-sm">
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-3 py-2.5 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0 border-t border-white/[0.06]">
              {suggestions.map(s => (
                <button key={s} onClick={() => { setInput(s); setTimeout(sendMessage, 0) }}
                  className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-[#C9A96E]/20 text-[#C9A96E] hover:bg-[#C9A96E]/10 transition-colors whitespace-nowrap">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 px-3 py-3 border-t border-white/[0.06] flex-shrink-0">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ask about jewellery…" rows={1}
              className="flex-1 resize-none rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-ink placeholder:text-ink-dim focus:outline-none focus:border-[#C9A96E]/40 focus:bg-white/[0.05] transition-all"
              style={{ maxHeight: 80 }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px' }}
              disabled={loading} />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#C9A96E] hover:bg-[#E8D4A0]"
              aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#07070A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #F5D98C 0%, #C9A96E 30%, #A07840 65%, #6B4F2A 100%)',
          boxShadow: '0 8px 32px rgba(201,169,110,0.55), 0 0 0 2px rgba(232,212,160,0.35), 0 0 60px rgba(201,169,110,0.2)',
          padding: 3,
        }}
        aria-label={open ? 'Close chat' : 'Open chat'}>
        {open ? (
          <div className="w-full h-full rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, #C9A96E, #8B6F47)' }}>
            <XIcon size={18} className="text-[#07070A]" />
          </div>
        ) : (
          <>
            <img src="/mayu-avatar.jpg" alt="Mayu" className="w-full h-full object-cover rounded-full" style={{ objectPosition: 'center 20%' }} />
            {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#07070A]" />}
          </>
        )}
      </button>
    </>
  )
}
