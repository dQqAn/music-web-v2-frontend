'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { audioPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import { waveformPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import styles from "../../../page.module.css"
import "@/public/styles/admin_register.css";
import { useAdminRegister } from '@/public/scripts/ts/admin_register/admin_register'

export default function Register() {
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

    useAdminRegister(!isLoading)

    if (isLoading) return null

    return (
        <div className={styles.page}>
            <form id="staffForm">
                <label htmlFor="mail">Staff Email:</label>
                <input id="mail" name="mail" required type="email" />

                <p>Select Role:</p>
                <label>
                    <input type="radio" name="role" value="ADMIN" />
                    Admin
                </label>

                <label>
                    <input type="radio" name="role" value="MODERATOR" />
                    Moderator
                </label>

                <label>
                    <input type="radio" name="role" value="ARTIST" required />
                    Artist
                </label>

                <div id="databaseMessage" style={{ display: 'none' }}>User added.</div>

                <div id="roleError" style={{ display: 'none' }}>Please select a role.</div>

                <div id="errorRegister" style={{ display: 'none' }}>
                    <p id="errorMessage"></p>
                </div>

                <button type="submit">Submit</button>
            </form>
        </div>
    )
}
