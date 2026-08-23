document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("productForm");

    if (!form) {
        console.error("❌ productForm not found");
        return;
    }


    // =====================================================
    // PREVENT DUPLICATE EVENT LISTENER
    // =====================================================

    if (form.dataset.listenerAttached === "true") {
        console.warn("⚠️ Submit listener already attached.");
        return;
    }

    form.dataset.listenerAttached = "true";


    // =====================================================
    // SUBMIT HANDLER
    // =====================================================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();
        e.stopPropagation();


        // =================================================
        // PREVENT DOUBLE SUBMISSION
        // =================================================

        if (form.dataset.submitting === "true") {
            console.warn("⚠️ Product submission already in progress.");
            return;
        }

        form.dataset.submitting = "true";


        // Get submit button
        const submitButton =
            form.querySelector('button[type="submit"]');

        // Store original button content
        const originalButtonContent =
            submitButton ? submitButton.innerHTML : "";


        // Disable button immediately
        if (submitButton) {

            submitButton.disabled = true;

            submitButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Saving Product...';
        }


        try {

            // =================================================
            // GET FORM DATA
            // =================================================

            const name =
                document.getElementById("name").value.trim();

            const category =
                document.getElementById("category").value;

            const description =
                document.getElementById("description").value.trim();

            const price =
                document.getElementById("price").value;

            const stock =
                document.getElementById("stock").value;

            const material =
                document.getElementById("material").value.trim();

            const dimensions =
                document.getElementById("dimensions").value.trim();

            const featured =
                document.getElementById("featured").checked;

            const mainImage =
                document.getElementById("image").files[0];

            const galleryImages =
                document.getElementById("gallery").files;

            const images360 =
                document.getElementById("images360").files;


            // =================================================
            // VALIDATION
            // =================================================

            if (!name || !category) {

                alert(
                    "Please enter product name and category."
                );

                return;
            }


            // =================================================
            // UPLOAD MAIN IMAGE
            // =================================================

            let imageUrl = null;

            if (mainImage) {

                const fileName =
                    `${Date.now()}-${mainImage.name}`;

                const filePath =
                    `products/${category}/${fileName}`;


                const { error: uploadError } =
                    await db.storage
                        .from("product-images")
                        .upload(
                            filePath,
                            mainImage
                        );


                if (uploadError) {

                    console.error(
                        "❌ Main image upload error:",
                        uploadError
                    );

                    alert(
                        "❌ Main image upload failed."
                    );

                    return;
                }


                const { data: publicData } =
                    db.storage
                        .from("product-images")
                        .getPublicUrl(filePath);


                imageUrl =
                    publicData.publicUrl;
            }


            // =================================================
            // INSERT PRODUCT
            // =================================================

            const { data: product, error } =
                await db
                    .from("products")
                    .insert([
                        {
                            name: name,
                            category: category,
                            description:
                                description || null,

                            price:
                                price
                                    ? Number(price)
                                    : null,

                            stock:
                                stock
                                    ? Number(stock)
                                    : null,

                            material:
                                material || null,

                            dimensions:
                                dimensions || null,

                            featured: featured,

                            image_url: imageUrl
                        }
                    ])
                    .select()
                    .single();


            // =================================================
            // DATABASE ERROR
            // =================================================

            if (error) {

                console.error(
                    "❌ Database Error:",
                    error
                );

                alert(
                    "❌ Product could not be saved.\n\n" +
                    error.message
                );

                return;
            }


            console.log(
                "✅ Product added:",
                product
            );


            // =================================================
            // ADDITIONAL IMAGES
            // =================================================

            if (galleryImages.length > 0) {

                for (const file of galleryImages) {

                    const fileName =
                        `${Date.now()}-${file.name}`;

                    const filePath =
                        `gallery/${product.id}/${fileName}`;


                    const { error: uploadError } =
                        await db.storage
                            .from("product-images")
                            .upload(
                                filePath,
                                file
                            );


                    if (uploadError) {

                        console.error(
                            "Gallery upload failed:",
                            uploadError
                        );

                        continue;
                    }


                    const { data: publicData } =
                        db.storage
                            .from("product-images")
                            .getPublicUrl(filePath);


                    console.log(
                        "Gallery image:",
                        publicData.publicUrl
                    );
                }
            }


            // =================================================
            // 360° IMAGES
            // =================================================

            if (images360.length > 0) {

                for (const file of images360) {

                    const fileName =
                        `${Date.now()}-${file.name}`;

                    const filePath =
                        `360/${product.id}/${fileName}`;


                    const { error: uploadError } =
                        await db.storage
                            .from("product-images")
                            .upload(
                                filePath,
                                file
                            );


                    if (uploadError) {

                        console.error(
                            "360 image upload failed:",
                            uploadError
                        );

                        continue;
                    }


                    console.log(
                        "✅ 360 image uploaded:",
                        file.name
                    );
                }
            }


            // =================================================
            // SUCCESS
            // =================================================

            alert(
                "✅ Product added successfully!"
            );


            // Reset form
            form.reset();


        }

        catch (error) {

            console.error(
                "❌ Unexpected error:",
                error
            );

            alert(
                "Something went wrong.\n\n" +
                error.message
            );

        }

        finally {

            // =================================================
            // ALLOW SUBMISSION AGAIN
            // =================================================

            form.dataset.submitting = "false";


            // Restore button
            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    originalButtonContent;
            }
        }

    });

});
