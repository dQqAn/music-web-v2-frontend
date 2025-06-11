'use client'

import { audioPlayer } from "@/public/scripts/ts/audio_player/audio_player";
import { waveformPlayer } from "@/public/scripts/ts/audio_player/audio_player";
import styles from "../page.module.css";
import "@/public/styles/public_artist_profile.css"
import { useSearchParams } from "next/navigation";
import { getSound } from "@/public/scripts/ts/soundList";
import { useEffect, useRef, useState } from "react";
import { Sound } from "@/public/types/sound";
import { fetchAudio } from "@/public/scripts/newSoundList";
import WaveSurfer from "wavesurfer.js";

export default function PublicArtistProfile() {
    const searchParams = useSearchParams()
    const soundID = searchParams.get('soundID')

    const [sound, setSound] = useState<Sound | null>(null)

    useEffect(() => {
        if (!soundID) return

        const fetchSound = async () => {
            const sound = await getSound(soundID)
            setSound(sound)
        }

        fetchSound()

    }, [soundID])

    waveformPlayer()
    audioPlayer()

    if (!soundID || !sound) return null

    const artistArray = typeof sound.artistIDs === 'string'
        ? JSON.parse(sound.artistIDs)
        : sound.artistIDs;

    return (
        <div className={styles.page}>
            <p>{sound.name}</p>
            <p>Artists: {
                artistArray.map((a: { name: string }) => a.name).join(', ')
            }</p>
            <SoundPageWaveSurfer key={sound.soundID} sound={sound} />
        </div>
    )
}

function SoundPageWaveSurfer({ sound }: { sound: Sound }) {
    const waveSurferRef = useRef<WaveSurfer | null>(null)
    const waveContainerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!waveContainerRef.current) return

        if (waveSurferRef.current) {
            waveSurferRef.current.destroy()
        }

        const listWaveSurfer = WaveSurfer.create({
            container: waveContainerRef.current,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            url: '',
            height: 75,
            width: 500,
            // dragToSeek: true, // minPxPerSec: 100,
            plugins: [],
        })

        waveSurferRef.current = listWaveSurfer

        const controller = new AbortController()
        const signal = controller.signal
        fetchAudio(sound.soundID, waveSurferRef.current, signal);
    }, [])

    return (
        <div id={`div_${sound.soundID}`} ref={waveContainerRef}></div>
    )
}
