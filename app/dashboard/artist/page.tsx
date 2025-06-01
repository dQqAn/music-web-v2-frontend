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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/role/artist`, {
          credentials: 'include'
        })
        const isArtist = await res.json()
        if (!isArtist) {
          router.push('/')
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        console.log(err)
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
      <button onClick={() => window.location.href = '/profile/artist'}>Profile</button>
      <button onClick={() => window.location.href = '/profile/artist/single_sound'}>Single Sound</button>
      <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`}>Logout</button>
    </div>
  )
}
