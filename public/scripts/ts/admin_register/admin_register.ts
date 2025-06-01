import { useEffect } from "react";

export function useAdminRegister(isReady: boolean) {
    useEffect(() => {
        if (!isReady) return;

        const form = document.getElementById("staffForm");
        if (!form) return;
        const handleSubmit = async (event: Event) => {
            event.preventDefault();

            const roleSelected = document.querySelector('input[name="role"]:checked') as HTMLInputElement;
            const errorRoleDiv = document.getElementById("roleError") as HTMLElement;
            const databaseMessage = document.getElementById("databaseMessage") as HTMLElement;
            const errorRegister = document.getElementById("errorRegister") as HTMLElement;
            const errorMessage = document.getElementById("errorMessage") as HTMLElement;

            if (!roleSelected) {
                errorRoleDiv.style.display = "block";
                errorRoleDiv.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }

            errorRoleDiv.style.display = "none";
            const mail = document.getElementById("mail") as HTMLInputElement;
            const data = { mail: mail.value, role: roleSelected.value };

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/database/admin/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                    credentials: "include"
                });

                const resData = await response.text();
                if (response.status === 200) {
                    databaseMessage.style.display = "block";
                    errorRegister.style.display = "none";
                } else {
                    errorMessage.textContent = resData;
                    errorRegister.style.display = "block";
                    databaseMessage.style.display = "none";
                }
            } catch (error) {
                errorMessage.textContent = `Error: ${error}`;
                errorRegister.style.display = "block";
                databaseMessage.style.display = "none";
            }
        };

        form.addEventListener("submit", handleSubmit);
        return () => {
            form?.removeEventListener("submit", handleSubmit);
        };
    }, [isReady]);
}
