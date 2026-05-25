const slides = document.querySelectorAll(".slide");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

let currentSlide = 0;
let slideInterval = setInterval(nextSlide, 3000); // Lưu bộ đếm vào biến

function showSlide(index) {
  slides.forEach((slide) => {
    slide.classList.remove("active");
  });
  slides[index].classList.add("active");
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length; // Cách viết ngắn gọn để quay vòng
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
}

/* Reset lại thời gian khi người dùng click thủ công */
function resetTimer() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 3000);
}

nextBtn.addEventListener("click", () => {
  nextSlide();
  resetTimer();
});

prevBtn.addEventListener("click", () => {
  prevSlide();
  resetTimer();
});
