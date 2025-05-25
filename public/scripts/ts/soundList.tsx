import WaveSurfer from 'wavesurfer.js'
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions'
import { formatTime, mainWaveSurfer } from './audio_player/audio_player'
import { toSlug } from './header'
import { createFavDiv } from './favourite'
import { createStemsContent } from './stems'
import { activeStatus } from "./index/auth"
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

export async function soundList(containerID: string, sounds: any[]) {
    const container = document.getElementById(containerID)
    if (!container) return;

    container.innerHTML = '';
    clearTempAllSoundIDs()

    for (const item of sounds) {
        addTempSoundID(item.soundID)

        const regions = RegionsPlugin.create()

        const listItem = document.createElement('div');
        listItem.style.display = 'flex';

        const infos = document.createElement('div')
        infos.innerHTML = `
                    <a href="http://localhost:8083/sound/?${toSlug(item.name)}&soundID=${item.soundID}">
                        <h5>${item.name}</h5>      
                    </a>
                    ${item.artistInfos.map((artist: any) => `
                        <h1>                    
                          <a href="http://localhost:8083/artist_profile/${artist.id}">${artist.name}</a>
                        </h1>
                    `).join("")}
                `;

        const durationInfos = document.createElement('div');
        durationInfos.innerHTML = `
                        <p id="time_${item.soundID}">0:00</p>
                        <p id="duration_${item.soundID}">0:00</p>
                    `;

        const playButton = document.createElement('button')
        const playIcon = document.createElement('i');
        playIcon.setAttribute('data-lucide', 'play');
        playIcon.className = `icon_${item.soundID}`;
        playIcon.textContent = 'Play'
        playButton.appendChild(playIcon);

        const leftDiv = document.createElement('div');
        leftDiv.style.display = 'flex';
        const img = document.createElement('img')
        img.src = item.image1Path

        const centerDiv = document.createElement('div');

        leftDiv.appendChild(img);
        leftDiv.appendChild(playButton);
        leftDiv.appendChild(infos);
        centerDiv.appendChild(createCategoryElement(item));
        listItem.appendChild(leftDiv)
        listItem.appendChild(centerDiv)
        container.appendChild(listItem)

        const waveSurferDiv = document.createElement('div');
        waveSurferDiv.style.width = '100%';
        waveSurferDiv.id = 'div_' + item.soundID

        const listWaveSurfer = WaveSurfer.create({
            container: waveSurferDiv,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            url: '',
            height: 75,
            // dragToSeek: true, // minPxPerSec: 100,
            plugins: [
                HoverPlugin.create({
                    lineColor: '#ff0000',
                    lineWidth: 2,
                    labelBackground: '#555',
                    labelColor: '#fff',
                    labelSize: '11px',
                }),
                regions
            ],
        })

        window.addEventListener('beforeunload', () => {
            if (listWaveSurfer) {
                listWaveSurfer.destroy()
            }
        });

        soundListWaveSurfers[item.soundID] = listWaveSurfer

        const downloadButton = document.createElement('button')
        const downloadIcon = document.createElement('i');
        downloadIcon.setAttribute('data-lucide', 'arrow-down-to-line');
        downloadIcon.className = `${'icon_' + item.soundID}`;
        downloadIcon.textContent = 'Download'

        downloadButton.appendChild(downloadIcon);
        downloadButton.onclick = () => {
            downloadSound(item.soundID)
        }

        const favDiv = document.createElement('div')
        favDiv.id = 'fav-btn-' + item.soundID

        const rightDiv = document.createElement('div');
        rightDiv.style.display = 'flex';

        const stemsButton = document.createElement('button')
        const stemsIcon = document.createElement('i');
        stemsIcon.setAttribute('data-lucide', 'audio-lines');
        stemsIcon.className = `${'icon_' + item.soundID}`;
        stemsIcon.textContent = 'Stems'

        stemsButton.appendChild(stemsIcon);

        const bpmText = document.createElement('p')
        bpmText.textContent = 'BPM: ' + item.bpm

        rightDiv.appendChild(bpmText);
        rightDiv.appendChild(stemsButton);
        rightDiv.appendChild(durationInfos);
        rightDiv.appendChild(waveSurferDiv);
        rightDiv.appendChild(downloadButton);
        rightDiv.appendChild(favDiv);
        rightDiv.appendChild(createListMenu(item));
        listItem.appendChild(rightDiv);
        container.appendChild(listItem);

        const timeID = 'time_' + item.soundID
        const durationID = 'duration_' + item.soundID
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

        setTimeout(() => {
            const src = `http://localhost:8083/stream/sound/${encodeURIComponent(item.soundID)}`;
            if (src) {
                listWaveSurfer.load(src)
                listWaveSurfer.getWrapper().className = "waveSurfer_" + item.soundID
            }
        }, 1000);

        listWaveSurfer.once('ready', () => {
            playButton.onclick = () => {
                const icon = document.querySelector('.icon_' + item.soundID);

                if (icon?.getAttribute('data-lucide') === 'play') {

                    replaceSoundIDsWith(item.soundID)

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

                    const src = `http://localhost:8083/stream/sound/${encodeURIComponent(item.soundID)}`;
                    if (src) {

                        mainWaveSurfer?.load(src)
                        const wrapper = mainWaveSurfer?.getWrapper()

                        if (wrapper) {
                            wrapper.className = "main_waveSurfer_" + item.soundID
                        }

                        const listIcon = document.querySelector('.icon_' + item.soundID);
                        listIcon?.setAttribute('data-lucide', 'pause');

                        mainWaveSurfer?.once('ready', () => {
                            const rateInput = document.getElementById('mainRateInput') as HTMLInputElement;
                            if (rateInput) {
                                mainWaveSurfer?.setPlaybackRate(rateInput.valueAsNumber);
                            }
                            mainWaveSurfer?.play()
                        })
                    }
                } else {
                    mainWaveSurfer?.pause()
                    const listIcon = document.querySelector('.icon_' + item.soundID);
                    listIcon?.setAttribute('data-lucide', 'play');
                }
            }
        })

        waveSurferDiv.addEventListener('click', (e) => {
            const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
            const className = 'waveSurfer_' + soundID;
            if (listWaveSurfer.getWrapper().className === className) {
                const bbox = waveSurferDiv.getBoundingClientRect();
                const x = e.clientX - bbox.left;
                const percent = x / bbox.width;

                const duration = mainWaveSurfer?.getDuration();
                if (duration && !isNaN(percent)) {
                    mainWaveSurfer?.seekTo(percent);
                }
            }
        });

        stemsButton.addEventListener('click', () => {
            createStemsContent(item.soundID)
        })

        const handleFavorite = async () => {
            if (activeStatus) {
                await createFavDiv(favDiv.id, item.soundID, false)
            }
        }
        handleFavorite()

    }
}

export async function downloadSound(soundID: string, stems = false, stemPath = "", stretchedSound = false, duration = 0) {
    const url = `http://localhost:8083/download/sound/${encodeURIComponent(soundID)}?stems=${stems}&stemPath=${stemPath}&stretchedSound=${stretchedSound}&duration=${duration}`;

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
    const response = await fetch(`http://localhost:8083/database/sound/${soundID}`, {
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
        p.innerHTML = `<a href="http://localhost:8083/category/${encodeURIComponent(tag)}__${source}">${tag}</a>`;
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
            p.innerHTML = `<a href="http://localhost:8083/category/${encodeURIComponent(tag)}__${source}">${tag}</a>`;
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



