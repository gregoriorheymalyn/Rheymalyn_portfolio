document.addEventListener("DOMContentLoaded", function() {
  const slider = document.querySelector(".sec02-slider");
  const track  = document.querySelector(".sec02-track");
  const slides = Array.from(track.querySelectorAll("img"));
  const prev   = document.querySelector(".slide-btn.prev");
  const next   = document.querySelector(".slide-btn.next");

  if (!slider || !track || slides.length === 0) return;

  let currentIndex = 0;
  let enabled = false;
  let slideWidth = 0;

  // ensure all images are loaded before sizing
  function waitForImages() {
    return Promise.all(slides.map(img => {
      return new Promise(res => {
        if (img.complete) return res();
        img.onload = img.onerror = () => res();
      });
    }));
  }

  function updateSizes() {
    slideWidth = slider.clientWidth;
    slides.forEach(img => img.style.width = slideWidth + "px");  // force each slide to equal the container width (mobile)
    track.style.width = (slideWidth * slides.length) + "px";     // set track width explicitly to avoid extra space issues
  }

  function showImage(index) {
    if (!enabled) return;
    currentIndex = ((index % slides.length) + slides.length) % slides.length; // wrap index safely
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  }

  function enableSlider() {
    if (enabled) return;
    enabled = true;
    updateSizes();
    showImage(0);
    prev.addEventListener("click", onPrev);
    next.addEventListener("click", onNext);
    window.addEventListener("resize", onWindowResize);
    setTimeout(() => { updateSizes(); showImage(currentIndex); }, 50);  // small safety reflow in case widths weren't computed yet
  }

  function disableSlider() {
    if (!enabled) return;
    enabled = false;
    prev.removeEventListener("click", onPrev);
    next.removeEventListener("click", onNext);
    window.removeEventListener("resize", onWindowResize);
    track.style.transform = ""; // reset transform for desktop layout
    track.style.width = "";     // remove forced track width
    slides.forEach(img => img.style.width = ""); // remove forced widths
  }

  function onNext() { showImage(currentIndex + 1); }
  function onPrev() { showImage(currentIndex - 1); }

  function onWindowResize() {
    if (window.innerWidth <= 600) {
      updateSizes();
      showImage(currentIndex);
    } else {
      disableSlider();
    }
  }

  // init
  waitForImages().then(() => {
    // decide initial state
    if (window.innerWidth <= 600) {
      enableSlider();
    } else {
      disableSlider();
    }
    // always listen for breakpoint changes
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 600 && !enabled) enableSlider();
      if (window.innerWidth > 600 && enabled) disableSlider();
    });
  });
});
