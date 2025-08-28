const mysql = require('mysql');
const fs = require('fs').promises;
const path = require('path');

// ---- Utility Functions ----
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON file:', err);
  }
}

async function writeJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON file:', err);
  }
}

function getDateDifference(date1, date2) {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function addDaysToDate(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// ---- Main Function ----
async function processData() {
  const filePath = path.join(__dirname, 'data.json');
  const data = await readJSON(filePath);
  if (!data) return;

  const today = new Date();
  let updated = false;
  const contests = [];

  // Leetcode Weekly Contest
  const weeklyLastUpdate = new Date(data.weekly_last_update);
  if (getDateDifference(weeklyLastUpdate, today) >= 7) {
    contests.push({
      contest_name: `Weekly Contest ${data.leetcode_weekly}`,
      platform: 'Leetcode',
      contest_date: `${data.weekly_next_contest} 08:00:00`,
      contest_time: '01:30'
    });

    data.leetcode_weekly += 1;
    data.weekly_next_contest = addDaysToDate(data.weekly_next_contest, 7);
    data.weekly_last_update = today.toISOString().split('T')[0];
    updated = true;
  }

  // Leetcode Biweekly Contest
  const biweeklyLastUpdate = new Date(data.biweekly_last_update);
  if (getDateDifference(biweeklyLastUpdate, today) >= 14) {
    contests.push({
      contest_name: `Biweekly Contest ${data.leetcode_biweekly}`,
      platform: 'Leetcode',
      contest_date: `${data.biweekly_next_contest} 20:00:00`,
      contest_time: '01:30'
    });

    data.leetcode_biweekly += 1;
    data.biweekly_next_contest = addDaysToDate(data.biweekly_next_contest, 14);
    data.biweekly_last_update = today.toISOString().split('T')[0];
    updated = true;
  }

  // Update DB + JSON if needed
  if (updated) {
    await insertContestsToDB(contests);
    await writeJSON(filePath, data);
  }
}

// ---- Insert to DB ----
async function insertContestsToDB(contests) {
  const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'my_database'
  });

  con.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL database!");

    const sql = `INSERT IGNORE INTO contests 
                 (contest_name, platform, contest_date, contest_time) 
                 VALUES (?, ?, ?, ?)`;

    contests.forEach(contest => {
      con.query(sql, [contest.contest_name, contest.platform, contest.contest_date, contest.contest_time], (err) => {
        if (err) console.error('Error inserting contest:', err);
        else console.log(`Contest inserted: ${contest.contest_name}`);
      });
    });

    con.end();
  });
}

// ---- Run Script ----
processData();
