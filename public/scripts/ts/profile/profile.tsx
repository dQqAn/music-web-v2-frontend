import { useEffect } from 'react';
import {updatePagination} from '../pagination';
import {soundList} from '../soundList'

export function profileContent(){
    useEffect(() => {
        const favContainer = document.getElementById('favSoundList')
        const playlistContainer = document.getElementById('userPlaylistContainer')
        const pagination = document.getElementById('pagination')
    
        const favouritesBtn = document.getElementById('favouritesBtn');
        if (favouritesBtn) {
            favouritesBtn.addEventListener('click', () => {
                if (favContainer) {
                    favContainer.innerHTML = ``
                }
                if (playlistContainer) {
                    playlistContainer.innerHTML = ``
                }
                const userId = favouritesBtn.dataset.userId;
                if (userId) {
                    loadFavourites(userId, 'favSoundList', 1);
                }
            });
        }
    
        const userProfilePlaylistButton = document.getElementById('userProfilePlaylistButton')
        if (userProfilePlaylistButton) {
            userProfilePlaylistButton.addEventListener('click', () => {
                if (favContainer) {
                    favContainer.innerHTML = ``
                }
                if (playlistContainer) {
                    playlistContainer.innerHTML = ``
                }
                if (pagination) {
                    pagination.innerHTML = ``
                }
                loadPlaylists('userPlaylistContainer')
            })
        }       
    },[])
}

function loadFavourites(userID: string, containerID: string, page = 1) {
    useEffect(() => {
        if (isNaN(page)) {
            console.error(`${page} is not a number`);
            return;
        }
        fetch(`http://localhost:8083/loadFavourites/${userID}?page=${page}`, {
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (!response.ok) {
                console.log(`HTTP error! Status: ${response.status}`);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        }).then(data => {
    
            const sounds = data.sounds || [];
            const length = data.length || 0
            soundList(containerID, sounds)
    
            window.history.pushState({page: page}, `Page ${page}`, `?page=${page}`);
    
            const totalPages = Math.floor((length + 20 - 1) / 20);
            updatePagination("pagination", page, totalPages, (p: number) => {
                loadFavourites(userID, containerID, p);
            });
        }).catch(error => {
            console.error("Error:", error);
        });
    },[])
    
}

async function loadPlaylists(containerID: string) {
    const container = document.getElementById(containerID)
    if (container) {
        container.innerHTML = ``;
        const response = await fetch('http://localhost:8083/database/userPlaylistIDs', {
            headers: {
                'Accept': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const playlists = await response.json();

        playlists.forEach((item: any) => {
            const card = document.createElement("div");

            card.innerHTML = `
                <a href="http://localhost:8083/playlist/${item.playlistID}">
                    <h3  id="${item.playlistID}">${item.name}</h3>
                </a>
            `;

            container.appendChild(card);
        })
    }
}

export function setUserInfos(userID: string, profileImageDivID: string, nameDivID: string, backgroundImageDivID: string) {
    fetch(`http://localhost:8083/database/basicUser/${userID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Basic user error');
            }
            return response.json();
        })
        .then(data => {
            const profileImageDiv = document.getElementById(profileImageDivID)
            if (profileImageDiv instanceof HTMLImageElement) {
                profileImageDiv.src = data.profileImage
            }
            const nameDiv = document.getElementById(nameDivID)
            if (nameDiv instanceof HTMLImageElement) {
                nameDiv.textContent = data.name
            }
            const backgroundImageDiv = document.getElementById(backgroundImageDivID)
            if (backgroundImageDiv instanceof HTMLImageElement) {
                backgroundImageDiv.src = data.backgroundImage
            }
        });
}