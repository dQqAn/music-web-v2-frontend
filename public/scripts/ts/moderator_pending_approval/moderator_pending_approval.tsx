import { useEffect } from 'react';
import { updatePagination } from '../pagination';

function getSounds(page: number) {
    useEffect(() => {
        let tempPage = 1
        if (page != null && Number.isInteger(page)) {
            tempPage = page
        } else {
            throw new Error('page is not an int');
        }

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/database/moderatorSounds?page=${tempPage}`, {
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        }).then(response => {
            if (!response.ok) {
                console.log(`HTTP error! Status: ${response.status}`);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        }).then(async data => {
            const tbody = document.getElementById('tbodyContent') as HTMLElement;
            tbody.innerHTML = '';
            const sounds = data.sounds || [];
            const length = data.length || 0

            sounds.forEach((soundItem: any) => {
                const row = document.createElement('tr');

                const cats = soundItem.categories.map((cat: any) => ({ tag: cat, source: 'category' }));
                const ins = soundItem.instruments.map((inst: any) => ({ tag: inst, source: 'instrument' }));
                const combined = [...cats, ...ins];

                const soundPath = "\\" + soundItem.soundPath.replaceAll("/", "\\");

                const artistArray = typeof soundItem.artistIDs === 'string'
                    ? JSON.parse(soundItem.artistIDs)
                    : soundItem.artistIDs;

                row.innerHTML = `
                    <td ><input type="checkbox" data-sound-id="${soundItem.soundID}"></td>
                    <td >${soundItem.name}</td>
                    <td >${artistArray.map((artist: any) => `
                            <p>
                              <a href="${process.env.NEXT_PUBLIC_BACKEND_URL}/artist_profile/${artist.id}">${artist.name}</a>
                            </p>
                            `).join("")}  </td>   
                    <td c>${combined.map(({ tag, source }) => `
                            <p>
                              <a href="${process.env.NEXT_PUBLIC_BACKEND_URL}/category/${encodeURIComponent(tag)}__${source}">${tag}</a>
                            </p>
                            `).join("")}</td>
                    
                    <td ><a href="${process.env.NEXT_PUBLIC_BACKEND_URL}/${soundItem.image1Path}">Image</a></td>
                    <td >
                        <a href="${process.env.NEXT_PUBLIC_BACKEND_URL}/${soundPath}">Sound</a>
                    </td>
                `;
                tbody.appendChild(row);
            });

            window.history.pushState({ page: tempPage }, `Page ${tempPage}`, `${process.env.NEXT_PUBLIC_BACKEND_URL}/moderator/pending_approval?page=${tempPage}`);

            const totalPages = Math.floor((length + 10 - 1) / 10);
            updatePagination('pagination', tempPage, totalPages, (p: number) => {
                getSounds(p)
            }, false)
        }).catch(error => {
            console.error('Error:', error)
        });

    }, [])

}

export function moderatorPendingApprovalContent() {
    useEffect(() => {
        getSounds(1)
    }, [])
}

/*async function soundsCount() {
    try {
        const response = await fetch("${process.env.NEXT_PUBLIC_BACKEND_URL}/database/moderator_sounds_count", {});
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return null;
        }

        const data = await response.text();
        const integerValue = parseInt(data);

        if (isNaN(integerValue)) {
            console.error(`${integerValue} is not a number`);
            return null;
        }
        return integerValue;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}*/

function getSelectedSoundIds() {
    const checkboxes = document.querySelectorAll('.sound-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.getAttribute('data-sound-id'));
}

document.getElementById('submitButton')?.addEventListener('click', async () => {
    const button = document.getElementById('submitButton');
    if (!button) return;
    useEffect(() => {
        const handleClick = async () => {
            const selectedSoundIds = getSelectedSoundIds();

            if (selectedSoundIds.length === 0) {
                alert('Please select min one item!');
                return;
            }

            try {
                const response = await fetch('${process.env.NEXT_PUBLIC_BACKEND_URL}/database/moderatorSounds', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ soundIDs: selectedSoundIds }),
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Error backend');
                }

                const result = await response.text();

                const urlParams = new URLSearchParams(window.location.search);
                const page = parseInt(urlParams.get("page") || "1");
                getSounds(page);
            } catch (error: any) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            }
        };

        button.addEventListener('click', handleClick);

        return () => {
            button.removeEventListener('click', handleClick);
        };
    }, [])


});
