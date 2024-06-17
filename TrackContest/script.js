// Function to fetch contests from a specific host
async function fetchContests(host) {
    // Construct the API URL with parameters
    let url = `https://clist.by/api/v4/contest/?format=json&start__gt=${new Date().toISOString().slice(0, 19)}&order_by=start&username=Shaan04&api_key=7f04b0f8380b4e96f01d56d28f5c49b07c9a5c65&host=${host}`;
    
    try {
        // Fetch data from the API and return the first contest
        const response = await fetch(url);
        const data = await response.json();
        return data.objects.slice(0, 3);
    } catch (error) {
        console.error(`Error fetching contests for ${host}:`, error);
        return null;
    }
}

// Function to map host names to human-readable names
function getHostName(host) {
    const hostNames = {
        "leetcode.com": "LeetCode",
        "codechef.com": "CodeChef",
        "codeforces.com": "Codeforces",
        "atcoder.jp": "AtCoder"
    };
    return hostNames[host] || host;
}

// Function to determine AM/PM for a given time
function getAmPm(hour) {
    return hour <= 12 ? "AM" : "PM";
}

// Function to calculate the next update time (12 hours later)
function calculateNextUpdateTime(timestamp) {
    let currentTime = Date.now();
    return currentTime + (timestamp - currentTime) + 43200000; // 12 hours in milliseconds
}

// Function to display contests from various hosts
async function displayContests() {
    let container = document.getElementById("tablesContainer");

    // List of hosts to fetch contests from
    const hosts = ["codeforces.com", "atcoder.jp", "leetcode.com", "codechef.com"];
    
    for (let host of hosts) {
        // Get cached contests data from localStorage
        let cachedData = JSON.parse(localStorage.getItem(host));
        let contests;

        if (cachedData && Date.now() - cachedData.timestamp < 43200000) { // 12 hours
            contests = cachedData.contests;
        } else {
            contests = await fetchContests(host);
            localStorage.setItem(host, JSON.stringify({ contests: contests, timestamp: Date.now() }));
        }

        if (contests && contests.length > 0) {
            // Create a table for the contests
            let table = document.createElement("table");
            let hostName = getHostName(host);
            table.innerHTML = `
                <caption class="host-header"><img src="./assets/${hostName}.png">Upcoming ${hostName} Contest</caption>
                <thead>
                    <tr>
                        <th style="width: 50%;">Contest Name</th>
                        <th style="width: 30%;">Start Time (IST)</th>
                        <th style="width: 15%;">Duration</th>
                        <th style="width: 5%;">Link</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;

            let tbody = table.querySelector("tbody");

            contests.forEach(contest => {
                let startTime = new Date(contest.start + "Z");
                let row = `
                    <tr>
                        <td>${contest.event}</td>
                        <td>${startTime.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                        <td>${contest.duration ? (contest.duration / 3600).toFixed(1) + " hours" : "N/A"}</td>
                        <td class="center"><a href="${contest.href}" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 11H8V13H12V16L16 12L12 8V11Z"></path></svg></a></td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            // Calculate the next update time
            let nextUpdateTime = calculateNextUpdateTime(cachedData ? cachedData.timestamp : Date.now());
            let updateTime = new Date(nextUpdateTime);
            let hours = updateTime.getHours();
            let minutes = updateTime.getMinutes();
            let amPm = getAmPm(new Date().getHours());

            if (minutes < 10) {
                minutes = "0" + minutes;
            }

            // Create a timer for the next update time
            let timer = document.createElement("div");
            timer.classList.add("timer");
            timer.textContent = `Data will be auto refreshed next at ${hours}:${minutes} ${amPm}`;
            container.appendChild(table);
            container.appendChild(timer);
        }
    }
}

// Function to delete old data from localStorage
function autoDeleteOldData() {
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let { timestamp } = JSON.parse(localStorage.getItem(key));
        if (timestamp < Date.now() - 43200000) { // 12 hours
            localStorage.removeItem(key);
        }
    }
}

// Event listener to run the functions on window load
window.addEventListener("load", autoDeleteOldData);
displayContests();

