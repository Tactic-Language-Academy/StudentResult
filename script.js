// 📌 Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAip-SynnGF9F_QuN0jjQMUJPeb7YppSsM",
    authDomain: "tacticresults.firebaseapp.com",
    databaseURL: "https://tacticresults-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tacticresults",
    storageBucket: "tacticresults.appspot.com",
    messagingSenderId: "423388903398",
    appId: "1:423388903398:web:3cad074c8d4e4f47078827",
    measurementId: "G-T7NYXVM9FQ"
};

// 📌 Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 📌 Chart.js Reference (Global)
let scoreChart;

// 📌 Fetch Student Result Based on Entered ID
function getResult() {
    let studentId = document.getElementById("studentId").value.trim();
    if (studentId === "") {
        alert("Please enter a valid student ID.");
        return;
    }

    database.ref("scores/" + studentId).once("value").then(snapshot => {
        if (!snapshot.exists()) {
            alert("No result found for this ID!");
            return;
        }

        let data = snapshot.val();

        // 📌 Display Student Info
        document.getElementById("studentName").innerText = data.studentName || "Unknown";
        document.getElementById("studentIdDisplay").innerText = data.studentId;
        document.getElementById("studentLevel").innerText = data.levelType + " - " + data.level;

        // 📌 Skills and Max Scores
        const skills = ["Speaking", "Listening", "Reading", "Writing", "Homework", "Objective", "Punctuality"];
        const overallScores = [14, 14, 14, 14, 20, 20, 4]; // Max scores per category
        let scoreTable = document.getElementById("scoreTable");
        scoreTable.innerHTML = ""; // Clear old results

        let totalScore = 0;
        let maxScore = 0;
        let studentScores = [];

        for (let i = 0; i < skills.length; i++) {
            let userScore = data.scores[i] || 0;
            let maxPossible = overallScores[i];

            // 📌 Determine Pass/Fail
            let status = userScore >= (maxPossible * 0.5) ? "✔ Passed" : "✖ Failed";
            let statusClass = userScore >= (maxPossible * 0.5) ? "passed" : "failed";

            // 📌 Add Row to Table
            let row = `
                <tr>
                    <td>${skills[i]}</td>
                    <td>${maxPossible}</td>
                    <td>${userScore}</td>
                    <td class="${statusClass}">${status}</td>
                </tr>
            `;
            scoreTable.innerHTML += row;

            // 📌 Store Scores for Chart
            studentScores.push(userScore);

            // 📌 Calculate Total
            totalScore += userScore;
            maxScore += maxPossible;
        }

        // 📌 Display Overall Score
        document.getElementById("overallScore").innerText = `${totalScore} / ${maxScore} (${Math.round((totalScore / maxScore) * 100)}%)`;

        // 📌 Show the Result Section
        document.getElementById("resultSection").style.display = "block";

        // 📌 Draw Chart
        drawChart(skills, studentScores, overallScores);

    }).catch(error => {
        console.error("❌ Error fetching result:", error);
        alert("❌ Error fetching result: " + error.message);
    });
}

// 📌 Function to Draw Bar Chart
function drawChart(skills, studentScores, overallScores) {
    let ctx = document.getElementById("scoreChart").getContext("2d");

    // 📌 Destroy existing chart if it exists
    if (scoreChart) {
        scoreChart.destroy();
    }

    // 📌 Create New Chart
    scoreChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: skills,
            datasets: [
                {
                    label: "Your Score",
                    data: studentScores,
                    backgroundColor: "rgba(54, 162, 235, 0.6)"
                },
                {
                    label: "Max Score",
                    data: overallScores,
                    backgroundColor: "rgba(255, 99, 132, 0.6)"
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(...overallScores) + 5
                }
            }
        }
    });
}
