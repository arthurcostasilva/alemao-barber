const APPBARBER_URL = "https://sites.appbarber.com.br/barbeariadoalem-gkiu";

// Fonte única para preços e duração dos destaques e do catálogo.
const serviceCatalog = [
  { id: "completo", name: "Barba, cabelo, bigode e sobrancelha", price: "R$ 70,00", duration: "60 min" },
  { id: "barbaterapia", name: "Barbaterapia", price: "R$ 30,00", duration: "30 min" },
  { id: "cabelo-sobrancelha", name: "Cabelo + Sobrancelha", price: "R$ 45,00", duration: "30 min" },
  { id: "corte", name: "Corte", price: "R$ 35,00", duration: "30 min" },
  { id: "corte-um-pente", name: "Corte com 1 pente", price: "R$ 25,00", duration: "15 min" },
  { id: "corte-barba", name: "Corte + Barba", price: "R$ 65,00", duration: "60 min" },
  { id: "hidratacao", name: "Hidratação", price: "R$ 15,00", duration: "15 min" },
  { id: "limpeza-pele", name: "Limpeza de pele", price: "R$ 15,00", duration: "15 min" },
  { id: "platinado", name: "Platinado", price: "A partir de R$ 89,99", duration: "60 min" },
  { id: "relaxamento", name: "Relaxamento", price: "A partir de R$ 59,99", duration: "30 min" },
  { id: "sobrancelha", name: "Sobrancelha", price: "R$ 10,00", duration: "15 min" }
];

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
  const targets = [...root.querySelectorAll(revealSelector)].filter(target => !target.classList.contains("reveal"));
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

const catalogList = document.querySelector("#catalog-list");
const catalogSearch = document.querySelector("#service-search");
const catalogEmpty = document.querySelector("#catalog-empty");
function normalizeSearch(value) {
  return value.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}
function createClockIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", "#clock");
  icon.append(use);
  return icon;
}
function renderFeaturedServices() {
  const byId = new Map(serviceCatalog.map(service => [service.id, service]));
  document.querySelectorAll("[data-service-id]").forEach(card => {
    const service = byId.get(card.dataset.serviceId);
    if (!service) return;
    card.querySelector("h3").textContent = service.name;
    card.querySelector(".service-price").textContent = service.price;
    card.querySelector(".service-duration").replaceChildren(createClockIcon(), document.createTextNode(service.duration));
  });
}
function renderCatalog(query = "") {
  const normalized = normalizeSearch(query);
  const matches = serviceCatalog.filter(service => normalizeSearch(service.name).includes(normalized));
  catalogList.replaceChildren();
  matches.forEach(service => {
    const item = document.createElement("article");
    item.className = "catalog-item";
    const details = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = service.name;
    const duration = document.createElement("p");
    duration.className = "catalog-duration";
    duration.append(createClockIcon(), document.createTextNode(service.duration));
    details.append(heading, duration);
    const price = document.createElement("p");
    price.className = "catalog-price";
    price.textContent = service.price;
    const action = document.createElement("a");
    action.className = "button button-outline catalog-book";
    action.href = APPBARBER_URL;
    action.target = "_blank";
    action.rel = "noopener noreferrer";
    action.setAttribute("aria-label", "Agendar " + service.name + " pelo AppBarber");
    action.textContent = "Agendar";
    item.append(details, price, action);
    catalogList.append(item);
  });
  window.observeSiteReveal(catalogList);
  catalogEmpty.hidden = matches.length !== 0;
}
renderFeaturedServices();
renderCatalog();
catalogSearch.addEventListener("input", () => renderCatalog(catalogSearch.value));

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
