import { error } from "util";
import { serialize } from "@angular/compiler/src/i18n/serializers/xml_helper";
import { observable } from "rxjs/symbol/observable";
import { Injectable } from "@angular/core";
import { Http, Headers, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/map";
import "rxjs/add/observable/of";
import "rxjs/add/observable/throw";
import { Promise } from "q";
import { HttpClients } from "./authorization.service";

@Injectable()
export class AuthenticationService {
  constructor(private http: HttpClients) {
    let ticket = localStorage.getItem("_uid");
  }

  login(email: string, password: string) {
    debugger;
    const user = {
      Email: email,
      Password: password
    };
    if (user) {
      return this.http.post("login", user).toPromise().then(res => {
        debugger
        const parseJson = res.json();
        if (parseJson.message == "Failure") {
          debugger
          return parseJson;

        }
        else {
          const token = parseJson.user_token;
          if (token !== undefined) {

            localStorage.setItem("_uid", token);
            localStorage.setItem("user_details", JSON.stringify(parseJson.user_details));

          }

        }

      }).catch(err => {
        return err;
      });
    }
  }
  logout() {
    // clear local storage user values
    localStorage.clear();
  }
}
