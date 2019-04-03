import express from "express";
import path from "path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import * as user from "./models/user";
import { RepoFindResult, RepoCreateResult } from "./models/types";

const app: express.Application = express();

const port = 3000;
const portDeployed = process.env.PORT;

const deployedURI: string = "mongodb+srv://XXXXXXXXXXX@unchangedfool-vc9qi.mongodb.net/DataTurtle?retryWrites=true";
const localURI: string = "mongodb://127.0.0.1:27017/DataTurtle"

let DEVMODE: boolean = false;

console.log("MODES: ");
process.argv.forEach((val) => {
    if (val === "--dev") {
        DEVMODE = true;
    }
    console.log(val);
});

if (DEVMODE) {
    mongoose.connect(localURI, {useNewUrlParser: true} );
} else {
    mongoose.connect(deployedURI, {useNewUrlParser: true} );
}


const db: mongoose.Connection = mongoose.connection;

db.on("error", (e) => {
    console.log("Error on connection!\n" + e);
});

db.once("open", (e) => {
    console.log("Sucessfully connected");
});

app.use(express.static(".dist/public"));
app.get("/", ( req, res) => {
    res.sendFile(path.join(__dirname + "/../views/login.html"));
});

app.get("/login", (req, res) => {
    let username: string = req.query.username;
    let password: string = req.query.password;

    let userRepo = new user.UserRepository();

    userRepo.findByName(username).then((repoRes: RepoFindResult<user.IUser>) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify( { msg: `${repoRes.msg}\nUN: ${repoRes.value.username} PW: ${repoRes.value.password}`} )); 
    }).catch((repoRes: RepoFindResult<user.IUser>) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify( { msg: `Error: ${repoRes.msg}`})); 
    });
});

app.get("/signup", (req, res) => {
    let userItem = new user.User(req.query.username, req.query.password);
    let userRepo = new user.UserRepository();

     userRepo.create(userItem).then((repoRes: RepoCreateResult<user.IUser>) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify( { msg: repoRes.msg })); 
     }).catch((repoRes: RepoCreateResult<user.IUser>) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify( { msg: `Error: ${repoRes.msg}` })); 
     });          
});

app.listen(DEVMODE ? port : portDeployed, () => console.log("Example app listening on port ${port}!", port));