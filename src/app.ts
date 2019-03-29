import express from "express";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const app: express.Application = express();

const port = 3000;

mongoose.connect(" mongodb://127.0.0.1:27017/DataTurtle", {useNewUrlParser: true} );

const db: mongoose.Connection = mongoose.connection;

db.on("error", (e) => {
    console.log("Error on connection!")
});

let userSchema: mongoose.Schema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model("User", userSchema);

db.once("open", (e) => {
    console.log("Sucessfully connected");
    userSchema 
});



app.use(express.static(".dist/public"));
app.get("/", ( req, res) => {
    res.sendFile(path.join(__dirname + "/../views/login.html"));
});

app.get("/login/send", (req, res) => {
    let username: string = req.query.username;
    let password: string = req.query.password;
    
    console.log(password);
    
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify( { msg: "Erfolgreich! " + username }));
});

app.get("/login/new", (req, res) => {
    let username: string = req.query.username;
    let password: string = req.query.password;

    User.count({ username: username}, (err, count) => {
        res.setHeader("Content-Type", "application/json");

        if (count > 0) {
            res.end(JSON.stringify( { msg: "Benutzer besteht bereits!" }));
        } else {
            bcrypt.hash(password, 10, (err, hash) => {
                let newUser = new User({ username: username, password: hash });

                newUser.save((err, user) => {
                    if (err) {
                        console.log(err);
                        res.end(JSON.stringify( { msg: "Beim erstellen des Benutzers kam es zu einem Fehler!" }));

                        return;
                    }

                    res.end(JSON.stringify( { msg: "Benutzer wurde angelegt!" }));
                });
            }); 
        }
    });

       
});

app.listen(port, () => console.log("Example app listening on port ${port}!", port));