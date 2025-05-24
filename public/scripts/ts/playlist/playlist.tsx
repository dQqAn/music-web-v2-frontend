import { soundList } from "../soundList";
import { updatePagination } from "../pagination";
import { useEffect } from "react";

export function playlistContent() {
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
}
async function playlistSounds(page = 1, playlistID: string) {
    useEffect(() => {
        fetch(`http://localhost:8083/database/userPlaylist/${playlistID}?page=${page}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(res => {
            if (!res.ok) {
                console.log(`HTTP error! Status: ${res.status}`);
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        }).then(async data => {
            const sounds = data.sounds || [];
            const length = data.length || 0

            try {
                await soundList('soundList', sounds)
            } catch (error) {
                console.error('soundList Error:', error);
                throw error;
            }

            window.history.pushState({ page: page }, `Page ${page}`, `?page=${page}`);

            const totalPages = Math.floor((length + 10 - 1) / 10);
            updatePagination("pagination", page, totalPages, (p: number) => {
                playlistSounds(p, playlistID);
            });
        }).catch(error => {
            console.error("Error:", error);
        });
    }, [])
}

/*async function playlistSize(playlistID) {
    try {
        const response = await fetch(`http://localhost:8083/database/userPlaylistSize/${playlistID}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return null;
        }

        const data = await response.text();
        const integerValue = parseInt(data);

        if (isNaN(integerValue)) {
            console.error(`${integerValue} is not a number`);
            return null;
        }
        return integerValue;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}*/
