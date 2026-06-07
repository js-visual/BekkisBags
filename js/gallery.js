/* ==========================================================================
   BekkisBags - Portfolio Galerie mit Filter und Lightbox
   --------------------------------------------------------------------------
   Diese Datei lädt alle Portfolio-Einträge aus einer einzigen JSON-Datei,
   filtert sie ohne Seitenreload und hält die Lightbox in Vanilla JavaScript.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const host = document.querySelector("[data-portfolio]");
  if (!host) {
    return;
  }

  const grid = host.querySelector("[data-portfolio-grid]");
  const emptyState = host.querySelector("[data-portfolio-empty]");
  const filterButtons = [...host.querySelectorAll("[data-portfolio-filter]")];
  const source = host.dataset.portfolioJson || "data/portfolio.json";
  const folderMap = {
    Taschen: "assets/images/taschen/",
    Gassitaschen: "assets/images/gassitaschen/",
    Rucksäcke: "assets/images/rucksaecke/",
    Portmonees: "assets/images/portmonees/",
    Accessoires: "assets/images/accessoires/",
  };

  let items = [];
  let activeFilter = "Alle";
  let currentIndex = 0;
  let lightbox = null;

  const normalizeCategory = (value) => String(value || "").trim().toLowerCase();

  const resolveImagePath = (entry) => {
    if (entry.image.startsWith("assets/")) {
      return entry.image;
    }
    const folder = folderMap[entry.category] || "assets/images/";
    return `${folder}${entry.image}`;
  };

  const setFilterState = (filterName) => {
    activeFilter = filterName;
    filterButtons.forEach((button) => {
      const isActive = button.dataset.portfolioFilter === filterName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const getFilteredItems = () => {
    if (activeFilter === "Alle") {
      return items;
    }
    return items.filter((item) => normalizeCategory(item.category) === normalizeCategory(activeFilter));
  };

  const ensureLightbox = () => {
    if (lightbox) {
      return lightbox;
    }

    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Bildansicht");
    lightbox.innerHTML = `
      <div class="lightbox__dialog">
        <div class="lightbox__frame">
          <img alt="" data-lightbox-image>
        </div>
        <div class="lightbox__bar">
          <div class="lightbox__title" data-lightbox-title></div>
          <div class="lightbox__controls">
            <button class="icon-button" type="button" data-lightbox-prev aria-label="Vorheriges Bild">‹</button>
            <button class="icon-button" type="button" data-lightbox-next aria-label="Nächstes Bild">›</button>
            <button class="icon-button" type="button" data-lightbox-close aria-label="Lightbox schließen">×</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(lightbox);

    const close = () => {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    const show = (index) => {
      const visibleItems = getFilteredItems();
      if (!visibleItems.length) {
        return;
      }

      currentIndex = (index + visibleItems.length) % visibleItems.length;
      const current = visibleItems[currentIndex];
      const image = lightbox.querySelector("[data-lightbox-image]");
      const title = lightbox.querySelector("[data-lightbox-title]");
      image.src = current.image;
      image.alt = current.alt;
      title.textContent = `${current.title} · ${current.category}`;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        close();
      }
    });

    lightbox.querySelector("[data-lightbox-close]").addEventListener("click", close);
    lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () => show(currentIndex - 1));
    lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () => show(currentIndex + 1));

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) {
        return;
      }
      if (event.key === "Escape") {
        close();
      }
      if (event.key === "ArrowLeft") {
        show(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        show(currentIndex + 1);
      }
    });

    lightbox.show = show;
    lightbox.close = close;
    return lightbox;
  };

  const renderGrid = () => {
    const visibleItems = getFilteredItems();

    if (!visibleItems.length) {
      grid.innerHTML = "";
      if (emptyState) {
        emptyState.hidden = false;
      }
      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }

    grid.innerHTML = visibleItems
      .map(
        (item, index) => `
          <button class="gallery-card" type="button" data-gallery-item="${index}">
            <figure class="gallery-card__figure">
              <img src="${item.image}" alt="${item.alt}" width="1200" height="1500" loading="lazy" decoding="async">
              <figcaption class="gallery-card__caption">
                <strong>${item.title}</strong>
                <span>${item.category}</span>
              </figcaption>
            </figure>
          </button>
        `
      )
      .join("");

    grid.querySelectorAll("[data-gallery-item]").forEach((button) => {
      button.addEventListener("click", () => {
        const lightboxApi = ensureLightbox();
        lightboxApi.show(Number(button.dataset.galleryItem));
      });
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilterState(button.dataset.portfolioFilter);
      renderGrid();
    });
  });

  fetch(source, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("portfolio-json-not-found");
      }
      return response.json();
    })
    .then((data) => {
      items = Array.isArray(data)
        ? data
            .map((entry) => ({
              category: entry.category || "",
              title: entry.title || "BekkisBags",
              image: resolveImagePath(entry),
              alt: entry.alt || `${entry.title || "BekkisBags"} von BekkisBags`,
            }))
            .filter((entry) => entry.category)
        : [];
      renderGrid();
    })
    .catch(() => {
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent = "Die Portfolio-Daten konnten gerade nicht geladen werden.";
      }
      grid.innerHTML = "";
    });
});
