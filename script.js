const toggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
const header = document.querySelector(".header");
const hero = document.querySelector(".hero");
const heroPhoto = document.querySelector(".hero-photo");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function closeMenu() {
  navigation.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Abrir menu");
}
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});
navigation.addEventListener("click", event => {
  if (event.target.closest("a[href]")) closeMenu();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener("click", event => {
  if (!event.target.closest(".header")) closeMenu();
});
window.matchMedia("(min-width: 1280px)").addEventListener("change", closeMenu);

const revealSelector = [
  ".services-intro > *", ".services-cta", ".service-card",
  ".gallery-copy > *", ".gallery-note", ".gallery-tile",
  ".plans-intro", ".plan-card", ".about-art", ".about-copy > *",
  ".catalog-heading > *", ".catalog-item", ".location-map",
  ".location-copy > *", ".hours-card", ".final-cta-inner > *",
  ".footer-main > *", ".footer-bottom > *"
].join(",");
let revealObserver = null;

function observeSiteReveal(root = document) {
  const targets = [...root.querySelectorAll(revealSelector)]
    .filter(target => !target.classList.contains("reveal"));
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    targets.forEach(target => target.classList.add("reveal", "is-revealed"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
  }
  const orderByGroup = new Map();
  targets.forEach(target => {
    const parent = target.parentElement;
    const index = orderByGroup.get(parent) || 0;
    orderByGroup.set(parent, index + 1);
    target.style.setProperty("--reveal-delay", Math.min(index * 55, 275) + "ms");
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
}
window.observeSiteReveal = observeSiteReveal;
observeSiteReveal();

let framePending = false;
function updateOnScroll() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(() => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
    if (!reduceMotion.matches && hero.getBoundingClientRect().bottom > 0) {
      const offset = Math.max(-18, Math.min(18, -hero.getBoundingClientRect().top * 0.022));
      heroPhoto.style.setProperty("--hero-shift", offset + "px");
    }
    framePending = false;
  });
}
window.addEventListener("scroll", updateOnScroll, { passive: true });
updateOnScroll();

const pointerGlow = document.querySelector("#pointer-glow");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let pointerFrame = 0;
let pointerPosition = null;
if (pointerGlow && finePointer.matches && !reduceMotion.matches) {
  window.addEventListener("pointermove", event => {
    if (event.pointerType !== "mouse") return;
    pointerPosition = [event.clientX, event.clientY];
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerGlow.style.setProperty("--glow-x", pointerPosition[0] + "px");
      pointerGlow.style.setProperty("--glow-y", pointerPosition[1] + "px");
      pointerGlow.classList.add("is-visible");
      pointerFrame = 0;
    });
  }, { passive: true });
}

reduceMotion.addEventListener?.("change", event => {
  if (event.matches) {
    document.querySelectorAll(".reveal").forEach(target => target.classList.add("is-revealed"));
    pointerGlow?.classList.remove("is-visible");
  }
});
