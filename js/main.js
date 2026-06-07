/* ==========================================================================
   BekkisBags - Gemeinsame Interaktionen
   --------------------------------------------------------------------------
   Aufgaben:
   - Mobile Navigation öffnen/schließen
   - Aktive Navigation markieren
   - Footer-Jahr aktualisieren
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector("[data-site-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const year = document.querySelector("[data-year]");

  // Footer-Jahr immer aktuell halten.
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // Mobile Navigation nur aktivieren, wenn das Markup vorhanden ist.
  if (nav && toggle) {
    const closeNav = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    const openNav = () => {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      isOpen ? closeNav() : openNav();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 880px)").matches) {
          closeNav();
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!window.matchMedia("(max-width: 880px)").matches) {
        return;
      }
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        closeNav();
      }
    });
  }

  // Aktive Seite im Menü markieren, damit Besucher sich leichter orientieren.
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-site-nav] a").forEach((link) => {
    const linkPath = link.getAttribute("href");
    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });

  // Kontaktformular: leichte Validierung und Versand über Web3Forms.
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const statusBox = contactForm.querySelector("[data-form-message]");
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const fields = {
      name: contactForm.querySelector("[data-field-name]"),
      contact: contactForm.querySelector("[data-field-contact]"),
      message: contactForm.querySelector("[data-field-message]"),
      replyEmail: contactForm.querySelector("[data-field-reply-email]"),
    };

    const showStatus = (message, type) => {
      if (!statusBox) {
        return;
      }
      statusBox.textContent = message;
      statusBox.className = `form__message form__message--${type} is-visible`;
      statusBox.hidden = false;
    };

    const clearErrors = () => {
      contactForm.querySelectorAll("[data-error-for]").forEach((node) => {
        node.textContent = "";
      });
    };

    const setError = (fieldName, message) => {
      const target = contactForm.querySelector(`[data-error-for="${fieldName}"]`);
      if (target) {
        target.textContent = message;
      }
    };

    const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isPhone = (value) => /^[+()\d\s/-]{6,}$/.test(value);

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors();
      if (statusBox) {
        statusBox.hidden = true;
        statusBox.className = "form__message";
      }

      const name = fields.name?.value.trim() || "";
      const contact = fields.contact?.value.trim() || "";
      const message = fields.message?.value.trim() || "";

      let hasError = false;

      if (!name) {
        setError("name", "Bitte gib deinen Namen an.");
        hasError = true;
      }

      if (!contact) {
        setError("contact", "Bitte E-Mail oder Telefonnummer angeben.");
        hasError = true;
      } else if (!isEmail(contact) && !isPhone(contact)) {
        setError("contact", "Bitte eine gültige E-Mail-Adresse oder Telefonnummer eingeben.");
        hasError = true;
      }

      if (!message) {
        setError("message", "Bitte schreibe eine Nachricht.");
        hasError = true;
      }

      if (hasError) {
        showStatus("Bitte prüfe die markierten Felder.", "error");
        return;
      }

      if (fields.replyEmail) {
        fields.replyEmail.value = isEmail(contact) ? contact : "";
      }
      const formData = new FormData(contactForm);

      submitButton?.setAttribute("disabled", "true");
      submitButton && (submitButton.textContent = "Sende...");

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result?.message || "submit-failed");
        }

        contactForm.reset();
        showStatus("Vielen Dank! Deine Nachricht wurde erfolgreich versendet.", "success");
      } catch (error) {
        showStatus("Leider konnte die Nachricht gerade nicht gesendet werden. Bitte versuche es später noch einmal.", "error");
      } finally {
        submitButton?.removeAttribute("disabled");
        if (submitButton) {
          submitButton.textContent = "Nachricht senden";
        }
      }
    });
  }
});
