document.addEventListener("DOMContentLoaded", () => {
  const paragraph = document.querySelector("#animated-paragraph-color");

  // گام ۱: تبدیل متن به span برای هر کلمه (این بخش بدون تغییر باقی می‌ماند)
  const childNodes = Array.from(paragraph.childNodes);
  const newContent = [];

  childNodes.forEach((node) => {
    if (node.nodeType === 3) { // TEXT_NODE
      const words = node.textContent.trim().split(/\s+/);
      words.forEach((word, i) => {
        if (word !== "") {
          const span = document.createElement("span");
          span.className = "fade-word";
          span.textContent = word;
          newContent.push(span);
          // اضافه کردن فاصله بین کلمات، مگر اینکه آخرین کلمه در یک گره متنی باشد
          // و یا بعد از آن گره دیگری (مثل عکس) وجود نداشته باشد.
          if (i < words.length - 1 || (node.nextSibling && node.nextSibling.nodeType !== 3)) {
            newContent.push(document.createTextNode(" "));
          } else if (i < words.length - 1) {
            newContent.push(document.createTextNode(" "));
          }
        }
      });
    } else {
      newContent.push(node.cloneNode(true)); // برای حفظ سایر عناصر مثل عکس‌ها
    }
  });

  paragraph.innerHTML = "";
  newContent.forEach((el) => paragraph.appendChild(el));

  // گام ۲: تنظیم رنگ اولیه کلمات (این بخش بدون تغییر باقی می‌ماند)
  gsap.set(".fade-word", { color: "#383838" });

  const words = document.querySelectorAll(".fade-word");
  const images = paragraph.querySelectorAll(".fade-img"); // مطمئن شوید این کلاس به درستی به عکس‌ها اعمال شده

  // گام ۳: ساخت تایم‌لاین GSAP برای انیمیشن پاراگراف (این بخش بدون تغییر باقی می‌ماند)
  const viewportHeight = window.innerHeight;
  const offset = viewportHeight * 0.6;

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#why", // این قسمت مربوط به سکشن "چرا Iguanify" است
      start: `top center-=${offset}`,
      end: "+=2000",
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      // markers: true, // برای دیباگ کردن می‌توانید این خط را از کامنت خارج کنید
    },
  });

  // گام ۴: انیمیشن رنگ کلمات و نمایش تصاویر داخل پاراگراف (این بخش بدون تغییر باقی می‌ماند)
  tl.to(
    {},
    {
      duration: words.length, // مدت زمان انیمیشن متناسب با تعداد کلمات
      ease: "none",
      onUpdate: function () {
        const progress = this.progress();
        const currentWordIndex = Math.floor(progress * words.length);

        words.forEach((word, index) => {
          if (index <= currentWordIndex) {
            word.style.color = "#ffffff";
          } else {
            word.style.color = "#383838";
            word.style.fontWeight = "normal";
          }
        });

        const triggerIndexes = [11, 42, 49]; // این اندیس‌ها را بر اساس موقعیت عکس‌ها در متن تنظیم کنید
        images.forEach((img, i) => { // تغییر برای استفاده صحیح از images
          if (!img) return;
          const triggerIndex = triggerIndexes[i];
          if (currentWordIndex >= triggerIndex) {
            img.classList.add("visible");
          } else {
            img.classList.remove("visible");
          }
        });
      },
    }
  );

  // --- کدهای مربوط به انیمیشن Lottie و سرویس‌ها ---
  const lottieContainer = document.getElementById("lottie-player");
  const lottieWrapper = document.querySelector(".right"); // کانتینر اصلی انیمیشن Lottie (ستون سمت راست)
  const serviceSection = document.getElementById("service"); // کانتینر اصلی بخش سرویس‌ها
  let currentLottie = null;

  function changeLottie(service) {
    const newAnimPath = service.getAttribute("data-animation");

    if (!newAnimPath) {
      // اگر مسیر انیمیشن جدید وجود ندارد، انیمیشن فعلی را با افکت محو کن
      if (currentLottie) {
        gsap.to(lottieContainer, {
          opacity: 0,
          duration: 0.3, // مدت زمان انیمیشن خروج
          ease: "power1.in",
          onComplete: () => {
            if (currentLottie) {
              currentLottie.destroy();
              currentLottie = null;
            }
            // بازنشانی وضعیت کانتینر برای استفاده‌های بعدی
            gsap.set(lottieContainer, { y: 0, scale: 1 });
          }
        });
      }
      return;
    }

    // اگر انیمیشن در حال نمایش همان انیمیشن جدید است، کاری انجام نده
    // مگر اینکه مخفی باشد که در این صورت فقط آن را نمایش بده
    if (currentLottie && currentLottie.path === newAnimPath) {
      if (gsap.getProperty(lottieContainer, "opacity") == 0) {
        // اگر مخفی بود، با انیمیشن ورود نمایش بده
        gsap.set(lottieContainer, { y: 20, scale: 1.05, opacity: 0 }); // حالت اولیه برای ورود مجدد
        gsap.to(lottieContainer, {
          opacity: 1,
          duration: 0.5, // مدت زمان انیمیشن ورود
          ease: "power1.out"
        });
      }
      return;
    }

    const loadAnimation = () => {
      if (currentLottie) {
        currentLottie.destroy(); // نابود کردن انیمیشن قبلی
      }
      currentLottie = lottie.loadAnimation({
        container: lottieContainer,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: newAnimPath,
      });
      currentLottie.path = newAnimPath; // ذخیره مسیر برای مقایسه‌های بعدی

      // تنظیم حالت اولیه انیمیشن جدید برای ورود
      gsap.set(lottieContainer, { opacity: 0, y: 20, scale: 1.05 }); // شروع از کمی پایین‌تر، بزرگتر و شفاف

      // انیمیشن ورود انیمیشن جدید
      gsap.to(lottieContainer, {
        opacity: 1,
        y: 0,         // حرکت به موقعیت اصلی
        scale: 1,     // بازگشت به اندازه اصلی
        duration: 0.5, // مدت زمان انیمیشن ورود
        ease: "power1.out"
      });
    };

    if (currentLottie) {
      // اگر انیمیشنی در حال اجراست، ابتدا آن را با افکت محو کن و سپس انیمیشن جدید را بارگذاری کن
      gsap.to(lottieContainer, {
        opacity: 0,
        y: -20,       // حرکت به بالا هنگام خروج
        scale: 0.95,  // کمی کوچک شدن هنگام خروج
        duration: 0.3, // مدت زمان انیمیشن خروج
        ease: "power1.in",
        onComplete: loadAnimation // پس از اتمام انیمیشن خروج، انیمیشن جدید را بارگذاری و نمایش بده
      });
    } else {
      // اگر هیچ انیمیشنی در حال اجرا نیست، مستقیما انیمیشن جدید را بارگذاری و با افکت نمایش بده
      loadAnimation();
    }
  }

  // انیمیشن اولیه برای ورود کانتینر Lottie (ستون سمت راست)
  if (lottieWrapper && serviceSection) {
    gsap.fromTo(
      lottieWrapper,
      {
        y: "50vh", // شروع از کمی پایین‌تر از وسط صفحه
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1, // مدت زمان انیمیشن ورود
        ease: "power2.out",
        scrollTrigger: {
          trigger: serviceSection, // تریگر: شروع بخش سرویس‌ها
          start: "top bottom-=150px", // شروع انیمیشن وقتی بالای بخش سرویس‌ها ۱۵۰ پیکسل از پایین صفحه فاصله دارد
          end: "top center",    // پایان انیمیشن وقتی بالای بخش سرویس‌ها به مرکز صفحه می‌رسد
          scrub: 1.5,              // اتصال نرم انیمیشن به اسکرول
          once: true,             // این انیمیشن فقط یک بار اجرا شود
          // markers: {startColor: "purple", endColor: "orange", indent: 80}, // برای دیباگ
        },
      }
    );
  }

  const services = document.querySelectorAll(".service");

  services.forEach((service, index) => {
    const title = service.querySelector(".title");

    // ۱. انیمیشن محو شدن و حرکت به بالا برای هر سرویس
    gsap.fromTo(
      service,
      {
        opacity: 0.1, // شروع با شفافیت بسیار کم
        y: 50, // شروع از کمی پایین‌تر
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6, // این duration در حالت scrub اهمیت کمتری دارد اما برای toggleActions اولیه استفاده می‌شود
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: service,
          start: "top bottom-=100px", // شروع وقتی بالای سرویس ۱۰۰ پیکسل از پایین صفحه فاصله دارد
          end: "center center-=50px",  // پایان وقتی مرکز سرویس ۵۰ پیکسل بالاتر از مرکز صفحه است (یعنی تقریبا در مرکز)
          scrub: 1, // اتصال نرم انیمیشن به اسکرول
          // markers: {startColor: "blue", endColor: "red", indent: 20 * index}, // برای دیباگ
        },
      }
    );

    // ۲. نمایش Lottie مربوط به هر سرویس وقتی عنوان آن به وسط ویوپورت می‌رسد
    ScrollTrigger.create({
      trigger: title, // تریگر: عنوان هر سرویس
      start: "center center-=50px", // شروع وقتی مرکز عنوان ۵۰ پیکسل بالاتر از مرکز صفحه است
      end: "center+=350px center", // پایان وقتی مرکز عنوان ۲۰۰ پیکسل پایین‌تر از مرکز صفحه است (برای پوشش محدوده حضور در مرکز)
      onEnter: () => {
        // تنها در صورتی انیمیشن را عوض کن که کانتینر Lottie قابل مشاهده باشد
        if (gsap.getProperty(lottieWrapper, "opacity") > 0.5) {
          changeLottie(service);
        }
      },
      onEnterBack: () => { // هنگام اسکرول به بالا و بازگشت به این بخش
        if (gsap.getProperty(lottieWrapper, "opacity") > 0.5) {
          changeLottie(service);
        }
      },
    });
  });

  // کدهای مربوط به otherServices
  const items = document.querySelectorAll(".service-item");
  const bgSlide = document.getElementById("bg-slide");

  items.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      // ابتدا، کلاس active را از تمام آیتم‌هایی که ممکن است فعال باشند و آیتم فعلی نیستند، حذف می‌کنیم
      // و انیمیشن لیست داخلی آن‌ها را ریست می‌کنیم.
      items.forEach((i) => {
        if (i !== item && i.classList.contains("active")) {
          i.classList.remove("active");
          const listItemsDeactivating = i.querySelectorAll(".service-details ul li");
          if (listItemsDeactivating.length > 0) {
            gsap.killTweensOf(listItemsDeactivating); // انیمیشن‌های در حال اجرا متوقف شوند
            gsap.set(listItemsDeactivating, { opacity: 0, y: 20 }); // به حالت اولیه انیمیشن بازگردانده شوند
          }
        }
      });

      // اگر آیتم فعلی هنوز active نشده است، آن را فعال کرده و انیمیشن لیست داخلی را اجرا می‌کنیم.
      // اگر موس صرفاً روی آیتمی که از قبل فعال بوده حرکت کند، انیمیشن دوباره اجرا نمی‌شود.
      // اما با توجه به اینکه در کد اصلی شما ابتدا از همه active حذف و سپس به فعلی اضافه می‌شود،
      // این بلوک if تضمین می‌کند که انیمیشن فقط در صورت تغییر وضعیت واقعی اجرا شود یا اگر بخواهیم همیشه اجرا شود باید کمی متفاوت عمل کنیم.
      // برای حفظ رفتار اصلی (فعال شدن مجدد و نمایش افکت حتی با حرکت کوچک موس روی همان آیتم):

      // ابتدا کلاس active از همه آیتم‌ها (شامل خود این آیتم اگر از قبل فعال بود) حذف می‌شود (طبق منطق اصلی شما)
      // این کار باعث می‌شود ترانزیشن CSS برای opacity مربوط به .service-details دوباره فعال شود.
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active"); // فعال کردن آیتم فعلی

      // انیمیشن GSAP برای آیتم‌های لیست (.service-details ul li)
      const listItems = item.querySelectorAll(".service-details ul li");
      if (listItems.length > 0) {
        // ابتدا انیمیشن‌های قبلی روی این آیتم‌ها را متوقف می‌کنیم (مهم برای هاورهای سریع و متعدد)
        gsap.killTweensOf(listItems);

        // انیمیشن از پایین و محو به سمت بالا و آشکار شدن
        gsap.fromTo(listItems,
          { opacity: 0, y: 20 }, // حالت شروع: شفافیت ۰، کمی پایین‌تر (y: 20)
          {
            opacity: 1,          // حالت پایان: شفافیت ۱
            y: 0,                // حالت پایان: در موقعیت اصلی (y: 0)
            duration: 0.4,       // مدت زمان انیمیشن برای هر آیتم
            stagger: 0.07,       // تاخیر بین شروع انیمیشن هر آیتم لیست
            ease: "power2.out",  // نوع Easing برای انیمیشن
            delay: 0.15          // تاخیر کلی قبل از شروع انیمیشن‌ها.
            // این تاخیر به ترانزیشن CSS والد (.service-details با 0.5s) اجازه می‌دهد کمی پیش برود.
            // انیمیشن آیتم‌ها (0.4s) + تاخیر (0.15s) = 0.55s، که با زمان ترانزیشن والد هماهنگ است.
          }
        );
      }

      // به‌روزرسانی موقعیت background-slide (کد اصلی شما)
      const rect = item.getBoundingClientRect();
      const parentRect = item.parentElement.getBoundingClientRect();
      const left = rect.left - parentRect.left;
      const width = rect.width;

      bgSlide.style.left = `${left}px`;
      bgSlide.style.width = `${width}px`;
    });

    item.addEventListener("mouseleave", () => {
      // فقط اگر آیتم واقعاً فعال بود، کلاس active را حذف و لیست را ریست کن
      if (item.classList.contains("active")) {
        item.classList.remove("active"); // این باعث می‌شود .service-details توسط CSS محو شود.

        const listItems = item.querySelectorAll(".service-details ul li");
        if (listItems.length > 0) {
          gsap.killTweensOf(listItems); // انیمیشن‌های در حال اجرا متوقف شوند
          // آیتم‌های لیست را به حالت اولیه انیمیشن (شفاف و کمی پایین‌تر) بازمی‌گردانیم.
          gsap.set(listItems, { opacity: 0, y: 20 });
        }
      }
    });
  });




  // MOUSE 
  //////////////////////////////////////////////
  //////////////////////////////////////////////
  // --- انتخاب عناصر ---
  const heroSection = document.querySelector(".hero-section"); // انتخاب سکشن هیرو
  const haloElement = document.querySelector(".mouse-glow-halo");
  const outerCircleElement = document.querySelector(".custom-cursor-outer-circle");
  const innerDotElement = document.querySelector(".custom-cursor-inner-dot");

  // بررسی وجود همه عناصر قبل از ادامه
  if (heroSection && haloElement && outerCircleElement && innerDotElement) {

    // --- تنظیمات اولیه GSAP برای همه عناصر سفارشی نشانگر ---
    gsap.set([haloElement, outerCircleElement, innerDotElement], {
      xPercent: -50, // مرکزیت افقی
      yPercent: -50, // مرکزیت عمودی
      opacity: 0,    // همه در ابتدا مخفی
      position: 'fixed' // اطمینان از اینکه position آنها fixed است
    });
    gsap.set(haloElement, { scale: 0.8 }); // هاله کمی کوچک‌تر شروع شود

    // --- توابع quickTo برای حرکت نرم ---
    const haloXTo = gsap.quickTo(haloElement, "x", { duration: 0.5, ease: "power2.out" });
    const haloYTo = gsap.quickTo(haloElement, "y", { duration: 0.5, ease: "power2.out" });
    const outerCircleXTo = gsap.quickTo(outerCircleElement, "x", { duration: 0.08, ease: "power1.out" });
    const outerCircleYTo = gsap.quickTo(outerCircleElement, "y", { duration: 0.08, ease: "power1.out" });
    const innerDotXTo = gsap.quickTo(innerDotElement, "x", { duration: 0.30, ease: "power2.out" });
    const innerDotYTo = gsap.quickTo(innerDotElement, "y", { duration: 0.30, ease: "power2.out" });

    // --- متغیرها برای کنترل وضعیت موس ---
    let mouseX = 0;
    let mouseY = 0;
    let mouseStopTimeout;
    let isCustomCursorActive = false; // برای پیگیری وضعیت نشانگر سفارشی

    // --- توابع برای فعال/غیرفعال کردن نشانگر سفارشی ---
    function activateCustomCursor(event) {
      if (!isCustomCursorActive) {
        isCustomCursorActive = true;
        document.body.style.cursor = 'none'; // مخفی کردن نشانگر پیش‌فرض کل صفحه
        heroSection.style.cursor = 'none'; // مخفی کردن نشانگر پیش‌فرض روی هیرو سکشن

        mouseX = event.clientX;
        mouseY = event.clientY;

        // تنظیم موقعیت اولیه عناصر برای جلوگیری از پرش
        gsap.set([haloElement, outerCircleElement, innerDotElement], { x: mouseX, y: mouseY });

        // ظاهر کردن عناصر سفارشی
        gsap.to([outerCircleElement, innerDotElement], { opacity: 1, duration: 0.2, ease: "power1.out", overwrite: "auto" });
        gsap.to(haloElement, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });

        // به‌روزرسانی اولیه موقعیت‌ها با quickTo
        haloXTo(mouseX);
        haloYTo(mouseY);
        outerCircleXTo(mouseX);
        outerCircleYTo(mouseY);
        innerDotXTo(mouseX);
        innerDotYTo(mouseY);
      }
    }

    function deactivateCustomCursor() {
      if (isCustomCursorActive) {
        isCustomCursorActive = false;
        document.body.style.cursor = 'auto'; // بازگرداندن نشانگر پیش‌فرض کل صفحه
        heroSection.style.cursor = 'auto'; // بازگرداندن نشانگر پیش‌فرض روی هیرو سکشن

        // مخفی کردن عناصر سفارشی
        gsap.to([haloElement, outerCircleElement, innerDotElement], {
          opacity: 0,
          duration: 0.3,
          ease: "power1.in",
          overwrite: "auto"
        });
        gsap.to(haloElement, { scale: 0.8 });
        clearTimeout(mouseStopTimeout);
      }
    }

    // --- رویدادهای موس برای heroSection ---
    heroSection.addEventListener("mouseenter", (event) => {
      activateCustomCursor(event);
    });

    heroSection.addEventListener("mouseleave", () => {
      deactivateCustomCursor();
    });

    heroSection.addEventListener("mousemove", (event) => {
      if (!isCustomCursorActive) { // اگر به دلایلی نشانگر فعال نشده بود، فعالش کن
        activateCustomCursor(event);
      }

      mouseX = event.clientX;
      mouseY = event.clientY;

      clearTimeout(mouseStopTimeout);

      haloXTo(mouseX);
      haloYTo(mouseY);
      outerCircleXTo(mouseX);
      outerCircleYTo(mouseY);
      innerDotXTo(mouseX);
      innerDotYTo(mouseY);

      mouseStopTimeout = setTimeout(() => {
        if (isCustomCursorActive) { // فقط اگر نشانگر سفارشی فعال است
          gsap.to(innerDotElement, {
            x: mouseX,
            y: mouseY,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      }, 100);
    });

    // --- رویداد خروج موس از کل پنجره سند ---
    // این برای حالتی است که موس به سرعت از هیرو سکشن خارج و از پنجره هم خارج شود
    document.documentElement.addEventListener("mouseleave", () => {
        deactivateCustomCursor();
    });

  } // انتهای شرط if (همه عناصر وجود دارند)
});
