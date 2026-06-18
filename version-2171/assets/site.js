(function () {
  var toggle = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 6500);
    }
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var root = panel.parentElement || document;
    var input = panel.querySelector('[data-card-search]');
    var year = panel.querySelector('[data-card-year]');
    var type = panel.querySelector('[data-card-type]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('.searchable-card'));

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';

      cards.forEach(function (card) {
        var ok = true;
        if (query) {
          ok = textOf(card).indexOf(query) !== -1;
        }
        if (ok && yearValue) {
          ok = card.getAttribute('data-year') === yearValue;
        }
        if (ok && typeValue) {
          ok = card.getAttribute('data-type') === typeValue;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (type) {
      type.addEventListener('change', apply);
    }

    if (document.querySelector('[data-search-page]') && input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      input.value = query;
      apply();
    }
  });

  document.querySelectorAll('[data-player-card]').forEach(function (card) {
    var video = card.querySelector('video');
    var cover = card.querySelector('.player-cover');

    function bindVideo() {
      if (!video || video.getAttribute('data-ready') === 'yes') {
        return;
      }

      var streamUrl = video.getAttribute('data-stream');
      if (!streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = streamUrl;
      }

      video.setAttribute('data-ready', 'yes');
    }

    function play() {
      if (!video) {
        return;
      }
      bindVideo();
      card.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        card.classList.add('is-playing');
      });
    }
  });
})();
