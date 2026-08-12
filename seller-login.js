const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";
    message.style.color = "#ffd700";

    const { data, error } = await db.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {

        console.error("Login error:", error);

        message.textContent = "Invalid email or password.";
        message.style.color = "#ff6b6b";

        return;
    }

    console.log("Seller logged in:", data.user);

    message.textContent = "Login successful!";
    message.style.color = "#4ade80";

    setTimeout(() => {
        window.location.href = "seller-dashboard.html";
    }, 500);

});
