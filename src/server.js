const express = require('express');
const bodyParser = require('body-parser');
const identifyRoutes = require('./routes/identifyRoutes');

const app = express();

app.use(bodyParser.json());
app.use('/', identifyRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
