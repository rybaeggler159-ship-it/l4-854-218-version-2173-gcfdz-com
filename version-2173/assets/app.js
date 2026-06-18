(function() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let activeIndex = 0;
    let timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function() {
        setSlide(activeIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        setSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        setSlide(activeIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        setSlide(Number(dot.dataset.heroDot));
        startTimer();
      });
    });

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    startTimer();
  }

  const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));

  panels.forEach(function(panel) {
    const input = panel.querySelector("[data-filter-input]");
    const year = panel.querySelector("[data-year-filter]");
    const type = panel.querySelector("[data-type-filter]");
    const reset = panel.querySelector("[data-filter-reset]");
    const list = document.querySelector("[data-filter-list]");
    const empty = document.querySelector("[data-empty-state]");
    const params = new URLSearchParams(window.location.search);

    if (!list) {
      return;
    }

    const items = Array.from(list.querySelectorAll(".movie-card, tbody tr"));

    function applyFilter() {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const selectedYear = year ? year.value : "";
      const selectedType = type ? type.value : "";
      let visible = 0;

      items.forEach(function(item) {
        const text = String(item.dataset.search || "").toLowerCase();
        const itemYear = item.dataset.year || "";
        const itemType = item.dataset.type || "";
        const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchedYear = !selectedYear || itemYear === selectedYear;
        const matchedType = !selectedType || itemType === selectedType;
        const show = matchedKeyword && matchedYear && matchedType;

        item.style.display = show ? "" : "none";

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    [input, year, type].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener("click", function() {
        if (input) {
          input.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (type) {
          type.value = "";
        }
        applyFilter();
      });
    }

    applyFilter();
  });
}());
