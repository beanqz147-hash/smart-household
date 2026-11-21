const DB = {
    users: "shf_users",
    session: "shf_current_user"
};

function getUsers() {
    return JSON.parse(localStorage.getItem(DB.users) || "[]");
}

function currentUser() {
    return localStorage.getItem(DB.session);
}

function userKey(type) {
    const email = currentUser();
    return email ? `shf_${email}_${type}` : null;
}

function getData(type) {
    const key = userKey(type);
    return key ? JSON.parse(localStorage.getItem(key) || "[]") : [];
}

function saveData(type, data) {
    const key = userKey(type);
    if (key) {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

function money(amount) {
    return "KSh " + Number(amount || 0).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function today() {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function showMessage(id, message, error = false) {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = message;
    element.classList.toggle("error", error);
}

function requireAuth() {
    if (!currentUser()) {
        window.location.href = "index.html";
        return false;
    }

    return true;
}

function logout() {
    localStorage.removeItem(DB.session);
    window.location.href = "index.html";
}

function deleteAccount() {
    if (!confirm("Are you sure? This will permanently delete your local account and records.")) {
        return;
    }

    const email = currentUser();

    const users = getUsers().filter(user => user.email !== email);

    localStorage.setItem(DB.users, JSON.stringify(users));

    [
        "income",
        "expenses",
        "budgets",
        "goals"
    ].forEach(type => {
        localStorage.removeItem(`shf_${email}_${type}`);
    });

    localStorage.removeItem(DB.session);

    window.location.href = "index.html";
}

function initSettings() {
    const form = document.getElementById("settingsForm");

    if (!form) return;

    const users = getUsers();

    const user = users.find(u => u.email === currentUser());

    if (!user) return;

    document.getElementById("settingsName").value = user.name;
    document.getElementById("settingsEmail").value = user.email;

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        user.name = document.getElementById("settingsName").value.trim();

        localStorage.setItem(DB.users, JSON.stringify(users));

        showMessage(
            "settingsMessage",
            "Account information updated successfully."
        );
    });
}

function initPage() {

    // FIX: Do not require login on login or registration pages.
    const page = window.location.pathname.split("/").pop().toLowerCase();

    const isAuthPage =
        document.body.classList.contains("auth-body") ||
        page === "index.html" ||
        page === "register.html" ||
        page === "";

    if (isAuthPage) {
        return;
    }

    // Protect all other pages.
    if (!requireAuth()) return;

    const name = getUsers().find(
        u => u.email === currentUser()
    )?.name;

    document.querySelectorAll("#userName").forEach(el => {
        el.textContent = name || "User";
    });

    const dateElement = document.getElementById("todayDate");

    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString(
            "en-KE",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    }

    const dateInputs = ["incomeDate", "expenseDate"];

    dateInputs.forEach(id => {
        const input = document.getElementById(id);

        if (input && !input.value) {
            input.value = today();
        }
    });

    const monthInput = document.getElementById("budgetMonth");

    if (monthInput && !monthInput.value) {
        monthInput.value = today().slice(0, 7);
    }

    initSettings();
}

function total(data) {
    return data.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );
}

// Run initialization after the page has loaded.
document.addEventListener("DOMContentLoaded", initPage);