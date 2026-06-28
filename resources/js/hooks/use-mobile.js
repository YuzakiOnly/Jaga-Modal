import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange);
  }, [])

  return !!isMobile
}

export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState(undefined)

  React.useEffect(() => {
    const getType = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) return "mobile"
      if (width < TABLET_BREAKPOINT) return "tablet"
      return "desktop"
    }

    const mobileMql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const tabletMql = window.matchMedia(
      `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`,
    )

    const onChange = () => setDeviceType(getType())

    mobileMql.addEventListener("change", onChange)
    tabletMql.addEventListener("change", onChange)
    setDeviceType(getType())

    return () => {
      mobileMql.removeEventListener("change", onChange)
      tabletMql.removeEventListener("change", onChange)
    }
  }, [])

  return deviceType
}