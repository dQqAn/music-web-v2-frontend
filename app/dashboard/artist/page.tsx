'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { audioPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import { waveformPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import styles from "../../page.module.css"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkArtist = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/role/artist', {
          credentials: 'include'
        })
        const isArtist = await res.json()
        if (!isArtist) {
          router.push('/')
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        router.push('/')
      }
    }

    checkArtist()
  }, [router])

  waveformPlayer()
  audioPlayer()

  if (isLoading) return null

  return (
    <div className={styles.page}>
      <h1>Artist Dashboard</h1>
    </div>
  )
}
