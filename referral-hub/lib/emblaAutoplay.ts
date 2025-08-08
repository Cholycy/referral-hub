import type { EmblaCarouselType } from 'embla-carousel'

export type PluginType = {
  name?: string
  onInit: (embla: EmblaCarouselType) => void
}

type AutoplayOptions = {
  delay?: number
  stopOnInteraction?: boolean
  stopOnMouseEnter?: boolean
}

export function Autoplay(userOptions: AutoplayOptions = {}): PluginType {
  let timer = 0
  let stop = false

  const options: Required<AutoplayOptions> = {
    delay: 4000,
    stopOnInteraction: true,
    stopOnMouseEnter: false,
    ...userOptions,
  }

  return {
    name: 'autoplay',
    onInit: (embla: EmblaCarouselType) => {
      const play = () => {
        if (stop) return
        clearTimeout(timer)
        timer = window.setTimeout(() => {
          if (embla.canScrollNext()) embla.scrollNext()
          else embla.scrollTo(0)
        }, options.delay)
      }

      const stopAutoplay = () => {
        stop = true
        clearTimeout(timer)
      }

      const startAutoplay = () => {
        stop = false
        play()
      }

      embla.on('pointerDown', () => {
        if (options.stopOnInteraction) stopAutoplay()
      })

      if (options.stopOnMouseEnter) {
        embla.containerNode().addEventListener('mouseenter', stopAutoplay)
        embla.containerNode().addEventListener('mouseleave', startAutoplay)
      }

      embla.on('select', play)
      embla.on('destroy', () => clearTimeout(timer))

      play()
    },
  }
}
