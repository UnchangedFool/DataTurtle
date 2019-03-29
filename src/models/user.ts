import mongoose from "mongoose";

mongoose.connect(" mongodb://127.0.0.1:27017/DataTurtle", {useNewUrlParser: true} );

const db: mongoose.Connection = mongoose.connection;
db.on("error", (e) => {
    console.log("Error on connection!")
});

db.once("open", (e) => {
    console.log("Sucessfully connected");
});