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
    const checkUser = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/role/user', {
          credentials: 'include'
        })
        const isUser = await res.json()
        if (!isUser) {
          router.push('/')
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        router.push('/')
      }
    }

    checkUser()
  }, [router])

  if (isLoading) return null

  waveformPlayer()
  audioPlayer()

  return (
    <div className={styles.page}>
      <h1>User Dashboard</h1>
    </div>
  )
}
