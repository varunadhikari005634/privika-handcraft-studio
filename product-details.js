// ======================================================
// PRIVIKA - PRODUCT DETAILS
// Supabase Product Viewer + Editor
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {

    // ==================================================
    // ELEMENTS
    // ==================================================

    const categorySelect = document.getElementById("category");
    const productsList = document.getElementById("productsList");
    const productCount = document.getElementById("productCount");
    const message = document.getElementById("message");

    const editPanel = document.getElementById("editPanel");
    const editForm = document.getElementById("editForm");
    const closeEdit = document.getElementById("closeEdit");
    const cancelEdit = document.getElementById("cancelEdit");

    const editId = document.getElementById("editId");
    const editName = document.getElementById("editName");
    const editCategory = document.getElementById("editCategory");
    const editDescription = document.getElementById("editDescription");
    const editPrice = document.getElementById("editPrice");
    const editStock = document.getElementById("editStock");
    const editMaterial = document.getElementById("editMaterial");
    const editDimensions = document.getElementById("editDimensions");
    const editFeatured = document.getElementById("editFeatured");

    // NEW
    const editSold = document.getElementById("editSold");


    // ==================================================
    // BASIC CHECK
    // ==================================================

    if (!categorySelect || !productsList) {
        console.error("❌ Product Details elements not found.");
        return;
    }


    // ==================================================
    // SUPABASE CHECK
    // ==================================================

    if (typeof db === "undefined" || !db) {

        showMessage(
            "Supabase connection is not available.",
            "error"
        );

        console.error(
            "❌ db object not found. Check supabase.js."
        );

        return;
    }


    // ==================================================
    // SELLER SESSION CHECK
    // ==================================================

    try {

        const {
            data: { session },
            error
        } = await db.auth.getSession();

        if (error) {

            console.error(
                "Session error:",
                error
            );

            showMessage(
                "Unable to verify seller session.",
                "error"
            );

            return;
        }

        if (!session) {

            showMessage(
                "Seller session not found. Please login again.",
                "error"
            );

            setTimeout(() => {
                window.location.href = "seller-login.html";
            }, 1500);

            return;
        }

        console.log(
            "✅ Seller authenticated:",
            session.user.email
        );

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        showMessage(
            "Authentication failed.",
            "error"
        );

        return;
    }


    // ==================================================
    // CATEGORY CHANGE
    // ==================================================

    categorySelect.addEventListener(
        "change",
        async function () {

            const category =
                this.value.trim();

            productsList.innerHTML = "";

            productCount.textContent =
                "0 Products";

            hideMessage();

            closeEditPanel();

            if (!category) {
                return;
            }

            await loadProductsByCategory(category);

        }
    );


    // ==================================================
    // LOAD PRODUCTS
    // ==================================================

    async function loadProductsByCategory(category) {

        showMessage(
            `Loading products from "${category}"...`,
            "info"
        );

        productsList.innerHTML = "";

        try {

            const products =
                await fetchAllProducts(category);

            hideMessage();


            if (!products || products.length === 0) {

                productCount.textContent =
                    "0 Products";

                productsList.innerHTML = `

                    <div class="empty-state">

                        <i class="fa-solid fa-box-open"></i>

                        <h3>No Products Found</h3>

                        <p>
                            There are currently no products
                            in <strong>${escapeHTML(category)}</strong>.
                        </p>

                    </div>

                `;

                return;
            }


            productCount.textContent =
                `${products.length} ${
                    products.length === 1
                        ? "Product"
                        : "Products"
                }`;


            products.forEach(product => {

                renderProduct(product);

            });


            console.log(
                `✅ Loaded ${products.length} products from ${category}`
            );

        } catch (error) {

            console.error(
                "Product loading error:",
                error
            );

            productCount.textContent =
                "0 Products";

            showMessage(
                `Unable to load products: ${error.message}`,
                "error"
            );

        }
    }


    // ==================================================
    // FETCH ALL PRODUCTS
    // ==================================================

    async function fetchAllProducts(category) {

        const allProducts = [];

        const batchSize = 1000;

        let start = 0;

        while (true) {

            const end =
                start + batchSize - 1;

            const {
                data,
                error
            } = await db
                .from("products")
                .select("*")
                .eq("category", category)
                .range(start, end);


            if (error) {

                console.error(
                    "Supabase query error:",
                    error
                );

                throw error;
            }


            if (!data || data.length === 0) {
                break;
            }


            allProducts.push(...data);


            if (data.length < batchSize) {
                break;
            }


            start += batchSize;

        }


        return allProducts;
    }


    // ==================================================
    // RENDER PRODUCT CARD
    // ==================================================

    function renderProduct(product) {

        const card =
            document.createElement("article");

        card.className =
            "product-card";


        // ------------------------------------------
        // IMAGE
        // ------------------------------------------

        const imageURL =
            getProductImage(product);

        let imageHTML;


        if (imageURL) {

            imageHTML = `

                <img
                    src="${escapeAttribute(imageURL)}"
                    alt="${escapeAttribute(
                        product.name || "Product"
                    )}"
                    loading="lazy"
                    onerror="this.style.display='none';"
                >

            `;

        } else {

            imageHTML = `

                <div style="
                    width:100%;
                    height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:#777;
                    font-size:35px;
                ">

                    <i class="fa-solid fa-image"></i>

                </div>

            `;
        }


        // ------------------------------------------
        // PRICE
        // ------------------------------------------

        const price =
            product.price !== null &&
            product.price !== undefined &&
            product.price !== ""
                ? `₹${Number(product.price).toLocaleString("en-IN")}`
                : "Not specified";


        // ------------------------------------------
        // STOCK
        // ------------------------------------------

        const stock =
            product.stock !== null &&
            product.stock !== undefined &&
            product.stock !== ""
                ? product.stock
                : "Not specified";


        // ------------------------------------------
        // FEATURED
        // ------------------------------------------

        const featured =
            product.featured === true;


        // ------------------------------------------
        // SOLD
        // ------------------------------------------

        const sold =
            product.sold === true;


        // ------------------------------------------
        // SOLD BADGE
        // ------------------------------------------

        const soldBadge = sold
            ? `
                <div class="admin-sold-badge">
                    <span>●</span> SOLD
                </div>
              `
            : "";


        // ==========================================
        // CARD HTML
        // ==========================================

        card.innerHTML = `

            <div class="product-image">

                ${imageHTML}

                ${soldBadge}

            </div>


            <div class="product-info">

                <h3>
                    ${escapeHTML(
                        product.name || "Unnamed Product"
                    )}
                </h3>


                <div class="product-category">

                    ${escapeHTML(
                        product.category || "No Category"
                    )}

                    ${
                        featured
                            ? `
                                <span style="
                                    margin-left:8px;
                                    color:#ffd700;
                                ">
                                    ★ Featured
                                </span>
                              `
                            : ""
                    }

                </div>


                <div class="product-meta">

                    <div class="meta-item">

                        Price

                        <strong>
                            ${escapeHTML(String(price))}
                        </strong>

                    </div>


                    <div class="meta-item">

                        Stock

                        <strong>
                            ${escapeHTML(String(stock))}
                        </strong>

                    </div>

                </div>


                ${
                    sold
                        ? `
                            <div class="admin-coming-soon">
                                COMING SOON
                            </div>
                          `
                        : ""
                }


                <button
                    type="button"
                    class="edit-btn"
                    data-product-id="${escapeAttribute(
                        String(product.id)
                    )}"
                >

                    <i class="fa-solid fa-pen-to-square"></i>

                    Edit Product

                </button>

            </div>

        `;


        productsList.appendChild(card);


        // ------------------------------------------
        // EDIT BUTTON
        // ------------------------------------------

        const editButton =
            card.querySelector(".edit-btn");


        if (editButton) {

            editButton.addEventListener(
                "click",
                () => {

                    openEditPanel(product);

                }
            );

        }

    }


    // ==================================================
    // GET PRODUCT IMAGE
    // ==================================================

    function getProductImage(product) {

        const possibleFields = [

            "image_url",
            "image",
            "main_image",
            "imageUrl",
            "image_path",
            "main_image_url",
            "thumbnail",
            "thumbnail_url"

        ];


        for (const field of possibleFields) {

            const value =
                product[field];


            if (
                typeof value === "string" &&
                value.trim() !== ""
            ) {

                return value.trim();

            }

        }


        const arrayFields = [

            "gallery",
            "images",
            "gallery_images",
            "additional_images"

        ];


        for (const field of arrayFields) {

            const value =
                product[field];


            if (
                Array.isArray(value) &&
                value.length > 0
            ) {

                const first =
                    value[0];


                if (
                    typeof first === "string"
                ) {

                    return first;

                }


                if (
                    first &&
                    typeof first === "object"
                ) {

                    return (
                        first.url ||
                        first.image_url ||
                        first.path ||
                        ""
                    );

                }

            }

        }


        return "";

    }


    // ==================================================
    // OPEN EDIT PANEL
    // ==================================================

    function openEditPanel(product) {

        if (!editPanel) {
            return;
        }


        editId.value =
            product.id || "";


        editName.value =
            product.name || "";


        editCategory.value =
            product.category || "";


        editDescription.value =
            product.description || "";


        editPrice.value =
            product.price ?? "";


        editStock.value =
            product.stock ?? "";


        editMaterial.value =
            product.material || "";


        editDimensions.value =
            product.dimensions || "";


        editFeatured.checked =
            product.featured === true;


        // NEW SOLD STATUS

        if (editSold) {

            editSold.checked =
                product.sold === true;

        }


        editPanel.classList.add("active");


        setTimeout(() => {

            editPanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);

    }


    // ==================================================
    // CLOSE EDIT PANEL
    // ==================================================

    function closeEditPanel() {

        if (!editPanel) {
            return;
        }

        editPanel.classList.remove("active");

        if (editForm) {
            editForm.reset();
        }

    }


    if (closeEdit) {

        closeEdit.addEventListener(
            "click",
            closeEditPanel
        );

    }


    if (cancelEdit) {

        cancelEdit.addEventListener(
            "click",
            closeEditPanel
        );

    }


    // ==================================================
    // SAVE PRODUCT
    // ==================================================

    if (editForm) {

        editForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const id =
                    editId.value.trim();


                if (!id) {

                    showMessage(
                        "Product ID is missing.",
                        "error"
                    );

                    return;
                }


                const confirmUpdate =
                    confirm(
                        "Are you sure you want to save these changes?"
                    );


                if (!confirmUpdate) {
                    return;
                }


                const saveButton =
                    editForm.querySelector(".save-btn");


                if (saveButton) {

                    saveButton.disabled = true;

                    saveButton.innerHTML = `

                        <i class="fa-solid fa-spinner fa-spin"></i>

                        Saving...

                    `;

                }


                try {

                    // ----------------------------------
                    // UPDATE OBJECT
                    // ----------------------------------

                    const updatedProduct = {

                        name:
                            editName.value.trim(),

                        category:
                            editCategory.value.trim(),

                        description:
                            editDescription.value.trim() || null,

                        price:
                            editPrice.value === ""
                                ? null
                                : Number(editPrice.value),

                        stock:
                            editStock.value === ""
                                ? null
                                : Number(editStock.value),

                        material:
                            editMaterial.value.trim() || null,

                        dimensions:
                            editDimensions.value.trim() || null,

                        featured:
                            editFeatured.checked,

                        // NEW
                        sold:
                            editSold
                                ? editSold.checked
                                : false

                    };


                    // ----------------------------------
                    // SUPABASE UPDATE
                    // ----------------------------------

                    const {
                        data: updatedRows,
                        error
                    } = await db
                        .from("products")
                        .update(updatedProduct)
                        .eq("id", id)
                        .select(`
                            id,
                            name,
                            category,
                            description,
                            price,
                            stock,
                            material,
                            dimensions,
                            featured,
                            sold
                        `);


                    if (error) {

                        console.error(
                            "❌ Update error:",
                            error
                        );

                        throw error;

                    }


                    if (
                        !updatedRows ||
                        updatedRows.length === 0
                    ) {

                        throw new Error(
                            "No product was updated. Check the product ID or Supabase RLS UPDATE policy."
                        );

                    }


                    console.log(
                        "✅ Product updated in Supabase:",
                        updatedRows[0]
                    );


                    // ----------------------------------
                    // SUCCESS
                    // ----------------------------------

                    showMessage(
                        "Product details updated successfully.",
                        "success"
                    );


                    closeEditPanel();


                    const currentCategory =
                        categorySelect.value;


                    if (currentCategory) {

                        await loadProductsByCategory(
                            currentCategory
                        );

                    }

                } catch (error) {

                    console.error(
                        "❌ Save product error:",
                        error
                    );

                    showMessage(
                        `Unable to save changes: ${error.message}`,
                        "error"
                    );

                } finally {

                    if (saveButton) {

                        saveButton.disabled = false;

                        saveButton.innerHTML = `

                            <i class="fa-solid fa-floppy-disk"></i>

                            Save Changes

                        `;

                    }

                }

            }
        );

    }


    // ==================================================
    // MESSAGE FUNCTIONS
    // ==================================================

    function showMessage(text, type) {

        if (!message) {
            return;
        }

        message.textContent =
            text;

        message.className =
            `message ${type}`;

    }


    function hideMessage() {

        if (!message) {
            return;
        }

        message.textContent = "";

        message.className =
            "message";

    }


    // ==================================================
    // HTML SAFETY
    // ==================================================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHTML(value);

    }


    // ==================================================
    // INITIAL STATE
    // ==================================================

    productsList.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-layer-group"></i>

            <h3>Select a Category</h3>

            <p>
                Choose a category above to view
                all its products.
            </p>

        </div>

    `;

});
