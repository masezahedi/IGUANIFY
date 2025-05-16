document.addEventListener("DOMContentLoaded", () => {
  const paragraph = document.querySelector("#animated-paragraph-color");

  // گام 1: تبدیل متن به span برای هر کلمه
  const childNodes = Array.from(paragraph.childNodes);
  const newContent = [];

  childNodes.forEach((node) => {
    if (node.nodeType === 3) {
      // متن ساده → به spanهای جداگانه
      const words = node.textContent.trim().split(/\s+/);
      words.forEach((word, i) => {
        if (word !== "") {
          const span = document.createElement("span");
          span.className = "fade-word";
          span.textContent = word;
          newContent.push(span);
          newContent.push(document.createTextNode(" "));
        }
      });
    } else {
      // اگر تصویر یا تگ دیگه بود → نگه‌دار
      newContent.push(node);
    }
  });

  // پاک کردن محتوای قبلی و اضافه کردن جدید
  paragraph.innerHTML = "";
  newContent.forEach((el) => paragraph.appendChild(el));

  // گام 2: تنظیم رنگ اولیه کلمات
  gsap.set(".fade-word", { color: "#383838" });

  const words = document.querySelectorAll(".fade-word");
  const images = paragraph.querySelectorAll(".fade-img");

  // گام 3: ساخت تایم‌لاین GSAP
  const viewportHeight = window.innerHeight;
  const offset = viewportHeight * 0.6;

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#why",
      start: `top center-=${offset}`,
      end: "+=2000",
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });

  // گام 4: انیمیشن رنگ کلمات
  tl.to(words, {
    color: "#fff",
    stagger: 0.1,
    ease: "none",
    onUpdate: function () {
      const progress = this.progress();
      const currentWordIndex = Math.floor(progress * words.length);

      // به ازای هر عکس، بررسی کن که باید ظاهر بشه یا نه
      // فرض: عکس اول بعد از کلمه 12، دومی بعد از 24، سومی بعد از 36 مثلا
      const triggerIndexes = [11, 42, 49];

      triggerIndexes.forEach((triggerIndex, i) => {
        const img = images[i];
        if (!img) return;

        if (currentWordIndex >= triggerIndex) {
          img.classList.add("visible");
        } else {
          img.classList.remove("visible");
        }
      });
    },
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
