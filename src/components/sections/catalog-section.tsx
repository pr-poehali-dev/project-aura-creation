import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Icon from "@/components/ui/icon"

const girls = [
  {
    id: 1,
    name: "Анастасия",
    age: 23,
    city: "Москва",
    mood: "Мечтательная",
    emoji: "🌸",
    donations: 47,
    image: "https://cdn.poehali.dev/projects/7c357816-5304-43cd-84f4-7e28f80ddc76/files/bc20d32f-07ed-4b2e-9cce-833999d1a6bc.jpg",
    online: true,
  },
  {
    id: 2,
    name: "Виктория",
    age: 25,
    city: "Санкт-Петербург",
    mood: "Романтичная",
    emoji: "💜",
    donations: 82,
    image: "https://cdn.poehali.dev/projects/7c357816-5304-43cd-84f4-7e28f80ddc76/files/0a18a58e-b5d8-41ee-8da1-818f6a4d1699.jpg",
    online: true,
  },
  {
    id: 3,
    name: "Алина",
    age: 21,
    city: "Казань",
    mood: "Игривая",
    emoji: "✨",
    donations: 31,
    image: "https://cdn.poehali.dev/projects/7c357816-5304-43cd-84f4-7e28f80ddc76/files/c77a3736-71fe-4f27-9da9-e13db2eedd25.jpg",
    online: false,
  },
  {
    id: 4,
    name: "Диана",
    age: 27,
    city: "Екатеринбург",
    mood: "Загадочная",
    emoji: "🔮",
    donations: 115,
    image: "https://cdn.poehali.dev/projects/7c357816-5304-43cd-84f4-7e28f80ddc76/files/4302514e-66ab-4064-bbc6-181ee8e8a749.jpg",
    online: true,
  },
  {
    id: 5,
    name: "Мия",
    age: 22,
    city: "Новосибирск",
    mood: "Нежная",
    emoji: "🌷",
    donations: 58,
    image: "https://cdn.poehali.dev/projects/7c357816-5304-43cd-84f4-7e28f80ddc76/files/0cdd3d68-fd4b-445c-9d6a-af56c39b6b66.jpg",
    online: false,
  },
  {
    id: 6,
    name: "Ева",
    age: 24,
    city: "Краснодар",
    mood: "Солнечная",
    emoji: "☀️",
    donations: 73,
    image: "https://cdn.poehali.dev/projects/7c357816-5304-43cd-84f4-7e28f80ddc76/files/f410574f-7a5c-4347-8c89-2859535b4384.jpg",
    online: true,
  },
]

const PAYMENT_URL = "https://functions.poehali.dev/b9f4052f-e148-44b7-bc82-433e27a48293"

function DonateModal({ girl, onClose }: { girl: typeof girls[0]; onClose: () => void }) {
  const amounts = [100, 300, 500, 1000, 2000, 5000]
  const [selected, setSelected] = useState(500)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSend = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selected,
          girl_name: girl.name,
          message,
          return_url: window.location.href,
        }),
      })
      const data = await res.json()
      if (data.confirmation_url) {
        window.location.href = data.confirmation_url
      } else {
        setError("Не удалось создать платёж. Попробуйте позже.")
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-background rounded-2xl p-6 w-full max-w-md shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", bounce: 0.3 }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <Icon name="X" size={20} />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <img src={girl.image} alt={girl.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-serif text-xl text-foreground">Поддержать {girl.name}</h3>
            <p className="text-muted-foreground text-sm">{girl.city} · {girl.mood} {girl.emoji}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3">Выбери сумму</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelected(amount)}
              className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                selected === amount
                  ? "bg-primary text-primary-foreground scale-105"
                  : "bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {amount.toLocaleString()} ₽
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Напиши ей пару слов... (необязательно)"
          className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary mb-4"
        />

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Icon name="Loader2" size={18} className="animate-spin" />
          ) : (
            <Icon name="Heart" size={18} />
          )}
          {loading ? "Создаём платёж..." : `Отправить ${selected.toLocaleString()} ₽`}
        </button>
      </motion.div>
    </motion.div>
  )
}

export function CatalogSection() {
  const [selectedGirl, setSelectedGirl] = useState<typeof girls[0] | null>(null)

  return (
    <section className="bg-secondary px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-3">Каталог</p>
          <h2 className="text-3xl md:text-5xl font-serif text-foreground">
            Найди ту, кому хочешь <em className="italic">улыбнуться</em>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {girls.map((girl, i) => (
            <motion.div
              key={girl.id}
              className="bg-background rounded-2xl overflow-hidden group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedGirl(girl)}
              data-clickable
            >
              <div className="relative h-72 overflow-hidden">
                <motion.img
                  src={girl.image}
                  alt={girl.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Online badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                  <div className={`w-2 h-2 rounded-full ${girl.online ? "bg-green-400" : "bg-gray-400"}`} />
                  <span className="text-white text-xs">{girl.online ? "онлайн" : "не в сети"}</span>
                </div>

                {/* Name overlay */}
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-serif text-xl">{girl.name}, {girl.age}</p>
                  <p className="text-white/70 text-sm">{girl.city}</p>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{girl.emoji}</span>
                  <span className="text-sm text-muted-foreground">{girl.mood}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Icon name="Heart" size={12} />
                  <span>{girl.donations} донатов</span>
                </div>
              </div>

              <div className="px-4 pb-4">
                <motion.button
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon name="Gift" size={15} />
                  Поддержать
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedGirl && (
          <DonateModal girl={selectedGirl} onClose={() => setSelectedGirl(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}