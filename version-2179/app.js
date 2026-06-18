(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = $("#menuToggle");
    var menu = $("#mobileMenu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = $("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = $all("[data-hero-slide]", root);
    var dots = $all("[data-hero-dot]", root);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function setupHomeSearch() {
    var form = $("[data-home-search]");
    if (!form) {
      return;
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var q = input ? input.value.trim() : "";
      var url = "./search.html";
      if (q) {
        url += "?q=" + encodeURIComponent(q);
      }
      window.location.href = url;
    });
  }

  function setupFilters() {
    var form = $("[data-filter-form]");
    var cards = $all(".js-card");
    if (!form || !cards.length) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var select = form.querySelector("select[name='category']");
    function apply() {
      var q = normalize(input && input.value);
      var category = select ? select.value : "";
      cards.forEach(function (card) {
        var text = normalize((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || ""));
        var cardCategory = card.getAttribute("data-category") || "";
        var matchText = !q || text.indexOf(q) !== -1;
        var matchCategory = !category || cardCategory === category;
        card.classList.toggle("is-hidden", !(matchText && matchCategory));
      });
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) {
      input.value = params.get("q");
    }
    apply();
  }

  window.initMoviePlayer = function (src) {
    var video = $("#movieVideo");
    var cover = $("#moviePlayerCover");
    var button = cover;
    var hls = null;
    if (!video || !src) {
      return;
    }
    function attach() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.getAttribute("src") !== src) {
          video.setAttribute("src", src);
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
        }
      } else if (video.getAttribute("src") !== src) {
        video.setAttribute("src", src);
      }
    }
    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", play);
    }
    if (cover && cover !== button) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupHomeSearch();
    setupFilters();
  });
})();
