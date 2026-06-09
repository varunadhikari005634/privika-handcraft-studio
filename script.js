function filterItems(type) {
  let cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    if (type === "all") {
      card.style.display = "block";
    } else {
      if (card.dataset.type.includes(type)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    }
  });
}
let isHovering = false;

// jab mouse dropdown pe ho → hide mat karo
document.getElementById("suggestions").addEventListener("mouseenter", () => {
  isHovering = true;
});

document.getElementById("suggestions").addEventListener("mouseleave", () => {
  isHovering = false;
});

// outside click
document.addEventListener("click", function(e) {
  if (!e.target.closest(".search-container") && !isHovering) {
    document.getElementById("suggestions").style.display = "none";
  }
});