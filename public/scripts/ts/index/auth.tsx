import { useEffect } from "react";

export let activeStatus = false

async function checkLoginStatus() {
    const user_section = document.getElementById("user_section");
    if (!user_section) return;
    user_section.innerHTML = ``;

    const route = document.createElement("a");

    const res = await tokenControl();

    if (res) {
        activeStatus = true
        route.href = "/dashboard";
        route.textContent = "Dashboard";
    } else {
        activeStatus = false
        const fullUrl = window.location.origin + window.location.pathname;
        route.href = "http://localhost:8083/start-login?redirectUrl=" + encodeURIComponent(fullUrl);
        route.textContent = "Login";
    }
    user_section.appendChild(route);
}

export function auth() {
    useEffect(() => {
        checkLoginStatus();
    }, [])
}

async function tokenControl() {
    const res = await fetch("http://localhost:8083/check_auth", { credentials: "include" });

    if (res.ok) return true;

    if (res.status === 401) {
        const csrf = readCookie("csrf");
        const headers: HeadersInit = {};
        if (csrf) {
            headers["X-CSRF"] = csrf;
        }
        const r = await fetch("http://localhost:8083/refresh", {
            method: "POST",
            credentials: "include",
            headers
        });

        if (r.ok) {
            const retry = await fetch("http://localhost:8083/check_auth", { credentials: "include" });
            return retry.ok;
        }
    }
    return false
}

function readCookie(name: string) {
    return document.cookie
        .split("; ")
        .find(r => r.startsWith(name + "="))
        ?.split("=")[1];
}