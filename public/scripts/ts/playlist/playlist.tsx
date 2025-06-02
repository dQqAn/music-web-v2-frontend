import { Sound, SoundListWithSize } from "@/public/types/sound";
import { updatePagination } from "../pagination";
import { useEffect, useRef, useState } from "react";
import { SoundListView } from "../../newSoundList";

export function PlaylistSounds({ playlistID }: { playlistID: string }) {
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
        playlistSounds(playlistID, page, controller.signal)
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

async function playlistSounds(playlistID: string, page: number = 1, signal?: AbortSignal): Promise<SoundListWithSize> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/userPlaylist/${playlistID}?page=${page}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        signal: signal
    })

    if (!res.ok) {
        throw new Error('Failed to fetch sounds')
    }

    const data: SoundListWithSize = await res.json()
    return data
}

/*export function playlistContent() {
    useEffect(() => {
        const pathSegments = window.location.pathname.split('/');
        const playlistID = pathSegments[2];

        const searchParams = new URLSearchParams(window.location.search);
        const rawPage = searchParams.get("page");
        const page = Number(rawPage) || 1;

        const playlistSoundList = document.getElementById('soundList') as HTMLElement;

        const handlePlaylistSounds = async () => {
            if (playlistSoundList) {
                await playlistSounds(page, playlistID)
            }
        }
        handlePlaylistSounds();
    }, [])
}*/
