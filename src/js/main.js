document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.grid-container button');
  const output = document.getElementById('output');
  
  const excludedButtons = [
    'Start', 'Snel spraak', 'Voorspellen', 
    'Toetsenbord', 'Danique', 'Alle woordenlijsten', 
    'Kleine woordjes', 'Beschrijvingen', 'Persoonlijk'
  ];

  const initialGridWords = [
    { woord: 'Wat', img: './images/wat.png', type: 'question' },
    { woord: 'Ik', img: './images/ik.png', type: 'personal' },
    { woord: 'Willen', img: './images/willen.png', type: 'verb' },
    { woord: 'Niet', img: './images/niet.png', type: 'negation' }
  ];

  let wordData = {};
  const originalButtonConfig = [];

  // Load JSON data
  fetch('./data/data.json')
    .then(response => response.json())
    .then(data => {
      wordData = data;

      // Ensure every word has 4 most common words following it
      wordData.woorden.forEach(word => {
        ensureFourMostCommonWords(word);
      });

      // Save original button configuration
      buttons.forEach(button => {
        originalButtonConfig.push({
          class: button.className,
          woord: button.getAttribute('data-woord'),
          img: button.getAttribute('data-img'),
          innerHTML: button.innerHTML
        });

        button.addEventListener('click', function() {
          const woord = button.getAttribute('data-woord');
          const imgSrc = button.getAttribute('data-img');

          if (woord === 'Weggooien') {
            // Clear the output div
            output.innerHTML = '';
            // Reset buttons to original configuration
            resetButtons();
          } else if (woord === 'Spreek') {
            // Read the text in the output div
            const textToSpeak = output.innerText;
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            speechSynthesis.speak(utterance);
          } else if (!excludedButtons.includes(woord)) {
            // Show the selected word in the output
            const woordDiv = document.createElement('div');
            const imgElement = document.createElement('img');
            imgElement.src = imgSrc;
            imgElement.alt = woord;

            const textElement = document.createElement('p');
            textElement.textContent = vervoegWoord(woord, output.innerText);

            // Add class based on word type
            const wordInfo = findWordInfo(woord, wordData.woorden);
            if (wordInfo && wordInfo.type) {
              woordDiv.classList.add(wordInfo.type + 'AI');
            }

            woordDiv.appendChild(imgElement);
            woordDiv.appendChild(textElement);

            output.appendChild(woordDiv);

            // Only do prediction-related updates if on voorspellen.html
            if (window.location.pathname.endsWith('voorspellen.html')) {
              // Update buttons with most common words after the selected word
              const updated = updateButtons(wordInfo);

              // If no words found to update, reset buttons to original configuration
              if (!updated) {
                resetButtons();
              }
            }
          }
        });
      });
    })
    .catch(error => {
      console.error('Error loading JSON data:', error);
    });

  function ensureFourMostCommonWords(word) {
    if (!word.meest_gebruikte_woorden_erna) {
      word.meest_gebruikte_woorden_erna = [];
    }
    while (word.meest_gebruikte_woorden_erna.length < 4) {
      word.meest_gebruikte_woorden_erna.push({
        woord: "other",
        type: "noun",
        image_url: "https://example.com/images/other.jpg",
        meest_gebruikte_woorden_erna: []
      });
    }
    word.meest_gebruikte_woorden_erna.forEach(nextWord => {
      if (nextWord.meest_gebruikte_woorden_erna) {
        ensureFourMostCommonWords(nextWord);
      }
    });
  }

  function updateButtons(wordInfo) {
    if (wordInfo && wordInfo.meest_gebruikte_woorden_erna && wordInfo.meest_gebruikte_woorden_erna.length > 0) {
      const gridButtons = ['grid8', 'grid9', 'grid10', 'grid11'];
      wordInfo.meest_gebruikte_woorden_erna.forEach((nextWord, index) => {
        const button = document.querySelector(`.${gridButtons[index]}`);
        if (button) {
          button.setAttribute('data-woord', nextWord.woord);
          button.setAttribute('data-img', nextWord.image_url);
          button.innerHTML = `<img src="${nextWord.image_url}" alt="${nextWord.woord}"> ${nextWord.woord}`;
          
          // Update the class of the button based on word type
          button.className = `${gridButtons[index]} ${nextWord.type ? nextWord.type + 'AI' : ''}`;
        }
      });
      return true;
    }
    return false;
  }

  function findWordInfo(word, words) {
    for (const w of words) {
      if (w.woord === word) {
        return w;
      }
      if (w.meest_gebruikte_woorden_erna) {
        const result = findWordInfo(word, w.meest_gebruikte_woorden_erna);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  function resetButtons() {
    originalButtonConfig.forEach(config => {
      const button = document.querySelector(`.${config.class.split(' ').join('.')}`);
      if (button) {
        button.setAttribute('data-woord', config.woord);
        button.setAttribute('data-img', config.img);
        button.innerHTML = config.innerHTML;
        button.className = config.class.replace('AI', '');
      }
    });

    // Reset content of grid8, grid9, grid10, grid11 buttons to initial words
    const gridButtons = ['grid8', 'grid9', 'grid10', 'grid11'];
    initialGridWords.forEach((wordInfo, index) => {
      const button = document.querySelector(`.${gridButtons[index]}`);
      if (button) {
        button.setAttribute('data-woord', wordInfo.woord);
        button.setAttribute('data-img', wordInfo.img);
        button.innerHTML = `<img src="${wordInfo.img}" alt="${wordInfo.woord}"> ${wordInfo.woord}`;
        button.className = `${gridButtons[index]} ${wordInfo.type ? wordInfo.type : ''}`;
      }
    });
  }

  function vervoegWoord(woord, huidigeTekst) {
    const vervoegingen = {
      'Ik': {
        'Willen': 'wil',
        'Komen': 'kom',
        'Zeggen': 'zeg',
        'Gaan': 'ga'
      },
      'Jij': {
        'Willen': 'wil',
        'Komen': 'komt',
        'Zeggen': 'zegt',
        'Gaan': 'gaat'
      },
      'Wij': {
        'Willen': 'willen',
        'Komen': 'komen',
        'Zeggen': 'zeggen',
        'Gaan': 'gaan'
      },
      'Jullie': {
        'Willen': 'willen',
        'Komen': 'komen',
        'Zeggen': 'zeggen',
        'Gaan': 'gaan'
      },
      // Voeg hier meer vervoegingen toe voor andere persoonlijke voornaamwoorden en werkwoorden
    };

    const woorden = huidigeTekst.split(' ');
    const laatsteWoord = woorden[woorden.length - 1];

    if (vervoegingen[laatsteWoord] && vervoegingen[laatsteWoord][woord]) {
      return vervoegingen[laatsteWoord][woord];
    }

    return woord;
  }
});
