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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/role/moderator`, {
          credentials: 'include'
        })
        const isModerator = await res.json()
        if (!isModerator) {
          router.push('/')
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        console.log(err)
        router.push('/')
      }
    }

    checkModerator()
  }, [router])

  waveformPlayer()
  audioPlayer()

  if (isLoading) return null

  return (
    <div className={styles.page}>
      <button onClick={() => window.location.href = '/profile/moderator'}>Profile</button>
      <button onClick={() => window.location.href = '/profile/moderator/pending_approval'}>Pending Approval</button>
      <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`}>Logout</button>
    </div>
  )
}
