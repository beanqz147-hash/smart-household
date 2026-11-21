document.addEventListener("DOMContentLoaded", function () {

    // LOGIN
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = document.getElementById("loginEmail")
                .value.trim().toLowerCase();

            const password = document.getElementById("loginPassword")
                .value;

            const users = getUsers();

            const user = users.find(function (u) {
                return u.email.toLowerCase() === email &&
                       u.password === password;
            });

            if (!user) {
                showMessage(
                    "loginMessage",
                    "Incorrect email or password. Please try again.",
                    true
                );
                return;
            }

            localStorage.setItem(DB.session, user.email);

            showMessage("loginMessage", "Login successful!");

            window.location.href = "dashboard.html";
        });
    }

    // REGISTRATION
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("registerName")
                .value.trim();

            const email = document.getElementById("registerEmail")
                .value.trim().toLowerCase();

            const password = document.getElementById("registerPassword")
                .value;

            const confirmPassword = document.getElementById("confirmPassword")
                .value;

            if (!name || !email || !password || !confirmPassword) {
                showMessage(
                    "registerMessage",
                    "Please complete all fields.",
                    true
                );
                return;
            }

            if (password.length < 6) {
                showMessage(
                    "registerMessage",
                    "Password must contain at least 6 characters.",
                    true
                );
                return;
            }

            if (password !== confirmPassword) {
                showMessage(
                    "registerMessage",
                    "Passwords do not match.",
                    true
                );
                return;
            }

            const users = getUsers();

            const existingUser = users.find(function (user) {
                return user.email.toLowerCase() === email;
            });

            if (existingUser) {
                showMessage(
                    "registerMessage",
                    "This email is already registered. Please login.",
                    true
                );
                return;
            }

            const newUser = {
                name: name,
                email: email,
                password: password
            };

            users.push(newUser);

            localStorage.setItem(DB.users, JSON.stringify(users));

            // Automatically log in the newly registered user.
            localStorage.setItem(DB.session, email);

            showMessage(
                "registerMessage",
                "Account created successfully!"
            );

            window.location.href = "dashboard.html";
        });
    }

});