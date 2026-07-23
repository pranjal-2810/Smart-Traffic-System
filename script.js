const STATE_URL = "http://127.0.0.1:8000/state";
const ANALYTICS_URL = "http://127.0.0.1:8000/analytics";

let queueChart, waitChart, pieChart, throughputChart;

// Lane labels
const laneNames = ["North", "East", "South", "West"];
const laneShort = ["N", "E", "S", "W"];

// Bright colors
const laneColors = [
    "#ef4444", // red
    "#22c55e", // green
    "#3b82f6", // blue
    "#eab308"  // yellow
];

/* =========================
        STATE UPDATE
========================= */
async function fetchState() {
    try {
        const res = await fetch(STATE_URL);
        const data = await res.json();

        document.getElementById("time").innerText = data.time;
        document.getElementById("activeLane").innerText =
            data.current_lane !== null ? laneNames[data.current_lane] : "-";

        const tbody = document.getElementById("tableBody");
        tbody.innerHTML = "";

        data.lanes.forEach(lane => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${laneNames[lane.id]}</td>
                <td>${lane.queue}</td>
                <td>${lane.wait_time}</td>
                <td>${lane.emergency ? "YES" : "NO"}</td>
            `;

            row.style.background = "";

            if (lane.id === data.current_lane && lane.emergency) {
                row.style.background = "#ca8a04";
            } else if (lane.id === data.current_lane) {
                row.style.background = "#16a34a";
            }

            tbody.appendChild(row);

            const box = document.getElementById(`lane-${lane.id}`);

            box.classList.remove("green", "red", "yellow");

            box.innerHTML = `
                ${laneNames[lane.id]}<br>
                Q:${lane.queue}<br>
                W:${lane.wait_time}
            `;

            if (lane.id === data.current_lane && lane.emergency) {
                box.classList.add("yellow");
            } else if (lane.id === data.current_lane) {
                box.classList.add("green");
            } else {
                box.classList.add("red");
            }
        });

    } catch (err) {
        console.error("STATE FETCH ERROR:", err);
    }
}

/* =========================
        HELPER: WINDOW SLICE
========================= */
function sliceLastWindow(time, dataArray, windowSize = 150) {
    const maxTime = time[time.length - 1];
    const minTime = maxTime - windowSize;

    const indices = time
        .map((t, i) => (t >= minTime ? i : -1))
        .filter(i => i !== -1);

    const slicedTime = indices.map(i => time[i]);
    const slicedData = dataArray.map(arr => indices.map(i => arr[i]));

    return { slicedTime, slicedData };
}

/* =========================
        ANALYTICS
========================= */
async function fetchAnalytics() {
    try {
        const res = await fetch(ANALYTICS_URL);
        const data = await res.json();

        if (!data.time || data.time.length === 0) return;

        const time = data.time;

        /* ===== APPLY 150 WINDOW ===== */
        const queueSlice = sliceLastWindow(time, [
            data.queues.lane0,
            data.queues.lane1,
            data.queues.lane2,
            data.queues.lane3
        ]);

        const waitSlice = sliceLastWindow(time, [data.avg_wait]);
        const throughputSlice = sliceLastWindow(time, [
            data.cum_arrival,
            data.cum_departure
        ]);

        /* -------- QUEUE BAR -------- */
        if (!queueChart) {
            queueChart = new Chart(document.getElementById("queueChart"), {
                type: "bar",
                data: {
                    labels: queueSlice.slicedTime,
                    datasets: [
                        { label: "North", data: queueSlice.slicedData[0], stack: "q", backgroundColor: laneColors[0] },
                        { label: "East", data: queueSlice.slicedData[1], stack: "q", backgroundColor: laneColors[1] },
                        { label: "South", data: queueSlice.slicedData[2], stack: "q", backgroundColor: laneColors[2] },
                        { label: "West", data: queueSlice.slicedData[3], stack: "q", backgroundColor: laneColors[3] }
                    ]
                },
                options: { responsive: true }
            });
        } else {
            queueChart.data.labels = queueSlice.slicedTime;
            queueChart.data.datasets[0].data = queueSlice.slicedData[0];
            queueChart.data.datasets[1].data = queueSlice.slicedData[1];
            queueChart.data.datasets[2].data = queueSlice.slicedData[2];
            queueChart.data.datasets[3].data = queueSlice.slicedData[3];
            queueChart.update();
        }

        /* -------- WAIT -------- */
        if (!waitChart) {
            waitChart = new Chart(document.getElementById("waitChart"), {
                type: "line",
                data: {
                    labels: waitSlice.slicedTime,
                    datasets: [{
                        label: "Avg Wait",
                        data: waitSlice.slicedData[0],
                        borderColor: "#38bdf8"
                    }]
                }
            });
        } else {
            waitChart.data.labels = waitSlice.slicedTime;
            waitChart.data.datasets[0].data = waitSlice.slicedData[0];
            waitChart.update();
        }

        /* -------- PIE (FULL DATA, NO SLICE) -------- */
        const pieData = [0, 0, 0, 0];

        Object.entries(data.signal_freq).forEach(([k, v]) => {
            pieData[k] = v;
        });

        if (!pieChart) {
            pieChart = new Chart(document.getElementById("pieChart"), {
                type: "pie",
                data: {
                    labels: laneNames,
                    datasets: [{
                        data: pieData,
                        backgroundColor: laneColors
                    }]
                }
            });
        } else {
            pieChart.data.datasets[0].data = pieData;
            pieChart.update();
        }

        /* -------- THROUGHPUT -------- */
        if (!throughputChart) {
            throughputChart = new Chart(document.getElementById("throughputChart"), {
                type: "line",
                data: {
                    labels: throughputSlice.slicedTime,
                    datasets: [
                        { label: "Arrival", data: throughputSlice.slicedData[0], borderColor: "#22c55e" },
                        { label: "Departure", data: throughputSlice.slicedData[1], borderColor: "#ef4444" }
                    ]
                }
            });
        } else {
            throughputChart.data.labels = throughputSlice.slicedTime;
            throughputChart.data.datasets[0].data = throughputSlice.slicedData[0];
            throughputChart.data.datasets[1].data = throughputSlice.slicedData[1];
            throughputChart.update();
        }

    } catch (err) {
        console.error("ANALYTICS ERROR:", err);
    }
}

setInterval(fetchState, 2000);
setInterval(fetchAnalytics, 2000);

fetchState();
fetchAnalytics();