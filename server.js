const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'src')));

// Handle 404 - Keep this as a last route
app.use((req, res, next) => {
  res.status(404).send('Sorry, we could not find that!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});