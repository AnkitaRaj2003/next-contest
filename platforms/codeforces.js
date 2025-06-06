const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql');
const moment = require('moment-timezone');

const app = express();
const port = 3000;
app.use(cors());

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     // password: "apstndp123@@@A",
    // database: "my_database"
// });  

async function getLatestContestInfo() {
    try {
        const response = await axios.get('https://codeforces.com/contests');
        const $ = cheerio.load(response.data);
        // return $('.datatable table').html();
        const contests=[];
        const firstDatatable = $('.datatable').first();

    firstDatatable.find('table tr[data-contestid]').each((index, element) => {
        const contestName = $(element).find('td').eq(0).text().trim();
        const dateTime = $(element).find('td').eq(2).text().trim();
        const time = $(element).find('td').eq(3).text().trim();

        const [datepart, timepart]=dateTime.split(' ');
        if (contestName && dateTime) {
            const [month, day, year] = datepart.split('/');
            const date2 = new Date(`${month} ${day}, ${year}`);
            
            const yyyy = date2.getFullYear();
            const mm = String(date2.getMonth() + 1).padStart(2, '0'); 
            const dd = String(date2.getDate()).padStart(2, '0');

            const formattedDate = `${yyyy}-${mm}-${dd}`;
            const tempdate = formattedDate+" "+timepart+':00+03:00';
            const finaldate = new Date(tempdate);
            // console.log(finaldate);
    
            const dateInIndia = moment(finaldate).utcOffset('+05:30');
            const date = dateInIndia.format();
            contests.push({ contestName, date, time});
            console.log(contestName, date, time);
        }
       
    });
    if(contests && contests.length>0){
        insertContestsToDB(contests);
    }
    } catch (error) {
        console.error('Error fetching contest info:', error);
        return null;
    }
}

async function insertContestsToDB(contests) {
    // console.log('called');
        var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        // password: "apstndp123@@@A",
        database: "my_database"
    });  
    con.connect(err => {
        if (err) throw err;
        console.log("Connected to MySQL database!");

        con.query(`DELETE FROM contests WHERE contest_date < CURDATE()`, (err, result) => {
            if (err) {
                console.log("Error occurred while deleting contests");
                throw err;
            }
            console.log(`Number of contests deleted: ${result.affectedRows}`);
        });

        const sql = `INSERT ignore INTO contests (contest_name, platform, contest_date, contest_time) 
                     VALUES (?, 'Codeforces', ?, ?)`;

        contests.forEach(contest => {
            con.query(sql, [contest.contestName, contest.date, contest.time], (err, result) => {
                if (err) {
                    console.log("error");
                    throw err;
                }
                // console.log(contest.date);
                console.log(`Contest inserted/updated: ${contest.contestName}`);
            });
        });

        con.end();
    });
}

app.get('/getdata', async (req, res) => {
    console.log('request came');
    const datatable = await getLatestContestInfo();
    // console.log(datatable)
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Get Data</title>
    </head>
    <body>
        <h1>Welcome to the Get Data Page</h1>
        <p>This is a simple HTML response from the /getdata route.</p>
        ${datatable}
    </body>
    </html>
    `;
    res.send(htmlContent);
});

console.log('Codeforces started');
getLatestContestInfo();