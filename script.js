(function () {
  const modal = document.getElementById("contact-modal");
  const modalPanel = modal.querySelector(".contact-modal");
  const closeButton = modal.querySelector(".modal-close");
  const form = document.getElementById("contact-form");
  const formState = modal.querySelector("[data-form-state]");
  const error = document.getElementById("form-error");
  const triggers = document.querySelectorAll(".contact-trigger");
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  let lastFocus = null;

  document.querySelectorAll(".asset img").forEach((image) => {
    const markLoaded = () => image.classList.add("is-loaded");
    const markMissing = () => image.classList.add("is-missing");
    image.addEventListener("load", markLoaded);
    image.addEventListener("error", markMissing);
    if (image.complete && image.naturalWidth > 0) markLoaded();
    if (image.complete && image.naturalWidth === 0) markMissing();
  });

  navToggle.addEventListener("click", () => {
    const open = primaryNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      primaryNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  function focusable() {
    return modal.querySelectorAll(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
  }

  function openModal(event) {
    lastFocus = event.currentTarget;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    closeButton.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocus) lastFocus.focus();
  }

  triggers.forEach((trigger) => trigger.addEventListener("click", openModal));
  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;
    if (event.key === "Escape") closeModal();
    if (event.key !== "Tab") return;
    const items = Array.from(focusable());
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";

    if (!form.reportValidity()) return;

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = "Sending...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Formspree submission failed");
      formState.innerHTML = `
        <p class="eyebrow">Get in Touch</p>
        <h2 id="modal-title">Message Received</h2>
        <p id="modal-desc">Thanks. We received your message and someone from our team will be in touch shortly.</p>
        <button class="button button-orange modal-submit" type="button" data-close-success>Close</button>
      `;
      modalPanel.setAttribute("aria-labelledby", "modal-title");
      modalPanel.setAttribute("aria-describedby", "modal-desc");
      formState.querySelector("[data-close-success]").addEventListener("click", closeModal);
      formState.querySelector("[data-close-success]").focus();
    } catch (submissionError) {
      error.textContent = "Something went wrong. Please try again without leaving this page.";
      submit.disabled = false;
      submit.textContent = "Send Message";
    }
  });
})();
