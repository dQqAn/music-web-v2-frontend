import { activeStatus } from "@/lib/tokenControl";

function togglePlaylist(playlistContainer: string, playlistResult: string, id: string, playlistInput: string) {
    const container = document.getElementById(playlistContainer);
    console.log("1")
    if (!container) return;
    console.log("2")
    container.style.display = container.style.display === 'block' ? 'none' : 'block';
    if (container.style.display === 'block') {
        console.log("3")
        showPlaylists(playlistResult, id)
        setupPlaylistInputListener(id, playlistInput, playlistResult);
    }
}

let basicSelected: string[] = [];
let basicUnSelected: string[] = [];
let selected: string[] = [];
let unSelected: string[] = [];

async function showPlaylists(playlistResult: string, id = "") {
    basicSelected = [];
    basicUnSelected = [];
    selected = [];
    unSelected = [];
    const params = new URLSearchParams(window.location.search);
    const soundID = params.get('soundID') ?? id;
    const playlistDiv = document.getElementById(playlistResult);
    if (!playlistDiv) return;
    try {
        playlistDiv.innerHTML = ``;

        const handleShowPlaylists = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/user_playlist?soundID=${soundID}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                return;
            }

            const results = await response.json();

            if (results.length === 0) {
                playlistDiv.innerHTML = "<p>No results found.</p>";
                return;
            }

            console.log("4")

            results.forEach((item: any) => {
                const input = document.createElement("input");
                input.type = "checkbox";
                input.id = "playlist-checkbox-" + item.playlist.playlistID

                const label = document.createElement("label");
                label.htmlFor = input.id;
                label.textContent = item.playlist.name;

                if (item.soundStatus) {
                    input.checked = item.soundStatus;
                    if (item.soundStatus && !selected.includes(item.playlist.playlistID)) {
                        basicSelected.push(item.playlist.playlistID)
                    }
                }

                const container = document.createElement("div");
                container.appendChild(input);
                container.appendChild(label);
                playlistDiv.appendChild(container);
            });
            playlistDiv.style.display = "block";
            (document.getElementById('mainPlaylistOverlay') as HTMLElement).style.display = 'block'
            setupCheckboxListener(playlistResult);
        }

        handleShowPlaylists();
    } catch (error) {
        console.log(error)
    }
}

let playlistSearchTimeout: number | null = null;

function setupPlaylistInputListener(id: string, playlistInput: string, playlistResult: string) {
    const input = document.getElementById(playlistInput);
    if (!input) return;
    input.addEventListener("input", (event) => {
        if (playlistSearchTimeout) {
            clearTimeout(playlistSearchTimeout);
        }
        playlistSearchTimeout = window.setTimeout(() => {
            handlePlaylistInput(event, id, playlistResult)
        }, 300);
    });
}

let currentPlaylistFetchController: AbortController | null = null;

async function handlePlaylistInput(event: Event, id = "", playlistResult: string) {
    const handleInput = async () => {
        const query = (event.target as HTMLInputElement).value;

        if (currentPlaylistFetchController) {
            currentPlaylistFetchController.abort();
        }

        currentPlaylistFetchController = new AbortController();
        const signal = currentPlaylistFetchController.signal;

        if (query.length < 1) {
            await showPlaylists(playlistResult, id)
            return;
        }
        basicSelected = [];
        basicUnSelected = [];
        const params = new URLSearchParams(window.location.search);
        const soundID = params.get('soundID') ?? id;
        const playlistDiv = document.getElementById(playlistResult);
        if (!playlistDiv) return;
        try {
            playlistDiv.innerHTML = ``;
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/search_user_playlist?query=${encodeURIComponent(query)}&soundID=${soundID}`,
                {
                    signal,
                    credentials: "include"
                });
            if (!response.ok) {
                playlistDiv.innerHTML = "<p style='color: red;'>Error while searching.</p>";
                return;
            }

            const results = await response.json();
            if (results.length === 0) {
                playlistDiv.innerHTML = "<p>No results found.</p>";
                return;
            }

            results.forEach((item: any) => {
                const input = document.createElement("input");
                input.type = "checkbox";
                input.id = "playlist-checkbox-" + item.playlist.playlistID

                const label = document.createElement("label");
                label.htmlFor = input.id;
                label.textContent = item.playlist.name;

                input.checked = item.soundStatus;
                if (item.soundStatus && !selected.includes(item.playlist.playlistID)) {
                    basicSelected.push(item.playlist.playlistID)
                }

                const container = document.createElement("div");
                container.appendChild(input);
                container.appendChild(label);
                playlistDiv.appendChild(container);
            });
            playlistDiv.style.display = "block";
        } catch (error) {
            playlistDiv.innerHTML = `<p style="color: red;">Error: ${error}</p>`;
            playlistDiv.style.display = "none";
        }
    }

    handleInput();
}

async function addSound(soundIDs: string[], playlistResult: string, id = "") {
    const newSelected = selected.filter(id => !basicSelected.includes(id));
    const newUnselected = unSelected.filter(id => !basicUnSelected.includes(id));

    const cleanedSelected = newSelected.map(id => id.replace("playlist-checkbox-", ""));
    const cleanedUnselected = newUnselected.map(id => id.replace("playlist-checkbox-", ""));

    if (newSelected.length !== 0 || newUnselected.length !== 0) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/soundsToPlaylist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ soundIDs: soundIDs, selected: cleanedSelected, unselected: cleanedUnselected }),
            credentials: 'include'
        });
        if (!response.ok) {
            return;
        }

        await showPlaylists(playlistResult, id);
    }
}

function setupCheckboxListener(playlistResult: string) {
    const checkboxes = document.querySelectorAll(`#${playlistResult} input[type="checkbox"]`);
    if (!checkboxes) return;

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxes);
    });
}

async function handleCheckboxes(event: Event) {
    const id = (event.target as HTMLInputElement).id;
    if ((event.target as HTMLInputElement).checked) {
        if (!selected.includes(id)) selected.push(id);
        const i = unSelected.indexOf(id);
        if (i !== -1) unSelected.splice(i, 1);
    } else {
        if (!unSelected.includes(id)) unSelected.push(id);
        const i = selected.indexOf(id);
        if (i !== -1) selected.splice(i, 1);
    }
}

async function createPlaylist(playlistInput: string, playlistResult: string, id = "") {
    const value = (document.getElementById(playlistInput) as HTMLInputElement).value;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/createPlaylist`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `name=${encodeURIComponent(value)}`,
        credentials: 'include'
    });

    const statusCode = response.status;
    if (statusCode === 200) {
        await showPlaylists(playlistResult, id)
    }
}

export function setupPlaylistDiv(
    sound: any, playlistDivID: string, playlistBtnID: string, addToPlaylistBtnID: string, createPlaylistBtnID: string,
    playlistContainerID: string, playlistCloseBtnID: string, playlistResultID: string, playlistInputID: string
) {
    const playlistDiv = document.getElementById(playlistDivID)
    if (!playlistDiv) return;
    const playlistBtn = document.getElementById(playlistBtnID)
    if (!playlistBtn) return;
    const addToPlaylist = document.getElementById(addToPlaylistBtnID)
    const createPlaylistBtn = document.getElementById(createPlaylistBtnID)
    const container = document.getElementById(playlistContainerID);
    const closeBtn = document.getElementById(playlistCloseBtnID);

    if (playlistDiv && activeStatus) {
        playlistBtn.onclick = () => {
            togglePlaylist(playlistContainerID, playlistResultID, sound.soundID, playlistInputID)
        }
        if (createPlaylistBtn) createPlaylistBtn.onclick = () => {
            createPlaylist(playlistInputID, playlistResultID, sound.soundID).then(r => {
            })
        }
        if (addToPlaylist) addToPlaylist.onclick = () => {
            addSound([sound.soundID], playlistResultID, sound.soundID).then(r => {
            })
        }
        if (closeBtn && container) {
            closeBtn.onclick = () => {
                container.style.display = "none";
                (document.getElementById('mainPlaylistOverlay') as HTMLElement).style.display = 'none'
            };
        }
        window.addEventListener("click", function (e) {
            if (container && container.style.display === "block" && !container.contains(e.target as Node) && e.target !== playlistBtn) {
                container.style.display = "none";
                (document.getElementById('mainPlaylistOverlay') as HTMLElement).style.display = 'none'
            }
        });
    } else {
        console.log("You are not login. Active status: ", activeStatus)
    }
}