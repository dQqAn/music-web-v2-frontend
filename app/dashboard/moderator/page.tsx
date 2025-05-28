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
    const checkModerator = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/role/moderator', {
          credentials: 'include'
        })
        const isModerator = await res.json()
        if (!isModerator) {
          router.push('/')
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        router.push('/')
      }
    }

    checkModerator()
  }, [router])

  if (isLoading) return null

  waveformPlayer()
  audioPlayer()

  return (
    <div className={styles.page}>
      <h1>Moderator Dashboard</h1>
    </div>
  )
}
