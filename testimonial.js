console.log("testimonial.js loaded");

// ===============================
// SUPABASE
// ===============================

const SUPABASE_URL = "https://jgyhxrxdpqfilyzzfttx.supabase.co";

const SUPABASE_KEY =
"sb_publishable_AkvNTfs2zCxR7TWdOkf1fg_6HzI3Jf1";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("Supabase Connected ✅");

// ===============================
// FORM
// ===============================

const reviewForm = document.getElementById("reviewForm");

const stars = document.querySelectorAll(".star");
const ratingValue = document.getElementById("ratingValue");

let selectedRating = 0;

function paintStars(value) {
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.add("active");
        } else {
            star.classList.remove("active");
        }
    });
}

stars.forEach((star, index) => {

star.addEventListener("mouseenter", () => {
    paintStars(index + 1);
});

    star.addEventListener("click", () => {
        console.log("Clicked:", index + 1);

        selectedRating = index + 1;
        ratingValue.value = selectedRating;

        paintStars(selectedRating);
    });

});

document.getElementById("ratingStars").addEventListener("mouseleave", () => {
    paintStars(selectedRating);
});

if (!reviewForm) {
    console.error("reviewForm not found");
} else {

    reviewForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        console.log("Submit button clicked");

        const name =
            document.getElementById("reviewName").value.trim();

        const review =
            document.getElementById("reviewText").value.trim();

const rating =
document.getElementById("ratingValue").value;

        const photoInput =
            document.getElementById("reviewPhoto");

        if (name === "") {
            alert("Please enter your name.");
            return;
        }

        if (review === "") {
            alert("Please write your review.");
            return;
        }

        if (!rating) {
            alert("Please select a rating.");
            return;
        }

        let photo_url = null;

        // ===============================
        // Upload Image (Optional)
        // ===============================

        if (photoInput && photoInput.files.length > 0) {

            const file = photoInput.files[0];

            const fileName =
                Date.now() + "_" + file.name;

            const { error: uploadError } =
                await supabaseClient.storage
                    .from("testimonial-images")
                    .upload(fileName, file);

            if (uploadError) {

                console.error(uploadError);

                alert("Image upload failed.");

                return;
            }

            const { data } =
                supabaseClient.storage
                    .from("testimonial-images")
                    .getPublicUrl(fileName);

            photo_url = data.publicUrl;
        }

        console.log({
    name,
    review,
    rating,
    photo_url
});

        // ===============================
        // Insert Review
        // ===============================

const { data, error } =
await supabaseClient
.from("testimonials")
.insert([
{
    name: name,
    review: review,
    rating: Number(rating),
    photo_url: photo_url
}
])
.select();

console.log("DATA :", data);
console.log("ERROR :", error);

if (error) {

    console.error(error);

    alert(error.message);

    return;

}
alert("Review submitted successfully!");

selectedRating = 0;
ratingValue.value = "";
paintStars(0);

reviewForm.reset();

await loadReviews();

    });

}

// ===============================
// LOAD REVIEWS
// ===============================

const reviewsContainer = document.getElementById("reviewsContainer");
const dotsContainer = document.getElementById("testimonialDots");

let reviews = [];
let currentReview = 0;
let slider = null;

async function loadReviews() {

    const { data, error } = await supabaseClient
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    reviews = data || [];

    renderReview();

    if (slider) clearInterval(slider);

    if (reviews.length > 1) {

        slider = setInterval(() => {

            currentReview++;

            if (currentReview >= reviews.length)
                currentReview = 0;

            renderReview();

        }, 8000);

    }

}

function renderReview() {

    if (reviews.length === 0) {

        reviewsContainer.innerHTML =
        "<p style='color:#999;text-align:center;'>No testimonials yet.</p>";

        if (dotsContainer)
            dotsContainer.innerHTML = "";

        return;
    }

    const review = reviews[currentReview];

    let stars = "";

    for (let i = 0; i < review.rating; i++) {
        stars += "★";
    }

    reviewsContainer.innerHTML = `

<div class="review-card">

    ${
    review.photo_url
        ? `<img src="${review.photo_url}"
               class="review-photo"
               onerror="this.style.display='none'">`
        : ""
}

    <div class="review-content">

        <div class="review-stars">${stars}</div>

        <div class="review-text">
            "${review.review}"
        </div>

        <div class="review-footer">

            <div class="review-name">
                ${review.name}
            </div>

            <div class="review-quote">❝</div>

        </div>

    </div>

</div>
`;

    if (!dotsContainer) return;

    dotsContainer.innerHTML = "";

    reviews.forEach((_, index) => {

        dotsContainer.innerHTML +=
        `<span class="${index === currentReview ? "active" : ""}"></span>`;

    });

}

loadReviews();