import { useState, useEffect, useRef } from "react"
import { Sound, SoundListWithSize } from "../types/sound"
import { categorySelectedItems, isBpmChanged, isDurationChanged, parseTimeRange } from "./ts/menu/menu"
import { updatePagination } from "./ts/pagination"
import { addTempSoundID, clearTempAllSoundIDs, handlePlaylistIDToStorage, replaceSoundIDsWith, soundListWaveSurfers } from "./ts/soundList"
import CustomButton from "@/components/button/CustomButton"
import WaveSurfer from "wavesurfer.js"
import { formatTime, mainWaveSurfer } from "./ts/audio_player/audio_player"

export function SoundList({ categoryTag, artistID, source }: { categoryTag: string | null, artistID: string | null, source: string | null }) {
    const [sounds, setSounds] = useState<Sound[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(1)

    const abortRef = useRef<AbortController | null>(null)
    const pageRef = useRef(page)

    const handleLoadSounds = (page: number) => {
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller

        setSounds([])
        fetchSounds(page, categoryTag, artistID, source, controller.signal)
            .then(({ sounds, length }) => {
                setSounds(sounds)
                setTotalCount(length)
                window.history.pushState({ page: page }, `Page ${page}`, `?page=${page}`);
                const totalPages = Math.ceil(length / 10);
                updatePagination("pagination", page, totalPages, (p: number) => {
                    setPage(p);
                })
            })
            .catch((err) => {
                if (err.name === "AbortError") {
                    console.log("fetch iptal edildi")
                } else {
                    console.error("fetch hatası", err)
                }
            })
            .finally(() => { abortRef.current = null })
    }

    useEffect(() => { pageRef.current = page }, [page])

    useEffect(() => {
        const listener = () => {
            handleLoadSounds(pageRef.current)
        }
        window.addEventListener('refreshSounds', listener)
        return () => {
            window.removeEventListener('refreshSounds', listener)
        }
    }, [])

    useEffect(() => {
        handleLoadSounds(page)
    }, [page])

    return (
        <SoundListView sounds={sounds} />
    )
}

export function SoundListView({ sounds }: { sounds: Sound[] }) {
    if (!Array.isArray(sounds) || sounds.length === 0) {
        return <div></div>
    }
    clearTempAllSoundIDs()
    return (
        <div style={{ width: '100%' }}>
            {sounds.map((sound) => (
                <SoundCard key={sound.id} sound={sound} />
            ))}
        </div>
    )
}

function SoundCard({ sound }: { sound: Sound }) {
    const waveSurferRef = useRef<WaveSurfer | null>(null)
    const waveContainerRef = useRef<HTMLDivElement | null>(null)
    const onClickRef = useRef<() => void>(() => { })

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
            // dragToSeek: true, // minPxPerSec: 100,
            plugins: [],
        })

        waveSurferRef.current = listWaveSurfer
        soundListWaveSurfers[sound.soundID] = listWaveSurfer

        /*window.addEventListener('beforeunload', () => {
            if (listWaveSurfer) {
                listWaveSurfer.destroy()
            }
        });*/

        const timeID = 'time_' + sound.soundID
        const durationID = 'duration_' + sound.soundID
        const timeEl = document.getElementById(timeID)
        const durationEl = document.getElementById(durationID)
        listWaveSurfer.on('decode', (duration) => {
            if (durationEl) {
                durationEl.textContent = formatTime(duration)
            }
        })
        listWaveSurfer.on('timeupdate', (currentTime) => {
            if (timeEl) {
                timeEl.textContent = formatTime(currentTime)
            }
        })

        const controller = new AbortController()
        const signal = controller.signal

        fetchAudio(sound.soundID, listWaveSurfer, signal);

        waveContainerRef.current.addEventListener('click', (e) => {
            const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
            const className = 'waveSurfer_' + soundID;
            if (listWaveSurfer.getWrapper().className === className && waveContainerRef.current) {
                const bbox = waveContainerRef.current.getBoundingClientRect();
                const x = e.clientX - bbox.left;
                const percent = x / bbox.width;

                const duration = mainWaveSurfer?.getDuration();
                if (duration && !isNaN(percent)) {
                    mainWaveSurfer?.seekTo(percent);
                }
            }
        });

        listWaveSurfer.once('ready', () => {
            listWaveSurfer.getWrapper().className = "waveSurfer_" + sound.soundID

            onClickRef.current = () => {
                const icon = document.querySelector('.icon_' + sound.soundID);

                if (icon?.getAttribute('data-lucide') === 'play') {

                    replaceSoundIDsWith(sound.soundID)

                    const pathSegments = window.location.pathname.split('/');
                    const playlistID = (pathSegments[1] === "playlist" && pathSegments[2]) ? pathSegments[2] : null;
                    if (playlistID) {
                        handlePlaylistIDToStorage(playlistID)
                    } else {
                        handlePlaylistIDToStorage(null)
                    }

                    const icons = document.querySelectorAll('[data-lucide]');
                    icons.forEach(otherIcon => {
                        if (otherIcon.getAttribute('data-lucide') === 'pause') {
                            otherIcon.setAttribute('data-lucide', 'play');
                        }
                    });
                    const src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stream/sound/${encodeURIComponent(sound.soundID)}`;
                    mainWaveSurfer?.load(src)
                    const wrapper = mainWaveSurfer?.getWrapper()

                    if (wrapper) {
                        wrapper.className = "main_waveSurfer_" + sound.soundID
                    }

                    const listIcon = document.querySelector('.icon_' + sound.soundID);
                    listIcon?.setAttribute('data-lucide', 'pause');

                    mainWaveSurfer?.once('ready', () => {
                        const rateInput = document.getElementById('mainRateInput') as HTMLInputElement;
                        if (rateInput) {
                            mainWaveSurfer?.setPlaybackRate(rateInput.valueAsNumber);
                        }
                        mainWaveSurfer?.play()
                    })
                } else {
                    mainWaveSurfer?.pause()
                    const listIcon = document.querySelector('.icon_' + sound.soundID);
                    listIcon?.setAttribute('data-lucide', 'play');
                }
            }
        })

        return () => {
            try {
                controller.abort()
                listWaveSurfer.destroy()
            } catch (e) {
                console.warn('WaveSurfer destroy error:', e)
            }
        }
    }, [sound.soundID])

    addTempSoundID(sound.soundID)

    const artistArray = typeof sound.artistIDs === 'string'
        ? JSON.parse(sound.artistIDs)
        : sound.artistIDs;

    return (
        <div style={{ border: '1px solid gray', padding: '10px', width: '100%', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <CustomButton
                    text="Play"
                    onClickAction={() => {
                        onClickRef.current?.()
                    }}
                >
                    <i data-lucide="play" className={`icon_${sound.soundID}`}>Play</i>
                </CustomButton>
                <h3>{sound.name}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <p id={`time_${sound.soundID}`}>0:00</p>
                    -
                    <p id={`duration_${sound.soundID}`}>0:00</p>
                </div>
                <p>
                    Kategoriler: {sound.categories.map((category, index) => (
                        <span key={category}>
                            <a href={`/category/${encodeURIComponent(category)}__category`}>{category}</a>
                            {index < sound.categories.length - 1 && ', '}
                        </span>
                    ))}
                </p>
                <p>
                    Enstrümanlar: {sound.instruments.map((instrument, index) => (
                        <span key={instrument}>
                            <a href={`/category/${encodeURIComponent(instrument)}__instrument`}>{instrument}</a>
                            {index < sound.instruments.length - 1 && ', '}
                        </span>
                    ))}
                </p>
                <p>Süre: {sound.duration} saniye</p>
                <p>BPM: {sound.bpm ?? 'Bilinmiyor'}</p>
                <p>Sanatçılar: {
                    artistArray.map((a: { name: string }) => a.name).join(', ')
                }</p>
            </div>
            <div style={{ width: '100%' }} id={`div_${sound.soundID}`} ref={waveContainerRef}></div>
        </div>
    )
}

async function fetchSounds(page: number, categoryTag: string | null = null, artistID: string | null = null, source: string | null = null, signal?: AbortSignal): Promise<SoundListWithSize> {
    let minDuration = null
    let maxDuration = null
    if (isDurationChanged) {
        const output = document.getElementById('durationOutput');
        if (output && output.textContent) {
            const outputResult = parseTimeRange(output.textContent);
            minDuration = outputResult.minSeconds;
            maxDuration = outputResult.maxSeconds;
        }
    }

    let bpm = null
    if (isBpmChanged) {
        const output = document.getElementById('bpmOutput');
        if (output && output.textContent) {
            bpm = parseInt(output.textContent, 10);
        }
    }

    const excludedTags = ['duration', 'bpm'];

    let instrumentSelectedTags: string[] = []
    instrumentSelectedTags = [...categorySelectedItems]
        .filter((item: { tag: string, source: string }) => !excludedTags.includes(item.tag) && item.source === 'instrument')
        .map((item: { tag: string }) => item.tag);

    let categorySelectedTags: string[] = []
    categorySelectedTags = [...categorySelectedItems]
        .filter(item => !excludedTags.includes(item.tag) && item.source === 'category')
        .map(item => item.tag);

    if (categoryTag) {
        if (source === 'instrument') {
            instrumentSelectedTags.push(categoryTag)
        } else {
            categorySelectedTags.push(categoryTag)
        }
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/filterSounds?page=${page}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            categorySelectedTags: categorySelectedTags,
            instrumentSelectedTags: instrumentSelectedTags,
            minDuration: minDuration,
            maxDuration: maxDuration,
            bpm: bpm,
            artistID: artistID
        }),
        credentials: "include",
        signal: signal
    })

    if (!res.ok) {
        throw new Error('Failed to fetch sounds')
    }

    const data: SoundListWithSize = await res.json()
    return data
}

export const fetchAudio = async (
    soundID: string,
    waveSurfer: WaveSurfer,
    signal?: AbortSignal
): Promise<void> => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stream/sound/${encodeURIComponent(soundID)}`,
            { signal }
        );

        if (!response.ok) {
            throw new Error('Audio fetch failed');
        }

        const blob = await response.blob();
        await waveSurfer.loadBlob(blob);

    } catch (e: any) {
        if (e.name === 'AbortError') {
            console.warn('Audio fetch aborted');
        } else {
            console.error('Audio fetch failed:', e);
        }
    }
};
