const axios=require('axios');
const fs = require('fs');

//use accordingly
// let host='http://localhost:8000';
let host='http://app0api.pikkalfm.com';
// let host='http://api.podminer.com';

axios.get(host+'/countries')
.then(res => {
  fs.writeFile('countries.json', JSON.stringify(res.data), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
})
.catch(err => console.log(err))

axios.get(host+'/genres')
.then(res => {
  fs.writeFile('genres.json', JSON.stringify(res.data), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
})
.catch(err => console.log(err))

axios.get(host+'/shows')
.then(res => {
  fs.writeFile('shows.json', JSON.stringify(res.data), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
})
.catch(err => console.log(err))

