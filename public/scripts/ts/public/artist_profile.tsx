import { setUserInfos } from "../profile/profile";

export function artistProfileContent() {
    const pathSegments = window.location.pathname.split('/');
        const artistID = pathSegments.filter(Boolean).pop();

        const div = document.getElementById('soundList');
        if (div && artistID) {
            setUserInfos(artistID, 'userProfileImage', 'userName', 'userBackgroundImage');
        }
}