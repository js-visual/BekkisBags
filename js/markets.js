document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('[data-markets]');
  if (!container) return;

  const listElement = container.querySelector('[data-markets-list]');
  const emptyStateElement = container.querySelector('[data-markets-empty]');
  
  // Erzwinge hier den korrekten Pfad ausgehend von der index.html im Root-Ordner
  const jsonUrl = 'data/markets.json';

  // Hilfsfunktion: Wandelt Datumsstrings (auch Intervalle) in ein gültiges JS-Date-Objekt um
  function parseMarketDate(dateString) {
    let dateToParse = dateString;
    
    // Falls ein Intervall wie "04.12.2026-06.12.2026" existiert, nutzen wir das Enddatum
    if (dateString.includes('-')) {
      dateToParse = dateString.split('-')[1].trim();
    }
    
    const parts = dateToParse.split('.');
    if (parts.length === 3) {
      // Format: TT.MM.JJJJ -> Achtung: Monat ist im JS-Date 0-basiert (Monat - 1)
      // Setzt die Uhrzeit auf das Ende des Tages (23:59:59)
      return new Date(parts[2], parts[1] - 1, parts[0], 23, 59, 59);
    }
    return new Date(0); // Fallback für ungültige Formate
  }

  // Märkte laden und verarbeiten
  fetch(jsonUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Märkte konnten nicht geladen werden. Status: ${response.status}`);
      }
      return response.json();
    })
    .then(markets => {
      const today = new Date();
      // Setzt die Uhrzeit von heute auf 00:00:00 für den reinen Tagesvergleich
      today.setHours(0, 0, 0, 0);

      // 1. Filtern: Nur zukünftige oder heute stattfindende Märkte
      // 2. Sortieren: Chronologisch aufsteigend
      const upcomingMarkets = markets
        .filter(market => parseMarketDate(market.date) >= today)
        .sort((a, b) => parseMarketDate(a.date) - parseMarketDate(b.date));

      // 3. Auf die nächsten 3 Termine begrenzen
      const nextThreeMarkets = upcomingMarkets.slice(0, 3);

      // Anzeige steuern
      if (nextThreeMarkets.length === 0) {
        if (emptyStateElement) emptyStateElement.removeAttribute('hidden');
        if (listElement) listElement.innerHTML = '';
        return;
      }

      // Empty State verstecken
      if (emptyStateElement) emptyStateElement.setAttribute('hidden', '');

      // HTML für die Märkte generieren
      const htmlOutput = nextThreeMarkets.map(market => {
        return `
          <article class="market-card">
            <span class="market-card__date">${market.date}</span>
            <h3 class="market-card__title">${market.name}</h3>
            <p class="market-card__meta">${market.location}</p>
          </article>
        `;
      }).join('');

      if (listElement) {
        listElement.innerHTML = htmlOutput;
      }
    })
    .catch(error => {
      console.error('Fehler beim Laden der Markt-Daten:', error);
      // Im Fehlerfall zeigen wir den Empty State als sicheren Fallback
      if (emptyStateElement) emptyStateElement.removeAttribute('hidden');
    });
});
