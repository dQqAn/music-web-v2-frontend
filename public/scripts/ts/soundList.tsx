import WaveSurfer from 'wavesurfer.js'
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions'
import { formatTime, mainWaveSurfer } from './audio_player/audio_player'
import { toSlug } from './header'
import { createFavDiv } from './favourite'
import { createStemsContent } from './stems'
import { activeStatus } from "@/lib/tokenControl";
import { useEffect } from 'react'
import { DynamicIcon } from 'lucide-react/dynamic';

export const soundListWaveSurfers: { [key: string]: WaveSurfer } = {};

//region Playlist IDs
//region Original IDs
const SOUND_IDS_KEY = 'soundIDs';

export function getStoredSoundIDs() {
    const data = localStorage.getItem(SOUND_IDS_KEY);
    return data ? JSON.parse(data) : [];
}

function addSoundID(id: string) {
    const ids = getStoredSoundIDs();
    if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(SOUND_IDS_KEY, JSON.stringify(ids));
    }
}

export function removeSoundID(id: string) {
    let ids = getStoredSoundIDs();
    ids = ids.filter((storedId: string) => storedId !== id);
    localStorage.setItem(SOUND_IDS_KEY, JSON.stringify(ids));
}

function clearAllSoundIDs() {
    localStorage.removeItem(SOUND_IDS_KEY);
}

export function isSoundIDStored(id: string) {
    const ids = getStoredSoundIDs();
    return ids.includes(id);
}

//endregion
//region Temp IDs
const TEMP_SOUND_IDS_KEY = 'tempSoundIDs';

export function getTempStoredSoundIDs() {
    const data = localStorage.getItem(TEMP_SOUND_IDS_KEY);
    return data ? JSON.parse(data) : [];
}

export function addTempSoundID(id: string) {
    const ids = getTempStoredSoundIDs();
    if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(TEMP_SOUND_IDS_KEY, JSON.stringify(ids));
    }
}

function removeTempSoundID(id: string) {
    let ids = getTempStoredSoundIDs();
    ids = ids.filter((storedId: string) => storedId !== id);
    localStorage.setItem(TEMP_SOUND_IDS_KEY, JSON.stringify(ids));
}

export function clearTempAllSoundIDs() {
    localStorage.removeItem(TEMP_SOUND_IDS_KEY);
}

export function isTempSoundIDStored(id: string) {
    const ids = getTempStoredSoundIDs();
    return ids.includes(id);
}

//endregion
export function replaceSoundIDsWith(soundID: string) {
    const tempIDs = getTempStoredSoundIDs();
    const index = tempIDs.indexOf(soundID);

    if (index === -1) {
        console.warn(`Sound ID "${soundID}" not found in temp list.`);
        return;
    }

    const sliced = tempIDs.slice(index);
    localStorage.setItem(SOUND_IDS_KEY, JSON.stringify(sliced));
}

export function playlistIDsToMainQueue(soundIDs = []) {
    localStorage.setItem(SOUND_IDS_KEY, JSON.stringify(soundIDs));
}

export function handlePlaylistIDToStorage(playlistID: string | null) {
    const savedTrack = localStorage.getItem("currentTrack");
    if (!savedTrack) return;

    let parsed;
    try {
        parsed = JSON.parse(savedTrack);
    } catch (e) {
        console.error("Invalid JSON in localStorage for currentTrack", e);
        return;
    }

    const { soundID, currentTime, volume } = parsed;

    const updatedTrack = {
        soundID,
        playlistID: playlistID || "",
        currentTime,
        volume
    };

    localStorage.setItem("currentTrack", JSON.stringify(updatedTrack));
}

//endregion

export async function downloadSound(soundID: string, stems = false, stemPath = "", stretchedSound = false, duration = 0) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/download/sound/${encodeURIComponent(soundID)}?stems=${stems}&stemPath=${stemPath}&stretchedSound=${stretchedSound}&duration=${duration}`;

    const response = await fetch(url);
    if (!response.ok) {
        console.error("Download failed");
        return;
    }

    let filename = `${soundID}.wav`;
    const disposition = response.headers.get("Content-Disposition");
    if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
            filename = match[1];
        }
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
}

export async function getSound(soundID: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/sound/${soundID}`, {
        headers: {
            'Accept': 'application/json'
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.sound;
}

function createCategoryElement(item: any) {
    const categories = document.createElement('div');

    const cats = item.categories.map((cat: string) => ({ tag: cat, source: 'category' }));
    const ins = item.instruments.map((inst: string) => ({ tag: inst, source: 'instrument' }));
    const combined = [...cats, ...ins];

    const visibleCategories = combined.slice(0, 3);
    const hiddenCategories = combined.slice(3);

    const categoryGroup = document.createElement('div');

    visibleCategories.forEach(({ tag, source }) => {
        const p = document.createElement('p');
        p.innerHTML = `<a href="${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/category/${encodeURIComponent(tag)}__${source}">${tag}</a>`;
        categoryGroup.appendChild(p);
    });

    categories.appendChild(categoryGroup);

    if (hiddenCategories.length > 0) {
        const moreBtn = document.createElement('button');
        moreBtn.id = "moreBtn";
        moreBtn.innerText = "▼";

        const popup = document.createElement('div');
        popup.id = "popup";

        hiddenCategories.forEach(({ tag, source }) => {
            const p = document.createElement('p');
            p.innerHTML = `<a href="${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/category/${encodeURIComponent(tag)}__${source}">${tag}</a>`;
            popup.appendChild(p);
        });

        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        const wrapper = document.createElement('div');
        wrapper.appendChild(moreBtn);
        wrapper.appendChild(popup);

        categories.appendChild(wrapper);
    }

    return categories;
}

export function createListMenu(sound: any) {
    const wrapper = document.createElement("div");
    // wrapper.style.display = 'none';
    const button = document.createElement("button");

    const menuIcon = document.createElement('i');
    menuIcon.setAttribute('data-lucide', 'ellipsis-vertical');
    menuIcon.className = `${'icon_' + sound.soundID}`;
    menuIcon.textContent = 'Menu'
    button.appendChild(menuIcon);
    wrapper.appendChild(button);

    const popup = document.createElement("div");
    popup.id = `popup_${sound.soundID}`;
    popup.style.display = 'none';
    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "(max: 600, min: 10)";

    const text = document.createElement('h1')
    text.textContent = "Duration"

    const stretchOutput = document.createElement('div')
    stretchOutput.textContent = "Processing... (Don't close)"
    stretchOutput.style.display = 'none';
    stretchOutput.id = "stretchOutput_" + sound.soundID

    const submitButton = document.createElement('button')
    submitButton.textContent = 'Submit'

    const content = document.createElement('div');

    content.appendChild(text);
    content.appendChild(input);
    content.appendChild(stretchOutput);
    content.appendChild(submitButton);

    popup.appendChild(content);

    document.body.appendChild(popup);

    input.addEventListener('input', (event) => {
        stretchOutput.style.display = 'none';
    })

    submitButton.addEventListener('click', async (e) => {
        e.stopPropagation();

        stretchOutput.style.display = 'block';

        const duration = parseInt(input.value, 10)
        if (isNaN(duration)) return;
        await downloadSound(sound.soundID, false, "", true, duration)
    })

    popup.addEventListener("click", (e) => e.stopPropagation());

    button.addEventListener("click", (e) => {
        e.stopPropagation();
        if (popup.style.display === 'none') {
            positionPopup();
            popup.style.display = 'block';
        } else {
            popup.style.display = 'none';
        }
    });
    document.addEventListener("click", (e) => {
        if (popup.contains(e.target as Node) || button.contains(e.target as Node)) return;
        popup.style.display = 'none';
    });

    function positionPopup() {
        const btnRect = button.getBoundingClientRect();
        const popWidth = popup.offsetWidth || 256;
        const popHeight = popup.offsetHeight || 150;

        const margin = 8;
        const maxLeft = window.innerWidth - popWidth - margin;
        let desiredLeft = btnRect.left + btnRect.width / 2 - popWidth / 2;
        desiredLeft = Math.max(margin, Math.min(desiredLeft, maxLeft));

        let desiredTop;
        const spaceBelow = window.innerHeight - btnRect.bottom;
        const spaceAbove = btnRect.top;

        if (spaceBelow >= popHeight + margin) {
            desiredTop = btnRect.bottom + margin;
        } else if (spaceAbove >= popHeight + margin) {
            desiredTop = btnRect.top - popHeight - margin;
        } else {
            desiredTop = window.innerHeight / 2 - popHeight / 2;
        }

        popup.style.left = `${desiredLeft}px`;
        popup.style.top = `${desiredTop}px`;
    }

    return wrapper;
}



