export function updatePagination(divID: string, currentPage: number, totalPages: number, onPageClick: (page: number) => void, forControl = true) {
    const pagination = document.getElementById(divID);
    if (!pagination) return;
    pagination.innerHTML = '';
    pagination.style.display = 'flex';
    pagination.style.gap = '14px';
    pagination.style.justifyContent = 'center';

    if (currentPage > 1) {
        if (forControl) {
            const firstLink = document.createElement('a');
            firstLink.textContent = 'First';
            firstLink.onclick = () => onPageClick(1);
            pagination.appendChild(firstLink);
        }

        const prevLink = document.createElement('a');
        prevLink.textContent = 'Before';
        prevLink.onclick = () => onPageClick(currentPage - 1);
        pagination.appendChild(prevLink);
    }

    if (forControl) {
        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.textContent = i.toString();
            pageLink.onclick = () => onPageClick(i);
            if (i === currentPage) {
                pageLink.style.borderBottom = '2px solid gray';
            }
            pagination.appendChild(pageLink);
        }
    }

    if (currentPage < totalPages) {
        const nextLink = document.createElement('a');
        nextLink.textContent = 'Next';
        nextLink.onclick = () => onPageClick(currentPage + 1);
        pagination.appendChild(nextLink);

        if (forControl) {
            const lastLink = document.createElement('a');
            lastLink.textContent = 'Last';
            lastLink.onclick = () => onPageClick(totalPages);
            pagination.appendChild(lastLink);
        }
    }
}
