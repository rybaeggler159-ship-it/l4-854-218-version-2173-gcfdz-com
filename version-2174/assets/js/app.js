(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
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

        function startSlider() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        function resetSlider() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }

            startSlider();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                resetSlider();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                resetSlider();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                resetSlider();
            });
        }

        startSlider();

        var queryInput = document.querySelector(".js-filter-input");
        var categorySelect = document.querySelector(".js-category-filter");
        var yearSelect = document.querySelector(".js-year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".js-filter-card"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (queryInput && initialQuery) {
            queryInput.value = initialQuery;
        }

        function applyFilters() {
            var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
            var category = categorySelect ? categorySelect.value : "";
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var cardCategory = card.getAttribute("data-category") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }

                if (category && cardCategory !== category) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                card.classList.toggle("is-hidden-card", !matched);
            });
        }

        [queryInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (cards.length) {
            applyFilters();
        }
    });
})();

function setupPlayer(streamUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.querySelector(".player-overlay");
    var loaded = false;
    var hls = null;

    if (!video || !streamUrl) {
        return;
    }

    function loadStream() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function playVideo() {
        loadStream();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    video.addEventListener("error", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
        loaded = false;
    });
}
