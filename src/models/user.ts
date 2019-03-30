import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { RepoFindResult, RepoCreateResult } from "./types"

export interface IUser {
    username: string;
    password: string;
    isEmpty(): boolean;
}

export interface IUserModel extends IUser, mongoose.Document {

}

export class User implements IUser {
    username: string;
    password: string;
    constructor(username: string = "", password: string = "") {
        this.username = username;
        this.password = password;
    }

    static empty(): IUser {
        return new User();
    }
    isEmpty(): boolean {
        return this.username === "" && this.password === "";
    }
}

export var UserSchema: mongoose.Schema = new mongoose.Schema({
    username: String,
    password: String
});
UserSchema.pre<IUserModel>("save", function (next) {
    const user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) { next(err); }
        user.password = hash;
        next();
    }); 
    
});
UserSchema.methods.empty = (): IUser => {
    return User.empty();
}

export class UserRepository {
    model: mongoose.Model<IUserModel>;
    constructor() {
        this.model = mongoose.model<IUserModel>("User", UserSchema);
    }

    findByName(username: string, cb: (res: RepoFindResult<IUser>) => void) : void {
        if (username.trim().length === 0) { 
            cb(<RepoFindResult<IUser>> { 
                value: User.empty(), 
                msg: "Kein Name angegeben!" 
            }); 

            return;
        }

        const repo = this;
        repo.model.findOne({ username: username}, (err, res) => {
            if (res === null) { 
                cb(<RepoFindResult<IUser>> { 
                    value: User.empty(), 
                    msg: "Kein Benutzer unter dem Namen '" + username + "' gefunden!" 
                });

                return;
            }

            cb(<RepoFindResult<IUser>> { 
                value: new User(res.username, res.password), 
                msg: "" 
            });
        })
    }
    
    existsByName(username: string, cb: (res: boolean) => void) : void {
        if (username.trim().length === 0) { 
            cb(true);
            return;
        }

        const repo = this;
        repo.model.countDocuments({ username: username}, (err, count) => {
            cb(count > 0);
        });
    }

    create(user: IUser, cb: (a: RepoFindResult<IUser>) => void): void {
        if (user.isEmpty()) {
            cb(<RepoFindResult<IUser>> { 
                value: User.empty(), 
                msg: "Leere Benutzer können nicht erstellt werden!" 
            });
        }

        const repo = this;
        repo.existsByName(user.username, (res: boolean ) => {
            if (res) {
                cb(<RepoFindResult<IUser>> { 
                    value: User.empty(), 
                    msg: "Benutzer ist bereits vergeben!" 
                });

                return;
            }

            let result = <RepoFindResult<IUser>> { 
                value: user, 
                msg: "Default" 
            };
    
            new repo.model(user).save((err, res) => {
                if (err) {
                    result.msg = "Beim erstellen des Benutzers kam es zu einem Fehler!\n" + err;
                    cb(result);
                    return;
                }
                result.value = new User(res.username, res.password);
                result.msg = "Benutzer erfolgreich angelegt!";

                cb(result);
            });
        });        
    }
}