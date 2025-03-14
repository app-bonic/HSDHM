document.addEventListener('DOMContentLoaded', function() {
    let danKongresa = 1; // Početna vrijednost dana
    let danas = new Date();

    if (danas.getFullYear() === 2025) {
        if (danas.getMonth() === 2 && danas.getDate() === 14) { // Mjeseci su indeksirani od 0 (2 = ožujak)
            danKongresa = 2;
        } else if (danas.getMonth() === 2 && danas.getDate() === 15) {
            danKongresa = 3;
        }
    }

    updateActiveButton(danKongresa); // Dodajte ovu liniju

    // Funkcija za učitavanje datoteke na osnovu dana
    function loadSchedule(dan) {
        // Dodaj base URL i cache-busting parametar
        const baseUrl = "https://app-bonic.github.io/HSDHM/data/";
        const fileName = `${baseUrl}${dan}.xlsx?t=${new Date().getTime()}`;
        
        fetch(fileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.arrayBuffer();
            })
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    
                displaySchedule(jsonData);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    
        // Ažuriraj aktivni gumb
        updateActiveButton(dan);
    }

    // Funkcija za postavljanje aktivnog gumba
    function updateActiveButton(dan) {
        const buttons = document.querySelectorAll('.schedule-header button');
        buttons.forEach((button, index) => {
            // Koristimo index +1 jer dani počinju od 1
            button.classList.toggle('active', index + 1 === dan);
        });
    }
    

    // Dodaj event listenere na svaki gumb
    const buttons = document.querySelectorAll('.schedule-header button');
    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            danKongresa = index + 1; // Postavi dan prema indeksu gumba
            loadSchedule(danKongresa); // Učitaj raspored za taj dan
        });
    });

    // Učitaj početni raspored za danKongresa
    loadSchedule(danKongresa);
});



    // Ovdje ostaje tvoj kod za učitavanje iz input-a
    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                displaySchedule(jsonData);
            };
            reader.readAsArrayBuffer(file);
        }
    });


function displaySchedule(data) {
    const container = document.getElementById('scheduleContainer');
    container.innerHTML = '';  // Očisti prethodni sadržaj

    data.forEach((row, index) => {
        if (index > 0 && row.length > 0) {  // Provjeravaj ima li redak podataka
            const vrsta = row[0] ? row[0].trim() .replace(/;/g, '<br>') : ''; // Zamjena ";" sa novim redom
            const vrijeme = row[1] ? row[1].trim() .replace(/;/g, '<br>') : ''; // Zamjena ";" sa novim redom
            const naslovHR = row[2] ? row[2].trim() .replace(/;/g, '<br>') : ''; // Zamjena ";" sa novim redom
            const predavac = row[4] ? row[4].trim() : '';
            const dvorana = row[9] ? row[9].trim() .replace(/;/g, '<br>') : ''; // Zamjena ";" sa novim redom
            const moderator = row[7] ? row[7].trim() .replace(/;/g, '<br>') : ''; // Zamjena ";" sa novim redom // Indeks za moderatora (H)
            const panelisti = row[8] ? row[8].trim() .replace(/;/g, '<br>') : ''; // Zamjena ";" sa novim redom // Indeks za paneliste (I)
            const voditelj = row[5] ? row[5].trim() .replace(/;/g, '<br>') : ''; // Zamjena ";" sa novim redom
            const radnoPredsjednistvo = row[6] ? row[6].trim() .replace(/;/g, '<br>') : ''; // Zamjena ";" sa novim redom // Radno predsjedništvo
            const sažetak = row[10] ? row[10].trim() .replace(/;/g, '<br>') : ''; // Zamjena ";" sa novim redom // Sažetak

            console.log(`Vrsta: ${vrsta}, Vrijeme: ${vrijeme}, Naslov HR: ${naslovHR}, Moderator: ${moderator}, Panelisti: ${panelisti}, Dvorana: ${dvorana}`);

            let eventCard = document.createElement('div');
            eventCard.classList.add('event-card');

            // Kreiraj ikonu unutar svakog događaja
            let iconElement = '';
            if (predavac.includes(',')) {
                iconElement = '<i class="fa-solid fa-users"></i>';
            } else {
                iconElement = '<i class="fa-solid fa-user"></i>';
            }

            switch (vrsta) {
                case "PREDAVANJE":
                    eventCard.innerHTML = `
                    <div class="event-time">
                        <p>${vrijeme}</p>
                    </div>
                    <div class="event-content">
                        <h3>${naslovHR}</h3>
                        <div class="event-info">
                            <p class="speaker">${iconElement} <span class="speaker-names">${predavac}</span></p>
                            <p class="location"><i class="fa-solid fa-location-dot"></i> ${dvorana}</p>
                        </div>
                    </div>
                    <div class="event-arrow">
                        <span>&#x276D;</span>
                    </div>
                `;
                            
                    eventCard.onclick = () => {
                        const url = `details.html?title=${encodeURIComponent(naslovHR)}&speaker=${encodeURIComponent(predavac)}&time=${encodeURIComponent(vrijeme)}&location=${encodeURIComponent(dvorana)}&description=${encodeURIComponent(sažetak)}`;
                        window.location.href = url; // Preusmjeravanje na novu stranicu
                    };
                    break;

                    case "RADNO":
                        case "RADNO":
                            eventCard.classList.add('gray-event'); // Dodajemo klasu za sivi okvir
                            eventCard.innerHTML = `
                                <div class="radno-predsjednistvo">
                                    <h4>Radno predsjedništvo:</h4>
                                    <p class="speaker">${radnoPredsjednistvo.replace(/\n/g, '<br>')}</p>
                                </div>
                            `;
                            break;

                        case "OKRUGLI":
                        eventCard.classList.add('orange-event');
                        eventCard.innerHTML = `
                            <div class="event-time">
                                <p>${vrijeme}</p>
                            </div>
                            <div class="event-content">
                                <h3>${naslovHR}</h3>
                                <p class="speaker"><i class="fa-solid fa-user"></i>${moderator}</p>
                                <p class="speaker"><i class="fa-solid fa-users"></i>${panelisti}</p>
                                <p class="location"><i class="fa-solid fa-location-dot"></i> ${dvorana}</p>
                            </div>
                            <div class="event-arrow">
                                <span>&#x276D;</span>
                            </div>
                        `;
                        eventCard.onclick = () => {
                            const url = `details.html?title=${encodeURIComponent(naslovHR)}&speaker=${encodeURIComponent("Moderator: " + moderator + "\nPanelisti: " + panelisti)}&time=${encodeURIComponent(vrijeme)}&location=${encodeURIComponent(dvorana)}&description=${encodeURIComponent(sažetak)}`;
                            window.location.href = url;
                        };
                        break;

                    case "RADIONICA":  // Dodano za RADIONICA
                    eventCard.classList.add('workshop-event'); // Dodaj klasu za stilizaciju
                    eventCard.innerHTML = `
                        <div class="event-time">
                    <p>${vrijeme}</p>
                        </div>
                    <div class="event-content">
                    <h3>${naslovHR}</h3>
                    <p class="speaker"><i class="fa-solid fa-user"></i> ${voditelj}</p>
                         <p class="location"><i class="fa-solid fa-location-dot"></i> ${dvorana}</p>
                      </div>
                </div>
                <div class="event-arrow">
                    <span>&#x276D;</span>
                 </div>
                        `;
                        eventCard.onclick = () => {
                            const url = `details.html?title=${encodeURIComponent(naslovHR)}&speaker=${encodeURIComponent("Voditelj radionice: " + voditelj)}&time=${encodeURIComponent(vrijeme)}&location=${encodeURIComponent(dvorana)}&description=${encodeURIComponent(sažetak)}`;
                            window.location.href = url;
                        };
                    break;

                case "PANEL":
                    eventCard.classList.add('red-event'); // dodaj klasu za crvenu boju
                    eventCard.innerHTML = `
                        <div class="event-time">
                            <p>${vrijeme}</p>
                        </div>
                        <div class="event-content">
                            <h3>${naslovHR}</h3>
                            <p class="speaker">${voditelj}</p>
                            <p class="location">Dvorana: ${dvorana}</p>
                        </div>
                        <div class="event-arrow">
                            <span>&#x276D;</span>
                        </div>
                    `;
                    //eventCard.onclick = () => showDetails(vrijeme, naslovHR, voditelj, dvorana, sažetak);
                    
                                   break;

                case "KAVA":
                    eventCard.classList.add('kava-event'); // Dodaj klasu za stilizaciju
                    eventCard.innerHTML = `
                        <div class="event-time">
                            <p>${vrijeme}</p>
                        </div>
                        <div class="event-content">
                            <h3>${naslovHR}</h3>
                            <p class="location"><i class="fa-solid fa-location-dot"></i> ${dvorana}</p>
                        </div>
                    `;
                    break;

                default:
                    console.warn(`Nepoznata vrsta: ${vrsta}`);
            }

            container.appendChild(eventCard);
        } else {
            console.warn(`Redak nije ispravan: ${index} - ${row}`);
        }
    });
}

function showDetails(time, title, speaker, location, summary = '') {
    const modal = document.getElementById('details-modal');
    const modalTitle = modal.querySelector('#modal-title');
    const modalSpeaker = modal.querySelector('#modal-speaker');
    const modalTime = modal.querySelector('#modal-time');
    const modalLocation = modal.querySelector('#modal-location');
    const modalDescription = modal.querySelector('#modal-description');

    // Postavi sadržaj modala prema tipovima događaja
    modalTitle.textContent = title;
    modalSpeaker.textContent = `Predavač: ${speaker}`;
    modalTime.textContent = `Vrijeme: ${time}`;
    modalLocation.textContent = `Dvorana: ${location}`;
    
    // Dodaj opis samo ako je dostupan
    if (summary) {
        modalDescription.textContent = `Sažetak: ${summary}`;
    } else {
        modalDescription.textContent = ''; // Ako nema sažetka, ostavi prazno
    }

    // Prikazuje modal
    modal.classList.remove('hidden');
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('details-modal');

}


// Dodaj listener za zatvaranje kad klikneš izvan modala
window.addEventListener('click', function(event) {
    const modal = document.getElementById('details-modal');
    if (event.target === modal) {
        closeModal();
    }
});
