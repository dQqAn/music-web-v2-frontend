import { filterSounds } from "../menu/menu.jsx";
import { setUserInfos } from "../profile/profile.jsx";
import { useEffect } from "react";

export function artistProfileContent() {
    useEffect(() => {
        const pathSegments = window.location.pathname.split('/');
        const artistID = pathSegments.filter(Boolean).pop();

        const div = document.getElementById('soundList');
        if (div && artistID) {
            setUserInfos(artistID, 'userProfileImage', 'userName', 'userBackgroundImage');
            filterSounds(1, null, artistID);
        }
    }, [])
}