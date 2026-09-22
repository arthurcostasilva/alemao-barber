const serviceCatalog = [
  { id: "completo", name: "Barba, cabelo, bigode e sobrancelha", price: "R$ 70,00", duration: "60 min" },
  { id: "barbaterapia", name: "Barbaterapia", price: "R$ 30,00", duration: "30 min" },
  { id: "cabelo-sobrancelha", name: "Cabelo + sobrancelha", price: "R$ 45,00", duration: "30 min" },
  { id: "corte", name: "Corte", price: "R$ 35,00", duration: "30 min" },
  { id: "corte-um-pente", name: "Corte com 1 pente", price: "R$ 25,00", duration: "15 min" },
  { id: "corte-barba", name: "Corte + barba", price: "R$ 65,00", duration: "60 min" },
  { id: "hidratacao", name: "Hidratação", price: "R$ 15,00", duration: "15 min" },
  { id: "limpeza-pele", name: "Limpeza de pele", price: "R$ 15,00", duration: "15 min" },
  { id: "platinado", name: "Platinado", price: "A partir de R$ 89,99", duration: "60 min" },
  { id: "relaxamento", name: "Relaxamento", price: "A partir de R$ 59,99", duration: "30 min" },
  { id: "sobrancelha", name: "Sobrancelha", price: "R$ 10,00", duration: "15 min" }
];

const catalogList = document.querySelector("#catalog-list");
const catalogSearch = document.querySelector("#service-search");
const catalogEmpty = document.querySelector("#catalog-empty");
const booking = document.querySelector("#booking");
const bookingForm = document.querySelector("#booking-form");
const serviceSelect = document.querySelector("#booking-service");
const dateInput = document.querySelector("#booking-date");
const timeOptions = document.querySelector("#booking-time-options");
const timeNote = document.querySelector("#booking-time-note");
const steps = [...booking.querySelectorAll(".booking-step")];
const progressItems = [...booking.querySelectorAll("[data-progress-step]")];
const nextButton = document.querySelector("#booking-next");
const backButton = document.querySelector("#booking-back");
const planContext = document.querySelector("#booking-plan-context");
const outcome = document.querySelector("#booking-outcome");
const state = { step: 0, plan: "", planPrice: "", date: "", time: "", name: "", phone: "" };
const planPrices = {
  "Corte Ilimitado": "R$ 90/mês",
  "Barba Ilimitada": "R$ 90/mês",
  "Corte + Barba Ilimitado": "R$ 160/mês"
};
let returnFocus = null;

serviceCatalog.forEach(service => {
  const option = document.createElement("option");
  option.value = service.id;
  option.textContent = service.name + " — " + service.price + " · " + service.duration;
  serviceSelect.append(option);
});

function renderCatalog(query = "") {
  const normalized = query.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matches = serviceCatalog.filter(service =>
    service.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalized)
  );
  catalogList.replaceChildren();
  matches.forEach(service => {
    const item = document.createElement("article");
    item.className = "catalog-item";
    const details = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = service.name;
    const duration = document.createElement("p");
    duration.className = "catalog-duration";
    duration.innerHTML = '<svg aria-hidden="true"><use href="#clock"/></svg>' + service.duration;
    details.append(heading, duration);
    const price = document.createElement("p");
    price.className = "catalog-price";
    price.textContent = service.price;
    const action = document.createElement("button");
    action.className = "button button-outline catalog-book";
    action.type = "button";
    action.dataset.bookingService = service.id;
    action.setAttribute("aria-haspopup", "dialog");
    action.setAttribute("aria-controls", "booking");
    action.textContent = "Agendar";
    item.append(details, price, action);
    catalogList.append(item);
  });
  window.observeSiteReveal?.(catalogList);
  catalogEmpty.hidden = matches.length !== 0;
}
renderCatalog();
catalogSearch.addEventListener("input", () => renderCatalog(catalogSearch.value));

function localDateString(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
dateInput.min = localDateString();

function renderExampleTimes() {
  timeOptions.replaceChildren();
  const day = dateInput.value ? new Date(dateInput.value + "T12:00:00").getDay() : null;
  const examples = day === 1 ? ["13:30", "15:30", "17:30"]
    : day >= 2 && day <= 5 ? ["09:30", "13:00", "16:30"]
    : day === 6 ? ["09:00", "11:30", "14:00"] : [];
  if (!dateInput.value) {
    timeNote.textContent = "Escolha uma data para ver exemplos de horários.";
    return;
  }
  if (!examples.length) {
    timeNote.textContent = day === 0
      ? "O horário de domingo não foi informado. A agenda ainda não consulta disponibilidade."
      : "Não foi possível carregar exemplos para esta data.";
    return;
  }
  timeNote.textContent = "Amostra de interface: estes horários não são consultados, confirmados ou reservados.";
  examples.forEach((time, index) => {
    const label = document.createElement("label");
    label.className = "booking-time-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "time";
    input.value = time;
    input.required = true;
    input.id = "booking-time-" + index;
    const text = document.createElement("span");
    text.textContent = time;
    label.append(input, text);
    timeOptions.append(label);
  });
}
dateInput.addEventListener("change", renderExampleTimes);

function updateStep(step) {
  state.step = step;
  steps.forEach(section => { section.hidden = Number(section.dataset.step) !== step; });
  progressItems.forEach((item, index) => {
    if (index === step) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
  backButton.hidden = step === 0;
  nextButton.textContent = step === 3 ? "Concluir prévia" : step === 2 ? "Revisar" : "Continuar";
  if (step < 3) nextButton.insertAdjacentHTML("beforeend", '<svg class="arrow" aria-hidden="true"><use href="#arrow"/></svg>');
}

function openBooking(trigger, selectedService = "", plan = "") {
  returnFocus = trigger;
  bookingForm.reset();
  state.plan = plan;
  state.planPrice = plan ? planPrices[plan] : "";
  planContext.hidden = !plan;
  planContext.textContent = plan ? "Plano de interesse: " + plan + " · " + state.planPrice + " (não contratado)." : "";
  if (selectedService) serviceSelect.value = selectedService;
  else serviceSelect.value = "";
  outcome.hidden = true;
  outcome.textContent = "";
  nextButton.hidden = false;
  booking.querySelector(".booking-progress").hidden = false;
  updateStep(0);
  booking.showModal();
  serviceSelect.focus({ preventScroll: true });
}

document.addEventListener("click", event => {
  const planButton = event.target.closest("[data-booking-plan]");
  const serviceButton = event.target.closest("[data-booking-service]");
  const genericButton = event.target.closest("[data-booking-open]");
  if (planButton) openBooking(planButton, "", planButton.dataset.bookingPlan);
  else if (serviceButton) openBooking(serviceButton, serviceButton.dataset.bookingService);
  else if (genericButton) openBooking(genericButton);
});

function validateVisibleFields() {
  const panel = steps[state.step];
  for (const field of panel.querySelectorAll("input, select")) {
    if (field.id === "booking-phone") {
      const digitCount = field.value.replace(/\D/g, "").length;
      field.setCustomValidity(digitCount >= 10 ? "" : "Informe um telefone com DDD.");
    }
    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();
      return false;
    }
  }
  return true;
}

function buildReview() {
  const service = serviceCatalog.find(item => item.id === serviceSelect.value);
  const date = new Date(dateInput.value + "T12:00:00");
  const rows = [
    ["Serviço", service.name],
    ["Valor informado", service.price],
    ["Duração estimada", service.duration],
    ["Data desejada", date.toLocaleDateString("pt-BR")],
    ["Horário ilustrativo", state.time],
    ["Nome", state.name],
    ["Telefone", state.phone]
  ];
  if (state.plan) rows.splice(1, 0, ["Plano de interesse", state.plan + " · " + state.planPrice + " (não contratado)"]);
  const list = document.createElement("dl");
  list.className = "booking-review-list";
  rows.forEach(([term, value]) => {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    row.append(dt, dd);
    list.append(row);
  });
  document.querySelector("#booking-review").replaceChildren(list);
}

nextButton.addEventListener("click", () => {
  if (state.step < 3 && !validateVisibleFields()) return;
  if (state.step === 1) {
    if (!bookingForm.elements.time?.value) {
      timeNote.textContent = timeOptions.children.length
        ? "Selecione um exemplo de horário para continuar."
        : "Não há horários de exemplo para esta data. O horário de domingo não foi informado.";
      timeNote.tabIndex = -1;
      timeNote.focus();
      return;
    }
    state.time = bookingForm.elements.time.value;
  }
  if (state.step === 2) {
    state.name = document.querySelector("#booking-name").value.trim();
    state.phone = document.querySelector("#booking-phone").value.trim();
    buildReview();
  }
  if (state.step < 3) {
    updateStep(state.step + 1);
    steps[state.step].querySelector("input, select")?.focus();
    return;
  }
  booking.querySelector(".booking-progress").hidden = true;
  booking.querySelectorAll(".booking-step").forEach(section => { section.hidden = true; });
  nextButton.hidden = true;
  backButton.hidden = true;
  outcome.textContent = "Prévia concluída. Nenhum pedido foi enviado ou horário reservado. A agenda e o envio dos dados dependem da integração futura.";
  outcome.hidden = false;
  outcome.focus();
});

backButton.addEventListener("click", () => {
  if (state.step > 0) updateStep(state.step - 1);
});
document.querySelector(".booking-close").addEventListener("click", () => booking.close());
booking.addEventListener("close", () => {
  if (returnFocus?.isConnected) returnFocus.focus();
});
booking.addEventListener("click", event => {
  if (event.target === booking) booking.close();
});
