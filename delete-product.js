// ==============================
// DELETE PRODUCT
// ==============================

let selectedProduct = null;

const categoryInput = document.getElementById("category");
const searchBtn = document.getElementById("searchBtn");
const productsList = document.getElementById("productsList");
const deleteBtn = document.getElementById("deleteBtn");
const message = document.getElementById("message");


// ==============================
// MESSAGE
// ==============================

function showMessage(text, type = "error") {

    message.textContent = text;

    message.className = "message " + type;

}


// ==============================
// CHECK SELLER SESSION
// ==============================

async function checkSellerSession() {

    try {

        const {
            data,
            error
        } = await db.auth.getSession();

        if (error) {

            console.error("Session error:", error);

            showMessage(
                "Unable to verify seller session.",
                "error"
            );

            return null;
        }

        const session = data?.session;

        if (!session) {

            showMessage(
                "Seller session not found. Please login again.",
                "error"
            );

            return null;
        }

        console.log(
            "Seller authenticated:",
            session.user.email
        );

        return session;

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        showMessage(
            "Authentication error. Please login again.",
            "error"
        );

        return null;
    }
}


// ==============================
// FIND PRODUCTS
// ==============================

searchBtn.addEventListener("click", async function () {

    const session = await checkSellerSession();

    if (!session) {
        return;
    }


    const category = categoryInput.value.trim();

    if (!category) {

        showMessage(
            "Please enter a category name.",
            "error"
        );

        return;
    }


    searchBtn.disabled = true;

    searchBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Searching...';

    productsList.innerHTML = "";

    deleteBtn.disabled = true;

    selectedProduct = null;


    try {

        const {
            data,
            error
        } = await db
            .from("products")
            .select("*")
            .ilike(
                "category",
                `%${category}%`
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Supabase search error:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            return;
        }


        if (!data || data.length === 0) {

            showMessage(
                `No products found in "${category}".`,
                "error"
            );

            return;
        }


        showMessage(
            `${data.length} product(s) found.`,
            "success"
        );


        // ==============================
        // DISPLAY PRODUCTS
        // ==============================

        data.forEach(product => {

            const item = document.createElement("div");

            item.className = "delete-product-item";

            item.innerHTML = `
                <label>
                    <input
                        type="radio"
                        name="selectedProduct"
                        value="${product.id}"
                    >

                    <div class="delete-product-info">

                        <strong>
                            ${product.name || "Unnamed Product"}
                        </strong>

                        <span>
                            Category:
                            ${product.category || "N/A"}
                        </span>

                        ${
                            product.price
                            ? `<span>Price: ₹${product.price}</span>`
                            : ""
                        }

                    </div>

                </label>
            `;


            const radio =
                item.querySelector("input");


            radio.addEventListener(
                "change",
                function () {

                    selectedProduct = product;

                    deleteBtn.disabled = false;

                    document
                        .querySelectorAll(
                            ".delete-product-item"
                        )
                        .forEach(el =>
                            el.classList.remove(
                                "selected"
                            )
                        );

                    item.classList.add("selected");

                }
            );


            productsList.appendChild(item);

        });


    } catch (error) {

        console.error(
            "Unexpected search error:",
            error
        );

        showMessage(
            "Something went wrong while searching.",
            "error"
        );

    } finally {

        searchBtn.disabled = false;

        searchBtn.innerHTML =
            '<i class="fa-solid fa-magnifying-glass"></i> Find Products';

    }

});


// ==============================
// DELETE PRODUCT
// ==============================

deleteBtn.addEventListener("click", async function () {

    if (!selectedProduct) {

        showMessage(
            "Please select a product first.",
            "error"
        );

        return;
    }


    const session = await checkSellerSession();

    if (!session) {
        return;
    }


    const confirmDelete = confirm(
        `Are you sure you want to delete "${selectedProduct.name}"?\n\nThis action cannot be undone.`
    );


    if (!confirmDelete) {
        return;
    }


    // ==============================
    // PASSWORD VERIFICATION
    // ==============================

    const password = prompt(
        "Enter your seller password to confirm deletion:"
    );


    if (!password) {

        showMessage(
            "Deletion cancelled.",
            "error"
        );

        return;
    }


    deleteBtn.disabled = true;

    deleteBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';


    try {

        // Re-authenticate seller
        const {
            data: authData,
            error: authError
        } = await db.auth.signInWithPassword({

            email: session.user.email,

            password: password

        });


        if (authError) {

            console.error(
                "Password verification failed:",
                authError
            );

            showMessage(
                "Incorrect password. Product was NOT deleted.",
                "error"
            );

            return;
        }


        if (!authData?.user) {

            showMessage(
                "Authentication failed. Product was NOT deleted.",
                "error"
            );

            return;
        }


        // ==============================
        // DELETE PRODUCT
        // ==============================

        deleteBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';


        const {
            error: deleteError
        } = await db
            .from("products")
            .delete()
            .eq(
                "id",
                selectedProduct.id
            );


        if (deleteError) {

            console.error(
                "Delete error:",
                deleteError
            );

            showMessage(
                "Product could not be deleted: " +
                deleteError.message,
                "error"
            );

            return;
        }


        // ==============================
        // SUCCESS
        // ==============================

        showMessage(
            `"${selectedProduct.name}" deleted successfully.`,
            "success"
        );


        productsList.innerHTML = "";

        categoryInput.value = "";

        selectedProduct = null;

        deleteBtn.disabled = true;


    } catch (error) {

        console.error(
            "Unexpected delete error:",
            error
        );

        showMessage(
            "Something went wrong. Product was NOT deleted.",
            "error"
        );

    } finally {

        deleteBtn.innerHTML =
            '<i class="fa-solid fa-trash"></i> Delete Selected Product';

        if (!selectedProduct) {
            deleteBtn.disabled = true;
        }

    }

});
