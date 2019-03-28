import express = require("express");

const app: express.Application = express();
const port = 3000;

app.use(express.static("public"));
app.get("/", ( req, res) => res.send("Hello World!"));
app.get("/", ( req, res) => res.send("Hello World!"));

app.listen(port, () => console.log("Example app listening on port ${port}!"));