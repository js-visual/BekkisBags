document.addEventListener("DOMContentLoaded", () => {
  const host = document.querySelector("[data-markets]");
  if (!host) {
    return;
  }

  const list = host.querySelector("[data-markets-list]");
  const empty = host.querySelector("[data-markets-empty]");
  const source = host.dataset.marketsJson || "data/markets.json";

  const renderEmpty = (message = "Aktuell sind keine Märkte eingetragen.") => {
    if (empty) {
      empty.textContent = message;
      empty.hidden = false;
    }
    if (list) {
      list.innerHTML = "";
    }
  };

  const renderMarkets = (items) => {
    const dateFormatter = new Intl.DateTimeFormat("de-DE", {
      dateStyle: "medium",
    });

    const sorted = items
      .map((item) => ({
        ...item,
        parsedDate: new Date(item.date),
      }))
      .filter((item) => !Number.isNaN(item.parsedDate.getTime()))
      .sort((a, b) => a.parsedDate - b.parsedDate)
      .filter((item) => item.parsedDate >= new Date(new Date().toDateString()))
      .slice(0, 3);

    if (!sorted.length) {
      renderEmpty();
      return;
    }

    if (empty) {
      empty.hidden = true;
    }

    list.innerHTML = sorted
      .map(
        (item) => `
          <article class="market-card">
            <span class="market-card__date">${dateFormatter.format(item.parsedDate)}</span>
            <h3 class="market-card__title">${item.name}</h3>
            <p class="market-card__meta">${item.location}</p>
          </article>
        `
      )
      .join("");
  };

  fetch(source, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error("markets-json-not-found");
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || data.length === 0) {
        renderEmpty();
        return;
      }
      renderMarkets(data);
    })
    .catch(() => {
      renderEmpty();
    });
});
