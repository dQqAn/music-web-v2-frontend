import WaveSurfer from 'wavesurfer.js'
import { clearAllSelections, filterMenu, renderMenu } from "../menu/menu";
import { useEffect } from 'react';
import { analyzeBPMFromFile } from '@/lib/sound/analyzeBPMFromFile';
import { stretchAudio } from '@/lib/stretchAudio'
import { getAudioDurationInSeconds } from '@/lib/audioUtils'
import { sendLocalFileRaw, getContentType } from '@/lib/fileUtils'
import { generateUniqueId } from '@/lib/generateUniqueId'
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';

function formSubmit() {
    document.getElementById("uploadForm")?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const imageInput = document.getElementById("imageInput") as HTMLInputElement;
        const soundInput = document.getElementById("soundInput") as HTMLInputElement;
        const soundName = document.getElementById("soundName") as HTMLInputElement;

        const fileInfo = document.getElementById("fileInfo") as HTMLElement;
        const errorMessage = document.getElementById("errorMessage") as HTMLElement;
        const errorInfo = document.getElementById("errorInfo") as HTMLElement;

        if (!(imageInput instanceof HTMLInputElement) || !(soundInput instanceof HTMLInputElement)
            || !imageInput.files?.length || !soundInput.files?.length) {
            if (errorMessage) errorMessage.textContent = "Wrong files";
            if (errorInfo) errorInfo.style.display = "block";
            return;
        }

        const soundFile = soundInput.files[0];
        const imageFile = imageInput.files[0];
        const formData = new FormData();
        //formData.append("image", imageInput.files[0]);
        //formData.append("sound", soundFile);
        formData.append("name", soundName.value);
        formData.append("bpm", bpm.toString());

        let categorySelectedTags = [...categorySelectedItems]
            .filter((item: any) => item.source === 'category' && item.tag && item.name)
            .map((item: any) => ({
                tag: item.tag,
                name: item.name
            }));
        formData.append("category", JSON.stringify(categorySelectedTags));

        let instrumentSelectedTags = [...instrumentSelectedItems]
            .filter((item: any) => item.source === 'instrument' && item.tag && item.name)
            .map((item: any) => ({
                tag: item.tag,
                name: item.name
            }));
        formData.append("instrument", JSON.stringify(instrumentSelectedTags));
        formData.append("loops", JSON.stringify(loops));
        formData.append("selectedArtists", JSON.stringify(selectedArtists));

        let duration = await getAudioDurationInSeconds(soundFile);
        duration = duration === -1 ? 0 : duration;
        formData.append("duration", duration.toString());

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/userID`, {
            credentials: 'include'
        })
        const data = await res.json()
        const userID: string = data.userID ? data.userID : `temp`

        const baseUploadDir = path.resolve('public/uploads');
        const imageDir = path.join(baseUploadDir, 'image', userID);
        const soundDir = path.join(baseUploadDir, 'sound', userID);
        const soundID = generateUniqueId();
        formData.append("soundID", soundID);
        const stemDir = path.join(baseUploadDir, 'stem', soundID);
        /*if (process.env.NODE_ENV === 'development') {
            ensureDir(imageDir);
            ensureDir(soundDir);
            ensureDir(stemDir);
        }*/

        const soundFileBuffer = Buffer.from(await soundFile.arrayBuffer());
        const soundUuid = uuidv4();
        const soundFT = await fileTypeFromBuffer(soundFileBuffer);
        const soundExt = soundFT?.ext || path.extname(soundFile.name).slice(1).toLowerCase();

        const imageFileBuffer = Buffer.from(await imageFile.arrayBuffer());
        const imageUuid = uuidv4();
        const imageFT = await fileTypeFromBuffer(imageFileBuffer);

        if (process.env.NODE_ENV === 'development') {
            if (imageFT?.mime.startsWith('image/')) {
                const imageTarget = path.join(imageDir, `${imageUuid}_${imageFile.name}`);
                formData.append("imagePath", imageTarget);
                await sendLocalFileRaw(imageFile, imageTarget);
            }

            if (soundFT?.mime.startsWith('audio/')) {
                if (['wav', 'mp3'].includes(soundExt)) {
                    const soundTarget = path.join(soundDir, `${soundUuid}_${soundFile.name}`);
                    formData.append("soundPath", soundTarget);
                    await sendLocalFileRaw(soundFile, soundTarget);
                }
            }
        } else {
            if (imageFT?.mime.startsWith('image/')) {
                const supabasePath = `image/${userID}/${imageUuid}_${imageFile.name}`;

                const contentType = getContentType(imageFile)
                await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/uploads/${supabasePath}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                        'Content-Type': contentType,
                    },
                    body: imageFile,
                });

                formData.append("imagePath", supabasePath);
            }

            if (soundFT?.mime.startsWith('audio/')) {
                if (['wav', 'mp3'].includes(soundExt)) {
                    const soundBaseName = path.parse(soundFile.name).name;
                    const supabasePath = `sound/${userID}/${soundUuid}_${soundBaseName}.${soundExt}`;

                    const contentType = getContentType(soundFile)
                    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/uploads/${supabasePath}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                            'Content-Type': contentType,
                        },
                        body: soundFile,
                    });

                    formData.append("soundPath", supabasePath);
                }
            }
        }

        //todo image and sound input
        for (const entry of stemEntries) {
            const file = entry.files[0];
            //const buffer = Buffer.from(await file.arrayBuffer());
            //const newFile = new File([buffer], "audio.wav", { type: file.type });
            let stretchedFile: File | null = null;

            let newDuration = await getAudioDurationInSeconds(file);
            newDuration = newDuration === -1 ? 0 : newDuration;

            //let newBuffer: Buffer<ArrayBuffer> | null

            if (duration !== 0 && duration === newDuration) {
                //newBuffer = buffer
                stretchedFile = file;
            } else {
                try {
                    const stretched = await stretchAudio(file, duration);
                    //newBuffer = Buffer.from(await stretched.arrayBuffer());
                    stretchedFile = stretched;
                } catch (err) {
                    console.error("Stretch failed, using original buffer:", err);
                    //newBuffer = buffer;
                    stretchedFile = file;
                }
            }

            if (!stretchedFile) {
                console.error("Stretched file is null");
                continue;
            }

            const newBuffer = Buffer.from(await stretchedFile.arrayBuffer());
            const ft = await fileTypeFromBuffer(newBuffer);
            const ext = ft?.ext || path.extname(stretchedFile.name).slice(1).toLowerCase();
            const baseName = path.parse(stretchedFile.name).name;
            const uuid = uuidv4();

            if (['wav', 'mp3'].includes(ext)) {
                if (process.env.NODE_ENV === 'development') {
                    const target = path.join(stemDir, `${uuid}_${baseName}.${ext}`);
                    await sendLocalFileRaw(stretchedFile, target);
                    formData.append("stemNames[]", entry.name);
                    formData.append("stemPaths[]", target);
                } else {
                    const supabasePath = `stem/${soundID}/${uuid}_${baseName}.${ext}`;

                    const contentType = getContentType(stretchedFile)
                    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/uploads/${supabasePath}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                            'Content-Type': contentType,
                        },
                        body: stretchedFile,
                    });

                    formData.append("stemNames[]", entry.name);
                    formData.append("stemPaths[]", supabasePath);
                }
            }
        }

        fileInfo.style.display = "none";
        errorInfo.style.display = "none";

        try {
            clearInfos()

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/artist/upload_sound`, {
                method: "POST",
                body: formData,
                credentials: 'include'
            });
            const data = await response.json();
            if (response.status === 200) {
                (document.getElementById("fileStatus") as HTMLElement).textContent = data.fileStatus;
                fileInfo.style.display = "block";
            } else {
                (errorMessage as HTMLElement).textContent = data.message;
                errorInfo.style.display = "block";
            }
        } catch (error) {
            (errorMessage as HTMLElement).textContent = `Error: ${error}`;
            errorInfo.style.display = "block";
        }
    });
}

//Category
let categoryMenuData: any[] = [];
let categorySelectedItems: Set<any> = new Set();
let categoryNavigationStack: any[] = [];
let categoryCurrentItems: any[] = [];
let categoryRootItems: any[] = [];

let instrumentMenuData: any[] = [];
let instrumentSelectedItems: Set<any> = new Set();
let instrumentNavigationStack: any[] = [];
let instrumentCurrentItems: any[] = [];
let instrumentRootItems: any[] = [];

let loops: any[] = []
let loopsCounter = 0

let bpm: number = 60

let artistWaveSurfer: WaveSurfer | null = null;
/*const waveSurfer = WaveSurfer.create({
    container: '#artistSingleSoundBox',
    waveColor: 'rgb(200, 0, 200)',
    progressColor: 'rgb(100, 0, 100)',
    url: '',
    height: 75,
})*/

/** @type {{ name: string, files: File[] }[]} */
let stemEntries: any[] = [];

type Artist = {
    id: string;
    name: string;
};

const selectedArtists: Artist[] = [];

function clearInfos() {
    const imageInput = document.getElementById("imageInput") as HTMLInputElement;
    const soundInput = document.getElementById("soundInput") as HTMLInputElement;
    const soundName = document.getElementById("soundName") as HTMLInputElement;
    imageInput.value = ``;
    soundInput.value = ``;
    soundName.value = ``;
    (document.getElementById("selectedSoundName") as HTMLElement).textContent = ``;
    (document.getElementById("selectedImageName") as HTMLElement).textContent = ``;

    artistWaveSurfer?.destroy();

    const artistSearchResults = document.getElementById('artistSearchResults');

    selectedArtists.splice(0, selectedArtists.length);

    (artistSearchResults as HTMLElement).innerHTML = ``;
    (artistSearchResults as HTMLElement).style.display = 'none';

    const fileInfo = document.getElementById("fileInfo") as HTMLElement;
    fileInfo.style.display = "none";

    const artistSearchInput = document.getElementById('artistSearchInput') as HTMLInputElement;
    artistSearchInput.value = ``;

    const artistLoopList = document.getElementById('artistLoopList') as HTMLElement;
    artistLoopList.innerHTML = ``;
    loops.length = 0
    loopsCounter = 0
    const artistSelectedLoopsDiv = document.getElementById('artistSelectedLoopsDiv') as HTMLElement;
    artistSelectedLoopsDiv.style.display = "none";

    (document.getElementById("selectedStemName") as HTMLElement).textContent = ``;
    stemEntries.length = 0
    const stemNameInput = document.getElementById("stemName") as HTMLInputElement;
    const stemFileInput = document.getElementById("stemInput") as HTMLInputElement;
    const selectedStemsDiv = document.getElementById("selectedStems") as HTMLElement;
    stemNameInput.value = ``;
    stemFileInput.value = ``;
    selectedStemsDiv.innerHTML = ``;

    clearAllSelections('categorySelectedItemsContainer', categorySelectedItems, true)
    clearAllSelections('instrumentSelectedItemsContainer', instrumentSelectedItems, true)
}

export function artistSingleSound() {

    useEffect(() => {
        formSubmit()

        const stemNameInput = document.getElementById("stemName") as HTMLInputElement;
        const stemFileInput = document.getElementById("stemInput") as HTMLInputElement;
        const addStemButton = document.getElementById("addStem") as HTMLElement;
        stemFileInput?.addEventListener("change", function (this: HTMLInputElement) {
            if (!this.files) return;
            const fileName = this.files.length > 0 ? this.files[0].name : "No file chosen";
            (document.getElementById("selectedStemName") as HTMLElement).textContent = fileName;
        });

        artistWaveSurfer = WaveSurfer.create({
            container: '#artistSingleSoundBox',
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            url: '',
            height: 75,
        })

        window.addEventListener('beforeunload', () => {
            if (artistWaveSurfer) {
                artistWaveSurfer.destroy()
            }
        });

        const startingTime = document.getElementById('startingTime') as HTMLInputElement;
        const endingTime = document.getElementById('endingTime') as HTMLInputElement;
        const artistSelectedLoopsDiv = document.getElementById('artistSelectedLoopsDiv') as HTMLElement;
        const artistLoopList = document.getElementById('artistLoopList') as HTMLElement;
        const soundBox = document.getElementById('artistSingleSoundBox') as HTMLElement;
        const addLoop = document.getElementById('addLoop') as HTMLElement;

        const artistSearchResults = document.getElementById('artistSearchResults') as HTMLElement;
        const artistSearchInput = document.getElementById('artistSearchInput') as HTMLInputElement;
        const searchArtistButton = document.getElementById('searchArtistButton') as HTMLElement;
        if (artistSearchResults && artistSearchInput && searchArtistButton) {
            searchArtistButton.addEventListener('click', async () => {
                try {
                    const text = artistSearchInput.value.trim();

                    if (!text) return;

                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/searchArtist?query=${encodeURIComponent(text)}`, {
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        artistSearchResults.innerHTML = "<p style='color: red;'>Error while searching.</p>";
                        artistSearchResults.style.display = 'block';
                        return;
                    }

                    const result = await response.json();

                    if (!result || !result.name || !result.userID) {
                        artistSearchResults.innerHTML = "<p>No results found.</p>";
                        artistSearchResults.style.display = 'block';
                        return;
                    }

                    const artist = {
                        id: String(result.id),
                        name: result.name
                    };

                    const alreadyExists = selectedArtists.some(a => a.id === artist.id);
                    if (alreadyExists) {
                        return;
                    }

                    selectedArtists.push(artist);

                    const div = document.createElement("div");

                    const artistName = document.createElement('span');
                    artistName.textContent = artist.name;

                    const removeBtn = document.createElement('button');
                    removeBtn.innerHTML = "✖";

                    removeBtn.addEventListener("click", () => {
                        const index = selectedArtists.findIndex(a => a.id === artist.id);
                        if (index !== -1) selectedArtists.splice(index, 1);
                        div.remove();
                    });

                    div.appendChild(artistName);
                    div.appendChild(removeBtn);
                    artistSearchResults.appendChild(div);
                    artistSearchResults.style.display = 'block';

                } catch (error) {
                    artistSearchResults.innerHTML = `<p style='color: red;'>${error}</p>`;
                    artistSearchResults.style.display = 'block';
                }
            });
        }

        addStemButton?.addEventListener("click", () => {
            const name = stemNameInput?.value.trim();
            const files = stemFileInput?.files ? [...stemFileInput.files] : [];

            if (!name || files.length === 0) {
                alert("Stem or file is missing");
                return;
            }

            stemEntries.push({ name, files });
            (document.getElementById("selectedStemName") as HTMLElement).textContent = ``;
            stemNameInput.value = ``;
            stemFileInput.value = ``;
            renderStems();
        });

        const imageInput = document.getElementById("imageInput") as HTMLInputElement;
        imageInput.addEventListener("change", function (this: HTMLInputElement) {
            if (!this.files) return;
            const fileName = this.files.length > 0 ? this.files[0].name : "No file chosen";
            const selectedImageName = document.getElementById("selectedImageName");
            if (selectedImageName) {
                selectedImageName.textContent = fileName;
            }
        });

        const soundInput = document.getElementById("soundInput") as HTMLInputElement;
        soundInput.addEventListener("change", function (this: HTMLInputElement) {
            if (!this.files) return;
            const fileName = this.files.length > 0 ? this.files[0].name : "No file chosen";
            const selectedSoundName = document.getElementById("selectedSoundName");
            if (selectedSoundName) {
                selectedSoundName.textContent = fileName;
            }
        });
        soundInput.addEventListener('change', async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0]
            if (file) {
                const fileName = file.name.toLowerCase()
                const isValid = fileName.endsWith('.mp3') || fileName.endsWith('.wav')
                if (isValid) {
                    soundBox.style.display = "block"
                    artistWaveSurfer?.loadBlob(file)

                    const tempBpm = await analyzeBPMFromFile(file);
                    bpm = tempBpm
                    //console.log('BPM:', tempBpm);
                }
            } else {
                soundBox.style.display = "none"
                artistWaveSurfer?.stop()
                artistWaveSurfer?.empty()
            }
        })

        addLoop.addEventListener('click', () => {
            loopsCounter++
            const startTime = parseFloat(startingTime.value)
            const endTime = parseFloat(endingTime.value)
            if (isNaN(startTime) || isNaN(endTime) || startTime < 0 || endTime < 1 || (endTime - startTime) < 1) return

            const loopId = 'loop_' + loopsCounter
            const loopItem = document.createElement('div')
            loopItem.id = loopId

            const loopText = document.createElement('p')
            loopText.textContent = `${startTime} - ${endTime}`

            const loopRemoveButton = document.createElement('button')
            loopRemoveButton.textContent = 'X'

            loopRemoveButton.addEventListener('click', () => {
                loops = loops.filter(item => item.id !== loopId)
                loopItem.remove()

                if (loops.length < 1) {
                    artistSelectedLoopsDiv.style.display = "none";
                }
            })

            loopItem.appendChild(loopText)
            loopItem.appendChild(loopRemoveButton)
            artistLoopList.appendChild(loopItem)

            loops.push({
                id: loopId,
                start: startTime,
                end: endTime
            })

            if (loops.length > 0) {
                artistSelectedLoopsDiv.style.display = "block"
            }

            startingTime.value = "0"
            endingTime.value = "0"
        })

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/allMetaData`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Menu loading error');
                }
                return response.json();
            })
            .then(data => {
                document.getElementById('categorySearchInput')?.addEventListener('input', (event) => {
                    filterMenu('categorySearchInput', 'categoryMenuContainer')
                });
                document.getElementById('categoryClearSelection')?.addEventListener('click', (event) => {
                    clearAllSelections('categorySelectedItemsContainer', categorySelectedItems, true)
                });
                const categoryDataName = 'categories'
                categoryMenuData = data[categoryDataName];
                categoryRootItems = data[categoryDataName];
                renderMenu('categoryBackButton', categoryRootItems, categoryMenuData, 'categoryMenuContainer', categorySelectedItems, categoryNavigationStack,
                    categoryCurrentItems, 'category', categoryDataName, 'categorySelectedItemsContainer', 'categoryBackButtonContainer', 'category');


                document.getElementById('instrumentSearchInput')?.addEventListener('input', (event) => {
                    filterMenu('instrumentSearchInput', 'instrumentMenuContainer')
                });
                document.getElementById('instrumentClearSelection')?.addEventListener('click', (event) => {
                    clearAllSelections('instrumentSelectedItemsContainer', instrumentSelectedItems, true)
                });
                const instrumentDataName = 'instruments'
                instrumentMenuData = data[instrumentDataName];
                instrumentRootItems = data[instrumentDataName];
                renderMenu('instrumentBackButton', instrumentRootItems, instrumentMenuData, 'instrumentMenuContainer', instrumentSelectedItems, instrumentNavigationStack,
                    instrumentCurrentItems, 'instrument', instrumentDataName, 'instrumentSelectedItemsContainer', 'instrumentBackButtonContainer', 'instrument');
            })

    }, [])

}


function renderStems() {
    const selectedStemsDiv = document.getElementById("selectedStems") as HTMLElement;
    selectedStemsDiv.innerHTML = ``;

    stemEntries.forEach((entry, index) => {
        const div = document.createElement("div");

        const info = document.createElement("span");
        info.textContent = `${entry.name}: ${entry.files[0].name}`;

        const remove = document.createElement("button");
        remove.textContent = "❌";
        remove.onclick = () => {
            stemEntries.splice(index, 1);
            renderStems();
        };

        div.appendChild(info);
        div.appendChild(remove);
        selectedStemsDiv?.appendChild(div);
    });
}