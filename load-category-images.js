document.addEventListener("DOMContentLoaded", async () => {

    console.log("🔄 Loading category image sliders...");

    const cards = document.querySelectorAll(".product-card");

    if (!cards.length) {
        console.error("❌ No product cards found");
        return;
    }

    // ==========================================
    // GET ALL PRODUCT IMAGES FROM SUPABASE
    // ==========================================

    const { data, error } = await db
        .from("products")
        .select("id, category, name, image_url")
        .not("image_url", "is", null)
        .order("id", {
            ascending: false
        });

    if (error) {

        console.error(
            "❌ Supabase category image error:",
            error
        );

        return;
    }

    console.log("✅ Products loaded:", data);


    // ==========================================
    // CREATE SLIDER FOR EACH CATEGORY
    // ==========================================

    cards.forEach(card => {

        const category =
            card.dataset.category;

        const imageContainer =
            card.querySelector(
                ".product-image-container"
            );

        if (!imageContainer || !category) {
            return;
        }


        // ==========================================
        // GET PRODUCTS BELONGING TO THIS CATEGORY
        // ==========================================

        const categoryProducts =
            data.filter(product =>
                product.category === category &&
                product.image_url
            );


        console.log(
            `📂 ${category}:`,
            categoryProducts
        );


        // ==========================================
        // NO IMAGE
        // ==========================================

        if (!categoryProducts.length) {

            imageContainer.innerHTML = `
                <div class="category-no-image">
                    <i class="fa-regular fa-image"></i>
                    <span>No images available</span>
                </div>
            `;

            return;
        }


        // ==========================================
        // CREATE SLIDER
        // ==========================================

        imageContainer.innerHTML = `

            <div class="category-slider">

                <div class="category-slides"></div>

                ${
                    categoryProducts.length > 1
                    ? `
                        <button
                            class="category-slider-prev"
                            aria-label="Previous image">
                            &#10094;
                        </button>

                        <button
                            class="category-slider-next"
                            aria-label="Next image">
                            &#10095;
                        </button>

                        <div class="category-slider-dots"></div>
                    `
                    : ""
                }

            </div>
        `;


        const slider =
            imageContainer.querySelector(
                ".category-slider"
            );

        const slidesContainer =
            slider.querySelector(
                ".category-slides"
            );


        // ==========================================
        // ADD IMAGES
        // ==========================================

        categoryProducts.forEach(
            (product, index) => {

                const slide =
                    document.createElement("div");

                slide.className =
                    "category-slide";

                if (index === 0) {
                    slide.classList.add("active");
                }


                slide.innerHTML = `

                    <img
                        src="${product.image_url}"
                        alt="${product.name || category}"
                        loading="lazy"
                    >

                `;


                slidesContainer.appendChild(
                    slide
                );

            }
        );


        // ==========================================
        // IF ONLY ONE IMAGE
        // ==========================================

        if (categoryProducts.length <= 1) {
            return;
        }


        // ==========================================
        // DOTS
        // ==========================================

        const dotsContainer =
            slider.querySelector(
                ".category-slider-dots"
            );


        categoryProducts.forEach(
            (product, index) => {

                const dot =
                    document.createElement("button");

                dot.className =
                    "category-slider-dot";

                if (index === 0) {
                    dot.classList.add("active");
                }

                dot.setAttribute(
                    "aria-label",
                    `Go to image ${index + 1}`
                );


                dot.addEventListener(
                    "click",
                    () => {

                        showCategorySlide(
                            slider,
                            index
                        );

                        resetCategoryTimer(
                            slider
                        );

                    }
                );


                dotsContainer.appendChild(
                    dot
                );

            }
        );


        // ==========================================
        // NEXT / PREVIOUS
        // ==========================================

        const nextButton =
            slider.querySelector(
                ".category-slider-next"
            );

        const prevButton =
            slider.querySelector(
                ".category-slider-prev"
            );


        nextButton.addEventListener(
            "click",
            () => {

                const current =
                    getCurrentCategorySlide(
                        slider
                    );

                const next =
                    (current + 1) %
                    categoryProducts.length;

                showCategorySlide(
                    slider,
                    next
                );

                resetCategoryTimer(
                    slider
                );

            }
        );


        prevButton.addEventListener(
            "click",
            () => {

                const current =
                    getCurrentCategorySlide(
                        slider
                    );

                const previous =
                    (
                        current -
                        1 +
                        categoryProducts.length
                    ) %
                    categoryProducts.length;

                showCategorySlide(
                    slider,
                    previous
                );

                resetCategoryTimer(
                    slider
                );

            }
        );


        // ==========================================
        // AUTOMATIC 3 SECOND SLIDER
        // ==========================================

        startCategoryTimer(
            slider,
            categoryProducts.length
        );


    });

});


// =================================================
// SHOW SLIDE
// =================================================

function showCategorySlide(
    slider,
    index
) {

    const slides =
        slider.querySelectorAll(
            ".category-slide"
        );

    const dots =
        slider.querySelectorAll(
            ".category-slider-dot"
        );


    slides.forEach(
        slide =>
            slide.classList.remove("active")
    );


    dots.forEach(
        dot =>
            dot.classList.remove("active")
    );


    if (slides[index]) {
        slides[index]
            .classList.add("active");
    }


    if (dots[index]) {
        dots[index]
            .classList.add("active");
    }

}


// =================================================
// CURRENT SLIDE
// =================================================

function getCurrentCategorySlide(
    slider
) {

    const slides =
        slider.querySelectorAll(
            ".category-slide"
        );


    for (
        let i = 0;
        i < slides.length;
        i++
    ) {

        if (
            slides[i]
                .classList
                .contains("active")
        ) {

            return i;

        }

    }

    return 0;

}


// =================================================
// START TIMER
// =================================================

function startCategoryTimer(
    slider,
    totalSlides
) {

    const timer =
        setInterval(
            () => {

                const current =
                    getCurrentCategorySlide(
                        slider
                    );

                const next =
                    (current + 1) %
                    totalSlides;

                showCategorySlide(
                    slider,
                    next
                );

            },
            3000
        );


    slider.dataset.timer =
        timer;

}


// =================================================
// RESET TIMER
// =================================================

function resetCategoryTimer(
    slider
) {

    if (slider.dataset.timer) {

        clearInterval(
            Number(slider.dataset.timer)
        );

    }


    const slides =
        slider.querySelectorAll(
            ".category-slide"
        );


    startCategoryTimer(
        slider,
        slides.length
    );

}
