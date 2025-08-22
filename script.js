// --- Dark Mode Logic ---
const darkModeToggle = document.getElementById('darkModeToggle');
const htmlElement = document.documentElement;
const toggleBall = document.getElementById('toggleBall');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

function setTheme(isDark) {
    if (isDark) {
        htmlElement.classList.add('dark');
        toggleBall.style.transform = 'translateX(24px)';
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        htmlElement.classList.remove('dark');
        toggleBall.style.transform = 'translateX(0)';
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialThemeIsDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
setTheme(initialThemeIsDark);
darkModeToggle.checked = initialThemeIsDark;

darkModeToggle.addEventListener('change', () => {
    setTheme(darkModeToggle.checked);
    localStorage.setItem('theme', darkModeToggle.checked ? 'dark' : 'light');
});

// --- Birthday Match Logic ---
const birthdayForm = document.getElementById('birthdayForm');
const monthInput = document.getElementById('monthInput');
const dayInput = document.getElementById('dayInput');
const resultDiv = document.getElementById('result');
const loader = document.getElementById('loader');

birthdayForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const month = monthInput.value;
    const day = dayInput.value.padStart(2, '0');

    // Hide previous results and show loader
    resultDiv.classList.add('hidden');
    loader.classList.remove('hidden');

    // Basic validation
    if (!dayInput.value || dayInput.value < 1 || dayInput.value > 31) {
        showResult(`<p class="text-center">Please enter a valid day (1-31).</p>`);
        return;
    }

    try {
        // Reverted to the Wikimedia API with a proper User-Agent header to prevent fetch errors.
        const response = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/${month}/${day}`, {
            headers: {
                'Api-User-Agent': 'FamousBirthdayMatcher/1.0 (contact@example.com)',
                'User-Agent': 'FamousBirthdayMatcher/1.0 (contact@example.com)'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        if (data.births && data.births.length > 0) {
            // Build an HTML string with a list of all celebrities
            let htmlContent = `<h3 class="font-bold mb-2 text-center">Born on this day:</h3><ul class="space-y-2">`;
            
            // Sort the results by year, descending (newest first)
            const sortedBirths = data.births.sort((a, b) => b.year - a.year);
            
            // Displaying up to 10 results for brevity
            const resultsToShow = sortedBirths.slice(0, 10);

            resultsToShow.forEach(person => {
                const personName = person.text.split(',')[0];
                const restOfDescription = person.text.substring(personName.length);
                const year = person.year;

                // Only the name is colored blue, and the year is added
                htmlContent += `<li><strong class="accent-text">${personName}</strong>${restOfDescription} (b. ${year})</li>`;
            });

            htmlContent += `</ul>`;
            showResult(htmlContent);

        } else {
            showResult(`<p class="text-center">Sorry, no famous birthday match found for that date. Try another!</p>`);
        }

    } catch (error) {
        console.error("Failed to fetch birthday data:", error);
        showResult(`<p class="text-center">Could not fetch birthday data. Please try again later.</p>`);
    }
});

function showResult(htmlContent) {
    loader.classList.add('hidden');
    resultDiv.innerHTML = htmlContent;
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('result-in');
}

// Hide result when user changes input
monthInput.addEventListener('input', () => {
    resultDiv.classList.add('hidden');
    resultDiv.classList.remove('result-in');
});
dayInput.addEventListener('input', () => {
    resultDiv.classList.add('hidden');
    resultDiv.classList.remove('result-in');
});
