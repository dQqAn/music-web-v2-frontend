import { useState, useEffect, useRef } from "react"
import { Sound, SoundListWithSize } from "../types/sound"
import { categorySelectedItems, isBpmChanged, isDurationChanged, parseTimeRange } from "./ts/menu/menu"
import { updatePagination } from "./ts/pagination"

export function SoundList() {
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
        fetchSounds(page, null, null, null, controller.signal)
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

    return (
        <div>
            {sounds.map((sound) => (
                <SoundCard key={sound.id} sound={sound} />
            ))}
        </div>
    )
}

export function SoundCard({ sound }: { sound: Sound }) {
    return (
        <div style={{ border: '1px solid gray', padding: '10px', marginBottom: '10px' }}>
            <h3>{sound.name}</h3>
            <p>Durum: {sound.status}</p>
            <p>Kategoriler: {sound.categories.join(', ')}</p>
            <p>Modlar: {sound.moods.join(', ')}</p>
            <p>Enstrümanlar: {sound.instruments.join(', ')}</p>
            <p>Süre: {sound.duration} saniye</p>
            <p>BPM: {sound.bpm ?? 'Bilinmiyor'}</p>
            <p>Sanatçılar: {sound.artistInfos.map((a) => a.name).join(', ')}</p>
        </div>
    )
}

export async function fetchSounds(page: number, categoryTag: string | null = null, artistID: string | null = null, source: string | null = null, signal?: AbortSignal): Promise<SoundListWithSize> {
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

    const res = await fetch(`http://localhost:8083/database/filterSounds?page=${page}`, {
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
