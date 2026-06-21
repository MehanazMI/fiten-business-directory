'use client'

import dynamic from 'next/dynamic'

const WorldMap = dynamic(() => import('./WorldMap'), { ssr: false })

export default function WorldMapLazy({
  theme,
  pins,
}: {
  theme?: 'dark' | 'light'
  pins?: { coords: [number, number]; city: string }[]
}) {
  return <WorldMap theme={theme} pins={pins} />
}
