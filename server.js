const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

console.clear();
app.listen(port, function() {
  console.log('Listening on port: ' + port);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});