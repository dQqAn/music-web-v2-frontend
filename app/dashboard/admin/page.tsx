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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/role/admin`, {
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
      <button onClick={() => window.location.href = '/profile/admin'}>Profile</button>
      <button onClick={() => window.location.href = '/dashboard/admin/register'}>Register</button>
      <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`}>Logout</button>
      <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/admin/metaDataSave`}>MetaDataSave</button>
    </div>
  )
}
