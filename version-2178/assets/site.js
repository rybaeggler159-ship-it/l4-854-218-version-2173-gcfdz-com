(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initSearch() {
    var inputs = document.querySelectorAll("[data-search-input]");
    inputs.forEach(function (input) {
      var scope = input.closest("[data-search-scope]") || document;
      var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
      var empty = scope.querySelector("[data-search-empty]");
      input.addEventListener("input", function () {
        var keyword = normalizeText(input.value);
        var visible = 0;
        items.forEach(function (item) {
          var content = normalizeText(item.getAttribute("data-search") || item.textContent);
          var matched = !keyword || content.indexOf(keyword) !== -1;
          item.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  ready(function () {
    initMenu();
    initSearch();
    initHero();
  });
})();

function setupPlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !streamUrl) {
    return;
  }
  var started = false;
  var hlsInstance = null;
  function playVideo() {
    if (!started) {
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play().catch(function () {});
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hlsInstance.loadSource(streamUrl);
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
        video.play().catch(function () {});
      }
    } else {
      video.play().catch(function () {});
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
  }
  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }
  video.addEventListener("click", function () {
    if (!started) {
      playVideo();
    }
  });
}
