import { UsermgmtService } from 'src/app/services/usermgmt.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessGuard implements CanActivate {

  constructor(private userService: UsermgmtService, private router: Router) {}

  // Check if a user is allowed to navigate to a specific route based on the set flag in the router
  // If he is not allowed redirect him to an allowed url
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const requiresLogin = next.data.requiresLogin || false;
      const requiredRole = next.data.requiredRole;
      const redirectIfLoggedIn = next.data.redirectIfLoggedIn || false;
      // If the requiresLogin flag is set the user has to be authenticated to navigate to the specified route
      // Otherwise just redirect him to the login page
      if (requiresLogin) {
        if (!this.userService.isLoggedIn()) {
          this.router.navigate(['/login']);
          return false;
        }
      }
      // Only allow access to the route if the user is publisher
      if (requiredRole === 'publisher') {
        if (!this.userService.getIsPublisher()) {
          this.router.navigate(['/speak']);
          return false;
        }
      }
      // If the redirectIfLoggedIn flag is set the user is redirected to the speak tab if he is already authenticated
      if (redirectIfLoggedIn) {
        if (this.userService.isLoggedIn()) {
          this.router.navigate(['/speak']);
          return false;
        }
      }
      return true;
  }

}