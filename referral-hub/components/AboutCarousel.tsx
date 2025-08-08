import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import type { EmblaOptionsType } from 'embla-carousel'
import { useRouter } from 'next/navigation'

const categories = [
    {
        name: 'Credit Card',
        icon: '💳',
        description:
            'Share card picks that earn you points, perks, or cashback — and help others find great rewards too.',
    },
    {
        name: 'Bank / Investment',
        icon: '🏦',
        description:
            'Invite friends to banking apps or investment platforms you trust — from stocks to crypto.',
    },
    {
        name: 'Mobile / Internet',
        icon: '📶',
        description:
            'Recommend mobile plans, eSIMs, or home internet services that worked well for you.',
    },
    {
        name: 'Shopping / Cashback',
        icon: '🛒',
        description:
            'From Rakuten to Ibotta — share smart ways to earn while you shop.',
    },
    {
        name: 'Subscriptions',
        icon: '📦',
        description:
            'Meal kits, streaming, pet boxes — let others know which subscriptions are actually worth it.',
    },
    {
        name: 'Travel & Transport',
        icon: '✈️',
        description:
            'Refer your favorite travel apps, flight deals, rideshare credits, or Airbnb discounts.',
    },
    {
        name: 'Health & Fitness',
        icon: '🧘',
        description:
            'Gym memberships, wellness apps, meditation tools — share what keeps you feeling your best.',
    },
    {
        name: 'Education',
        icon: '🎓',
        description:
            'From coding to languages, invite others to learn with platforms you’ve personally tried.',
    },
    {
        name: 'Apps & Tools',
        icon: '🧰',
        description:
            'Share must-have tools like Notion, Canva, or Dropbox — the ones that make life smoother.',
    },
    {
        name: 'Others',
        icon: '🌀',
        description:
            'Got something unique? Share cool finds — from niche clubs to exclusive memberships.',
    },
];

const options: EmblaOptionsType = { loop: true }

export default function AboutCarousel() {
    const router = useRouter()
    const [emblaRef] = useEmblaCarousel(options, [
        Autoplay({ delay: 3000, stopOnInteraction: false }),
    ])

    // Helper to handle category click
    const handleCategoryClick = (category: string) => {
        // Use encodeURIComponent for safety
        router.push(`/?category=${encodeURIComponent(category)}`);
    };

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex select-none gap-4 px-4">
                {categories.map((cat, index) => (
                    <div key={cat.name}
                        className="flex bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-blue-200 cursor-pointer hover:bg-white/50 transition max-w-full"
                        onClick={() => handleCategoryClick('education')
                        }
                        tabIndex={0}
                        role="button"
                    >
                        {/* Icon: fixed width, centered */}
                        <div className="flex-shrink-0 w-20 flex justify-center items-center">
                            <span className="text-6xl">{cat.icon}</span>
                        </div>

                        {/* Text container: flex-grow, consistent horizontal padding, allow shrinking */}
                        <div className="flex flex-col justify-center flex-grow px-6 min-w-0">
                            <span className="font-semibold text-blue-800 text-lg whitespace-nowrap">{cat.name}</span>
                            <span className="text-gray-600 text-sm break-words whitespace-normal">{cat.description}</span>
                        </div>
                    </div>



                )
                )}
            </div>
        </div>
    )
}
