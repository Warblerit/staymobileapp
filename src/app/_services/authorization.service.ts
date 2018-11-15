import { Injectable } from "@angular/core";
import { Http, Headers } from "@angular/http";

@Injectable()
export class HttpClients {
    baseUrl = "https://staysimplyfied.com/api/";
   // baseUrl = "http://localhost:3000/api/"
    constructor(private http: Http) { }

    createAuthorizationHeader(headers: Headers) {
        headers.append("x-access-token", localStorage.getItem("_uid"));
    }


    get(url) {
        let apiRouteUrl = this.baseUrl + url;
        let headers = new Headers();
        this.createAuthorizationHeader(headers);
        return this.http.get(apiRouteUrl, {
            headers: headers
        });
    }

    post(url, data) {
        debugger;
        let apiRouteUrl = this.baseUrl + url;
        let headers = new Headers();
        this.createAuthorizationHeader(headers);
        return this.http.post(apiRouteUrl, data, {
            headers: headers
        });
    }
}