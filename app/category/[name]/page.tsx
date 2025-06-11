'use client'

import { audioPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import { waveformPlayer } from "@/public/scripts/ts/audio_player/audio_player"
import "@/public/styles/category.css"
import styles from "../../page.module.css"
import { SoundList } from "@/public/scripts/newSoundList"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"


export default function Category() {
    const params = useParams()

    const [categoryTag, setCategoryTag] = useState<string | null>(null)
    const [artistID, setArtistID] = useState<string | null>(null)
    const [source, setSource] = useState<string | null>(null)

    useEffect(() => {
        const name = params.name as string
        if (!name) return
        const [tag, source] = name.split('__')
        if (tag && source) {
            setCategoryTag(tag)
            setArtistID(null)
            setSource(source)
        }
    }, [params])

    waveformPlayer()
    audioPlayer()

    if (!categoryTag || !source) return null

    return (
        <div className={styles.page}>
            <div className="flex-container">
                <div className="flex-column">
                    <SoundList categoryTag={categoryTag} artistID={artistID} source={source} />
                    <div id="pagination" className="pagination"></div>
                </div>
            </div>
        </div>
    )
}