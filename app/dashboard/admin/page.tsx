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
    const checkAdmin = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/role/admin', {
          credentials: 'include'
        })
        const isAdmin = await res.json()
        if (!isAdmin) {
          router.push('/')
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        router.push('/')
      }
    }

    checkAdmin()
  }, [router])

  waveformPlayer()
  audioPlayer()

  if (isLoading) return null

  return (
    <div className={styles.page}>
      <h1>Admin Dashboard</h1>
    </div>
  )
}
