import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs/Observable";
import { observable } from "rxjs/symbol/observable";
import { retry } from "rxjs/operators/retry";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {

   
  }
    isAuthenticated(): boolean {
      if (localStorage.getItem("_uid")) {
        return true;
      } else {
        return false;
      }
    }

    canActivate(): boolean {
      if (!this.isAuthenticated()) {
        this.router.navigate(["login"]);
        return false;
      }
      return true;
    }
}
