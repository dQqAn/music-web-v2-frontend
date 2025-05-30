document.getElementById("staffForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const roleSelected = document.querySelector('input[name="role"]:checked') as HTMLInputElement;
    const errorRoleDiv = document.getElementById("roleError") as HTMLElement;
    const databaseMessage = document.getElementById("databaseMessage") as HTMLElement;
    const errorRegister = document.getElementById("errorRegister") as HTMLElement;
    const errorMessage = document.getElementById("errorMessage") as HTMLElement;

    if (!roleSelected) {
        errorRoleDiv.style.display = "block";
        errorRoleDiv.scrollIntoView({behavior: "smooth", block: "center"});
    } else {
        errorRoleDiv.style.display = "none";

        const mail = document.getElementById("mail") as HTMLInputElement;

        const data = {
            mail: mail.value,
            role: roleSelected.value
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const resData = await response.text();
            if (response.status === 200) {
                databaseMessage.style.display = "block";
            } else {
                errorMessage.textContent = resData;
                errorRegister.style.display = "block";
            }
        } catch (error) {
            errorMessage.textContent = `Error: ${error}`;
            errorRegister.style.display = "block";
        }
    }
});