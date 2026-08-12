document.addEventListener("DOMContentLoaded", async () => {

    console.log("📊 Seller Dashboard Started");


    // =====================================================
    // SUPABASE CHECK
    // =====================================================

    if (typeof db === "undefined") {

        console.error("❌ Supabase 'db' not found");

        return;
    }


    // =====================================================
    // ELEMENTS
    // =====================================================

    const totalProducts =
        document.getElementById("totalProducts");

    const totalViews =
        document.getElementById("totalViews");

    const mostViewed =
        document.getElementById("mostViewed");

    const outOfStock =
        document.getElementById("outOfStock");

    const lowStock =
        document.getElementById("lowStock");

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.querySelector(".sidebar");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // =====================================================
    // MOBILE MENU
    // =====================================================

    if (menuBtn && sidebar) {

        menuBtn.addEventListener("click", () => {

            sidebar.classList.toggle("active");

        });

    }


    // =====================================================
    // FORMAT NUMBER
    // =====================================================

    function formatNumber(number) {

        return Number(number || 0)
            .toLocaleString("en-IN");

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // SOLD CHECK
    // =====================================================

    function isSold(product) {

        return (
            product.sold === true ||
            product.sold === "true" ||
            product.sold === 1 ||
            product.sold === "1"
        );

    }


    // =====================================================
    // LOAD ALL PRODUCTS
    // =====================================================

    async function loadDashboardProducts() {

        console.log("📦 Loading products from Supabase...");


        /*
         * IMPORTANT:
         * select("*") is intentionally used.
         *
         * This prevents the dashboard from failing if
         * a column such as views/sold is not present.
         */

        const {
            data,
            error
        } = await db
            .from("products")
            .select("*")
            .order("id", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ PRODUCT DATABASE ERROR:",
                error
            );


            // Show actual error in console
            console.error(
                "Message:",
                error.message
            );


            return [];

        }


        console.log(
            `✅ ${data?.length || 0} products loaded`
        );


        console.table(data);


        return data || [];

    }


    // =====================================================
    // TOTAL PRODUCTS
    // =====================================================

    function updateTotalProducts(products) {

        if (!totalProducts) return;


        totalProducts.textContent =
            formatNumber(products.length);

    }


    // =====================================================
    // TOTAL WEBSITE VIEWS
    // =====================================================

    async function loadTotalViews() {

        if (!totalViews) return;


        console.log("👁 Loading website visits...");


        const {
            count,
            error
        } = await db
            .from("site_visits")
            .select("id", {
                count: "exact",
                head: true
            });


        if (error) {

            console.error(
                "❌ SITE VISITS ERROR:",
                error
            );


            totalViews.textContent = "0";


            // Show useful message
            totalViews.title =
                "Unable to read site_visits table";


            return;

        }


        totalViews.textContent =
            formatNumber(count || 0);


        console.log(
            `👁 Total website visits: ${count || 0}`
        );

    }


    // =====================================================
    // MOST VIEWED PRODUCT
    // =====================================================

    function updateMostViewed(products) {

        if (!mostViewed) return;


        if (!products.length) {

            mostViewed.innerHTML = `
                <span class="empty-text">
                    No products yet
                </span>
            `;

            return;

        }


        const sorted =
            [...products].sort(
                (a, b) =>
                    Number(b.views || 0) -
                    Number(a.views || 0)
            );


        const product =
            sorted[0];


        const views =
            Number(product.views || 0);


        mostViewed.innerHTML = `

            <strong>
                ${escapeHTML(
                    product.name ||
                    "Unnamed Product"
                )}
            </strong>

            <span class="insight-number">
                ${formatNumber(views)} views
            </span>

        `;

    }


    // =====================================================
    // OUT OF STOCK / SOLD PRODUCTS
    // =====================================================

    function updateOutOfStock(products) {

        if (!outOfStock) return;


        const soldProducts =
            products.filter(product =>
                isSold(product)
            );


        if (!soldProducts.length) {

            outOfStock.innerHTML = `
                <span class="empty-text">
                    No sold out products
                </span>
            `;

            return;

        }


        outOfStock.innerHTML = `

            <div class="product-list">

                ${soldProducts.map(product => `

                    <div class="dashboard-product-item sold-item">

                        <span class="product-item-name">
                            ${escapeHTML(
                                product.name ||
                                "Unnamed Product"
                            )}
                        </span>

                        <span class="status-badge sold-badge">
                            SOLD OUT
                        </span>

                    </div>

                `).join("")}

            </div>

        `;

    }


    // =====================================================
    // LOW STOCK
    // =====================================================

    function updateLowStock(products) {

        if (!lowStock) return;


        const lowStockProducts =
            products.filter(product => {

                const stock =
                    Number(product.stock);


                return (
                    !isSold(product) &&
                    !Number.isNaN(stock) &&
                    stock >= 0 &&
                    stock < 3
                );

            });


        if (!lowStockProducts.length) {

            lowStock.innerHTML = `
                <span class="empty-text">
                    No low stock products
                </span>
            `;

            return;

        }


        lowStock.innerHTML = `

            <div class="product-list">

                ${lowStockProducts.map(product => `

                    <div class="dashboard-product-item low-stock-item">

                        <span class="product-item-name">
                            ${escapeHTML(
                                product.name ||
                                "Unnamed Product"
                            )}
                        </span>

                        <span class="status-badge low-stock-badge">
                            ${Number(product.stock)} LEFT
                        </span>

                    </div>

                `).join("")}

            </div>

        `;

    }


    // =====================================================
    // PRODUCT VIEWS BAR CHART
    // =====================================================

    let viewsChart = null;


    function createViewsChart(products) {

        const canvas =
            document.getElementById("viewsChart");


        if (!canvas) {

            console.error(
                "❌ viewsChart canvas not found"
            );

            return;

        }


        // =========================================
        // SORT BY VIEWS
        // =========================================

        const sorted =
            [...products]
                .sort(
                    (a, b) =>
                        Number(b.views || 0) -
                        Number(a.views || 0)
                );


        // =========================================
        // LIMIT TO TOP PRODUCTS
        // =========================================

        const topProducts =
            sorted.slice(0, 10);


        const names =
            topProducts.map(
                product =>
                    product.name ||
                    "Unnamed"
            );


        const views =
            topProducts.map(
                product =>
                    Number(product.views || 0)
            );


        // =========================================
        // DESTROY OLD CHART
        // =========================================

        if (viewsChart) {

            viewsChart.destroy();

        }


        // =========================================
        // CREATE CHART
        // =========================================

        viewsChart =
            new Chart(canvas, {

                type: "bar",

                data: {

                    labels: names,

                    datasets: [{

                        label: "Product Views",

                        data: views,

                        backgroundColor:
                            "#ffd700",

                        borderColor:
                            "#ffd700",

                        borderWidth: 1,

                        borderRadius: 6

                    }]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,


                    plugins: {

                        legend: {

                            display: false

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            " " +
                                            formatNumber(
                                                context.raw
                                            ) +
                                            " views"
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        x: {

                            ticks: {

                                color: "#ddd",

                                maxRotation: 45,

                                minRotation: 0

                            },

                            grid: {

                                display: false

                            }

                        },


                        y: {

                            beginAtZero: true,

                            ticks: {

                                color: "#ddd",

                                precision: 0

                            },

                            grid: {

                                color:
                                    "rgba(255,215,0,0.08)"

                            }

                        }

                    }

                }

            });

    }


    // =====================================================
    // WORK IN PROGRESS SECTIONS
    // =====================================================

    function setWorkInProgress() {

        const totalOrders =
            document.getElementById("totalOrders");

        const totalRevenue =
            document.getElementById("totalRevenue");

        const bestSelling =
            document.getElementById("bestSelling");


        if (totalOrders) {

            totalOrders.innerHTML =
                "WORK IN PROGRESS";

        }


        if (totalRevenue) {

            totalRevenue.innerHTML =
                "WORK IN PROGRESS";

        }


        if (bestSelling) {

            bestSelling.innerHTML =
                "WORK IN PROGRESS";

        }


        const salesChart =
            document.getElementById("salesChart");


        if (salesChart) {

            const parent =
                salesChart.parentElement;


            salesChart.style.display =
                "none";


            const existing =
                parent.querySelector(
                    ".wip-message"
                );


            if (!existing) {

                const message =
                    document.createElement("div");


                message.className =
                    "wip-message";


                message.innerHTML =
                    "🛠 WORK IN PROGRESS";


                parent.appendChild(message);

            }

        }

    }


    // =====================================================
    // REMOVE RECENT PRODUCTS SECTION
    // =====================================================

    function removeRecentProducts() {

        const recentSection =
            document.querySelector(".recent");


        if (recentSection) {

            recentSection.remove();

            console.log(
                "🗑 Recent Products removed"
            );

        }

    }


    // =====================================================
    // LOGOUT
    // =====================================================

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async event => {

                event.preventDefault();


                try {

                    if (
                        typeof db !== "undefined" &&
                        db.auth
                    ) {

                        await db.auth.signOut();

                    }

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                }


                window.location.href =
                    "seller-login.html";

            }
        );

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    try {

        console.log(
            "🚀 Starting dashboard data load..."
        );


        // -----------------------------------------
        // PRODUCTS
        // -----------------------------------------

        const products =
            await loadDashboardProducts();


        updateTotalProducts(products);

        updateMostViewed(products);

        updateOutOfStock(products);

        updateLowStock(products);

        createViewsChart(products);


        // -----------------------------------------
        // WEBSITE VISITS
        // -----------------------------------------

        await loadTotalViews();


        // -----------------------------------------
        // WIP
        // -----------------------------------------

        setWorkInProgress();


        // -----------------------------------------
        // REMOVE RECENT PRODUCTS
        // -----------------------------------------

        removeRecentProducts();


        console.log(
            "✅ Dashboard loaded successfully"
        );

    } catch (error) {

        console.error(
            "❌ Dashboard fatal error:",
            error
        );

    }

});
