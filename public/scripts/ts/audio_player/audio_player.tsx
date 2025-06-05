import WaveSurfer from 'wavesurfer.js'
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions'
import {
    createListMenu,
    downloadSound,
    getSound,
    getStoredSoundIDs,
    getTempStoredSoundIDs,
    isSoundIDStored,
    isTempSoundIDStored,
    playlistIDsToMainQueue,
    removeSoundID,
    replaceSoundIDsWith,
    soundListWaveSurfers
} from '../soundList'
import { setupPlaylistDiv } from '../playlist'
import { createFavDiv } from '../favourite'
import { setSoundInfos } from '../sound/sound'
import { createStemsContent } from '../stems'
import { useEffect, useRef } from 'react'
import { fetchAudio } from '../../newSoundList'

export let mainWaveSurfer: WaveSurfer | null = null;

let regionsPlugin: RegionsPlugin | null = null

export function waveformPlayer() {
    useEffect(() => {
        regionsPlugin = RegionsPlugin.create()

        const container = document.getElementById('music_box')
        if (!container) {
            console.error('music_box bulunamadi')
            return
        }

        mainWaveSurfer = WaveSurfer.create({
            container,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            height: 75,
            url: '',
            plugins: [
                HoverPlugin.create({
                    lineColor: '#ff0000',
                    lineWidth: 2,
                    labelBackground: '#555',
                    labelColor: '#fff',
                    labelSize: '11px'
                }),
                regionsPlugin
            ]
        })

        return () => {
            mainWaveSurfer?.destroy()
            mainWaveSurfer = null
        }
    }, [])

    return <div id="music_box"></div>
}


let currentSrc = ''; // Track current source URL

let currentTrack = {
    soundID: "",
    playlistID: "",
    currentTime: 0.0,     // second
    volume: 1.0         // 0.0 - 1.0
};

let mainWaveReady = false;

export function audioPlayer() {
    useEffect(() => {

        window.addEventListener('beforeunload', () => {
            if (mainWaveSurfer) {
                mainWaveSurfer.destroy()
            }
        });

        const volumeInput = document.getElementById("mainVolume");

        if (volumeInput) {
            volumeInput.addEventListener("input", () => {
                const vol = parseFloat((volumeInput as HTMLInputElement).value);
                mainWaveSurfer?.setVolume(vol);

                currentTrack.volume = vol;
                localStorage.setItem("currentTrack", JSON.stringify(currentTrack));
            });
        }

        setInterval(() => {
            currentTrack.currentTime = mainWaveSurfer?.getCurrentTime() ?? 0
            localStorage.setItem("currentTrack", JSON.stringify(currentTrack));
        }, 5000);

        let savedTrack = localStorage.getItem("currentTrack");

        if (savedTrack) {
            let parsed;
            try {
                parsed = JSON.parse(savedTrack);
            } catch (e) {
                console.error("Invalid JSON in localStorage for currentTrack", e);
                return;
            }

            const { soundID, playlistID, currentTime, volume } = parsed;

            if (!soundID) {
                console.warn(`soundID is missing, cannot load track. ${soundID}`);
            } else if (playlistID) {
                fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/playlistSoundIDs/${playlistID}`)
                    .then(res => {
                        if (!res.ok) {
                            console.error('playlistSoundIDs error')
                            throw new Error(`HTTP error! Status: ${res.status}`);
                        }
                        return res.json()
                    })
                    .then(async data => {
                        const soundIDs = data.soundIDs;
                        playlistIDsToMainQueue(soundIDs)
                    })
                    .catch(err => {
                        console.error('Fetch failed:', err);
                    });
            } else {

                if (mainWaveSurfer?.getWrapper().className) {
                    const controller = new AbortController()
                    const signal = controller.signal
                    fetchAudio(soundID, mainWaveSurfer, signal);

                    //const src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stream/sound/${encodeURIComponent(soundID)}`;
                    //mainWaveSurfer?.load(src);

                    const wrapper = mainWaveSurfer?.getWrapper()
                    if (wrapper) {
                        wrapper.className = "main_waveSurfer_" + soundID
                    }
                }
            }
            if (currentTime && volume) {
                mainWaveSurfer?.once('ready', () => {
                    if (typeof volume === 'number') {
                        mainWaveSurfer?.setVolume(volume);
                        (volumeInput as HTMLInputElement).value = volume.toFixed(2);
                    }
                    if (typeof currentTime === 'number') {
                        const duration = mainWaveSurfer?.getDuration();
                        if (duration && duration > 0) {
                            const percent = currentTime / duration;
                            mainWaveSurfer?.seekTo(percent);
                        }
                    }
                });
            }
        }

        //region MainWaveSurfer
        const rateInput = document.getElementById('mainRateInput') as HTMLInputElement;
        const timeEl = document.getElementById('mainTime') as HTMLElement;
        const durationEl = document.getElementById('mainDuration') as HTMLElement;
        const rateDisplay = document.getElementById('mainRate') as HTMLElement;
        const slider = document.getElementById('mainZoomInput') as HTMLInputElement;

        //region Regions
        let regionCount = 1
        regionsPlugin?.enableDragSelection({
            color: 'rgba(255,255,255,0.1)',
        })
        let loop = false
        const loopCheckbox = document.getElementById('mainLoopCheckbox')
        if (loopCheckbox) {
            loopCheckbox.onclick = (e: MouseEvent) => {
                const target = e.target as HTMLInputElement
                loop = target.checked
            }
        }
        let activeRegion: any = null
        regionsPlugin?.on('region-in', (region) => {
            activeRegion = region
        })
        regionsPlugin?.on('region-out', (region) => {
            if (activeRegion === region) {
                if (loop) {
                    region.play()
                } else {
                    activeRegion = null
                }
            }
        })
        regionsPlugin?.on('region-clicked', (region, e) => {
            e.stopPropagation() // prevent triggering a click on the waveform
            activeRegion = region
            region.play(true)
            region.setOptions({ color: randomColor() })
        })
        regionsPlugin?.on('region-created', (region) => {
            const regionId = `region-${regionCount++}`
            region.setOptions({ id: regionId })

            const wrapper = document.createElement('div')

            const deleteBtn = document.createElement('button')
            deleteBtn.textContent = 'X'
            deleteBtn.addEventListener('click', () => region.remove())

            const downloadBtn = document.createElement('button')
            downloadBtn.textContent = '↓'
            downloadBtn.addEventListener('click', async () => {
                const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
                const { start, end } = region

                try {
                    if (!soundID) {
                        console.log("SoundID error")
                        return
                    }

                    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/download/loop/${soundID}?start=${start}&end=${end}`
                    window.open(url, "_blank")
                } catch (error) {
                    console.log("SoundID error")
                }
            })

            wrapper.appendChild(deleteBtn)
            wrapper.appendChild(downloadBtn)
            region.element.appendChild(wrapper)
        })
        document.getElementById('mainClearRegions')?.addEventListener('click', () => {
            regionsPlugin?.clearRegions()
        })
        //endregion

        //region Listeners
        let isRepeatEnabled = false;
        const repeatButton = document.getElementById('musicBoxRepeat') as HTMLElement;
        repeatButton.addEventListener('click', () => {
            isRepeatEnabled = !isRepeatEnabled;
            repeatButton.style.color = isRepeatEnabled ? 'blue' : '';
        });
        mainWaveSurfer?.on('finish', () => {
            if (isRepeatEnabled) {
                mainWaveSurfer?.seekTo(0);
                mainWaveSurfer?.play();
            } else if (getStoredSoundIDs().length > 0) {
                const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
                if (soundID && isSoundIDStored(soundID)) {
                    removeSoundID(soundID)
                }

                const localSoundID = getStoredSoundIDs()[0]
                if (localSoundID) {

                    if (mainWaveSurfer) {
                        const controller = new AbortController()
                        const signal = controller.signal

                        fetchAudio(localSoundID, mainWaveSurfer, signal);

                        //const src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stream/sound/${encodeURIComponent(localSoundID)}`;
                        //mainWaveSurfer?.load(src)
                    }

                    const wrapper = mainWaveSurfer?.getWrapper()
                    if (wrapper) {
                        wrapper.className = "main_waveSurfer_" + localSoundID
                    }

                    const listIcon = document.querySelector('.icon_' + localSoundID);
                    if (listIcon) {
                        listIcon.setAttribute('data-lucide', 'pause');
                    }

                    mainWaveSurfer?.once('ready', () => {
                        if (rateInput) {
                            mainWaveSurfer?.setPlaybackRate(rateInput.valueAsNumber);
                        }
                        mainWaveSurfer?.play()
                    })
                }
            }
        });
        mainWaveSurfer?.on('ready', async () => {
            mainWaveReady = true;

            //region Music Infos
            const soundOptionsToUser = document.getElementById('soundOptionsToUser') as HTMLElement;
            const sound = await getSound(currentTrack.soundID);
            if (sound) {
                soundOptionsToUser.style.display = 'flex';

                setSoundInfos(sound, 'mainSoundImage', 'mainSoundName', 'mainArtistsName')
                await createFavDiv('mainFavDiv', sound.soundID, true)
                setupPlaylistDiv(sound, 'mainPlaylistDiv', 'mainPlaylistBtn',
                    'mainAddToPlaylistBtn', 'mainCreatePlaylist',
                    'mainPlaylistContainer', 'mainPlaylistCloseBtn',
                    'mainPlaylistResult', 'mainPlaylistInput')

                const mainDownloadButton = document.getElementById('mainDownloadButton') as HTMLButtonElement;
                mainDownloadButton.onclick = () => {
                    downloadSound(sound.soundID)
                }

                const mainStretchDiv = document.getElementById('mainStretchDiv') as HTMLElement;
                mainStretchDiv.innerHTML = ``;
                mainStretchDiv.appendChild(createListMenu(sound))
            } else {
                soundOptionsToUser.style.display = 'none';
            }
            //endregion
        });
        const musicBoxPlayPause = document.getElementById('musicBoxPlayPause') as HTMLElement
        const musicBoxSkipBack = document.getElementById('musicBoxSkipBack') as HTMLElement
        const musicBoxSkipForward = document.getElementById('musicBoxSkipForward') as HTMLElement

        mainWaveSurfer?.once('ready', () => {
            musicBoxPlayPause.onclick = () => {
                mainWaveSurfer?.setPlaybackRate(rateInput.valueAsNumber);
                mainWaveSurfer?.playPause()
            }
            musicBoxSkipBack.onclick = () => {
                const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
                if (soundID && isTempSoundIDStored(soundID)) {
                    const tempIDs = getTempStoredSoundIDs();
                    const index = tempIDs.indexOf(soundID);

                    if (index !== -1 && mainWaveSurfer) {
                        const targetID = index > 0 ? tempIDs[index - 1] : tempIDs[0];
                        replaceSoundIDsWith(targetID);

                        const controller = new AbortController()
                        const signal = controller.signal
                        fetchAudio(targetID, mainWaveSurfer, signal);
                        //const src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stream/sound/${encodeURIComponent(targetID)}`;
                        //mainWaveSurfer?.load(src)

                        const wrapper = mainWaveSurfer?.getWrapper()
                        if (wrapper) {
                            wrapper.className = "main_waveSurfer_" + targetID
                        }
                        mainWaveSurfer?.once('ready', () => {
                            mainWaveSurfer?.play();
                        })
                    }
                }
            };
            musicBoxSkipForward.onclick = () => {
                const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
                if (soundID && isTempSoundIDStored(soundID)) {
                    const tempIDs = getTempStoredSoundIDs();
                    const index = tempIDs.indexOf(soundID);

                    if (index !== -1 && index < tempIDs.length - 1 && mainWaveSurfer) {
                        const nextID = tempIDs[index + 1];
                        replaceSoundIDsWith(nextID);

                        const controller = new AbortController()
                        const signal = controller.signal
                        fetchAudio(nextID, mainWaveSurfer, signal);

                        //const src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stream/sound/${encodeURIComponent(nextID)}`;
                        //mainWaveSurfer?.load(src)

                        const wrapper = mainWaveSurfer?.getWrapper()
                        if (wrapper) {
                            wrapper.className = "main_waveSurfer_" + nextID
                        }
                        mainWaveSurfer?.once('ready', () => {
                            mainWaveSurfer?.play();
                        })
                    }
                }
            };

            //region Stems
            const openStems = document.getElementById('openStemsOverlay')
            if (openStems) {
                openStems.addEventListener('click', () => {
                    if (mainWaveSurfer?.getWrapper().className) {
                        const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
                        if (soundID) {
                            createStemsContent(soundID)
                        }
                    }
                })
            }
            //endregion
        })
        mainWaveSurfer?.on('decode', (duration: number) => {
            mainWaveReady = false;

            const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
            const otherPlayer = soundID ? soundListWaveSurfers[soundID] : null;

            if (otherPlayer) {
                const currentTime = otherPlayer.getCurrentTime();
                const otherDuration = otherPlayer.getDuration();

                if (Number.isFinite(currentTime) && Number.isFinite(otherDuration) && otherDuration > 0) {
                    const targetSeek = currentTime / otherDuration;
                    if (Number.isFinite(targetSeek)) {
                        mainWaveSurfer?.seekTo(targetSeek);
                    }
                } else {
                    console.log(`[decode] player is not ready: ${soundID}`, { currentTime, otherDuration });
                }
            }

            if (soundID) {
                currentTrack.soundID = soundID;
                localStorage.setItem("currentTrack", JSON.stringify(currentTrack));
            }

            regionsPlugin?.clearRegions();
            regionCount = 1;
            if (regionsPlugin) {
                fetchAndCreateRegions(currentTrack.soundID, regionCount, regionsPlugin)
            }

            durationEl.textContent = formatTime(duration)

            slider.addEventListener('input', (e) => {
                const minPxPerSec = (e.target as HTMLInputElement).valueAsNumber
                mainWaveSurfer?.zoom(minPxPerSec)
            })
        })
        mainWaveSurfer?.on('interaction', () => {
            activeRegion = null
        })
        mainWaveSurfer?.on('play', () => {
            mainWaveReady = true;

            const icons = document.querySelectorAll('[data-lucide]');
            icons.forEach(otherIcon => {
                if (otherIcon.getAttribute('data-lucide') === 'pause') {
                    otherIcon.setAttribute('data-lucide', 'play');
                }
            });

            const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
            const listIcon = document.querySelector('.icon_' + soundID);
            if (listIcon && listIcon.getAttribute('data-lucide') === 'play') {
                listIcon.setAttribute('data-lucide', 'pause');
            }

            const playlistBoxIcon = document.querySelector('.playlist_icon_' + soundID);
            if (playlistBoxIcon && playlistBoxIcon.getAttribute('data-lucide') === 'play') {
                playlistBoxIcon.setAttribute('data-lucide', 'pause');
            }
            const icon = document.getElementById('playPauseIcon');
            if (icon) {
                icon.setAttribute('data-lucide', 'pause');
            }
        })
        mainWaveSurfer?.on('pause', () => {
            mainWaveReady = false;

            const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
            const listIcon = document.querySelector('.icon_' + soundID);
            if (listIcon && listIcon.getAttribute('data-lucide') === 'pause') {
                listIcon.setAttribute('data-lucide', 'play');
            }

            const playlistBoxIcon = document.querySelector('.playlist_icon_' + soundID);
            if (playlistBoxIcon && playlistBoxIcon.getAttribute('data-lucide') === 'pause') {
                playlistBoxIcon.setAttribute('data-lucide', 'play');
            }
            const icon = document.getElementById('playPauseIcon');
            if (icon) {
                icon.setAttribute('data-lucide', 'play');
            }
        })
        mainWaveSurfer?.on('timeupdate', (currentTime: number) => {
            timeEl.textContent = formatTime(currentTime)
        })

        rateInput.addEventListener('input', (e) => {
            if (mainWaveSurfer?.getWrapper().className) {
                const target = e.target as HTMLInputElement;
                const speed = parseFloat(target.value);
                rateDisplay.textContent = speed.toFixed(1);
                mainWaveSurfer?.setPlaybackRate(speed);
                mainWaveSurfer?.play();
            }
        });

        mainWaveSurfer?.on('audioprocess', () => {
            if (!mainWaveReady || !mainWaveSurfer?.isPlaying()) return;
            const soundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
            const otherPlayer = soundID ? soundListWaveSurfers[soundID] : undefined;

            if (!otherPlayer) return;

            const mainTime = mainWaveSurfer.getCurrentTime();
            const mainDuration = mainWaveSurfer.getDuration();

            if (!Number.isFinite(mainTime) || !Number.isFinite(mainDuration) || mainDuration <= 0) return;

            const seekTo = mainTime / mainDuration;
            if (Number.isFinite(seekTo)) {
                otherPlayer.seekTo(seekTo);
            }
        });

        //endregion

        //endregion

        //region Playlist Box
        const playlistOverlayContent = document.getElementById('playlistOverlayContent');
        const playlistOverlay = document.getElementById('playlistOverlay');
        const openPlaylist = document.getElementById('openPlaylistButton');
        const closePlaylist = document.getElementById('closePlaylistOverlay');
        const mainQueueOverlay = document.getElementById('mainQueueOverlay');

        if (playlistOverlay) {
            playlistOverlay.addEventListener("click", (e) => {
                if (e.target === playlistOverlay) {
                    playlistOverlayContent!.innerHTML = ``;
                    playlistOverlay.style.display = 'none';
                    mainQueueOverlay!.style.display = 'none';
                }
            });
            if (openPlaylist) {
                openPlaylist.addEventListener("click", (e) => {
                    playlistOverlay.style.display = 'block';
                    mainQueueOverlay!.style.display = 'block';
                    createPlaylistContent(playlistOverlayContent!, getStoredSoundIDs())
                });
            }
            if (closePlaylist) {
                closePlaylist.addEventListener("click", (e) => {
                    playlistOverlayContent!.innerHTML = ``;
                    playlistOverlay.style.display = 'none';
                    mainQueueOverlay!.style.display = 'none';
                });
            }
        }
        //endregion
    }, [])
}

async function createPlaylistContent(playlistOverlayContent: HTMLElement, soundIDs: string[]) {
    playlistOverlayContent.innerHTML = ``;

    for (const [index, soundID] of soundIDs.entries()) {
        const listItem = document.createElement('div');
        listItem.style.width = '100%';
        listItem.style.display = 'flex';
        listItem.style.flexDirection = 'column';
        listItem.style.marginBottom = '10px';

        const soundInfos = document.createElement('div');
        soundInfos.style.display = 'flex';
        soundInfos.style.justifyContent = 'space-between';

        const imageContainer = document.createElement('div');

        const img = document.createElement('img');
        img.id = `soundImage_${soundID}`;
        img.alt = "";

        imageContainer.appendChild(img);

        const nameP = document.createElement('p');
        nameP.id = `soundName_${soundID}`;

        const artistDiv = document.createElement('div');
        artistDiv.id = `soundArtistName_${soundID}`;

        const playButton = document.createElement('button')
        const mainSoundID = mainWaveSurfer?.getWrapper().className.split("_").pop();
        if ((mainSoundID === soundID) && mainWaveSurfer?.isPlaying()) {
            const pauseIcon = document.createElement('i');
            pauseIcon.setAttribute('data-lucide', 'pause');
            pauseIcon.className = `${'playlist_icon_' + soundID}`;
            pauseIcon.textContent = 'Pause'
            playButton.appendChild(pauseIcon);
        } else {
            const playIcon = document.createElement('i');
            playIcon.setAttribute('data-lucide', 'play');
            playIcon.className = `${'playlist_icon_' + soundID}`;
            playIcon.textContent = 'Play'
            playButton.appendChild(playIcon);
        }

        soundInfos.appendChild(imageContainer);
        soundInfos.appendChild(nameP);
        soundInfos.appendChild(artistDiv);
        soundInfos.appendChild(playButton);

        listItem.appendChild(soundInfos);
        playlistOverlayContent.appendChild(listItem);

        const sound = await getSound(soundID);
        setSoundInfos(sound, img.id, nameP.id, artistDiv.id);

        playButton.onclick = () => {
            const icons = document.querySelectorAll('[data-lucide]');
            icons.forEach(otherIcon => {
                if (otherIcon.getAttribute('data-lucide') === 'pause') {
                    otherIcon.setAttribute('data-lucide', 'play');
                }
            });

            const src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stream/sound/${encodeURIComponent(soundID)}`;
            if (currentSrc === src && mainWaveSurfer) {
                if (mainWaveSurfer?.isPlaying()) {
                    const icon = document.querySelector('.playlist_icon_' + soundID);
                    if (icon) {
                        icon.setAttribute('data-lucide', 'play');
                        mainWaveSurfer.pause();
                        return;
                    }
                }
                if (currentSrc === src) {
                    const icon = document.querySelector('.playlist_icon_' + soundID);
                    if (icon) {
                        icon.setAttribute('data-lucide', 'pause');
                        mainWaveSurfer?.play();
                        return;
                    }
                }

                const controller = new AbortController()
                const signal = controller.signal
                fetchAudio(soundID, mainWaveSurfer, signal);
                //mainWaveSurfer?.load(src);

                const wrapper = mainWaveSurfer?.getWrapper()
                if (wrapper) {
                    wrapper.className = "main_waveSurfer_" + soundID
                }
                mainWaveSurfer?.once('ready', () => {
                    mainWaveSurfer?.stop();
                    const icon = document.querySelector('.playlist_icon_' + soundID);
                    if (icon) {
                        icon.setAttribute('data-lucide', 'pause');
                        mainWaveSurfer?.play();
                        currentSrc = src;
                    }
                });
            } else {
                mainWaveSurfer?.load(src);
                const wrapper = mainWaveSurfer?.getWrapper()
                if (wrapper) {
                    wrapper.className = "main_waveSurfer_" + soundID
                }
                mainWaveSurfer?.once('ready', () => {
                    mainWaveSurfer?.stop();
                    const icon = document.querySelector('.playlist_icon_' + soundID);
                    if (icon) {
                        icon.setAttribute('data-lucide', 'pause');
                        mainWaveSurfer?.play();
                        currentSrc = src;
                    }
                });
            }
        };
    }
}

export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secondsRemainder = Math.round(seconds) % 60
    const paddedSeconds = `0${secondsRemainder}`.slice(-2)
    return `${minutes}:${paddedSeconds}`
}

const createRegion = (regionCount: number, regions: RegionsPlugin, start: number, end: number, extraOptions: any = {}) => {
    const regionId = regionCount++;

    const region = regions.addRegion({
        id: `region-${regionId}`,
        start,
        end,
        color: randomColor(),
        drag: false,
        resize: false,
        ...extraOptions,
    });

    return region;
}

const random = (min: number, max: number): number => Math.random() * (max - min) + min
const randomColor = (): string => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`

export function fetchAndCreateRegions(soundID: string, regionCount: number, regionsPlugin: RegionsPlugin) {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/regions/${soundID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('fetchAndCreateRegions error');
            }
            return response.json();
        })
        .then(data => {
            let regions = data.regions;

            if (typeof regions === 'string') {
                try {
                    regions = JSON.parse(regions);
                } catch (e) {
                    console.error("Regions JSON parse error:", e);
                    regions = [];
                }
            }

            if (Array.isArray(regions) && regions.length > 0) {
                regions.forEach(([start, end]: [string, string]) => {
                    createRegion(regionCount, regionsPlugin, parseFloat(start), parseFloat(end));
                });
            }
        });
}
