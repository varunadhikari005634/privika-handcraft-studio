document.addEventListener("DOMContentLoaded", async () => {

    const slider = document.getElementById("slider-products");
    const nextButton = document.querySelector(".next");
    const prevButton = document.querySelector(".prev");

    if (!slider) {
        console.error("❌ slider-products not found");
        return;
    }

    // Get all products from Supabase
    const { data, error } = await db
        .from("products")
        .select("id, name, image_url, category");

    if (error) {
        console.error("❌ Supabase Error:", error);
        return;
    }

    if (!data || data.length === 0) {
        console.error("❌ No products found");
        return;
    }

    // Products having images only
    const products = data.filter(product => product.image_url);

    if (products.length === 0) {
        console.error("❌ No product images found");
        return;
    }

    // Random order
    products.sort(() => Math.random() - 0.5);

    // Create slides
    slider.innerHTML = products.map((product, index) => {

        return `
            <div class="slide-wrapper ${index === 0 ? "active" : ""}">

                <img
                    src="${product.image_url}"
                    class="slide-bg"
                    alt="${product.name}"
                >

                <img
                    src="${product.image_url}"
                    class="slide"
                    alt="${product.name}"
                >

            </div>
        `;

    }).join("");

    const slides = slider.querySelectorAll(".slide-wrapper");

    let currentSlide = 0;

    function showSlide(index) {

        slides.forEach(slide => {
            slide.classList.remove("active");
        });

        currentSlide = (index + slides.length) % slides.length;

        slides[currentSlide].classList.add("active");
    }

    // NEXT
    if (nextButton) {

        nextButton.addEventListener("click", () => {
            showSlide(currentSlide + 1);
        });

    }

    // PREVIOUS
    if (prevButton) {

        prevButton.addEventListener("click", () => {
            showSlide(currentSlide - 1);
        });

    }

    // AUTO CHANGE EVERY 5 SECONDS
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);

    console.log("✅ Slider loaded");
    console.log("📦 Products:", products.length);

});
