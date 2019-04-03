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

    findByName(username: string) : Promise<RepoFindResult<IUser>> {
        return new Promise<RepoFindResult<IUser>>((resolve, reject) => {
            if (username.trim().length === 0) { 
                reject(<RepoFindResult<IUser>> { 
                    value: User.empty(), 
                    msg: "Kein Name angegeben!" 
                }); 
            } else {
                const repo = this;

                repo.model.findOne({ username: username}, (err, res) => {
                    if (res === null) { 
                        reject(<RepoFindResult<IUser>> { 
                            value: User.empty(), 
                            msg: "Kein Benutzer unter dem Namen '" + username + "' gefunden!" 
                        });
                    } else {
                        resolve(<RepoFindResult<IUser>> { 
                            value: new User(res.username, res.password), 
                            msg: "Benutzer gefunden!" 
                        });
                    }
                });
            }
        });
    }
    
    existsByName(username: string) : Promise<RepoFindResult<boolean>> {
        return new Promise<RepoFindResult<boolean>>((resolve, reject) => {
            if (username.trim().length === 0) { 
                reject(<RepoFindResult<boolean>> { 
                    value: false, 
                    msg: `Kein Benutzer unter dem Namen '${username}' gefunden! `
                });
            } else {
                const repo = this;
                repo.model.countDocuments({ username: username}, (err, count) => {
                    if (err) {
                        reject(<RepoFindResult<boolean>> { 
                            value: false, 
                            msg: `MongoDB - ${err}! `
                        });
                    } else {
                        if (count === 0) {
                            reject(<RepoFindResult<boolean>> { 
                                value: false, 
                                msg: `Benutzer exestiert!`
                            });
                        } else {
                            resolve(<RepoFindResult<boolean>> { 
                                value: true, 
                                msg: `Benutzer exestiert!`
                            });
                        }                        
                    }                    
                });
            }
        });        
    }

    create(user: IUser): Promise<RepoCreateResult<IUser>> {
        return new Promise<RepoCreateResult<IUser>>((resolve, reject) => {
            if (user.isEmpty()) {
                reject(<RepoCreateResult<IUser>> { 
                    value: User.empty(), 
                    msg: "Leere Benutzer können nicht erstellt werden!" 
                });            
            } else {
                const repo = this;

                repo.existsByName(user.username).then(() => {
                    reject(<RepoCreateResult<IUser>> { 
                        value: User.empty(), 
                        msg: "Benutzer ist bereits vergeben!" 
                    });                  
                }).catch(() => {
                    let result = <RepoCreateResult<IUser>> { 
                        value: user, 
                        msg: "Default" 
                    };
            
                    (new repo.model(user)).save((err, res) => {
                        if (err) {
                            result.msg = "Beim erstellen des Benutzers kam es zu einem Fehler!\n" + err;
                            reject(result);
                        } else {
                            result.value = new User(res.username, res.password);
                            result.msg = "Benutzer erfolgreich angelegt!";
            
                            resolve(result);
                        }                            
                    });
                });
            }
        });
    }
}