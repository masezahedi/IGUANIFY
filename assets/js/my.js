document.addEventListener("DOMContentLoaded", () => {
  // کدهای مربوط به انیمیشن متن
  const paragraph = document.querySelector("#animated-paragraph-color");
  const words = paragraph.textContent.trim().split(" ");

  paragraph.innerHTML = words
    .map((word) => `<span class="fade-word">${word}</span>`)
    .join(" ");

  gsap.set(".fade-word", { color: "#383838" });

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#why",
      start: "top center+800",
      end: "+=2000",
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });

  tl.to(".fade-word", {
    color: "#fff",
    stagger: 0.1,
    ease: "none",
  });

  // کدهای مربوط به لوتی
  const lottieContainer = document.getElementById("lottie-player");

  let currentLottie = lottie.loadAnimation({
    container: lottieContainer,
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "",
  });

  function changeLottie(service) {
    const newAnim = service.getAttribute("data-animation");

    if (!newAnim) return;

    currentLottie.destroy();
    currentLottie = lottie.loadAnimation({
      container: lottieContainer,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: newAnim,
    });
  }

  const services = document.querySelectorAll(".service");

  services.forEach((service) => {
    gsap.fromTo(
      service,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: service,
          start: "top 45%",
          toggleActions: "play none none reverse",
          onEnter: () => changeLottie(service),
          onEnterBack: () => changeLottie(service),
        },
      }
    );
  });

  // کدهای مربوط به otherservices
  const items = document.querySelectorAll(".service-item");
  const bgSlide = document.getElementById("bg-slide");

  items.forEach((item, i) => {
    item.addEventListener("mouseenter", () => {
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      const rect = item.getBoundingClientRect();
      const parentRect = item.parentElement.getBoundingClientRect();
      const left = rect.left - parentRect.left;
      const width = rect.width;

      bgSlide.style.left = `${left}px`;
      bgSlide.style.width = `${width}px`;
    });

    item.addEventListener("mouseleave", () => {
      item.classList.remove("active");
    });
  });
});
