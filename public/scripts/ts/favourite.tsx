import { activeStatus } from "@/lib/tokenControl";
import { createRoot, Root } from 'react-dom/client';
import { Button } from "@/components/ui/button"
import { Heart, HeartOff } from "lucide-react";
import { proxy, useSnapshot } from 'valtio';

export const favouriteStore = proxy<{ [soundID: string]: boolean }>({});

let mainMenuFav: Root | null = null;

async function getFavStatus(soundID: string) {
    try {
        if (activeStatus === true) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/sound/checkFav/${soundID}`, {
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
    const favDiv = document.getElementById(favDivID) as HTMLDivElement;
    if (!favDiv) return;

    if (!mainMenuFav) {
        mainMenuFav = createRoot(favDiv);
    }

    mainMenuFav.render(<FavouriteButton soundID={soundID} initialFav={isFav} />);

    //const IconComponent: LucideIcon = isFav ? Heart : HeartOff; 
}

export function FavouriteButton({ soundID, initialFav }: {
    soundID: string;
    initialFav: boolean;
}) {
    const snap = useSnapshot(favouriteStore);
    const favStatus = snap[soundID] ?? initialFav;

    async function handleToggleFavourite() {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/favouriteSound`, {
                credentials: "include",
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ soundIDs: [soundID] })
            });

            if (!response.ok) {
                console.log("Error backend.");
                return;
            }

            const result = await response.json();
            const newStatus = result.favouriteStatus;
            favouriteStore[soundID] = newStatus;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <Button variant="secondary" onClick={handleToggleFavourite}>
            {favStatus ? <Heart /> : <HeartOff />}
        </Button>
    );
}

async function changeSoundFavouriteStatus(soundID: string, favID: string) {
    try {
        if (activeStatus === true) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/favouriteSound`, {
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