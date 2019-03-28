import express = require("express");
import path = require("path");

const app: express.Application = express();

const port = 3000;

app.use(express.static(".dist/public"));
app.get("/", ( req, res) => {
    res.sendFile(path.join(__dirname + "/../views/login.html"));
});

app.listen(port, () => console.log("Example app listening on port ${port}!", port));