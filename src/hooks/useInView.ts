import { useEffect, useState, useRef, RefObject } from 'react'

export const useInView = (options?: IntersectionObserverInit): [boolean, RefObject<HTMLElement>] => {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
      },
      { 
        threshold: 0.1,
        ...options 
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [options])

  return [inView, ref]
}

