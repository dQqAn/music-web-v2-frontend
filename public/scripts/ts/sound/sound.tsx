import { downloadSound, getSound } from '../soundList'
import { setupPlaylistDiv } from '../playlist'
import { createFavDiv } from '../favourite'
import { toSlug } from '../header'
import { mainWaveSurfer } from "../audio_player/audio_player";
import { useEffect } from 'react';

let currentSrc = '';

export function soundPage() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const soundID = params.get('soundID')

        const soundPlaylistDiv = document.getElementById('soundPlaylistDiv')
        if (soundPlaylistDiv) {
            getSound(soundID!).then(async sound => {
                if (sound) {
                    setSoundInfos(sound, 'soundImage', 'soundName', 'soundArtistNames')
                    await createFavDiv('soundFavDiv', sound.soundID)
                    setupPlaylistDiv(sound, 'soundPlaylistDiv', 'soundPlaylistBtn',
                        'soundAddToPlaylistBtn', 'soundCreatePlaylist',
                        'soundPlaylistContainer', 'soundPlaylistCloseBtn',
                        'soundPlaylistResult', 'soundPlaylistInput')

                    const downloadBtn = document.getElementById('soundDownload')
                    if (downloadBtn) {
                        downloadBtn.onclick = () => {
                            downloadSound(sound.soundID)
                        }
                    }

                    setCategories(sound, 'soundCategories')
                    const playButton = document.getElementById('soundPlay')
                    if (playButton && soundID) {
                        const playIcon = document.createElement('i');
                        playIcon.setAttribute('data-lucide', 'play');
                        playIcon.className = `${'icon_' + sound.soundID}`;
                        playIcon.textContent = 'Play'
                        playButton.appendChild(playIcon);
                        playButton.onclick = () => {
                            const src = `http://localhost:8083/stream/sound/${encodeURIComponent(soundID)}`;
                            if (mainWaveSurfer?.isPlaying()) {
                                mainWaveSurfer?.pause();
                                return;
                            }
                            if (currentSrc === src) {
                                mainWaveSurfer?.play();
                                return;
                            }

                            if (src) {
                                mainWaveSurfer?.load(src);
                                const wrapper = mainWaveSurfer?.getWrapper()
                                if (wrapper) {
                                    wrapper.className = "main_waveSurfer_" + soundID
                                }
                                mainWaveSurfer?.once('ready', () => {
                                    mainWaveSurfer?.stop();
                                    mainWaveSurfer?.play();
                                    currentSrc = src;
                                });
                            }
                        };
                    }
                }
            });
        }
    }, [])
}

export function setSoundInfos(sound: any, soundImageDivID: string, soundNameDivID: string, artistsNameDivID: string) {
    const image = document.getElementById(soundImageDivID) as HTMLImageElement
    const name = document.getElementById(soundNameDivID)
    const artists = document.getElementById(artistsNameDivID)

    if (image) {
        image.src = sound.image1Path;
        (image as HTMLElement).style.display = 'flex';
    }

    if (name) {
        name.innerHTML = `
        <a href="http://localhost:8083/sound/?${toSlug(sound.name)}&soundID=${sound.soundID}">
                    <h5>${sound.name}</h5>      
                </a>
    `;
        (name as HTMLElement).style.display = 'flex';
        if (artists) {
            artists.style.display = 'flex';
            artists.innerHTML = `
                    ${sound.artistInfos.map((artist: { id: string, name: string }) => `
                        <p>
                          <a href="http://localhost:8083/artist_profile/${artist.id}">${artist.name}</a>
                        </p>
                        `).join("")}  
                    `;
        }
    }
}

export function setCategories(sound: any, categoryDivID: string) {
    const categoriesDiv = document.getElementById(categoryDivID)
    if (!categoriesDiv) return;
    categoriesDiv.innerHTML = ''
    if (!sound.categories || sound.categories.length === 0) return;

    sound.categories.forEach((category: string) => {
        const span = document.createElement('span')
        span.textContent = category
        categoriesDiv.appendChild(span)
    })
}

