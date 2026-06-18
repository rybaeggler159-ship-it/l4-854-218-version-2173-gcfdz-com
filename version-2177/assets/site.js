(function () {
  var nav = document.querySelector(".nav-wrap");
  var toggle = document.querySelector(".nav-toggle");

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(index);
        play();
      });
    });

    hero.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });

    hero.addEventListener("mouseleave", function () {
      window.clearInterval(timer);
      play();
    });

    show(0);
    play();
  });

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilter(scope) {
    var input = scope.querySelector(".filter-input");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    if (!input || !cards.length) {
      return;
    }
    var query = normalize(input.value);
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-filter"));
      card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
    });
  }

  function applySort(scope) {
    var select = scope.querySelector(".sort-select");
    var grid = scope.querySelector("[data-grid]");
    if (!select || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var value = select.value;
    cards.sort(function (a, b) {
      if (value === "year-desc") {
        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
      }
      if (value === "year-asc") {
        return Number(a.getAttribute("data-year") || 0) - Number(b.getAttribute("data-year") || 0);
      }
      if (value === "title-asc") {
        return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
      }
      return 0;
    });
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  document.querySelectorAll(".content-section").forEach(function (scope) {
    var input = scope.querySelector(".filter-input");
    var select = scope.querySelector(".sort-select");
    if (input) {
      input.addEventListener("input", function () {
        applyFilter(scope);
      });
    }
    if (select) {
      select.addEventListener("change", function () {
        applySort(scope);
        applyFilter(scope);
      });
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get("search");
  if (query) {
    var firstInput = document.querySelector(".filter-input");
    if (firstInput) {
      firstInput.value = query;
      var section = firstInput.closest(".content-section");
      if (section) {
        applyFilter(section);
      }
    }
  }
}());
