import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import { Constants } from '../constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertManagerService } from './alert-manager.service';
import { ConditionalExpr } from '@angular/compiler';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})


export class UsermgmtService {

  SERVER_URL = Constants.SERVER_URL;

  private dataFromServer: any = '';

  private httpOptions;
  private isPublisher = new BehaviorSubject<boolean>(undefined);
  private menuLanguage = 'en'; // TODO: fetch menu language from server

  private AUTH_TOKEN = new BehaviorSubject<string>('');

  constructor(
    public http: HttpClient,
    public navCtrl: NavController,
    private alertService: AlertManagerService,
    private translate: TranslateService) {

    // gets AuthToken after reload or on init
    this.getAuthToken();
    this.initHeaders();
   }



   // login into Website, saving AuthToken local and in localStorage, redirect to speak tab
  login(dataToSend): void {
    const url = this.SERVER_URL +  '/api/auth/login/';
    this.resetHttpOptions();
    this.http.post(url, dataToSend, this.httpOptions).subscribe((dataReturnFromServer: object) => {

      this.isPublisher.next(dataReturnFromServer['user']['is_publisher']);

      this.dataFromServer = JSON.stringify(dataReturnFromServer);

      this.AUTH_TOKEN.next('Token ' + JSON.parse(this.dataFromServer).token);
      this.initHeaders();
      localStorage.setItem('Token', this.AUTH_TOKEN.getValue());

      localStorage.setItem('isPublisher', JSON.stringify(this.isPublisher.getValue()));

      this.navCtrl.navigateForward('speak');
      }, (error: any) => {
        // calls AlertService when server sends error code
        this.alertService.showErrorAlertNoRedirection('Wrong Input', 'Invalid Password or Username');
      });
  }

  // creates a new User with the sended Data
  register(dataToSend, logInData): void {
    const url = this.SERVER_URL + '/api/auth/register/';
    this.http.post(url, dataToSend).subscribe(() => {
      this.login(logInData);
    });
  }

  // notifys the Server about profile changes
  updateProfile(dataToSend) {
    const url = this.SERVER_URL + '/api/user/';
    return this.http.put(url, dataToSend, this.httpOptions);
  }

  // redirect to login, and loging out
  logout(): void {
    const url = this.SERVER_URL + '/api/auth/logout/';
    this.http.post(url, '', this.httpOptions).subscribe(() => {
      this.resetHttpOptions();
      // reset the auth token manually because on back button press page isn't refreshed
      this.deleteAuthToken();
      this.navCtrl.navigateForward('/login');

    });
  }

  // deletes Authtoken and clears localStorage
  deleteAuthToken(): void {
    localStorage.clear();
    this.AUTH_TOKEN.next(null);
  }

  // gets all the information about the User who is currently logged in
  loadContent(): Observable<ArrayBuffer> {
    const url = this.SERVER_URL + '/api/user/';
    return this.http.get(url, this.httpOptions);
  }

  // returns all speakable Languages created by an admin
  getLangs(): Observable<object> {
    const url = this.SERVER_URL + '/api/langs/';
    return this.http.get(url);
  }
  // resets httpOptions -> no Authtoken after reset
  private resetHttpOptions(): void {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'authtoken'
      })
    };
  }

// add AuthToken to httpOptions
  private initHeaders(): void {
    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: this.AUTH_TOKEN.getValue(),
      })
    };
  }
  // returns boolean if a user is a Publisher
  getIsPublisher(): Observable<boolean> {
    this.isPublisher.next(JSON.parse(localStorage.getItem('isPublisher')));
    return this.isPublisher.asObservable();
  }
  // gets the authToken.
  getAuthToken(): Observable<string> {
    this.AUTH_TOKEN.next(localStorage.getItem('Token'));
    return this.AUTH_TOKEN.asObservable();
  }

  setMenuLanguage(lang: string): void {
    this.menuLanguage = lang;
    this.translate.use(lang);
  }

  getMenuLanguage(): string {
    return this.menuLanguage;
  }

  isLoggedIn(): boolean {
    // if no auth token is found in local storage AUTH_TOKEN = null
    return !(this.AUTH_TOKEN.getValue() === null);
  }

}
