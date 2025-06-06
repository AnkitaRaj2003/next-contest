const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const app = express();
app.use(cors());
// app.use(express.static('public'));

// Create a connection to the database
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    // password: "your_password",
    database: "my_database"
});

// Function to get the latest contest information from the database
async function getLatestContestInfo() {
    return new Promise((resolve, reject) => {
        // con.query('SELECT contest_name, platform, contest_date, contest_time FROM contests ORDER BY contest_date ASC, contest_time ASC LIMIT 10', (err, results) => {
        con.query('SELECT contest_name, platform, DATE_FORMAT(contest_date, "%a %b %d %Y %r") AS datetime, contest_time FROM contests ORDER BY contest_date ASC, contest_time ASC LIMIT 10', (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

// app.get('/getdata', async (req, res) => {
//     console.log('request came');
//     try {
//         const contests = await getLatestContestInfo();
//         // console.log(contests);

//         let datatable = `
//         <table border="1">
//             <tr>
//                 <th>Contest Name</th>
//                 <th>Platform</th>
//                 <th>Contest Date</th>
//                 <th>Contest Time</th>
//             </tr>`;

//         contests.forEach(contest => {
//             datatable += `
//             <tr>
//                 <td>${contest.contest_name}</td>
//                 <td>${contest.platform}</td>
//                 <td>${contest.contest_date}</td>
//                 <td>${contest.contest_time}</td>
//             </tr>`;
//         });

//         datatable += '</table>';

//         const htmlContent = `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>Next Contest</title>
//         </head>
//         <body>
//             ${datatable}
//         </body>
//         </html>
//         `;
//         res.send(htmlContent);
//     } catch (error) {
//         console.error('Error fetching data from database:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.get('/getdata', async (req, res) => {
    console.log('request came');
    try {
        const contests = await getLatestContestInfo();
        // console.log(contests);

        let datatable = `
        <table border="1">
            <tr>
                <th>Contest Name</th>
                <th>Platform</th>
                <th>Contest Date</th>
                <th>Length</th>
            </tr>`;

        contests.forEach(contest => {
            // const date = contest.contest_date.split('(')[0];
            datatable += `
            <tr>
                <td>${contest.contest_name}</td>
                <td>${contest.platform}</td>
                <td>${contest.datetime}</td>
                <td>${contest.contest_time}</td>
            </tr>`;
        });

        datatable += '</table>';

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Next Contest</title>
            <link rel="stylesheet" type="text/css" href="Styles/style.css">
        </head>
        <body>
            ${datatable}
        </body>
        </html>
        `;
        res.send(htmlContent);
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).send('Internal Server Error');
    }
});

function runLeetcodeScript() {
    try {
      const scriptPath = path.join(__dirname, 'platforms', 'leetcode.js');
      const scriptPath2 = path.join(__dirname, 'platforms', 'codeforces.js');
      require(scriptPath);
      require(scriptPath2);
      console.log(`Executed script at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('Error executing script:', err);
    }
  }
  
  // Schedule the job to run every 7 days
  cron.schedule('0 0 0 */7 * *', () => {
// cron.schedule('*/10 * * * * *', () => {
    // console.log('Running scheduled task...');
    try{
    runLeetcodeScript();
    }catch(err){
        console.log(err);
    }
  });


const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
