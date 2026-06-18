document.addEventListener("DOMContentLoaded", function() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (menuButton && navMenu) {
    menuButton.addEventListener("click", function() {
      navMenu.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function() {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(current + 1);
        startTimer();
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        show(index);
        startTimer();
      });
    });

    startTimer();
  }

  const filterInputs = Array.from(document.querySelectorAll("[data-filter-input]"));
  const regionFilters = Array.from(document.querySelectorAll("[data-filter-region]"));
  const yearFilters = Array.from(document.querySelectorAll("[data-filter-year]"));

  function applyFilters() {
    const query = filterInputs.map(function(input) {
      return input.value.trim().toLowerCase();
    }).find(Boolean) || "";
    const region = regionFilters.map(function(select) {
      return select.value;
    }).find(Boolean) || "";
    const year = yearFilters.map(function(select) {
      return select.value;
    }).find(Boolean) || "";

    document.querySelectorAll("[data-card]").forEach(function(card) {
      const title = (card.getAttribute("data-title") || "").toLowerCase();
      const tags = (card.getAttribute("data-tags") || "").toLowerCase();
      const cardRegion = card.getAttribute("data-region") || "";
      const cardYear = card.getAttribute("data-year") || "";
      const textMatch = !query || title.indexOf(query) !== -1 || tags.indexOf(query) !== -1;
      const regionMatch = !region || cardRegion === region;
      const yearMatch = !year || cardYear === year;
      card.classList.toggle("is-hidden-card", !(textMatch && regionMatch && yearMatch));
    });
  }

  filterInputs.forEach(function(input) {
    input.addEventListener("input", applyFilters);
  });
  regionFilters.forEach(function(select) {
    select.addEventListener("change", applyFilters);
  });
  yearFilters.forEach(function(select) {
    select.addEventListener("change", applyFilters);
  });
});
