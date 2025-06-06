// document.getElementById('fetchButton').addEventListener('click', function() {
//     fetch('http://localhost:3000/getdata')
//         .then(response => response.text())
//         .then(data => {
//             document.getElementById('result').innerHTML = data;
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             document.getElementById('result').textContent = 'Error fetching data';
//         });
// });
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:3000/getdata')
        .then(response => response.text())
        .then(data => {
            document.getElementById('result').innerHTML = data;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').textContent = 'OOPS! Something went Wrong :(';
        });
});

