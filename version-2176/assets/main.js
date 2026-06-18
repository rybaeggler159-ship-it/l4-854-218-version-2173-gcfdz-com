(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-nav-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
    var index = window.MOVIE_SEARCH_INDEX || [];
    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var box = form.querySelector("[data-search-results]");
      if (!input || !box) {
        return;
      }

      function close() {
        box.classList.remove("is-open");
      }

      function render(items) {
        if (!items.length) {
          box.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
          box.classList.add("is-open");
          return;
        }
        box.innerHTML = items.slice(0, 8).map(function (item) {
          return '<a href="' + item.file + '"><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></a>';
        }).join("");
        box.classList.add("is-open");
      }

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        if (!keyword) {
          close();
          return;
        }
        var matched = index.filter(function (item) {
          return item.search.indexOf(keyword) !== -1;
        });
        render(matched);
      });

      input.addEventListener("focus", function () {
        if (input.value.trim()) {
          input.dispatchEvent(new Event("input"));
        }
      });

      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          close();
        }
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = box.querySelector("a");
        if (first) {
          window.location.href = first.getAttribute("href");
        }
      });
    });
  }

  function setupPageFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-page-filter-panel]"));
    panels.forEach(function (panel) {
      var textInput = panel.querySelector("[data-page-filter]");
      var yearSelect = panel.querySelector("[data-year-filter]");
      var typeSelect = panel.querySelector("[data-type-filter]");
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");

      function apply() {
        var keyword = textInput ? textInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre, card.dataset.year].join(" ").toLowerCase();
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && card.dataset.year !== year) {
            matched = false;
          }
          if (type && card.dataset.type !== type) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [textInput, yearSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector("[data-play-overlay]");
      var message = box.querySelector("[data-player-message]");
      var src = video ? video.getAttribute("data-video-src") : "";
      var hls = null;
      var attached = false;

      if (!video || !src) {
        return;
      }

      function showMessage(text) {
        if (message) {
          message.textContent = text;
          message.classList.add("is-visible");
        }
      }

      function attach() {
        if (attached) {
          return Promise.resolve();
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          return new Promise(function (resolve, reject) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                reject(new Error("load"));
              }
            });
          });
        }
        return Promise.reject(new Error("unsupported"));
      }

      function play() {
        attach().then(function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          return video.play();
        }).catch(function () {
          showMessage("视频加载失败，请稍后重试");
        });
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("error", function () {
        showMessage("视频加载失败，请稍后重试");
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupPageFilters();
    setupPlayers();
  });
})();
