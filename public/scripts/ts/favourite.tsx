import { activeStatus } from "./index/auth"

async function getFavStatus(soundID: string) {
    try {
        if (activeStatus === true) {
            const res = await fetch(`http://localhost:8083/sound/checkFav/${soundID}`, {
                credentials: "include"
            });
            const data = await res.json();
            return data.favouriteStatus;
        } else {
            return false
        }
    } catch (error) {
        console.error('soundList Error:', error);
        return false
    }
}

export async function createFavDiv(favDivID: string, soundID: string, main = false) {
    const isFav = await getFavStatus(soundID);
    const favText = isFav ? "heart" : "heart-off";

    const favID = main ? "main-fav-btn-" + soundID : "fav-btn-" + soundID
    const favDiv = document.getElementById(favDivID)
    if (favDiv) {
        const icon = document.createElement('p');
        icon.setAttribute('data-lucide', favText);
        icon.className = `${favID}`;
        icon.textContent = 'Favourite';

        const button = document.createElement('button');
        button.id = favID;
        button.appendChild(icon);

        favDiv.innerHTML = ``;
        favDiv.appendChild(button);
        const favBtn = document.getElementById(favID)
        if (favBtn) {
            favBtn.onclick = () => {
                changeSoundFavouriteStatus(soundID, favID)
            }
        }
    }
}

async function changeSoundFavouriteStatus(soundID: string, favID: string) {
    try {
        if (activeStatus === true) {
            const response = await fetch('http://localhost:8083/database/favouriteSound', {
                credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ soundIDs: [soundID] })
            });

            if (!response.ok) {
                console.log("Error backend.")
                return;
            }

            const result = await response.json();
            const newStatus = result.favouriteStatus;

            const favIcon = document.querySelector('.fav-btn-' + soundID)
            if (favIcon) {
                favIcon.setAttribute('data-lucide', newStatus ? "heart" : "heart-off");
            }

            const favIcon2 = document.querySelector('.main-fav-btn-' + soundID)
            if (favIcon2) {
                favIcon2.setAttribute('data-lucide', newStatus ? "heart" : "heart-off");
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}