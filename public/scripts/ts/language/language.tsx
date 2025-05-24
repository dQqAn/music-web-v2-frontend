function changeLanguage(lang) {
    document.cookie = "lang=" + lang + "; path=/";
    localStorage.setItem("lang", lang);
    location.reload();
}