(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === currentSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
      }
      showSlide(i);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var noResults = document.querySelector('[data-no-results]');
  var activeFilter = { key: 'all', value: 'all' };

  function textOf(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-year')
    ].join(' ').toLowerCase();
  }

  function runFilter() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = textOf(card);
      var matchedQuery = !query || text.indexOf(query) !== -1;
      var matchedFilter = true;

      if (activeFilter.key !== 'all') {
        var value = activeFilter.value.toLowerCase();
        var source = card.getAttribute('data-' + activeFilter.key) || '';
        matchedFilter = source.toLowerCase().indexOf(value) !== -1;
      }

      var show = matchedQuery && matchedFilter;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.hidden = visible !== 0;
    }
  }

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', runFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      activeFilter = {
        key: button.getAttribute('data-filter') || 'all',
        value: button.getAttribute('data-value') || 'all'
      };
      runFilter();
    });
  });

  window.setupMoviePlayer = function (src) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('[data-play-overlay]');
    var loaded = false;
    var hls = null;

    if (!video || !src) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function attachSource() {
      if (loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      loaded = true;
    }

    function beginPlay() {
      attachSource();
      hideOverlay();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        beginPlay();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', function () {
      if (hls) {
        hls.stopLoad();
      }
    });
  };
})();
