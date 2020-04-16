import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '../constants';
import { FolderStats } from '../interfaces/folder-stats';
import { UsermgmtService } from './usermgmt.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  SERVER_URL = Constants.SERVER_URL;
  AUTH_TOKEN: string;

  constructor(private http: HttpClient, public authenticationService: AuthenticationService) {
    authenticationService.getAuthToken().subscribe((token) => this.AUTH_TOKEN = token);
  }


  public getSharedFolderStats(sharedFolderId: number): Observable<FolderStats> {
    const url = new URL(`${this.SERVER_URL}/api/pub/sharedfolders/${sharedFolderId}/stats/`);
    return this.http.get<FolderStats>(url.toString(), {
      headers: {
        Authorization: this.AUTH_TOKEN
      }
    });
  }

}
