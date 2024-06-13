async function fetchContests(t) {
    let e = new Date().toISOString().slice(0, 19),
        o = `https://clist.by/api/v4/contest/?format=json&start__gt=${e}&order_by=start&username=Shaan04&api_key=7f04b0f8380b4e96f01d56d28f5c49b07c9a5c65&host=${t}`;
    try {
        let a = await fetch(o),
            n = await a.json();
        return n.objects.slice(0, 3);
    } catch (r) {
        return console.error(`Error fetching contests for ${t}:`, r), null;
    }
}
function getHostName(t) {
    return { "leetcode.com": "LeetCode", "codechef.com": "CodeChef", "codeforces.com": "Codeforces", "atcoder.jp": "AtCoder" }[t] || t;
}
function getAmPm(t) {
    return t <= 12 ? "PM" : "AM";
}
function calculateNextUpdateTime(t) {
    let e = Date.now();
    return e + (t - e) + 432e5;
}
async function displayContests() {
    let t = document.getElementById("tablesContainer");
    for (let e of ["codeforces.com", "atcoder.jp", "leetcode.com", "codechef.com"]) {
        let o = JSON.parse(localStorage.getItem(e)),
            a;
        if ((o && Date.now() - o.timestamp < 432e5 ? (a = o.contests) : ((a = await fetchContests(e)), localStorage.setItem(e, JSON.stringify({ contests: a, timestamp: Date.now() }))), a && a.length > 0)) {
            let n = document.createElement("table"),
                r = getHostName(e);
            n.innerHTML = `
    <caption class="host-header"><img src="./assets/${r}.png">Upcoming ${r} Contest</caption>
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
            let s = n.querySelector("tbody");
            a.forEach((t) => {
                let e = new Date(t.start + "Z"),
                    o = t.duration ? (t.duration / 3600).toFixed(1) + " hours" : "N/A",
                    a = e.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
                    n = `
        <tr>
            <td>${t.event}</td>
            <td>${a}</td>
            <td>${o}</td>
            <td class="center"><a href="${t.href}" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM12 11H8V13H12V16L16 12L12 8V11Z"></path></svg></a></td>
        </tr>
    `;
                s.innerHTML += n;
            });
            let c = document.createElement("div"),
                i = o ? o.timestamp : Date.now(),
                d = calculateNextUpdateTime(i),
                l = new Date(d),
                h = l.getHours(),
                m = l.getMinutes(),
                $ = new Date(),
                f = $.getHours(),
                u = getAmPm(f);
            c.classList.add("timer"), (c.textContent = `Data will be auto refreshed next at ${h}:${m} ${u}`), t.appendChild(n), t.appendChild(c);
        }
    }
}
function autoDeleteOldData() {
    for (let t = 0; t < localStorage.length; t++) {
        let e = localStorage.key(t),
            o = JSON.parse(localStorage.getItem(e)),
            { timestamp: a } = o,
            n = Date.now(),
            r = n - 432e5;
        a < r && localStorage.removeItem(e);
    }
}
window.addEventListener("load", autoDeleteOldData), displayContests();