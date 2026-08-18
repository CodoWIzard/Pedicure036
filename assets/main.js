const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

window.addEventListener("scroll", () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
  revealObserver.observe(element);
});

document.querySelectorAll(".magnetic").forEach((button) => {
  button.addEventListener("mousemove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "";
  });
});

const serviceItems = document.querySelectorAll("[data-service]");
serviceItems.forEach((item) => {
  item.addEventListener("click", () => {
    serviceItems.forEach((candidate) => candidate.classList.remove("is-active"));
    item.classList.add("is-active");
  });
});

const reviewCarousel = document.querySelector("[data-review-carousel]");
const reviewPrev = document.querySelector("[data-review-prev]");
const reviewNext = document.querySelector("[data-review-next]");
const reviewDots = document.querySelector("[data-review-dots]");

if (reviewCarousel && reviewDots) {
  const reviewCards = [...reviewCarousel.querySelectorAll(".review-card")];
  const dots = reviewCards.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ga naar review ${index + 1}`);
    dot.addEventListener("click", () => {
      reviewCards[index].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    });
    reviewDots.appendChild(dot);
    return dot;
  });

  const setActiveReview = () => {
    const carouselLeft = reviewCarousel.getBoundingClientRect().left;
    const closestIndex = reviewCards.reduce((bestIndex, card, index) => {
      const currentDistance = Math.abs(card.getBoundingClientRect().left - carouselLeft);
      const bestDistance = Math.abs(reviewCards[bestIndex].getBoundingClientRect().left - carouselLeft);
      return currentDistance < bestDistance ? index : bestIndex;
    }, 0);

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === closestIndex);
    });
  };

  const scrollReviews = (direction) => {
    const card = reviewCards[0];
    if (!card) return;
    const gap = Number.parseFloat(getComputedStyle(reviewCarousel).columnGap) || 18;
    reviewCarousel.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: "smooth" });
  };

  reviewPrev?.addEventListener("click", () => scrollReviews(-1));
  reviewNext?.addEventListener("click", () => scrollReviews(1));
  reviewCarousel.addEventListener("scroll", () => window.requestAnimationFrame(setActiveReview), { passive: true });
  window.addEventListener("resize", setActiveReview);
  setActiveReview();
}

document.querySelectorAll("[data-accordion]").forEach((accordion) => {
  accordion.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.nextElementSibling;
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isExpanded));
      if (panel) panel.hidden = isExpanded;
    });
  });
});

const careStudio = document.querySelector("[data-care-studio]");
if (careStudio) {
  const careContent = {
    nagels: {
      kicker: "Focus",
      title: "Nagelverzorging",
      copy: "De nagelbehandeling bestaat uit gerichte verzorging voor vorm, druk en comfort in schoenen.",
      lines: ["Knippen", "Reinigen", "Mechanisch afwerken", "Polijsten", "Nagelomgeving verzorgen", "Advies bij verdikte nagels"],
      background: "center"
    },
    huid: {
      kicker: "Focus",
      title: "Voetverzorging",
      copy: "Eelt, droge huid, kloven, likdoorns en gevoelige drukplekken worden rustig behandeld, met aandacht voor wat je voet dagelijks belast.",
      lines: ["Eelt zorgvuldig verminderen", "Kloven en droge huid verzorgen", "Drukplekken beoordelen", "Likdoorns rustig behandelen"],
      background: "58% center"
    },
    advies: {
      kicker: "Focus",
      title: "Nazorg en advies",
      copy: "Je krijgt duidelijke tips voor thuis en eerlijk advies wanneer doorverwijzing naar huisarts, podotherapeut of medisch pedicure verstandiger is.",
      lines: ["Thuisverzorging concreet maken", "Schoen- en drukadvies", "Vervolgafspraak inschatten", "Doorverwijzen waar nodig"],
      background: "72% center"
    }
  };

  const tabs = [...careStudio.querySelectorAll("[data-care-tab]")];
  const panel = careStudio.querySelector("[data-care-panel]");
  const kicker = careStudio.querySelector("[data-care-kicker]");
  const title = careStudio.querySelector("[data-care-title]");
  const copy = careStudio.querySelector("[data-care-copy]");
  const lines = careStudio.querySelector("[data-care-lines]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeKey = "nagels";

  const setCarePanel = (key) => {
    const content = careContent[key];
    if (!content || !panel || !kicker || !title || !copy || !lines) return;
    if (key === activeKey) return;
    activeKey = key;

    tabs.forEach((tab) => {
      const active = tab.dataset.careTab === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    const updateContent = () => {
      kicker.textContent = content.kicker;
      title.textContent = content.title;
      copy.textContent = content.copy;
      lines.replaceChildren(...content.lines.map((line) => {
        const item = document.createElement("span");
        item.textContent = line;
        return item;
      }));
      panel.style.backgroundPosition = content.background;
    };

    if (window.gsap && !reduceMotion) {
      window.gsap.killTweensOf([kicker, title, copy, lines, ...lines.children]);
      window.gsap.to([kicker, title, copy, lines], {
        autoAlpha: 0,
        y: 8,
        duration: .28,
        ease: "power2.out",
        onComplete: () => {
          updateContent();
          window.gsap.fromTo([kicker, title, copy, ...lines.children], {
            autoAlpha: 0,
            y: 10
          }, {
            autoAlpha: 1,
            y: 0,
            duration: .58,
            stagger: .045,
            ease: "power3.out"
          });
        }
      });
    } else {
      updateContent();
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setCarePanel(tab.dataset.careTab));
    tab.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover)").matches) setCarePanel(tab.dataset.careTab);
    });
  });

  if (window.gsap && !reduceMotion) {
    window.gsap.fromTo(careStudio.querySelectorAll(".care-tab"), {
      autoAlpha: 0,
      x: -18
    }, {
      autoAlpha: 1,
      x: 0,
      duration: .55,
      stagger: .08,
      ease: "power3.out",
      delay: .1
    });

    window.gsap.fromTo(careStudio.querySelector(".care-panel"), {
      autoAlpha: 0,
      clipPath: "inset(0 0 0 18%)"
    }, {
      autoAlpha: 1,
      clipPath: "inset(0 0 0 0%)",
      duration: .8,
      ease: "power3.out",
      delay: .18
    });

    window.gsap.fromTo(document.querySelectorAll(".timeline div"), {
      autoAlpha: 0,
      y: 28
    }, {
      autoAlpha: 1,
      y: 0,
      duration: .6,
      stagger: .08,
      ease: "power3.out"
    });
  }
}

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = contactForm.querySelector("[data-form-status]");
    const requiredFields = [...contactForm.querySelectorAll("[required]")];
    const missingField = requiredFields.find((field) => !field.value.trim());

    if (missingField) {
      missingField.focus();
      if (status) {
        status.textContent = "Vul eerst de verplichte velden in.";
        status.style.color = "#a86f5e";
      }
      return;
    }

    if (status) {
      status.textContent = "Aanvraag staat klaar. Koppel later e-mail of een boekingssysteem.";
      status.style.color = "#2d251f";
    }
  });
}
