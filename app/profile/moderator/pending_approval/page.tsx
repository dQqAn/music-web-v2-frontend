'use client'

import { waveformPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import { audioPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import "@/public/styles/moderator_pending_approval.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSounds, submitButton } from "@/public/scripts/ts/moderator_pending_approval/moderator_pending_approval"

export default function ModeratorPendingApproval() {
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
                setIsLoading(false)
                console.log(err)
                router.push('/')
            }
        }

        checkModerator()
    }, [router])

    waveformPlayer()
    audioPlayer()

    useEffect(() => {
        if (!isLoading) {
            getSounds(1)
        }
    }, [isLoading])

    if (isLoading) return null

    return (
        <div className="page">
            <div style={{ }} id="tableOptions">
                <table >
                    <thead>
                        <tr>
                            <th ></th>
                            <th>Name</th>
                            <th >Artist</th>
                            <th >Tags</th>
                            <th >Image</th>
                            <th >Sound</th>
                        </tr>
                    </thead>
                    <tbody id="tbodyContent">
                    </tbody>
                </table>
            </div>

            <div>
                <button id="submitButton" onClick={submitButton}>Submit</button>
                <div id="pagination" ></div>
            </div>
        </div>
    )
}