import WaveSurfer from 'wavesurfer.js'
import { setSoundInfos } from './sound/sound'
import { downloadSound, getSound } from './soundList'

export function createStemsContent(soundID: string) {
    const stemsListWaveSurfers: any = {}
    const singleStemsListWaveSurfers: any = {}
    const muteStemsListWaveSurfers: any = {}

    const stemsOverlay = document.createElement("div");
    stemsOverlay.id = "stemsOverlay";
    stemsOverlay.style.display = 'none';
    stemsOverlay.style.position = 'fixed';
    stemsOverlay.style.zIndex = '50';

    const modal = document.createElement("div");
    modal.style.position = 'fixed';
    modal.style.zIndex = '50';
    Object.assign(modal.style, {
        top: "50%",
        left: "50%",
        width: "24rem",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "2rem",
    });

    const closeStems = document.createElement("button");
    closeStems.id = "closeStemsOverlay";
    closeStems.textContent = "✕";

    const stemsOverlayContent = document.createElement("div");
    stemsOverlayContent.id = "stemsOverlayContent";

    modal.appendChild(closeStems);
    modal.appendChild(stemsOverlayContent);
    stemsOverlay.appendChild(modal);
    document.body.appendChild(stemsOverlay);

    stemsOverlay.style.display = 'block';
    stemsOverlay.style.top = '0';
    stemsOverlay.style.left = '0';
    stemsOverlay.style.right = '0';
    stemsOverlay.style.bottom = '0';
    stemsOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    stemsOverlay.style.backdropFilter = "blur(4px)";

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/soundStems/${soundID}`, {
        headers: {
            'Accept': 'application/json'
        }
    }).then(res => {
        if (!res.ok) {
            console.log(`HTTP error! Status: ${res.status}`);
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
    }).then(data => {
        if (data.stems.length > 0) {
            stemsContent(stemsOverlayContent, data.stems, soundID, stemsListWaveSurfers, singleStemsListWaveSurfers, muteStemsListWaveSurfers)
        }
    })

    stemsOverlay.addEventListener("click", (e) => {
        if (e.target === stemsOverlay) {
            stemsOverlayContent.innerHTML = ``;
            for (const key of Object.keys(stemsListWaveSurfers)) {
                delete stemsListWaveSurfers[key];
            }
            for (const key of Object.keys(muteStemsListWaveSurfers)) {
                delete muteStemsListWaveSurfers[key];
            }
            for (const key of Object.keys(singleStemsListWaveSurfers)) {
                delete singleStemsListWaveSurfers[key];
            }
            stemsOverlay.style.display = 'none';
        }
    });

    closeStems.addEventListener('click', () => {
        stemsOverlayContent.innerHTML = ``;
        for (const key in stemsListWaveSurfers) {
            delete stemsListWaveSurfers[key];
        }
        for (const key in muteStemsListWaveSurfers) {
            delete muteStemsListWaveSurfers[key];
        }
        for (const key in singleStemsListWaveSurfers) {
            delete singleStemsListWaveSurfers[key];
        }
        stemsOverlay.style.display = 'none';
    })
}

async function stemsContent(stemsOverlayContent: any, stems: any, soundID: string, stemsListWaveSurfers: any, singleStemsListWaveSurfers: any, muteStemsListWaveSurfers: any) {
    const sound = await getSound(soundID);
    let mainStemWaveReady = false;

    const mainStemItem = document.createElement('div');
    //mainStemItem.style.display = 'flex';
    mainStemItem.style.width = '100%';

    const mainInfos = document.createElement('div')
    mainInfos.style.color = 'black';
    mainInfos.style.display = 'flex';
    mainInfos.style.justifyContent = 'space-between';
    mainInfos.innerHTML = `
                    <div style="width: 12px; height: 12px;">
                            <img id="stemSoundImage_${soundID}" src=""
                                  alt="">
                    </div>
    
                    <div style="width: 100%; display:flex;">
                        <h5>Name: </h5>
                        <div id="stemSoundName_${soundID}"></div>
                    </div>
    
                    <div style="width: 100%; display:flex;">
                        <h5>Artists: </h5>
                        <div id="stemSoundArtistNames_${soundID}"></div>
                    </div>
                    `;

    mainStemItem.appendChild(mainInfos)
    stemsOverlayContent.appendChild(mainStemItem)

    if (sound) {
        setSoundInfos(sound, `stemSoundImage_${soundID}`, `stemSoundName_${soundID}`, `stemSoundArtistNames_${soundID}`)
    }

    const mainStemWaveSurferDiv = document.createElement('div');
    mainStemWaveSurferDiv.style.border = "1px solid #ddd";
    mainStemWaveSurferDiv.style.width = '100%';
    mainStemWaveSurferDiv.style.height = '50px';

    mainStemItem.appendChild(mainStemWaveSurferDiv)
    stemsOverlayContent.appendChild(mainStemItem)

    const mainStemWaveSurfer = WaveSurfer.create({
        container: mainStemWaveSurferDiv,
        waveColor: 'rgb(200, 0, 200)',
        progressColor: 'rgb(100, 0, 100)',
        url: '',
        height: 50,
    })
    window.addEventListener('beforeunload', () => {
        if (mainStemWaveSurfer) {
            mainStemWaveSurfer.destroy()
        }
    });

    mainStemWaveSurfer.setMuted(true);
    stemsListWaveSurfers[soundID] = mainStemWaveSurfer

    const src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stream/sound/${encodeURIComponent(soundID)}`;
    mainStemWaveSurfer.load(src)

    const mainStemPlayButton = document.createElement('button')
    mainStemPlayButton.textContent = "Play"
    mainStemPlayButton.style.width = '100%';
    mainStemPlayButton.style.border = '1px solid #1a1a1a';
    mainStemPlayButton.style.display = 'flex';
    mainStemPlayButton.style.justifyContent = 'center';

    const mainControllerDiv = document.createElement('div')

    mainControllerDiv.appendChild(mainStemPlayButton)

    mainStemItem.appendChild(mainControllerDiv)
    stemsOverlayContent.appendChild(mainStemItem)

    mainStemWaveSurfer.on('decode', (duration) => {
        mainStemWaveReady = false
    })

    mainStemWaveSurfer.once('ready', () => {
        mainStemWaveReady = true
        mainStemPlayButton.onclick = () => {
            const mainStemItem = stemsListWaveSurfers[soundID];
            mainStemItem.playPause()

            const hasSingleSelected = Object.keys(singleStemsListWaveSurfers).length > 0;

            for (const key in stemsListWaveSurfers) {
                const stemItem = stemsListWaveSurfers[key];

                if (stemItem === mainStemItem) continue;

                stemItem.setMuted(true)

                if (hasSingleSelected) {
                    if (singleStemsListWaveSurfers[key]) {
                        stemItem.setMuted(false);
                    }
                } else {
                    if (!muteStemsListWaveSurfers[key]) {
                        stemItem.setMuted(false);
                    }
                }

                stemItem.playPause();
            }
        }
    })
    mainStemWaveSurferDiv.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const bbox = target.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const percent = x / bbox.width;

        const duration = mainStemWaveSurfer.getDuration();
        if (duration && !isNaN(percent)) {
            for (const key in stemsListWaveSurfers) {
                if (stemsListWaveSurfers[soundID] !== stemsListWaveSurfers[key]) {
                    stemsListWaveSurfers[key].seekTo(percent);
                }
            }
        }
    });

    stems.forEach((stem: any) => {
        let listStemWaveReady = false;

        const listItem = document.createElement('div');

        const waveSurferDiv = document.createElement('div');
        waveSurferDiv.id = 'div_' + stem.stemID
        waveSurferDiv.style.border = "1px solid #ddd";
        waveSurferDiv.style.width = '100%';

        listItem.appendChild(waveSurferDiv)
        stemsOverlayContent.appendChild(listItem)

        const stemWaveSurfer = WaveSurfer.create({
            container: waveSurferDiv,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            url: '',
            height: 50,
        })
        window.addEventListener('beforeunload', () => {
            if (stemWaveSurfer) {
                stemWaveSurfer.destroy()
            }
        });
        stemsListWaveSurfers[stem.stemID] = stemWaveSurfer

        stemWaveSurfer.on('decode', (duration) => {
            listStemWaveReady = false
        })
        stemWaveSurfer.once('ready', () => {
            listStemWaveReady = true
        })
        waveSurferDiv.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            const bbox = target.getBoundingClientRect();
            const x = e.clientX - bbox.left;
            const percent = x / bbox.width;

            const duration = mainStemWaveSurfer.getDuration();
            if (duration && !isNaN(percent)) {
                for (const key in stemsListWaveSurfers) {
                    if (stemsListWaveSurfers[stem.stemID] !== stemsListWaveSurfers[key]) {
                        stemsListWaveSurfers[key].seekTo(percent);
                    }
                }
            }
        });

        const src = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stream/sound/${encodeURIComponent(soundID)}?stems=true&stemPath=${stem.stemPath}`;
        stemWaveSurfer.load(src)
        stemWaveSurfer.getWrapper().className = "stem_waveSurfer_" + soundID

        const downloadButton = document.createElement('button')
        downloadButton.textContent = "D"
        downloadButton.onclick = function () {
            downloadSound(soundID, true, stem.stemPath);
        };

        const singleCheckbox = document.createElement('input');
        singleCheckbox.type = 'checkbox';
        const singleLabel = document.createElement('label');
        singleLabel.textContent = 'S';
        singleLabel.appendChild(singleCheckbox);
        singleCheckbox.addEventListener('change', function () {
            if (singleCheckbox.checked) {
                muteCheckbox.checked = false
                delete muteStemsListWaveSurfers[stem.stemID]
                singleStemsListWaveSurfers[stem.stemID] = stemWaveSurfer
            } else {
                delete singleStemsListWaveSurfers[stem.stemID]
            }

            const basicWaveSurfers: any = Object.fromEntries(
                Object.entries(stemsListWaveSurfers).filter(([key]) => key !== soundID)
            )
            /*for (const key in basicWaveSurfers) {
                basicWaveSurfers[key].setMuted(true)
                const myDiv = document.getElementById('div_' + key) as HTMLElement;
                myDiv.style.backgroundColor = 'black';
                myDiv.style.opacity = '0.6';
            }*/

            let newWaveSurfers: any = {}
            if (Object.keys(singleStemsListWaveSurfers).length > 0) {
                newWaveSurfers = Object.fromEntries(
                    Object.entries(basicWaveSurfers).filter(([key]) => {
                        return key in singleStemsListWaveSurfers
                    })
                )
            } else {
                newWaveSurfers = Object.fromEntries(
                    Object.entries(basicWaveSurfers).filter(([key]) => {
                        return !(key in muteStemsListWaveSurfers)
                    })
                )
            }
            for (const key in newWaveSurfers) {
                newWaveSurfers[key].setMuted(false)
                const myDiv = document.getElementById('div_' + key) as HTMLElement;
                myDiv.style.backgroundColor = 'transparent';
                myDiv.style.opacity = '1';
            }

            const mutedWaveSurfers: any = Object.fromEntries(
                Object.entries(basicWaveSurfers).filter(([key]) => {
                    return !(key in newWaveSurfers)
                })
            )
            for (const key in mutedWaveSurfers) {
                mutedWaveSurfers[key].setMuted(true)
                const myDiv = document.getElementById('div_' + key) as HTMLElement;
                myDiv.style.backgroundColor = 'black';
                myDiv.style.opacity = '0.6';
            }
        });

        const muteCheckbox = document.createElement('input');
        muteCheckbox.type = 'checkbox';
        const muteLabel = document.createElement('label');
        muteLabel.textContent = 'M';
        muteLabel.appendChild(muteCheckbox);
        muteCheckbox.addEventListener('change', function () {
            if (muteCheckbox.checked) {
                singleCheckbox.checked = false
                delete singleStemsListWaveSurfers[stem.stemID]
                muteStemsListWaveSurfers[stem.stemID] = stemWaveSurfer
            } else {
                delete muteStemsListWaveSurfers[stem.stemID]
            }

            const basicWaveSurfers: any = Object.fromEntries(
                Object.entries(stemsListWaveSurfers).filter(([key]) => key !== soundID)
            )
            /*for (const key in basicWaveSurfers) {
                basicWaveSurfers[key].setMuted(true)
                const myDiv = document.getElementById('div_' + key) as HTMLElement;
                myDiv.style.backgroundColor = 'black';
                myDiv.style.opacity = '0.6';
            }*/

            let newWaveSurfers: any = {}
            if (Object.keys(singleStemsListWaveSurfers).length > 0) {
                newWaveSurfers = Object.fromEntries(
                    Object.entries(basicWaveSurfers).filter(([key]) => {
                        return key in singleStemsListWaveSurfers
                    })
                )
            } else {
                newWaveSurfers = Object.fromEntries(
                    Object.entries(basicWaveSurfers).filter(([key]) => {
                        return !(key in muteStemsListWaveSurfers)
                    })
                )
            }
            for (const key in newWaveSurfers) {
                newWaveSurfers[key].setMuted(false)
                const myDiv = document.getElementById('div_' + key) as HTMLElement;
                myDiv.style.backgroundColor = 'transparent';
                myDiv.style.opacity = '1';
            }

            const mutedWaveSurfers: any = Object.fromEntries(
                Object.entries(basicWaveSurfers).filter(([key]) => {
                    return !(key in newWaveSurfers)
                })
            )
            for (const key in mutedWaveSurfers) {
                mutedWaveSurfers[key].setMuted(true)
                const myDiv = document.getElementById('div_' + key) as HTMLElement;
                myDiv.style.backgroundColor = 'black';
                myDiv.style.opacity = '0.6';
            }
        });

        const infos = document.createElement('div')
        infos.innerHTML = `
                    <p>${stem.name}</p>
                `;

        const controllerDiv = document.createElement('div')
        controllerDiv.style.display = 'flex';
        controllerDiv.style.justifyContent = 'space-between';
        controllerDiv.appendChild(infos)
        controllerDiv.appendChild(downloadButton)
        controllerDiv.appendChild(muteLabel)
        controllerDiv.appendChild(singleLabel)

        listItem.appendChild(controllerDiv)
        stemsOverlayContent.appendChild(listItem)
    })
}
