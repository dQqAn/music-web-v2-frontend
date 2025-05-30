import { useEffect } from 'react' 


export function categoryContent() {

    useEffect(() => {
        const pathSegments = window.location.pathname.split('/');
        const lastSegment = pathSegments.at(-1);
        if (!lastSegment) return;
        const [tag, source] = lastSegment.split('__');

        const categorySoundList = document.getElementById('soundList')
        if (categorySoundList) {
            //filterSounds(1, tag, null, source)
        }
    }, [])

}