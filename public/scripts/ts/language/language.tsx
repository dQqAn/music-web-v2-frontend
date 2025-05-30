export function changeLanguage(lang: string) {
    document.cookie = "lang=" + lang + "; path=/";
    localStorage.setItem("lang", lang);
    location.reload();
}