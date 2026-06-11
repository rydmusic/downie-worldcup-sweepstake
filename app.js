// 1. Paste your exact group setup from the handwritten photo sheet
const sweepstakeData = [
  { player: "Archie", teams: ["Algeria", "Canada", "Egypt", "Australia", "Congo", "Iraq", "Portugal", "Croatia"] },
  { player: "Bea", teams: ["Qatar", "Sweden", "Ivory Coast", "Ecuador", "South Korea", "Haiti", "England", "Spain"] },
  { player: "Craig", teams: ["Switzerland", "Senegal", "Austria", "Uruguay", "Mexico", "Japan", "Colombia", "France"] },
  { player: "Emily", teams: ["Norway", "Jordan", "Paraguay", "Saudi Arabia", "South Africa", "Iran", "Brazil", "Belgium"] },
  { player: "Laura", teams: ["Scotland", "Curaçao", "Panama", "Czechia", "Tunisia", "New Zealand", "Argentina", "Morocco"] },
  { player: "Ryan", teams: ["Turkey", "Bosnia + Herzegovina", "Uzbekistan", "Ghana", "Cape Verde", "USA", "Germany", "Netherlands"] }
];

// 2. Your API Configuration (Get a free key from RapidAPI - API-Football)
const API_KEY = "YOUR_RAPIDAPI_KEY_HERE"; 
const WORLD_CUP_ID = 1; // API-Football uses ID 1 for the World Cup

// Create a master tracker object for the teams
let teamStats = {};
sweepstakeData.forEach(player => {
    player.teams.forEach(team => {
        teamStats[team] = { scored: 0, conceded: 0 };
    });
});

// 3. Fetch live data from the sports site
async function fetchLiveScores() {
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${WORLD_CUP_ID}&season=2026`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        const matches = result.response;

        // Reset stats before calculation
        Object.keys(teamStats).forEach(team => {
            teamStats[team] = { scored: 0, conceded: 0 };
        });

        // 4. Parse the match results
        matches.forEach(match => {
            const homeTeam = match.teams.home.name;
            const awayTeam = match.teams.away.name;
            const homeGoals = match.goals.home ?? 0;
            const awayGoals = match.goals.away ?? 0;

            // If the team is in our sweepstake, update their stats
            if (teamStats[homeTeam]) {
                teamStats[homeTeam].scored += homeGoals;
                teamStats[homeTeam].conceded += awayGoals;
            }
            if (teamStats[awayTeam]) {
                teamStats[awayTeam].scored += awayGoals;
                teamStats[awayTeam].conceded += homeGoals;
            }
        });

        calculatePlayerStandings();

    } catch (error) {
        console.error("Error fetching live sports data:", error);
    }
}

// 5. Map team performance back to Archie, Bea, Craig, Emily, Laura, and Ryan
function calculatePlayerStandings() {
    let leaderboard = sweepstakeData.map(player => {
        let maxScored = 0;
        let maxConceded = 0;

        player.teams.forEach(team => {
            if (teamStats[team]) {
                // Find the individual team that scored/conceded the most
                if (teamStats[team].scored > maxScored) maxScored = teamStats[team].scored;
                if (teamStats[team].conceded > maxConceded) maxConceded = teamStats[team].conceded;
            }
        });

        return {
            name: player.player,
            highestScored: maxScored,
            highestConceded: maxConceded
        };
    });

    // Update your HTML table elements using the 'leaderboard' array here
    console.log("Updated Leaderboard:", leaderboard);
}

// Run this automatically when the site loads
fetchLiveScores();