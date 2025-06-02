'use client'

import { audioPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import { waveformPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import "@/public/styles/category.css"
import styles from "../../page.module.css"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PlaylistSounds } from "@/public/scripts/ts/playlist/playlist"


export default function Playlist() {
    const params = useParams()

    const [playlistID, setPlaylistID] = useState<string | null>(null)

    useEffect(() => {
        const playlistID = params.playlistID as string
        if (!playlistID) return
        setPlaylistID(playlistID)
    }, [params])

    waveformPlayer()
    audioPlayer()

    if (!playlistID) return null

    return (
        <div className={styles.page}>
            <div className="flex-container">
                <div className="flex-column">
                    <PlaylistSounds playlistID={playlistID} />
                    <div id="pagination" className="pagination"></div>
                </div>
            </div>
        </div>
    )
}