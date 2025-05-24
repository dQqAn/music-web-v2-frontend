import { useEffect } from "react";


export function headerContent() {
    useEffect(() => {
        const resultsDiv = document.getElementById("searchResults");
    if (resultsDiv) {
        const input = document.getElementById("searchInput")
        if (input) {
            input.addEventListener("input", async (event) => {
                const target = event.target as HTMLInputElement;
                const query = target.value.trim();
                if (query.length < 3) {
                    resultsDiv.style.display = "none";
                    resultsDiv.innerHTML = ``;
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:8083/search?query=${encodeURIComponent(query)}`);
                    if (!response.ok) {
                        resultsDiv.innerHTML = "<p style='color: red;'>Error while searching.</p>";
                        return;
                    }

                    const results = await response.json();
                    resultsDiv.innerHTML = ``;

                    if (results.length === 0) {
                        resultsDiv.style.display = "none";
                        resultsDiv.innerHTML = "<p>No results found.</p>";
                        return;
                    }

                    results.forEach((item: any) => {
                        const div = document.createElement("div");

                        div.innerHTML = item.name + " - " + item.artistInfos.map((artist: any) =>
                            `<a href="http://localhost:8083/artist_profile/${artist.id}">${artist.name}</a>`
                        ).join(", ");

                        div.onclick = () => {
                            window.location.href = `/sound/?${toSlug(item.name)}&soundID=${item.soundID}`;
                        };
                        resultsDiv.appendChild(div);
                    });
                    resultsDiv.style.display = "block";
                } catch (error) {
                    resultsDiv.innerHTML = `<p style="color: red;">Error: ${error}</p>`;
                    resultsDiv.style.display = "none";
                }
            });
        }

        const searchBox = document.querySelector(".search_box")
        document.addEventListener("click", (e) => {
            if (searchBox && !searchBox.contains(e.target as Node)) {
                resultsDiv.style.display = "none";
            }
        });
    } 
    }, [])
}

export function toSlug(str: string) {
    const turkishToEnglish = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };

    return str
        .toLowerCase()
        .split('')
        .map(char => turkishToEnglish[char as keyof typeof turkishToEnglish] || char)
        .join('')
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^a-z0-9-]/g, '')     // Remove all non-alphanumeric chars except -
        .replace(/-+/g, '-');           // Replace multiple - with single -
}
