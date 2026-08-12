document.addEventListener("DOMContentLoaded", async () => {

    // =========================================
    // CONTAINER
    // =========================================

    const container =
        document.getElementById("products-container");

    if (!container) {
        console.error("❌ products-container not found");
        return;
    }


    // =========================================
    // CATEGORY
    // =========================================

    const category =
        document.body.dataset.category;

    if (!category) {
        console.error("❌ data-category missing");
        return;
    }

    console.log("📂 Loading category:", category);


    // =========================================
    // LOADING
    // =========================================

    container.innerHTML = `
        <div class="no-products">
            Loading products...
        </div>
    `;


    // =========================================
    // SUPABASE CHECK
    // =========================================

    if (typeof db === "undefined") {

        console.error(
            "❌ Supabase database object 'db' not found"
        );

        container.innerHTML = `
            <div class="no-products">
                Unable to connect to database.
            </div>
        `;

        return;
    }


    // =========================================
    // FETCH PRODUCTS
    // =========================================

    const { data, error } = await db
        .from("products")
        .select("*")
        .eq("category", category)
        .order("id", {
            ascending: false
        });


    // =========================================
    // DATABASE ERROR
    // =========================================

    if (error) {

        console.error(
            "❌ Supabase Error:",
            error
        );

        container.innerHTML = `
            <div class="no-products">
                Unable to load products.
            </div>
        `;

        return;
    }


    // =========================================
    // CLEAR LOADING
    // =========================================

    container.innerHTML = "";


    // =========================================
    // NO PRODUCTS
    // =========================================

    if (!data || data.length === 0) {

        console.warn(
            "⚠️ No products found for category:",
            category
        );

        container.innerHTML = `
            <div class="no-products">
                No products available in this category yet.
            </div>
        `;

        return;
    }


    console.log(
        `✅ ${data.length} products loaded`
    );


    // =========================================
    // DISPLAY PRODUCTS
    // =========================================

    data.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "gallery-card";


        // =========================================
        // SOLD STATUS
        // =========================================

        const isSold =
            product.sold === true ||
            product.sold === "true";


        // =========================================
        // IMAGE
        // =========================================

        const imageHTML =
            product.image_url

            ? `
                <div class="image-wrapper ${isSold ? "is-sold" : ""}">

                    <img
                        src="${product.image_url}"
                        alt="${product.name || "Product"}"
                        loading="lazy"
                    >

                    ${
                        isSold
                        ? `
                            <div class="sold-overlay">

                                <span class="sold-badge">
                                    SOLD OUT
                                </span>

                            </div>
                        `
                        : ""
                    }

                </div>
            `

            : `
                <div class="image-wrapper">

                    <div class="no-image">
                        No Image Available
                    </div>

                </div>
            `;


        // =========================================
        // DESCRIPTION
        // =========================================

        const descriptionHTML =
            product.description &&
            String(product.description).trim() !== ""

            ? `
                <div class="product-description">

                    <span class="detail-label">
                        Description
                    </span>

                    <p>
                        ${product.description}
                    </p>

                </div>
            `

            : "";


        // =========================================
        // MATERIAL
        // =========================================

        const materialHTML =
            product.material &&
            String(product.material).trim() !== ""

            ? `
                <div class="product-detail-row">

                    <span class="detail-label">
                        Material:
                    </span>

                    <span class="detail-value">
                        ${product.material}
                    </span>

                </div>
            `

            : "";


        // =========================================
        // DIMENSIONS
        // =========================================

        const dimensionsHTML =
            product.dimensions &&
            String(product.dimensions).trim() !== ""

            ? `
                <div class="product-detail-row">

                    <span class="detail-label">
                        Dimensions:
                    </span>

                    <span class="detail-value">
                        ${product.dimensions}
                    </span>

                </div>
            `

            : "";


        // =========================================
        // STOCK
        // =========================================

        const stockHTML =
            product.stock !== null &&
            product.stock !== undefined &&
            product.stock !== ""

            ? `
                <div class="product-detail-row">

                    <span class="detail-label">
                        Stock:
                    </span>

                    <span class="detail-value">
                        ${product.stock}
                    </span>

                </div>
            `

            : "";


        // =========================================
        // PRICE
        // =========================================

        const priceHTML =
            product.price !== null &&
            product.price !== undefined &&
            product.price !== "" &&
            Number(product.price) > 0

            ? `
                <div class="product-price">

                    ₹${Number(product.price)
                        .toLocaleString("en-IN")}

                </div>
            `

            : "";


        // =========================================
        // PRODUCT INFO
        // =========================================

        const productInfoHTML =
            isSold

            ? `
                <div class="product-info">

                    <div class="coming-soon">

                        <span>
                            COMING SOON
                        </span>

                    </div>

                </div>
            `

            : `
                <div class="product-info">

                    ${descriptionHTML}

                    ${materialHTML}

                    ${dimensionsHTML}

                    ${stockHTML}

                </div>
            `;


        // =========================================
        // CARD HTML
        // =========================================

        card.innerHTML = `

            ${imageHTML}


            <h3>
                ${product.name || "Unnamed Product"}
            </h3>


            ${productInfoHTML}


            ${
                isSold
                ? ""
                : priceHTML
            }

        `;


        // =========================================
        // IMAGE VIEWER
        // =========================================

        const image =
            card.querySelector("img");


        if (image) {

            image.addEventListener("click", async () => {
            
            try {

    await db.rpc(
        "increment_product_view",
        {
            product_id: product.id
        }
    );

} catch (error) {

    console.error(
        "❌ View tracking failed:",
        error
    );

}

                    const viewer =
                        document.createElement("div");

                    viewer.className =
                        "image-viewer";


                    viewer.innerHTML = `

                        <button
                            class="close-viewer"
                            type="button"
                            aria-label="Close image viewer">
                            ×
                        </button>


                        <div class="viewer-content">

                            <img
                                src="${product.image_url}"
                                alt="${product.name || "Product"}"
                            >


                            <h2>
                                ${product.name || "Product"}
                            </h2>

                        </div>

                    `;


                    document.body
                        .appendChild(viewer);


                    // CLOSE BUTTON

                    const closeButton =
                        viewer.querySelector(
                            ".close-viewer"
                        );


                    closeButton.addEventListener(
                        "click",
                        () => viewer.remove()
                    );


                    // CLICK OUTSIDE

                    viewer.addEventListener(
                        "click",
                        event => {

                            if (
                                event.target === viewer
                            ) {
                                viewer.remove();
                            }

                        }
                    );


                    // ESC KEY

                    function closeWithEscape(event) {

                        if (
                            event.key === "Escape"
                        ) {

                            viewer.remove();

                            document.removeEventListener(
                                "keydown",
                                closeWithEscape
                            );

                        }

                    }


                    document.addEventListener(
                        "keydown",
                        closeWithEscape
                    );

                }
            );

        }


        // =========================================
        // ADD CARD TO PAGE
        // =========================================

        container.appendChild(card);

    });

});
